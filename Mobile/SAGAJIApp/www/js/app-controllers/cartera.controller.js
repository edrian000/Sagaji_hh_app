angular.module('cartera.controllers', [])

.controller('carteraCtrl', function ($scope, $rootScope, $ionicHistory, $state, $ionicLoading,
    clientService, carteraService, pedidosService, $stateParams) {
    console.log('carteraCtrl ...');

    $scope.Cartera = '';
    $scope.Cliente = {};

    $scope.Carteras = [];
    $scope.Clientes = [];
    $scope.Request = {};

    $scope.SelectCartera = function (item) {
        $scope.Clientes = [];
        $scope.Cartera = item;

        $ionicLoading.show({
            template: '<p>Cargando clientes...</p><ion-spinner></ion-spinner>'
        });

        clientService.getClientes($scope.Cartera)
            .then(function (result) {
                $ionicLoading.hide();
                $scope.Clientes = result;
            }, function (error) {
                $ionicLoading.hide();
                console.error('Error consulta clientes: ' + error.message);
            });
    };

    $scope.SelectCliente = function (item) {

        $scope.Cliente = item;

        //sconsole.log('transmitiendo cartera cliente');

        $scope.Request.Cliente = item;

        if ($scope.Cliente.Domicilios.length == 0) {
            clientService.getDomicilios($scope.Cliente.NoCliente)
            .then(function (result) {

                //$scope.Cliente.Domicilios = result;

                $scope.Request.Cliente.Domicilios = result;
                $scope.Request.Entrega = $scope.Request.Cliente.Domicilios[0];

                // guarda pedido temporal
                $scope.Request.Sincronizado = 2;
                $scope.Request.FechaCaptura = new Date();
                pedidosService.savePedidoOffline($scope.Request)
                        .then(function (result) {
                            console.info('RESULT: ' + JSON.stringify(result));
                            $ionicHistory.nextViewOptions({
                                disableAnimate: true,
                                disableBack: true
                            });
                            $state.go('app.pedidosedit', { cvepedido: $scope.Request.CvePedido }, { reload: true });
                        }, function (error) {
                            console.error('Error:' + JSON.stringify(error));
                        });

            }, function (error) {
                console.error('Error al consultar domicilios: ' + error.message);
            });
        } else {

            //$scope.Request.Cliente = $scope.Cliente;
            $scope.Request.Entrega = $scope.Request.Cliente.Domicilios[0];

            // guarda pedido temporal
            $scope.Request.Sincronizado = 2;
            $scope.Request.FechaCaptura = new Date();

            pedidosService.savePedidoOffline($scope.Request)
                    .then(function (result) {
                        console.info('RESULT: ' + JSON.stringify(result));

                        $ionicHistory.nextViewOptions({
                            disableAnimate: true,
                            disableBack: true
                        });
                        $state.go('app.pedidosedit', { cvepedido: $scope.Request.CvePedido }, { reload: true });
                    }, function (error) {
                        console.error('Error:' + JSON.stringify(error));
                    });
        }
    };

    if (sessionStorage.getItem("loginData") == null) {
        $ionicHistory.nextViewOptions({
            disableAnimate: true,
            disableBack: true
        });

        $state.go('app.login', {}, { reload: true });
    }

    $scope.loginData = sessionStorage.getItem("loginData");

    if ($stateParams.cvepedido) {
        pedidosService.getPedido($stateParams.cvepedido, $scope.loginData)
        .then(function (res) {

            if (res == null) {
                $scope.Request = {
                    CvePedido: $stateParams.cvepedido,
                    Cliente: null,
                    UsuarioLogin: $scope.loginData,
                    FechaCaptura: null,
                    FechaProceso: null,
                    Entrega: null,
                    TipoEntrega: '1',
                    Observaciones: '',
                    SubTotal: 0,
                    Show: false,
                    Select: false,
                    Iva: 0,
                    Total: 0,
                    NumArticulos: 0,
                    Sincronizado: 2,
                    Partidas: []
                };

            } else {
                $scope.Request = res;
            }

            $ionicLoading.show({
                template: '<p>Cargando carteras...</p><ion-spinner></ion-spinner>'
            });

            carteraService.getCartera($scope.loginData)
                .then(function (result) {

                    $ionicLoading.hide();

                    if (result) {
                        $scope.Carteras = result;
                        $scope.Clientes = [];
                    }
                }, function (error) {
                    $ionicLoading.hide();
                    console.error('Error al consultar carteras:' + error.message);
                });
        }, function (error) {
            console.error("Error:" + JSON.stringify(error));
            $state.go('app.pedidosnew', {}, { reload: true });
        });
    }

});