(function () {
    'use strict';

    angular
        .module('app')
        .factory('plataforms_service', ['$http', function ($http) {
            var getData = function () {
                return $http.get('/api/App/Plataforms');
            }

            var service = {
                getData: getData
            };

            return service;
        }]);


})();