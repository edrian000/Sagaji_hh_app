angular.module('deposito.controllers', [])

.controller('depositoCtrl', function ($scope, $ionicHistory, $state) {
    console.log('depositoCtrl ...');

if (sessionStorage.getItem("loginData") == null) {
        $ionicHistory.nextViewOptions({
            disableAnimate: true,
            disableBack: true
        });

        $state.go('app.login', {}, { reload: true });
    }
});