(function () {
    'use strict';

    angular
        .module('app')
        .controller('adviser_controller', ['$scope', 'adviserService', function ($scope, adviserService) {
            $scope.Advisers = [];

            $scope.Adviser = {
                Login: '',
                Pedidos: []
            };

            $scope.Select = function (login) {

                adviserService.getAdviser(login)
                .then(function (result) {
                    $scope.Adviser = result.data;
                }, function (error) {
                    console.error('Error al cargar usuarios: ' + error.message);
                });
            }

            adviserService.getAdvisers()
            .then(function (result) {
                $scope.Advisers = result.data;
            }, function (error) {
                console.error('Error al cargar usuarios: ' + error.message);
            });

        }]);
})();


