(function () {
    'use strict';

    angular
        .module('app')
        .factory('adviserService', ['$http', function ($http) {

            var accesstoken = sessionStorage.getItem('accessToken');

            var authHeaders = {};

            if (accesstoken) {
                authHeaders.Authorization = 'Bearer ' + accesstoken;
            }

            var getAdviser = function (login) {

                var response = $http({
                    url: '/api/Adviser/User?id=' + login,
                    method: "GET",
                    headers: authHeaders
                });

                return response;
            }
            var getPedidos = function (name) {

                var response = $http({
                    url: '/api/Adviser/Pedidos?id=' + name,
                    method: "GET",
                    headers: authHeaders
                });

                return response;
            }
            var promises = {
                getAdviser: getAdviser,
                getPedidos: getPedidos
            };

            return promises;
        }]);


})();