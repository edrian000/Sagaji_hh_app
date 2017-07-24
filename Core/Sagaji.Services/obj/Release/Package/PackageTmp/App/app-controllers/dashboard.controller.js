(function () {
    'use strict';

    angular
        .module('app')
        .controller('DashboardController', ['$scope', '$interval', 'backendHubProxy', 'toaster', function ($scope, $interval, backendHubProxy, toaster) {

            var dashboard = backendHubProxy('dashboardHub');

            console.log('DashboardController ...');



            $scope.OnLineUser = 0;
            $scope.Events = [];
            $scope.Errors = [];
            $scope.Operations = [];
            $scope.Pedidos = [];
            $scope.accessToken = sessionStorage.getItem("accessToken");




            dashboard.on('broadcastOperation', function (event) {

                $scope.Operations.unshift(event);
            });

            dashboard.on('broadcastPedidos', function (pedidos) {

                $scope.Pedidos = pedidos;
            });

            $scope.redirect = function () {

                if ($scope.accessToken === null) {
                    window.location.href = '/Home/Index';
                }
            };

            $scope.redirect();


        }]);



})();
