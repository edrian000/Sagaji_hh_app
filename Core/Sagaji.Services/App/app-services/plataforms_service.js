(function () {
    'use strict';

    angular
        .module('app')
        .factory('plataformService', ['$http', '$q', function ($http, $q) {
            var getPlataforms = function () {
                return $http.get('/api/App/Plataforms');
            };

            var service = {
                getPlataforms: getPlataforms
            };

            return service;
        }]);

})();