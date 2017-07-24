(function () {
    'use strict';

    angular
        .module('app')
        .factory('adviserService', ['$http', function ($http) {
            var getAdvisers = function () {
                return $http.get('/api/Usuario/Usuarios');
            }
            var getAdviser = function (login) {
                return $http.get('/api/Usuario/Usuario?id=' + login);
            }
            var promises = {
                getAdvisers: getAdvisers,
                getAdviser: getAdviser
            };

            return promises;
        }]);


})();