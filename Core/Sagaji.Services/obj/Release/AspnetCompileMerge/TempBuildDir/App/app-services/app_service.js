(function () {
    'use strict';

    angular
        .module('app')
        .factory('appService', ['$http', '$q', function ($http, $q) {

            var getModelAsFormData = function (data) {
                var dataAsFormData = new FormData();
                angular.forEach(data, function (value, key) {
                    dataAsFormData.append(key, value);
                });
                return dataAsFormData;
            };

            var uploadApp = function (data) {
                var deferred = $q.defer();
                $http.post('/api/App/Upload', data)
                .then(function (result) {
                    deferred.resolve(result);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            };            

            var downloadApp = function (version, plataform) {
                return $http.get('/api/App/Download?version=' + version + '&platform=' + plataform);
            };

            var getApps = function () {
                return $http.get('/api/App/Apps');
            };

            var promises = {
                uploadApp: uploadApp,
                getApps: getApps,                
                downloadApp: downloadApp
            };

            return promises;
        }]);
})();