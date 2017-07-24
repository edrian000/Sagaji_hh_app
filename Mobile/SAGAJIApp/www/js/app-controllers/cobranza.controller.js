angular.module('cobranza.controllers', [])

.controller('cobranzaCtrl', function ($scope, $ionicHistory, $state) {
    console.log('cobranzaCtrl ...');

    if (sessionStorage.getItem("loginData") == null) {
        $ionicHistory.nextViewOptions({
            disableAnimate: true,
            disableBack: true
        });

        $state.go('app.login', {}, { reload: true });
    }


});