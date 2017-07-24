(function () {
    'use strict';

    angular
        .module('app')
       .factory('loginservice', ['$http', function ($http) {

           var register = function (userInfo) {
               var resp = $http({
                   url: "/api/Account/Register",
                   method: "POST",
                   data: userInfo,
               });
               return resp;
           };

           var login = function (userlogin) {

               var resp = $http({
                   //url: "/TOKEN",
                   url: "/api/Account/Login",
                   method: "POST",
                   data: $.param({ grant_type: 'password', Username: userlogin.username, Password: userlogin.password }),
                   headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
               });
               return resp;
           };

           var logout = function () {
               var accesstoken = sessionStorage.getItem('accessToken');

               var authHeaders = {};

               if (accesstoken) {
                   authHeaders.Authorization = 'Bearer ' + accesstoken;
               }

               var resp = $http({
                   url: '/api/Account/Logout',
                   method: "POST",
                   headers: authHeaders,
               });
               return resp;
           };

           var promises = {
               login: login,
               register: register,
               logout: logout
           };

           return promises;
       }]);

})();