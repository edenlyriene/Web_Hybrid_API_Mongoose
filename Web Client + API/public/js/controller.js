'use strict';

angular.module('MEANapp')

/*********************************
 Controllers
 *********************************/

// ---- LOGIN CONTROLLER ----

.controller('HeaderController', function($scope, $localStorage, $sessionStorage, $location, $http){

    $scope.user = $localStorage;

    $scope.accountData = $.extend(true,{},$localStorage.user);
    
})

.controller('SidebarController', function($scope, $localStorage, $sessionStorage, $location, $http){

    // Set local scope to persisted user data
    $scope.user = $localStorage;

    // Logout function
    $scope.logout = function(){
        $http({
            method: 'GET',
            url: '/account/logout'
        })
            .success(function(response){
                alert(response);
                $localStorage.$reset();
                $location.path('/');
            })
            .error(function(response){
                alert(response);
                $location.path('/account/login');
            }
        );
    };
})

.controller('HomeController', function($scope, $localStorage, $sessionStorage, $location, $http){
    if($localStorage.user){
        $location.path('/home');
    } else{
        $location.path('/');
    }
})

.controller('LoginController', function($scope, $localStorage, $sessionStorage, $location, $http){

    // Login submission
    $scope.submitLogin = function(){

        // Login request
        $http({
            method: 'POST',
            url: '/account/login',
            data: {
                    'username': $scope.loginForm.username,
                    'password': $scope.loginForm.password
                }
            })
            .success(function(response){
                // $localStorage persists data in browser's local storage (prevents data loss on page refresh)
                $localStorage.status = true;
                $localStorage.user = response;
                $location.path('/home');
            })
            .error(function(){
                alert('Login failed. Check username/password and try again.');
            }
        );
    };

    // Redirect to account creation page
    $scope.createAccount = function(){
        $location.path('/account/create');
    }
})

.controller('CreateAccountController', function($scope, $localStorage, $sessionStorage, $http, $location){
    $scope.newUser = {
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
    }

    $scope.submitForm = function(){
        console.log("Creating account: ", $scope.newUser)
        
        $http({
            method: 'POST',
            url: '/account/create',
            data: {
                    'username': $scope.newUser.username,
                    'email' : $scope.newUser.email,
                    'password': $scope.newUser.password,
                    'name' : $scope.newUser.name,
                    'lastname' : $scope.newUser.lastname,
                    'gender' : $scope.newUser.gender,
                    'facebook' : $scope.newUser.facebook,
                    'twitter' : $scope.newUser.twitter,
                    'contact' : $scope.newUser.contact,
                    'status' : $scope.newUser.status,
                    'friend' : $scope.newUser.friend
                }
            })
            .success(function(response){
                console.log(response);
                alert(response);
                $location.path('/account/login');
            })
            .error(function(response){
                console.log(response);
                alert(response);
            }
        );

    };
})

.controller('AccountController', function($scope, $localStorage, $sessionStorage, $http, $location){

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
                $localStorage.user = $scope.formData;
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
})

.controller('ProtectedController', function($scope, $location, $http){

    $http({
        method: 'GET',
        url: '/protected'
    })
        .success(function(response){
            $scope.message = response;
        })
        .error(function(response){
            alert(response);
            $location.path('/account/login');
        }
    );

})

.directive('compareTo', function(){
    return {
          require: 'ngModel',
          scope: {
            reference: "=compareTo" 
          },
          link: function(scope, elm, attrs, ctrl) {
              ctrl.$parsers.unshift(function(viewValue, $scope) {

                var noMatch = viewValue != scope.reference
                ctrl.$setValidity('noMatch', !noMatch);
                return (noMatch)?noMatch:!noMatch;
              });

              scope.$watch("reference", function(value) {;
                ctrl.$setValidity('noMatch', value === ctrl.$viewValue);

              });
            }
        };
})
// ---- END LOGIN CONTROLLER ----


// ---- MAIN CONTROLLLER ----

