var app = angular.module('starter.controllers', []);

app.baseConfig = false;


app.controller('AppCtrl', function ($scope, $ionicModal, $timeout, $ionicLoading, $ionicHistory, $state, accessService, connectivityMonitor, menuServices) {

    // With the new view caching in Ionic, Controllers are only called
    // when they are recreated or on app start, instead of every page change.
    // To listen for when this page is active (for example, to refresh data),
    // listen for the $ionicView.enter event:

    $scope.$on('$ionicView.enter', function (e) {
        $scope.menuSide();
    });

    connectivityMonitor.startWatching();

    $scope.appName = "SAGAJIApp";

    console.log('AppCtrl ...');

    // Form data for the login modal
    $scope.rightContent = "template/config/about.html";

    $scope.selectRightContent = function (content) {
        if (content !== null) {
            $scope.rightContent = content;
        }
    };

    // Perform the login action when the user submits the login form


    $scope.menuSide = function () {
        var loginSession = sessionStorage.getItem("loginData");

        if (loginSession !== null) {
            $scope.menuItems = menuServices.menuLogin();
        } else {
            $scope.menuItems = menuServices.menuLogout();
        }
    };

    $scope.menuSide();

});

app.controller("LoginCtrl", function ($scope, $ionicModal, $timeout, $ionicLoading, $ionicHistory, $state, accessService, connectivityMonitor, menuServices) {
    console.log('LoginCtrl ...');

    $scope.loginData = {
        UserLogin: localStorage.getItem("username") ? localStorage.getItem("username") : "",
        UserPassword: localStorage.getItem("password") ? localStorage.getItem("password") : "",
        Remembering: false
    };

    $scope.doLogin = function () {
        console.log('validando usuario', $scope.loginData);

        if ($scope.loginData.UserLogin === "" || $scope.loginData.UserLogin === undefined) {
            window.plugins.toast.showWithOptions(
                    {
                        message: '!Se requiere usuario!',
                        duration: "short", // which is 2000 ms. "long" is 4000. Or specify the nr of ms yourself.
                        position: "bottom",
                        addPixelsY: -40  // added a negative value to move it up a bit (default 0)
                    });
            return;
        }

        if ($scope.loginData.UserPassword === "" || $scope.loginData.UserPassword === undefined) {
            window.plugins.toast.showWithOptions(
                    {
                        message: '!Se requiere contrase&ntilde;a!',
                        duration: "short", // which is 2000 ms. "long" is 4000. Or specify the nr of ms yourself.
                        position: "bottom",
                        addPixelsY: -40  // added a negative value to move it up a bit (default 0)
                    });
            return;
        }

        $ionicLoading.show({
            template: '<p>Autentificando...</p><ion-spinner></ion-spinner>'
        });

        accessService.doLogin($scope.loginData)
        .then(function (result) {

            $scope.IsProcessing = false;
            $ionicLoading.hide();
            //$scope.modal.hide();

            sessionStorage.setItem("loginData", $scope.loginData.UserLogin.toLowerCase());
            localStorage.setItem("username", $scope.loginData.UserLogin);
            localStorage.setItem("password", $scope.loginData.UserPassword);

            $ionicHistory.clearCache();
            $ionicHistory.clearHistory();
            $ionicHistory.nextViewOptions({ disableBack: true, historyRoot: true });

            $scope.menuItems = menuServices.menuLogin();

            if (result.data) {
                // login en línea
                $state.go('app.sync2', { usuario: $scope.loginData.UserLogin.toLowerCase() }, { reload: true });
            }
            else if (result.UserLogin) {
                // login fuera de línea                
                $state.go('app.sync', {}, { reload: true });

            } else {
                //alert('!Usuario incorrecto o contraseña invalida!');
                window.plugins.toast.showWithOptions(
                    {
                        message: '!Usuario incorrecto o contraseña invalida!',
                        duration: "short", // which is 2000 ms. "long" is 4000. Or specify the nr of ms yourself.
                        position: "bottom",
                        addPixelsY: -40  // added a negative value to move it up a bit (default 0)
                    });
                $scope.loginData.password = "";
                return;
            }
        },
        function (error) {
            $ionicLoading.hide();
            //$scope.modal.hide();
            //alert('!Usuario incorrecto o contraseña invalida!');
            window.plugins.toast.showWithOptions(
                    {
                        message: '!Usuario incorrecto o contraseña invalida!',
                        duration: "short", // which is 2000 ms. "long" is 4000. Or specify the nr of ms yourself.
                        position: "bottom",
                        addPixelsY: -40  // added a negative value to move it up a bit (default 0)
                    });
        });
    };

});
