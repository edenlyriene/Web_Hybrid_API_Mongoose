angular.module('conFusion.controllers', [])

.controller('AppCtrl', function ($scope, $rootScope, $ionicModal, $timeout, $localStorage, $ionicPlatform, $cordovaCamera, $cordovaImagePicker, AuthFactory) {

    // With the new view caching in Ionic, Controllers are only called
    // when they are recreated or on app start, instead of every page change.
    // To listen for when this page is active (for example, to refresh data),
    // listen for the $ionicView.enter event:
    //$scope.$on('$ionicView.enter', function(e) {
    //});

    // Form data for the login modal
    $scope.loginData = $localStorage.getObject('userinfo','{}');
    $scope.reservation = {};
    $scope.registration = {
        'username': '',
        'email' : '',
        'password': '',
        'name' : '',
        'lastname' : '',
        'gender' : '',
        'facebook' : '',
        'twitter' : '',
        'contact' : '',
        'status' : '',
        'friend' : ''
    };
    
    $scope.loggedIn = false;
    
    if(AuthFactory.isAuthenticated()) {
        $scope.loggedIn = true;
        $scope.username = AuthFactory.getUsername();
    }
    
    // Create the login modal that we will use later
    $ionicModal.fromTemplateUrl('templates/login.html', {
        scope: $scope
    }).then(function (modal) {
        $scope.modal = modal;
    });

    // Triggered in the login modal to close it
    $scope.closeLogin = function () {
        $scope.modal.hide();
    };

    // Open the login modal
    $scope.login = function () {
        $scope.modal.show();
    };

    // Perform the login action when the user submits the login form
    $scope.doLogin = function () {
        console.log('Doing login', $scope.loginData);
        $localStorage.storeObject('userinfo',$scope.loginData);

        AuthFactory.login($scope.loginData);

        $scope.closeLogin();
    };
    
    $scope.logOut = function() {
       AuthFactory.logout();
        $scope.loggedIn = false;
        $scope.username = '';
    };
      
    $rootScope.$on('login:Successful', function () {
        $scope.loggedIn = AuthFactory.isAuthenticated();
        $scope.username = AuthFactory.getUsername();
    });
    

    // Create the login modal that we will use later
    $ionicModal.fromTemplateUrl('templates/register.html', {
        scope: $scope
    }).then(function (modal) {
        $scope.registerform = modal;
    });

    // Triggered in the login modal to close it
    $scope.closeRegister = function () {
        $scope.registerform.hide();
    };

    // Open the login modal
    $scope.register = function () {
        $scope.registerform.show();
    };

    // Perform the login action when the user submits the login form
    $scope.doRegister = function () {
        console.log('Doing registration', $scope.registration);
        $scope.loginData.username = $scope.registration.username;
        $scope.loginData.email = $scope.registration.email;
        $scope.loginData.password = $scope.registration.password;
        $scope.loginData.firstname = $scope.registration.firstname;
        $scope.loginData.lastname = $scope.registration.lastname;
        $scope.loginData.gender = $scope.registration.gender;
        $scope.loginData.facebook = '';
        $scope.loginData.twitter = '';
        $scope.loginData.contact = '';
        $scope.loginData.status = 'Hello, world!';
        $scope.loginData.friend = [];

        AuthFactory.register($scope.registration);
        // Simulate a login delay. Remove this and replace with your login
        // code if using a login system
        $timeout(function () {
            $scope.closeRegister();
        }, 1000);
    };
       
    $rootScope.$on('registration:Successful', function () {
        $scope.loggedIn = AuthFactory.isAuthenticated();
        $scope.username = AuthFactory.getUsername();
        $localStorage.storeObject('userinfo',$scope.loginData);
    });
})

