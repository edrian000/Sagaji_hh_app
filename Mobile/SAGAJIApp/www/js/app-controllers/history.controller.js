angular.module('history.controllers', [])

.controller('historyController', function ($scope, $rootScope, $ionicLoading, $ionicHistory, $state, pedidosService, uuid4, $linq) {

    console.log('historyController ...');

    if (sessionStorage.getItem("loginData") === null) {
        $ionicHistory.nextViewOptions({
            disableAnimate: true,
            disableBack: true
        });

        $state.go('app.login', {}, { reload: true });
    }

    $scope.SearchFilter = "";

    $scope.loginData = sessionStorage.getItem("loginData");

    $scope.Search = function (filter) {
    };

    $scope.isGroupShowing = function (item) {
        return item.Show;
    };

    $scope.togglePlus = function (item) {
        var ngclass = $scope.isGroupShowing(item) ? 'ion-chevron-up' : 'ion-chevron-down';
        return ngclass;
    };

    $scope.clickMe = function (item) {
        console.log('clickme ...');
        item.Show = !item.Show;
    };

    $scope.cloneMe = function (item) {
        console.log('cloneMe ...');
        var request = item;

        request.CvePedido = uuid4.generate();

        request.Sincronizado = 2;
        request.FechaCaptura = new Date();

        pedidosService.savePedidoOffline(request)
        .then(function (result) {
            console.info('RESULT: ' + JSON.stringify(result));
            $ionicHistory.nextViewOptions({
                disableAnimate: true,
                disableBack: true
            });

            $state.go('app.pedidosedit', { cvepedido: request.CvePedido }, { reload: true });

        }, function (error) {
            console.error("Error:" + JSON.stringify(error));
        });

    };

    pedidosService.getPedidosEnviados($scope.loginData)
    .then(function (result) {
        $scope.History = result;
    }, function (error) {
        console.error('Error al consultar pedidos temporales: ' + error.message);
    });

});