(function () {
    'use strict';

    angular
        .module('app')
        .factory('appService', ['$http', '$q', function ($http, $q) {

            var accesstoken = sessionStorage.getItem('accessToken');

            var authHeaders = {};

            if (accesstoken) {
                authHeaders.Authorization = 'Bearer ' + accesstoken;
            }

            var getModelAsFormData = function (data) {
                var dataAsFormData = new FormData();
                angular.forEach(data, function (value, key) {
                    dataAsFormData.append(key, value);
                });
                return dataAsFormData;
            };

            var uploadApp = function (data) {

                var response = $http({
                    url: '/api/App/Upload',
                    method: 'POST',
                    headers: authHeaders,
                    data: data
                });

                //return deferred.promise;

                return presponse;
            };

            var downloadApp = function (version, plataform) {

                var response = $http({
                    url: '/api/App/Download?version=' + version + '&platform=' + plataform,
                    method: "GET",
                    headers: authHeaders
                });

                return response;
            };

            var getApps = function () {


                var response = $http({
                    url: '/api/App/Apps',
                    method: 'GET',
                    headers: authHeaders
                });

                return response;

                //return $http.get('/api/App/Apps');
            };

            var removeApp = function (version, platform) {
                var response = $http({
                    url: '/api/App/Delete?version=' + version + '&platform=' + platform,
                    method: "DELETE",
                    headers: authHeaders
                });

                return response;
            };

            var promises = {
                uploadApp: uploadApp,
                getApps: getApps,
                removeApp: removeApp,
                downloadApp: downloadApp
            };

            return promises;
        }]);
})();