.controller('FeedbackController', ['$scope', '$ionicModal', '$timeout', 'feedbackFactory', function ($scope, $ionicModal, $timeout, feedbackFactory) {

    $scope.feedback = {
        name: "",
        comment: "",
        email: ""
    };

    // Create the login modal that we will use later
    $ionicModal.fromTemplateUrl('templates/feedback.html', {
        scope: $scope
    }).then(function (modal) {
        $scope.feedbackform = modal;
    });

    // Triggered in the login modal to close it
    $scope.closeFeedback = function () {
        $scope.feedbackform.hide();
    };

    // Open the login modal
    $scope.feedback = function () {
        $scope.feedbackform.show();
    };

    $scope.sendFeedback = function () {

        console.log($scope.feedback);
        feedbackFactory.save($scope.feedback);
        $scope.feedback = {
            name: "",
            comment: "",
            email: ""
        };
        console.log($scope.feedback);
    };
}])

.controller('WorldwideController',['$scope', '$localStorage', '$sessionStorage', '$http', '$location', '$state', '$stateParams', 'postFactory', 'commentFactory', function($scope, $localStorage, $sessionStorage, $http, $location, $state, $stateParams, postFactory, commentFactory){

    $scope.showMenu = false;
    $scope.message = "Loading ...";
    $scope.accountData = $.extend(true,{},$localStorage.user);

    var limit = 5;
    $scope.load = limit;
    $scope.loadMore = function(){
        $scope.load = limit + 5;
    };

    $scope.postData = {
        'username' : $scope.accountData.username,
        'text' : '',
        'firstname' : $scope.accountData.name,
        'lastname' : $scope.accountData.lastname
    };

    $http({
        method: 'GET',
        url: '/home'
    })
        .success(function (response) {
            $scope.posts = response;
            $scope.showMenu = true;
        })
        .error(function (response) {
            $scope.message = "Error: " + response.status + " " + response.statusText;
        }
    );
    
    //Create new post
    // Create the login modal that we will use later
    $ionicModal.fromTemplateUrl('templates/posting.html', {
        scope: $scope
    }).then(function (modal) {
        $scope.modal = modal;
    });

    // Triggered in the login modal to close it
    $scope.closePosting = function () {
        $scope.modal.hide();
    };

    // Open the login modal
    $scope.doPost = function () {
        $scope.modal.show();
    };

    // Perform the login action when the user submits the login form
    $scope.sendPost = function () {
        console.log("Posting as : ", $scope.postData.username)
        $http({
            method: 'POST',
            url: '/home',
            data: {
                'username': $scope.postData.username,
                'firstname' : $scope.postData.firstname,
                'lastname' : $scope.postData.lastname,
                'text' : $scope.postData.text
            }
        })
            .success(function(response){
                console.log(response);
                alert(response);
                $state.go($state.current, {}, {reload: true}); 
            })
            .error(function(response){
                console.log(response);
                alert(response);
            }
        );
    };

}])

.controller('ProfileController',['$scope', '$localStorage', '$sessionStorage', '$http', '$location', '$state', '$stateParams', 'postFactory', 'commentFactory', function($scope, $localStorage, $sessionStorage, $http, $location, $state, $stateParams, postFactory, commentFactory){

    $scope.showMenu = false;
    $scope.message = "Loading ...";
    $scope.accountData = $.extend(true,{},$localStorage.user);

    var limit = 5;
    $scope.load = limit;
    $scope.loadMore = function(){
        $scope.load = limit + 5;
    };

    $scope.postData = {
        'username' : $scope.accountData.username,
        'text' : '',
        'firstname' : $scope.accountData.name,
        'lastname' : $scope.accountData.lastname
    };

    $http({
        method: 'GET',
        url: '/home'
    })
        .success(function (response) {
            $scope.posts = response;
            $scope.showMenu = true;
        })
        .error(function (response) {
            $scope.message = "Error: " + response.status + " " + response.statusText;
        }
    );
    
    //Create new post
    // Create the login modal that we will use later
    $ionicModal.fromTemplateUrl('templates/posting.html', {
        scope: $scope
    }).then(function (modal) {
        $scope.modal = modal;
    });

    // Triggered in the login modal to close it
    $scope.closePosting = function () {
        $scope.modal.hide();
    };

    // Open the login modal
    $scope.doPost = function () {
        $scope.modal.show();
    };

    // Perform the login action when the user submits the login form
    $scope.sendPost = function () {
        console.log("Posting as : ", $scope.postData.username)
        $http({
            method: 'POST',
            url: '/home',
            data: {
                'username': $scope.postData.username,
                'firstname' : $scope.postData.firstname,
                'lastname' : $scope.postData.lastname,
                'text' : $scope.postData.text
            }
        })
            .success(function(response){
                console.log(response);
                alert(response);
                $state.go($state.current, {}, {reload: true}); 
            })
            .error(function(response){
                console.log(response);
                alert(response);
            }
        );
    };

}]).controller('PostController',['$scope', '$localStorage', '$sessionStorage', '$http', '$location', '$state', '$stateParams', '$routeParams', 'postFactory', 'commentFactory', function($scope, $localStorage, $sessionStorage, $http, $location, $state, $stateParams, $routeParams, postFactory, commentFactory){
    
    $scope.showMenu = false;
    $scope.message = "Loading ...";
    console.log($stateParams.id);


    $scope.posts = postFactory.get({
        id: $stateParams.id
    })
    .$promise.then(
        function (response) {
            $scope.posts = response;
            $scope.showMenu = true;
        },
        function (response) {
            $scope.message = "Error: " + response.status + " " + response.statusText;
        }
    );

}])


