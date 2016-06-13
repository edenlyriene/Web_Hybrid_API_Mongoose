// See LICENSE.MD for license information.

'use strict';

/********************************
Dependencies
********************************/
var express = require('express'),// server middleware
    mongoose = require('mongoose'),// MongoDB connection library
    bodyParser = require('body-parser'),// parse HTTP requests
    passport = require('passport'),// Authentication framework
    LocalStrategy = require('passport-local').Strategy,
    expressValidator = require('express-validator'), // validation tool for processing user input
    cookieParser = require('cookie-parser'),
    session = require('express-session'),
    MongoStore = require('connect-mongo/es5')(session), // store sessions in MongoDB for persistence
    bcrypt = require('bcrypt'), // middleware to encrypt/decrypt passwords
    sessionDB,

    cfenv = require('cfenv'),// Cloud Foundry Environment Variables
    appEnv = cfenv.getAppEnv(),// Grab environment variables

    User = require('./server/models/user.model'),
    Post = require('./server/models/post.model'),
    Event = require('./server/models/event.model'),
    Feedback = require('./server/models/feedback.model');
    require('dotenv').load();// Loads .env file into environment\

/********************************
 MongoDB Connection
 ********************************/

//Detects environment and connects to appropriate DB
if(appEnv.isLocal){
    mongoose.connect(process.env.LOCAL_MONGODB_URL);
    sessionDB = process.env.LOCAL_MONGODB_URL;
    console.log('Your MongoDB is running at ' + process.env.LOCAL_MONGODB_URL);
}
// Connect to MongoDB Service on Bluemix
else if(!appEnv.isLocal) {
    var env = JSON.parse(process.env.VCAP_SERVICES),
        //mongoURL = env['mongodb-2.4'][0]['credentials']['url'];
        mongoURL = 'mongodb://admin:admin@ds021943.mlab.com:21943/suryasoenaryo';
    mongoose.connect(mongoURL);
    sessionDB = mongoURL;
    console.log('Your MongoDB is running at ' + mongoURL);
}
else{
    console.log('Unable to connect to MongoDB.');
}


/********************************
Express Settings
********************************/
var app = express();
app.enable('trust proxy');
// Use SSL connection provided by Bluemix. No setup required besides redirecting all HTTP requests to HTTPS
if (!appEnv.isLocal) {
    app.use(function (req, res, next) {
        if (req.secure) // returns true is protocol = https
            next();
        else
            res.redirect('https://' + req.headers.host + req.url);
    });
}

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(expressValidator()); // must go directly after bodyParser
app.use(cookieParser());
app.use(session({
    secret: process.env.SESSION_SECRET || 'this_is_a_default_session_secret_in_case_one_is_not_defined',
    resave: true,
    store: new MongoStore({
        url: sessionDB,
        autoReconnect: true
    }),
    saveUninitialized : false,
    cookie: { secure: true }
}));
app.use(passport.initialize());
app.use(passport.session());



/********************************
 Passport Middleware Configuration
 ********************************/
passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    });
});

passport.use(new LocalStrategy(
    function(username, password, done) {
        User.findOne({ username: username }, function (err, user) {
            if (err) {
                return done(err);
            }
            if (!user) {
                return done(null, false, { message: 'Incorrect username.' });
            }
            // validatePassword method defined in user.model.js
            if (!user.validatePassword(password, user.password)) {
                return done(null, false, { message: 'Incorrect password.' });
            }
            return done(null, user);
        });
    }
));

/********************************
 Routing
 ********************************/

// ---- LOGIN PAGE ----

// Home
app.get('/', function (req, res){
    res.sendfile('index.html');
});

// Account login
app.post('/account/login', function(req,res){

    // Validation prior to checking DB. Front end validation exists, but this functions as a fail-safe
    req.checkBody('username', 'Username is required').notEmpty();
    req.checkBody('password', 'Password is required').notEmpty();

    var errors = req.validationErrors(); // returns an object with results of validation check
    if (errors) {
        res.status(401).send('Username or password was left empty. Please complete both fields and re-submit.');
        return;
    }

    // Create session if username exists and password is correct
    passport.authenticate('local', function(err, user) {
        if (err) { return next(err); }
        if (!user) { return res.status(401).send('User not found. Please check your entry and try again.'); }
        req.logIn(user, function(err) { // creates session
            if (err) { return res.status(500).send('Error saving session.'); }
            var userInfo = {
                username: user.username,
                email : user.email,
                name : user.name,
                lastname : user.lastname,
                facebook : user.facebook,
                twitter : user.twitter,
                contact : user.contact,
                status : user.status,
                friend : user.friend
            };
            return res.json(userInfo);
        });
    })(req, res);

});

