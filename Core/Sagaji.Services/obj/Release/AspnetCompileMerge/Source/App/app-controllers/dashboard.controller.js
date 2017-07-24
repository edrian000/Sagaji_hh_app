(function () {
    'use strict';

    angular
        .module('app')
        .controller('DashboardController', ['$scope', '$interval', 'backendHubProxy', 'toastr', function ($scope, $interval, backendHubProxy, toastr) {

            var dashboard = backendHubProxy('dashboardHub');

            console.log('DashboardController ...');

            

            $scope.OnLineUser = 0;
            $scope.Events = [];
            $scope.Errors = [];
            $scope.Operations = [];

            $interval(function () {
                $scope.timer = new Date();
            }, 1000);

            dashboard.on('broadcastAddUser', function (model) {
                $scope.OnLineUser = $scope.OnLineUser + 1;
                // log en messages list
                var message = 'usuario en linea: ' + model.UserLogin;
            });

            dashboard.on('broadcastErrorMessage', function (message) {
                $scope.Errors.unshift(message);
            });

            dashboard.on('broadcastMessage', function (message) {
                var event = {
                    time: new Date(),
                    message: message
                };
                $scope.Events.unshift(event);
            });

            dashboard.on('broadcastOperation', function (message) {
                var event = {
                    time: new Date(),
                    message: message
                };
                $scope.Operations.unshift(event);
            });

        }]);


})();