.controller('WorldwideController',['$scope', '$localStorage', '$sessionStorage', '$http', '$location', '$state', '$stateParams', 'postFactory', 'commentFactory', function($scope, $localStorage, $sessionStorage, $http, $location, $state, $stateParams, postFactory, commentFactory){

    $scope.showMenu = false;
    $scope.message = "Loading ...";
    $scope.accountData = $.extend(true,{},$localStorage.user);

    var limit = 5;
    $scope.load = limit;
    $scope.loadMore = function(){
        $scope.load = limit + 5;
        //$state.go($state.current, {}, {reload: true}); 
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

    $scope.doPosting = function(){
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

    $scope.doComment = function(){
        console.log("Comment as : ", $scope.postData.username)

        commentFactory.save({id: $stateParams.id}, $scope.mycomment);

        $state.go($state.current, {}, {reload: true});

        $scope.mycomment = {
            comment: ""
        };
    };

    /*$scope.deletePost = function(postId) {
        console.log('Delete post ', postId);
        var response = confirm("Are you sure you want to delete this post? This cannot be undone!");
        if(response == true){
            postFactory.delete(postId);

            $location.path('/worldwide');
            //$state.go($state.current, {}, {reload: true});
        }
    };*/
}])


.controller('CommunityController',['$scope', '$localStorage', '$sessionStorage', '$http', '$location', '$state', '$stateParams', function($scope, $localStorage, $sessionStorage, $http, $location, $state, $stateParams){

    $scope.showMenu = false;
    $scope.message = "Loading ...";
    $scope.accountData = $.extend(true,{},$localStorage.user);

    $scope.postData = {
        'username' : $scope.accountData.username,
        'text' : '',
        'firstname' : $scope.accountData.name,
        'lastname' : $scope.accountData.lastname
    };

    $http({
        method: 'GET',
        url: '/community'
    })
        .success(function (response) {
            $scope.posts = response;
            $scope.showMenu = true;
        })
        .error(function (response) {
            $scope.message = "Error: " + response.status + " " + response.statusText;
        }
    );

    $scope.doPosting = function(){
        console.log("Posting as : ", $scope.postData.username)
        $http({
            method: 'POST',
            url: '/community',
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


.controller('FriendlistController',['$scope', '$localStorage', '$sessionStorage', '$http', '$location', '$state', '$stateParams', function($scope, $localStorage, $sessionStorage, $http, $location, $state, $stateParams){

}])


.controller('ProfileController',['$scope', '$localStorage', '$sessionStorage', '$http', '$location', '$state', '$stateParams', '$q', function($scope, $localStorage, $sessionStorage, $http, $location, $state, $stateParams, $q){

    $scope.showMenu = false;
    $scope.message = "Loading ...";
    $scope.accountData = $.extend(true,{},$localStorage.user);

    $scope.userId = $stateParams.id;
    console.log($stateParams.id);

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
        url: '/profile/:id'
    })
        .success(function (response) {
            $scope.posts = response;
            $scope.showMenu = true;
            console.log($stateParams.id);
        })
        .error(function (response) {
            $scope.message = "Error: " + response.status + " " + response.statusText;
        }
    );

    $scope.doPosting = function(){
        console.log("Posting as : ", $scope.postData.username)
        $http({
            method: 'POST',
            url: '/profile/:id',
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


.controller('PostController',['$scope', '$localStorage', '$sessionStorage', '$http', '$location', '$state', '$stateParams', '$routeParams', 'postFactory', 'commentFactory', function($scope, $localStorage, $sessionStorage, $http, $location, $state, $stateParams, $routeParams, postFactory, commentFactory){
    
    $scope.showMenu = false;
    $scope.message = "Loading ...";
    console.log($stateParams.id);

    //var postId = $stateParams.id;

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

    $scope.doComment = function(){
        console.log("Comment as : ", $scope.posts.username)
        console.log("Comment to post : ", $stateParams.id)

        commentFactory.save({id: $stateParams.id}, $scope.mycomment);

        $state.go($state.current, {}, {reload: true});

        $scope.mycomment = {
            comment: ""
        };
    };

    /*$scope.deletePost = function(postId) {
        console.log('Delete post ', postId);
        var response = confirm("Are you sure you want to delete this post? This cannot be undone!");
        if(response == true){
            postFactory.delete(postId);

            $location.path('/worldwide');
            $state.go($state.current, {}, {reload: true});
        }
    };*/

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


.controller('EventController',['$scope', '$localStorage', '$sessionStorage', '$http', '$location', '$state', '$stateParams', 'eventFactory', function($scope, $localStorage, $sessionStorage, $http, $location, $state, $stateParams, eventFactory){

    $scope.showMenu = false;
    $scope.message = "Loading ...";
    $scope.accountData = $.extend(true,{},$localStorage.user);

    $scope.postData = {
        'title' : '',
        'description': '',
        'location': '',
        'postedBy': $scope.accountData.firstname + $scope.accountData.lastname
    };

    eventFactory.query(
        function (response) {
            $scope.events = response;
            $scope.showMenu = true;

        },
        function (response) {
            $scope.message = "Error: " + response.status + " " + response.statusText;
        }
    );

    $scope.doPosting = function(){
        console.log("Posting as : ", $scope.accountData.username)
        /*eventFactory.save($scope.postData)
        .$promise.then(
            function (response) {
                console.log(response);
                alert(response);
                $state.go($state.current, {}, {reload: true}); 
            },
            function (response) {
                console.log(response);
                alert(response);
            }
        );*/
        
        $http({
            method: 'POST',
            url: '/event',
            data: {
                'title': $scope.postData.title,
                'description' : $scope.postData.description,
                'location' : $scope.postData.location,
                'postedBy' : $scope.postData.postedBy
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


.controller('EventdetailController',['$scope', '$localStorage', '$sessionStorage', '$http', '$location', '$state', '$stateParams', function($scope, $localStorage, $sessionStorage, $http, $location, $state, $stateParams){

}])


.controller('FeedbackController', ['$scope', '$localStorage', '$sessionStorage', '$http', '$location', '$state', '$stateParams', function($scope, $localStorage, $sessionStorage, $http, $location, $state, $stateParams){
    $scope.submitted = false;
    
    $scope.doFeedback = function(){
        console.log("Posting as : ", $scope.formData.name)
        $http({
            method: 'POST',
            url: '/feedback',
            data: {
                'name': $scope.formData.name,
                'comment' : $scope.formData.comment,
                'email' : $scope.formData.email
            }
        })
            .success(function(response){
                console.log(response);
                alert(response);
                $scope.submitted = true; 
            })
            .error(function(response){
                console.log(response);
                alert(response);
            }
        );
    };
}])


// ---- END MAIN CONTROLLER ----
;