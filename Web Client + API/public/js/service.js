'use strict';

angular.module('MEANapp')
.constant("baseURL", "https://suryasoenaryo.mybluemix.net/")
/*********************************
 Services
 *********************************/

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
.factory('eventFactory', ['$resource', 'baseURL', function ($resource, baseURL) {

        return $resource(baseURL + "event/:id", null, {
            'update': {
                method: 'PUT'
            }
        });

}])

;