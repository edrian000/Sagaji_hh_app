angular.module('scratch.controllers', [])

.controller('scratchController', function ($scope, $rootScope, $ionicLoading, $ionicHistory, pedidosService, $state, $ionicPopup) {

    console.log('scratchController ...');

    if (sessionStorage.getItem("loginData") === null) {
        $ionicHistory.nextViewOptions({
            disableAnimate: true,
            disableBack: true
        });

        $state.go('app.login', {}, { reload: true });
    }

    $scope.loginData = sessionStorage.getItem("loginData");

    $scope.Edit = function (item) {

        if (item) {
            $ionicHistory.nextViewOptions({
                disableAnimate: true,
                disableBack: true
            });

            $state.go('app.pedidosedit', { cvepedido: item.CvePedido }, { reload: true });
        }
    };

    $scope.Remove = function (item) {
        if (item) {
            var confirmPopup = $ionicPopup.confirm({
                title: 'Eliminar pedido',
                template: 'Desea eliminar el pedido?'
            });

            confirmPopup.then(function (res) {
                if (res) {
                    pedidosService.removePedido(item)
                    .then(function (reuslt) {
                        pedidosService.getPedidosTemporales($scope.loginData)
                            .then(function (result) {
                                $scope.Scratchs = result;
                            }, function (error) {
                                console.error('Error al consultar pedidos temporales: ' + error.message);
                            });
                    }, function (error) {
                        console.error('Error al eliminar archivo temporal: ' + error.message);
                    });
                }
            });

        }
    };

    pedidosService.getPedidosTemporales($scope.loginData)
    .then(function (result) {
        $scope.Scratchs = result;
    }, function (error) {
        console.error('Error al consultar pedidos temporales: ' + error.message);
    });
});