.controller('PostEditController',['$scope', '$localStorage', '$sessionStorage', '$http', '$location', '$state', '$stateParams', '$routeParams', 'postEditFactory', function($scope, $localStorage, $sessionStorage, $http, $location, $state, $stateParams, $routeParams, postEditFactory){
    $scope.showMenu = false;
    $scope.message = "Loading ...";
    console.log($stateParams.id);

    $scope.formData = postEditFactory.get({
        id: $stateParams.id
    })
    .$promise.then(
        function (response) {
            console.log(response);
            $scope.formData = response;
            $scope.showMenu = true;
        },
        function (response) {
            console.log(response);
            $scope.message = "Error: " + response.status + " " + response.statusText;
        }
    );

    $scope.updatePost = function () {

        postEditFactory.update({id: $stateParams.id}, $scope.formData);

        $location.path('/post/' + $scope.formData._id);
    };
}])


.controller('AccountController', ['$scope', '$localStorage', '$sessionStorage', '$http', '$location', '$state', '$stateParams', 'postFactory', 'commentFactory', function($scope, $localStorage, $sessionStorage, $http, $location, $state, $stateParams, postFactory, commentFactory){

    // Create static copy of user data for form usage (otherwise any temporary changes will bind permanently to $localStorage)
    $scope.formData = $.extend(true,{},$localStorage.user);

    // Update user's account with new data
    $scope.updateAccount = function(){
        $http({
            method: 'PUT',
            url: '/account/update',
            data: {
                'username': $scope.formData.username,
                'email' : $scope.formData.email,
                'password': $scope.formData.password,
                'name' : $scope.formData.name,
                'lastname' : $scope.formData.lastname,
                'gender' : $scope.formData.gender,
                'facebook' : $scope.formData.facebook,
                'twitter' : $scope.formData.twitter,
                'contact' : $scope.formData.contact,
                'status' : $scope.formData.status
            }
        })
            .success(function(response){
                $localStorage.userinfo = $scope.formData;
                console.log(response);
                alert(response);
            })
            .error(function(response){
                console.log(response);
                alert(response);
            }
        );
    }

    // Delete user's account
    $scope.deleteAccount = function(){
        var response = confirm("Are you sure you want to delete your account? This cannot be undone!");
        if(response == true){
            $http({
                method: 'POST',
                url: '/account/delete',
                data: {
                    'username': $scope.formData.username
                }
            })
                .success(function(response){
                    $localStorage.$reset();
                    alert(response);
                    $location.path('/');
                })
                .error(function(response){
                    alert(response);
                }
            );
        }
    };
}])



// implement the IndexController and About Controller here

.controller('IndexController', ['$scope', 'postFactory', 'postEditFactory', 'commentFactory', 'feedbackFactory', 'baseURL', 'AuthFactory', function ($scope, postFactory, postEditFactory, commentFactory, feedbackFactory, baseURL, AuthFactory) {
    
    $scope.baseURL = baseURL;

}])


;