// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('conFusion', ['ionic', 'ngCordova', 'conFusion.controllers','conFusion.services'])

.run(function($ionicPlatform, $rootScope, $ionicLoading, $cordovaSplashscreen, $timeout) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
      $timeout(function(){
                //$cordovaSplashscreen.hide();
      },2000);
  });
    
    $rootScope.$on('loading:show', function () {
        $ionicLoading.show({
            template: '<ion-spinner></ion-spinner> Loading ...'
        })
    });

    $rootScope.$on('loading:hide', function () {
        $ionicLoading.hide();
    });

    $rootScope.$on('$stateChangeStart', function () {
        console.log('Loading ...');
        $rootScope.$broadcast('loading:show');
    });

    $rootScope.$on('$stateChangeSuccess', function () {
        console.log('done');
        $rootScope.$broadcast('loading:hide');
    });
})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

  //ROOT
  .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/sidebar.html',
    controller: 'AppCtrl'
  })
  
  //LOGIN PAGE
  .state('app.home', {
    url: '/home',
    views: {
      'mainContent': {
        templateUrl: 'templates/home.html',
        controller: 'IndexController'
      }
    }
  })
  
  .state('app.feedback', {
    url: '/feedback',
    views: {
      'mainContent': {
        templateUrl: 'templates/feedback.html',
        controller: 'FeedbackController'
      }
    }
  })
  
  //MAIN PAGE
  .state('app.worldwide', {
      url: '/worldwide',
      views: {
        'mainContent': {
          templateUrl: 'templates/worldwide.html',
            controller: 'WorldwideController'
        }
      }
    })

   .state('app.profile', {
      url: '/profile',
      views: {
        'mainContent': {
          templateUrl: 'templates/profile.html',
            controller:'ProfileController'
        }
      }
    })
  
    .state('app.post', {
        url:'post/:id',
        views: {
            'container@': {
                templateUrl: 'templates/posting.html',
                controller: 'PostController'
            }
        }
    })

    //User edit post page
    .state('app.postedit', {
        url:'post/:id/edit',
        views: {
            'container@': {
                templateUrl: 'templates/postedit.html',
                controller: 'PostEditController'
            }
        }
    })
  
    .state('app.account', {
      url: '/account',
      views: {
        'mainContent': {
          templateUrl: 'templates/account.html',
          controller: 'AccountController'
        }
      }
    })
  ;
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/home');
});