// Account creation
app.post('/account/create', function(req,res){

    // 1. Input validation. Front end validation exists, but this functions as a fail-safe
    req.checkBody('username', 'Username is required').notEmpty();
    req.checkBody('email', 'Email is required and must be in a valid form').notEmpty().isEmail();
    req.checkBody('password', 'Password is required').notEmpty();
    req.checkBody('name', 'First name is required').notEmpty();
    req.checkBody('lastname', 'Last name is required').notEmpty();
    req.checkBody('gender', 'Gender is required').notEmpty();

    var errors = req.validationErrors(); // returns an object with results of validation check
    if (errors) {
        console.log(errors);
        res.status(400).send(errors);
        return;
    }

    // 2. Hash user's password for safe-keeping in DB
    var salt = bcrypt.genSaltSync(10),
        hash = bcrypt.hashSync(req.body.password, salt);

    // 3. Create new object that store's new user data
    var user = new User({
        username: req.body.username,
        email: req.body.email,
        password: hash,
        name: req.body.name,
        lastname: req.body.lastname,
        gender: req.body.gender,
        facebook: '',
        twitter: '',
        contact: '',
        status: 'Hello, world!',
        friend: []
    });

    // 4. Store the data in MongoDB
    User.findOne({ username: req.body.username }, function(err, existingUser) {
        if (existingUser) {
            return res.status(400).send('That username already exists. Please try a different username.');
        }
        user.save(function(err) {
            if (err) {
                console.log(err);
                res.status(500).send('Error saving new account (database error). Please try again.');
                return;
            }
            res.status(200).send('Account created! Please login with your new account.');
        });
    });

});
// ---- END LOGIN PAGE ---

// ---- MAIN PAGE ----

//Worldwide Router

app.get('/home', authorizeRequest, function (req, res){
    Post.find(req.query)
        .populate('comment.postedBy')
        .exec(function (err, post) {
        if (err) next(err);
        res.json(post);
    });
});

app.post('/home', authorizeRequest, function (req, res){
    var post = new Post({
        username: req.body.username,
        text: req.body.text,
        firstname: req.body.firstname,
        lastname: req.body.lastname
    });
    
    Post.create(post, function (err, post) {
        if (err) next(err);
        console.log('Post created!');
        var id = post._id;

        res.writeHead(200, {
            'Content-Type': 'text/plain'
        });
        res.end('Added the post with id: ' + id);
    });
});

/*app.delete('/home', authorizeRequest, function(req, res, next){

    var postID = req.decoded._doc._id;

    Post.remove({ _id: postID }, function(err, resp) {
        if (err) next(err);
        //res.status(200).send('Post successfully deleted.');
        res.json(resp);
    });
});*/


// End Worldwide Router

// Profile Router

app.get('/profile/:id', function (req, res){
    Post.find(req.query)
        .populate('comment.postedBy')
        .exec(function (err, post) {
        if (err) next(err);
        res.json(post);
    });
});

app.post('/profile/:id', authorizeRequest, function (req, res){
    var post = new Post({
        username: req.body.username,
        text: req.body.text,
        firstname: req.body.firstname,
        lastname: req.body.lastname
    });
    
    Post.create(post, function (err, post) {
        if (err) next(err);
        console.log('Post created!');
        var id = post._id;

        res.writeHead(200, {
            'Content-Type': 'text/plain'
        });
        res.end('Added the post with id: ' + id);
    });
});

// End Profile Router

//Post Router

app.get('/post/:id', function (req, res){
    Post.findById(req.params.id)
    //Post.findById({_id : req.params.id})
        .populate('comment.postedBy')
        .exec(function (err, post) {
            if (err){
                console.log(err);
                res.status(500).send('Error updating post.');
                return;
            }

            res.json(post);
        });
});

/*app.delete('/post', authorizeRequest, function(req, res, next){

    Post.remove(req.body.postId, function(err, resp) {
        if (err) next(err);
        res.status(200).send('Post successfully deleted.');
        //res.json(resp);
    });
});

app.delete('/post/:id', authorizeRequest, function(req, res, next){

    Post.remove(req.params.id, function(err, resp) {
        if (err) next(err);
        //res.status(200).send('Post successfully deleted.');
        res.json(resp);
    });
});*/

/*app.post('/account/delete', authorizeRequest, function(req, res){

    User.remove({ username: req.body.username }, function(err) {
        if (err) {
            console.log(err);
            res.status(500).send('Error deleting account.');
            return;
        }
        req.session.destroy(function(err) {
            if(err){
                res.status(500).send('Error deleting account.');
                console.log("Error deleting session: " + err);
                return;
            }
            res.status(200).send('Account successfully deleted.');
        });
    });

});*/

app.get('/post/:id/edit', authorizeRequest, function (req, res){
    Post.findById(req.params.id)
        .populate('comment.postedBy')
        .exec(function (err, post) {
            if (err) next(err);

            res.json(post);
        });
});

app.put('/post/:id/edit', authorizeRequest, function (req, res){
    Post.findByIdAndUpdate(req.params.id, {
        $set: req.body
    }, {
        new: true
    }, function (err, post) {
        if (err) next(err);
        res.json(post);
    });
});

app.get('/post/:id/comment', function (req, res, next) {
    Post.findById(req.params.id)
        .populate('comment.postedBy')
        .exec(function (err, post) {
            if (err) next(err);
            
            res.json(post.comment);
        });
});

