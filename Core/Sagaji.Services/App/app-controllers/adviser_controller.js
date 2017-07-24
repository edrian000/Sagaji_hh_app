(function () {
    'use strict';

    angular
        .module('app')
        .controller('adviser_controller', ['$scope', 'adviserService', 'backendHubProxy', function ($scope, adviserService, backendHubProxy) {

            var dashboard = backendHubProxy('dashboardHub');

            $scope.userName = sessionStorage.getItem('userName');

            $scope.Adviser = null;

            $scope.Pedidos = [];

            $scope.collapse = function (event) {
                $(event.target).toggleClass("glyphicon-chevron-down");
            };

            dashboard.on('broadcastAddRequest', function (request) {
                if (request) {
                    $scope.Pedidos.unshift(request);
                }
            });


            adviserService.getAdviser($scope.userName)
            .then(function (result) {
                $scope.Adviser = result.data;
                adviserService.getPedidos($scope.Adviser.UserLogin)
                .then(function (result) {
                    $scope.Pedidos = result.data;
                }, function (error) {
                    console.error('Error al cargar pedidos: ' + error.message);
                });
            }, function (error) {
                console.error('Error al cargar asesores: ' + error.message);
            });

        }]);
})();


