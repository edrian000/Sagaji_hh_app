angular.module('exit.controllers', [])

.controller('exitController', function ($scope, $timeout, $ionicLoading, $ionicPopup) {
    console.log("exitController ...");


    var confirmPopup = $ionicPopup.confirm({
        title: 'Envio de pedido',
        template: '¿Desea cerrar sesión?'
    });

    confirmPopup.then(function (res) {

        if (res) {
            $ionicLoading.show({
                template: '<p>Cerrando sesión ...</p><ion-spinner></ion-spinner>'
            });

            $timeout(function () {
                $ionicLoading.hide();

                ionic.Platform.exitApp();

            }, 2000);
        }

    });



});