// See LICENSE.MD for license information.

angular.module('MEANapp', ['ngRoute', 'ngStorage', 'ui.router','ngResource','ngDialog'])

/*********************************
 Routing
 *********************************/
.config(function($stateProvider, $urlRouterProvider) {
    'use strict';

    $stateProvider

        //Root
        .state('app', {
            url:'/',
            views: {
                'header': {
                    templateUrl : 'views/header.html',
                    controller : 'HeaderController'
                },
                'sidebar': {
                    templateUrl : 'views/sidebar.html',
                    controller : 'SidebarController'
                },
                'container': {
                    templateUrl: 'views/home.html',
                    controller: 'HomeController'
                },
                'footer': {
                    templateUrl : 'views/footer.html'
                }
            }
        })

        //Login page
        .state('app.login', {
            url:'account/login',
            views: {
                'container@': {
                    templateUrl: 'views/login.html',
                    controller: 'LoginController'
                }
            }
        })

        //Create Account page
        .state('app.create', {
            url:'account/create',
            views: {
                'container@': {
                    templateUrl: 'views/create_account.html',
                    controller: 'CreateAccountController'
                }
            }
        })

        //Worldwide newsfeed page
        .state('app.worldwide', {
            url:'home',
            views: {
                'container@': {
                    templateUrl: 'views/worldwide.html',
                    controller: 'WorldwideController'
                }
            }
        })

        //Community newsfeed page
        .state('app.community', {
            url:'community',
            views: {
                'container@': {
                    templateUrl: 'views/community.html',
                    controller: 'CommunityController'
                }
            }
        })

        //Friend list  page
        .state('app.friendlist', {
            url:'friendlist',
            views: {
                'container@': {
                    templateUrl: 'views/friendlist.html',
                    controller: 'FriendlistController'
                }
            }
        })

        //Account page
        .state('app.account', {
            url:'account',
            views: {
                'container@': {
                    templateUrl: 'views/account.html',
                    controller: 'AccountController'
                }
            }
        })

        //User profile  page
        .state('app.profile', {
            url:'profile/:id',
            views: {
                'container@': {
                    templateUrl: 'views/profile.html',
                    controller: 'ProfileController'
                }
            }
        })

        //User post page
        .state('app.post', {
            url:'post/:id',
            views: {
                'container@': {
                    templateUrl: 'views/post.html',
                    controller: 'PostController'
                }
            }
        })

        //User edit post page
        .state('app.postedit', {
            url:'post/:id/edit',
            views: {
                'container@': {
                    templateUrl: 'views/postedit.html',
                    controller: 'PostEditController'
                }
            }
        })

        //Event list  page
        .state('app.event', {
            url:'event',
            views: {
                'container@': {
                    templateUrl: 'views/event.html',
                    controller: 'EventController'
                }
            }
        })

        //Event detail  page
        .state('app.eventdetail', {
            url:'event/:id',
            views: {
                'container@': {
                    templateUrl: 'views/eventdetail.html',
                    controller: 'EventdetailController'
                }
            }
        })

        //Event detail  page
        .state('app.feedback', {
            url:'feedback',
            views: {
                'container@': {
                    templateUrl: 'views/feedback.html',
                    controller: 'FeedbackController'
                }
            }
        })

        

        //Protected page
        .state('app.protected', {
            url:'protected',
            views: {
                'container@': {
                    templateUrl: 'views/protected.html',
                    controller: 'ProtectedController'
                }
            }

        })
});