app.post('/post/:id/comment', authorizeRequest, function (req, res, next) {
    Post.findById(req.params.id, function (err, post) {
        if (err) next(err);
        
        req.body.postedBy = req.decoded._id;
        
        post.comment.push(req.body);
        
        post.save(function (err, post) {
            if (err) next(err);
            console.log('Updated Comments!');
            
            res.json(post);
        });
    });
});

app.get('/post/:id/comment/:commentId', function (req, res, next) {
    Post.findById(req.params.id)
        .populate('comment.postedBy')
        .exec(function (err, post) {
        if (err) next(err);
        
        res.json(post.comment.id(req.params.commentId));
    });
});

// End Post Router

// Event Router

app.get('/event', function (req, res){
    Event.find(req.query)
        .populate('postedBy')
        .exec(function (err, event) {
        if (err) next(err);
        res.json(event);
    });
});

app.post('/event', authorizeRequest, function (req, res){
    var post = new Post({
        title: req.body.title,
        description: req.body.description,
        location: req.body.location,
        postedBy: req.body.postedBy
    });
    
    Event.create(post, function (err, event) {
        if (err) next(err);
        console.log('Event created!');
        var id = post._id;

        res.writeHead(200, {
            'Content-Type': 'text/plain'
        });
        res.end('Added the event with id: ' + id);
    });
});

app.get('/event/:id', function (req, res){
    Event.findById(req.params.id)
        .populate('postedBy')
        .exec(function (err, event) {
            if (err){
                console.log(err);
                res.status(500).send('Error updating event.');
                return;
            }

            res.json(event);
        });
});

// End Event Router

// Like Router

// End Like Router

// Friend Router

// End Friend Router

//Account Router

app.post('/account/delete', authorizeRequest, function(req, res){

    User.remove({ username: req.body.username }, function(err) {
        if (err) {
            console.log(err);
            res.status(500).send('Error deleting account.');
            return;
        }
        req.session.destroy(function(err) {
            if(err){
                res.status(500).send('Error deleting account.');
                console.log("Error deleting session: " + err);
                return;
            }
            res.status(200).send('Account successfully deleted.');
        });
    });

});

app.put('/account/update', authorizeRequest, function(req,res){

    // 1. Input validation. Front end validation exists, but this functions as a fail-safe
    req.checkBody('email', 'Email is required and must be in a valid form').notEmpty().isEmail();
    req.checkBody('password', 'Password is required').notEmpty();
    req.checkBody('name', 'First name is required').notEmpty();
    req.checkBody('lastname', 'Last name is required').notEmpty();
    req.checkBody('gender', 'Gender is required').notEmpty();

    var errors = req.validationErrors(); // returns an object with results of validation check
    if (errors) {
        res.status(400).send(errors);
        return;
    }

    // 2. Hash user's password for safe-keeping in DB
    var salt = bcrypt.genSaltSync(10),
        hash = bcrypt.hashSync(req.body.password, salt);

    // 3. Store updated data in MongoDB
    User.findOne({ username: req.body.username }, function(err, user) {
        if (err) {
            console.log(err);
            return res.status(400).send('Error updating account.');
        }
        
        user.email = req.body.email;
        user.password = hash;
        user.name = req.body.name;
        user.lastname = req.body.lastname;
        user.gender = req.body.gender;
        user.facebook = req.body.facebook;
        user.twitter = req.body.twitter;
        user.contact = req.body.contact;
        user.status = req.body.status;
        user.save(function(err) {
            if (err) {
                console.log(err);
                res.status(500).send('Error updating account.');
                return;
            }
            res.status(200).send('Account updated.');
        });
    });

});

// Account logout
app.get('/account/logout', function(req,res){

    // Destroys user's session
    if (!req.user)
        res.status(400).send('User not logged in.');
    else {
        req.session.destroy(function(err) {
            if(err){
                res.status(500).send('Sorry. Server error in logout process.');
                console.log("Error destroying session: " + err);
                return;
            }
            res.status(200).send('Success logging user out!');
        });
    }
});

// End Account Router

//Feedback Router
app.post('/feedback', function (req, res){
    var feedback = new Feedback({
        name: req.body.name,
        comment: req.body.comment,
        email: req.body.email
    });
    
    Feedback.create(feedback, function (err, feedback) {
        if (err) next(err);
        console.log('Feedback created!');
        var id = feedback._id;

        res.writeHead(200, {
            'Content-Type': 'text/plain'
        });
        res.end('Added the feedback with id: ' + id);
    });
});

// Custom middleware to check if user is logged-in
function authorizeRequest(req, res, next) {
    if (req.user) {
        next();
    }
    else if(!req.user){
        res.status(401).send('Unauthorized. This is not yours. Please go back.');
    } 
    else {
        res.status(401).send('Unauthorized. Please login.');
    }
}

// Protected route requiring authorization to access.
app.get('/protected', authorizeRequest, function(req, res){
    res.send("This is a protected route only visible to authenticated users.");
});

// End Feedback Router

/********************************
Ports
********************************/
app.listen(appEnv.port, appEnv.bind, function() {
  console.log("Node server running on " + appEnv.url);
});