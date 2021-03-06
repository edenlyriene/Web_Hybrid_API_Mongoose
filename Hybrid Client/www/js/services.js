'use strict';

angular.module('conFusion.services', ['ngResource'])
//.constant("baseURL", "https://143.89.197.186:3443/")
//.constant("baseURL", "https://192.168.1.127:3443/")
.constant("baseURL", "https://suryasoenaryo.mybluemix.net/")
// .constant("baseURL", "https://localhost:3443/")

.factory('postFactory', ['$resource', 'baseURL', function ($resource, baseURL) {

        return $resource(baseURL + "post/:id", null, {
            'update': {
                method: 'PUT'
            },
            'delete': {
                method: 'DELETE'
            }
        });

}])

.factory('postEditFactory', ['$resource', 'baseURL', function ($resource, baseURL) {

        return $resource(baseURL + "post/:id/edit", null, {
            'update': {
                method: 'PUT'
            },
            'query':  {method:'GET', isArray:false}
        });

}])

.factory('commentFactory', ['$resource', 'baseURL', function ($resource, baseURL) {

        return $resource(baseURL + "post/:id/comment/:commentId", {id:"@Id", commentId: "@CommentId"}, {
            'update': {
                method: 'PUT'
            }
        });

}])


.factory('feedbackFactory', ['$resource', 'baseURL', function ($resource, baseURL) {


    return $resource(baseURL + "feedback/:id", null,  {
                'update': {
                    method: 'PUT'
                }
            });

}])

.factory('$localStorage', ['$window', function($window) {
  return {
    store: function(key, value) {
      $window.localStorage[key] = value;
    },
    get: function(key, defaultValue) {
      return $window.localStorage[key] || defaultValue;
    },
    remove: function (key) {
      $window.localStorage.removeItem(key);
    },
    storeObject: function(key, value) {
      $window.localStorage[key] = JSON.stringify(value);
    },
    getObject: function(key,defaultValue) {
      return JSON.parse($window.localStorage[key] || defaultValue);
    }
  }
}])

.factory('AuthFactory', ['$resource', '$http', '$localStorage', '$rootScope', 'baseURL', '$ionicPopup', function($resource, $http, $localStorage, $rootScope, baseURL, $ionicPopup){
    
    var authFac = {};
    var TOKEN_KEY = 'Token';
    var isAuthenticated = false;
    var username = '';
    var authToken = undefined;
    

  function loadUserCredentials() {
    var credentials = $localStorage.getObject(TOKEN_KEY,'{}');
    if (credentials.username != undefined) {
      useCredentials(credentials);
    }
  }
 
  function storeUserCredentials(credentials) {
    $localStorage.storeObject(TOKEN_KEY, credentials);
    useCredentials(credentials);
  }
 
  function useCredentials(credentials) {
    isAuthenticated = true;
    username = credentials.username;
    authToken = credentials.token;
 
    // Set the token as header for your requests!
    $http.defaults.headers.common['x-access-token'] = authToken;
  }
 
  function destroyUserCredentials() {
    authToken = undefined;
    username = '';
    isAuthenticated = false;
    $http.defaults.headers.common['x-access-token'] = authToken;
    $localStorage.remove(TOKEN_KEY);
  }
     
    authFac.login = function(loginData) {
        
        $resource(baseURL + "users/login")
        .save(loginData,
           function(response) {
              storeUserCredentials({username:loginData.username, token: response.token});
              $rootScope.$broadcast('login:Successful');
           },
           function(response){
              isAuthenticated = false;
            
              var message = '<div><p>' +  response.data.err.message + 
                  '</p><p>' + response.data.err.name + '</p></div>';
            
               var alertPopup = $ionicPopup.alert({
                    title: '<h4>Login Failed!</h4>',
                    template: message
                });

                alertPopup.then(function(res) {
                    console.log('Login Failed!');
                });
           }
        
        );

    };
    
    authFac.logout = function() {
        $resource(baseURL + "users/logout").get(function(response){
        });
        destroyUserCredentials();
    };
    
    authFac.register = function(registerData) {
        
        $resource(baseURL + "users/register")
        .save(registerData,
           function(response) {
              authFac.login({username:registerData.username, password:registerData.password});
            
              $rootScope.$broadcast('registration:Successful');
           },
           function(response){
            
              var message = '<div><p>' +  response.data.err.message + 
                  '</p><p>' + response.data.err.name + '</p></div>';
            
               var alertPopup = $ionicPopup.alert({
                    title: '<h4>Registration Failed!</h4>',
                    template: message
                });

                alertPopup.then(function(res) {
                    console.log('Registration Failed!');
                });
           }
        
        );
    };
    
    authFac.isAuthenticated = function() {
        return isAuthenticated;
    };
    
    authFac.getUsername = function() {
        return username;  
    };
    
    authFac.facebook = function() {
        
    };
    
    loadUserCredentials();
    
    return authFac;
    
}])
;
