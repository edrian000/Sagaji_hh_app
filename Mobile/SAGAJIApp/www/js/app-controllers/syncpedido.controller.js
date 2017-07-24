angular.module('syncpedido.controllers', [])

.controller('syncPedidoCtrl', function ($scope, $ionicHistory, $state, $interval, $ionicPopup,
    $ionicLoading, $rootScope, pedidosService, connectivityMonitor) {

    console.log('syncPedidoCtrl ...');

    if (sessionStorage.getItem("loginData") === null) {
        $ionicHistory.nextViewOptions({
            disableAnimate: true,
            disableBack: true
        });

        $state.go('app.login', {}, { reload: true });
    }

    $scope.stop = null;

    $scope.loginData = sessionStorage.getItem("loginData");

    $scope.step = "done";
    $scope.stop = null;

    $scope.Processed = 0;
    $scope.InitQueue = 0;

    $scope.Pedidos = [];
    $scope.errors = [];

    $scope.Count = 0;

    $scope.isSearching = false;

    $scope.isSyncing = false;

    $scope.EditPedido = function (item) {
        if (item) {

            $ionicHistory.nextViewOptions({
                disableAnimate: true,
                disableBack: true
            });

            $state.go('app.pedidosedit', { cvepedido: item.CvePedido }, { reload: true });
        }
    };


    var stopSynchronizing = function () {

        if ($scope.stop !== null) {
            $interval.cancel($scope.stop);
            $scope.stop = null;
        }
    };


    var syncPedido = function (item) {

        pedidosService.syncPedido(item)
                    .then(function (response) {

                        console.info('Sincronziación exitosa!: ' + item.CvePedido);

                        pedidosService.getPedidos($scope.loginData)
                        .then(function (result) {
                            $scope.Pedidos = result;
                            $scope.step = "done";
                            $scope.Processed++;
                        }, function (error) {
                            console.log('Err: ' + JSON.stringify(error));
                            //$scope.errors.push(JSON.stringify(error));
                            $scope.errors.push("Error durante la sincronización de pedido la actualización");
                            $scope.step = "fail";
                        });
                    }, function (error) {

                        console.log('Err: ' + JSON.stringify(error));
                        $scope.errors.push("Error durante la sincronización de pedido, vuelva intentar ");
                        $scope.step = "fail";
                    });
    };

    var syncAllPedidos = function () {
        var isOnline = connectivityMonitor.isOnline();

        if (isOnline) {
            switch ($scope.step) {
                case "done":
                    if ($scope.Pedidos.length > 0) {
                        $scope.isSyncing = true;
                        $ionicLoading.show({
                            template: '<p>Sincronizado...</p><ion-spinner></ion-spinner>'
                        });
                        $scope.step = "syncrhonizing";
                    } else {
                        if ($scope.errors.length === 0) {
                            $scope.step = "finish";
                        } else {
                            $scope.step = "fail";
                        }
                    }
                    break;
                case "syncrhonizing":
                    if ($scope.Pedidos.length > 0) {
                        $scope.step = "wait";
                        var pedido = $scope.Pedidos[0];
                        $scope.Pedidos.splice(0, 1);
                        syncPedido(pedido);
                    } else {
                        $scope.step = "done";
                    }
                    break;
                case "wait":
                    console.log("esperando que se sincronice el pedido");
                    break;
                case "fail":
                    $scope.isSyncing = false;
                    $ionicLoading.hide();
                    stopSynchronizing();
                    $scope.errors.forEach(function (error) {
                        window.plugins.toast.showWithOptions({
                            message: error,
                            duration: "long", // which is 2000 ms. "long" is 4000. Or specify the nr of ms yourself.
                            position: "bottom",
                            addPixelsY: -40  // added a negative value to move it up a bit (default 0)
                        });
                    });
                    break;
                case "finish":
                    $scope.Processed = 0;
                    $scope.isSyncing = false;
                    $ionicLoading.hide();
                    stopSynchronizing();
                    window.plugins.toast.showWithOptions({
                        message: '!Sincronziación exitosa!',
                        duration: "long", // which is 2000 ms. "long" is 4000. Or specify the nr of ms yourself.
                        position: "bottom",
                        addPixelsY: -40  // added a negative value to move it up a bit (default 0)
                    });
                    break;
            }
        } else {
            $scope.isSyncing = false;
            $ionicLoading.hide();
            stopSynchronizing();
            window.plugins.toast.showWithOptions({
                message: '!Error, no hay conexión!',
                duration: "long", // which is 2000 ms. "long" is 4000. Or specify the nr of ms yourself.
                position: "bottom",
                addPixelsY: -40  // added a negative value to move it up a bit (default 0)
            });
        }

    };


    $scope.sincronizaPedidos = function () {

        var confirmPopup = $ionicPopup.confirm({
            title: 'Sincronizar pedidos',
            template: '¿Desea sincronizar todos los pedidos?'
        });

        confirmPopup.then(function (res) {
            if (res) {
                if ($scope.stop === null) {
                    $scope.step = "done";
                    $scope.stop = $interval(syncAllPedidos, 200);
                }
            }
        });

    };

    $scope.SincronizaPedido = function (item) {

        var isOnline = connectivityMonitor.isOnline();

        if (!isOnline) {
            window.plugins.toast.showWithOptions({
                message: '!No tiene conexión!',
                duration: "long", // which is 2000 ms. "long" is 4000. Or specify the nr of ms yourself.
                position: "bottom",
                addPixelsY: -40  // added a negative value to move it up a bit (default 0)
            });
            return;
        }

        var confirmPopup = $ionicPopup.confirm({
            title: 'Sincronizar pedido pedido',
            template: '¿Desea sincronizar éste pedido?'
        });


        if (item) {

            confirmPopup.then(function (res) {

                if (res) {

                    $ionicLoading.show({
                        template: '<p>Sincronizado...</p><ion-spinner></ion-spinner>'
                    });

                    if (item.Entrega.Id === "") {
                        item.Entrega.Id = '0';
                    }

                    pedidosService.syncPedido(item)
                    .then(function (response) {

                        $ionicLoading.hide();

                        window.plugins.toast.showWithOptions(
                            {
                                message: '!Sincronziación exitosa!',
                                duration: "short", // which is 2000 ms. "long" is 4000. Or specify the nr of ms yourself.
                                position: "bottom",
                                addPixelsY: -40  // added a negative value to move it up a bit (default 0)
                            });


                        console.info('Sincronziación exitosa!: ' + item.CvePedido);

                        pedidosService.getPedidos($scope.loginData)
                        .then(function (result) {
                            $scope.Pedidos = result;
                        }, function (error) {
                            console.log('Error al consultar los pedidos: ' + error.message);
                        });
                    }, function (error) {
                        $ionicLoading.hide();
                        console.error('Error al sincronizar pedido: ' + error.message);
                        //ionicToast.show('Error al sincronizar pedido: ' + error.message, 'center', true, 2000);
                        //alert('Error al sincronizar pedido: ' + error.message);
                        window.plugins.toast.showWithOptions(
                            {
                                message: 'Error al sincronizar pedido: ' + error.message,
                                duration: "short", // which is 2000 ms. "long" is 4000. Or specify the nr of ms yourself.
                                position: "bottom",
                                addPixelsY: -40  // added a negative value to move it up a bit (default 0)
                            });
                    });

                }
            });
        }
    };

    $scope.RemovePedido = function (item) {

        if (item) {

            var confirmPopup = $ionicPopup.confirm({
                title: 'Eliminar pedido',
                template: 'Desea eliminar el pedido?'
            });

            confirmPopup.then(function (res) {

                if (res) {

                    pedidosService.removePedido(item)
                    .then(function (result) {

                        window.plugins.toast.showWithOptions(
                        {
                            message: result.Message,
                            duration: "short", // which is 2000 ms. "long" is 4000. Or specify the nr of ms yourself.
                            position: "bottom",
                            addPixelsY: -40  // added a negative value to move it up a bit (default 0)
                        });

                        if (result.Status === 0) {
                            //console.info('eliminación exitosa!: ' + item);
                            pedidosService.getPedidos($scope.loginData)
                            .then(function (result) {
                                $scope.Pedidos = result;
                            }, function (error) {
                                console.log('Error al consultar los pedidos: ' + error.message);
                            });
                        }

                    }, function (error) {
                        //ionicToast.show('Error al eliminar pedido: ' + error.message, 'center', true, 2000);
                        //alert('Error al eliminar pedido: ' + error.message);
                        window.plugins.toast.showWithOptions(
                        {
                            message: 'Error al eliminar pedido: ' + error.message,
                            duration: "short", // which is 2000 ms. "long" is 4000. Or specify the nr of ms yourself.
                            position: "bottom",
                            addPixelsY: -40  // added a negative value to move it up a bit (default 0)
                        });
                    });
                }
            });

        }
    };

    pedidosService.getPedidos($scope.loginData)
    .then(function (result) {
        $scope.Pedidos = result;
        $scope.InitQueue = $scope.Pedidos.length;
    }, function (error) {
        console.log('Error al consultar los pedidos: ' + error.message);
    });

});