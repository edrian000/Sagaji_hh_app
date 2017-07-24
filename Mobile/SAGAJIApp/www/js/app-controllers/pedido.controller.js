"use strict";

angular.module('pedido.controllers', [])

.controller('menuPedidoCtrl', function ($scope, $rootScope, $stateParams, $state, $ionicHistory) {

    console.log('pedidoCtrl ...');

    $ionicHistory.clearCache();

    $scope.goItem = function (index) {
        var urlPedido = 'app.pedidosnew';
        switch (index) {
            case 0:
                urlPedido = 'app.pedidosnew';
                break;
            case 1:
                urlPedido = 'app.pedidostemp';
                break;
            case 2:
                urlPedido = 'app.pedidossync';
                break;
            case 3:
                urlPedido = 'app.pedidoshistory';
                break;
        }
        $ionicHistory.nextViewOptions({
            disableAnimate: true,
            disableBack: true
        });

        // refesca la pantalla con un nuevo pedido
        $state.go(urlPedido, {}, { reload: true });
    };
})

.controller('pedidoCtrl', function ($scope, $rootScope, $stateParams, $state, $ionicLoading, $ionicHistory, $ionicModal,
    $cordovaKeyboard , pedidosService, $linq, $ionicPopup, uuid4, $ionicNavBarDelegate, productService) {

    $scope.Prioridades = [
    { ID: '1', Title: 'SAGAJI ENTREGA' },
    { ID: '2', Title: 'CLIENTE RECOGE' },
    { ID: '3', Title: 'EXPRESS' },
    { ID: '4', Title: '2DA VUELTA' },
    { ID: '5', Title: 'PAQUETERIA' },
    { ID: '6', Title: 'CONSOLIDADO' },
    { ID: '7', Title: 'LOCAL UNION' },
    { ID: '8', Title: 'PEDIDO ESPECIAL' },
    { ID: '9', Title: 'MONTERREY DHL' },

    { ID: '10', Title: 'COMPLEMENTO SAGAJI ENTREGA' },
    { ID: '11', Title: 'COMPLEMENTO CLIENTE RECOJE' },
    { ID: '12', Title: 'MONTERREY ESTAFETA' },
    { ID: '13', Title: 'MONTERREY AFIMEX' },
    { ID: '14', Title: 'MONTERREY DHL' },
    { ID: '15', Title: 'MONTERREY SAGAJI' },
    { ID: '16', Title: 'MONTERREY VERACRUZ' },
    { ID: '17', Title: 'PAQUETERIA LIT' },
    { ID: '18', Title: 'TUXTLA PAQUETERIA' },
    { ID: '19', Title: 'EXPRESS PAQUETERIA' },

    { ID: '21', Title: 'LEON PAQUETERIA' },
    { ID: '22', Title: 'LEON SAGAJI ENTREGA' },
    { ID: '23', Title: 'LEON DHL' },
    { ID: '25', Title: 'TUXTLA PAQUETERI' },
// requerimiento 04/dic/2016
    { ID: '26', Title: 'OAXACA SAGAJI ENTREGA' },
    { ID: '27', Title: 'OAXACA EXPRESS' },
    { ID: '28', Title: 'OAXACA PAQUETERÍA' }

    ];

    console.log('pedidoCtrl ...');

    if (sessionStorage.getItem("loginData") === null) {
        $ionicHistory.nextViewOptions({
            disableAnimate: true,
            disableBack: true
        });

        $state.go('app.login', {}, { reload: true });
    }


    $ionicModal.fromTemplateUrl('my-modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function (modal) {
        $scope.modal = modal;
    });


    $scope.loginData = sessionStorage.getItem("loginData");

    $scope.Search = "";
    $scope.isSearching = false;

    $scope.Product = {
        Search: '',
        Codigo: '',
        CodigoEquivalente: '',
        //Cantidad: 0,
        Descripcion: '',
        Precio: 0,
        Unidad: 0,
        Linea: 0,
        Leon: 0,
        Mexico: 0,
        Oaxaca: 0,
        Puebla: 0,
        Tuxtla: 0,
        Equivalencias: [],
        Products: []
    };

    $scope.Request = {
        CvePedido: null,
        Cliente: null,
        UsuarioLogin: $scope.loginData,
        FechaCaptura: null,
        FechaProceso: null,
        Entrega: null,
        TipoEntrega: $scope.Prioridades[0].ID,
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

    $scope.ClearView = function () {

        if ($scope.Product.length > 0) {
            $scope.Product = [];
        }

        if ($scope.Product.IsSelect) {
            $scope.Product.IsSelect = false;
        }

    };

    $scope.AddinCart = function (product) {

        if (product && product.Cantidad > 0) {

            var yaexisten = $linq.Enumerable().From($scope.Request.Partidas)
                    .Where(function (x) { return x.Codigo === product.Codigo; }).ToArray();

            if (yaexisten.length > 0) {
                var confirmPopup = $ionicPopup.confirm({
                    title: 'Envio de pedido',
                    template: 'Éste articulo ya se encuentra en el carro ¿Desea sumarlo a los existentes?'
                });

                confirmPopup.then(function (res) {

                    if (res) {

                        var newProduct = yaexisten[0];

                        newProduct.Cantidad += product.Cantidad;

                        var newPartidas = $linq.Enumerable().From($scope.Request.Partidas)
                        .Where(function (x) {
                            return x.Codigo !== product.Codigo;
                        }).ToArray();


                        $scope.Request.Partidas = newPartidas;

                        $scope.Request.Partidas.push(newProduct);

                        $scope.ActualizaPrecio();
                        $scope.SaveTemporal();

                        window.plugins.toast.showWithOptions({
                            message: "¡Se agrego producto al carrito!",
                            duration: "short", // which is 2000 ms. "long" is 4000. Or specify the nr of ms yourself.
                            position: "bottom",
                            addPixelsY: -40  // added a negative value to move it up a bit (default 0)
                        });
                    }

                });
            } else {
                $scope.Request.Partidas.push($scope.Product);

                $scope.ActualizaPrecio();
                $scope.SaveTemporal();

                window.plugins.toast.showWithOptions({
                    message: "¡Se agrego producto al carrito!",
                    duration: "short", // which is 2000 ms. "long" is 4000. Or specify the nr of ms yourself.
                    position: "bottom",
                    addPixelsY: -40  // added a negative value to move it up a bit (default 0)
                });
            }

            $scope.Product = {
                Search: '',
                Codigo: '',
                CodigoEquivalente: '',
                //Cantidad: 0,
                Descripcion: '',
                Precio: 0,
                Unidad: 0,
                Linea: 0,
                Leon: 0,
                Mexico: 0,
                Oaxaca: 0,
                Puebla: 0,
                Tuxtla: 0,
                Equivalencias: [],
                Products: []
            };

        }
    };


    $scope.searchProduct = function (search) {

        if (search.length > 0) {

            $scope.isSearching = true;
            $ionicLoading.show({
                template: '<p>Cargando...</p><ion-spinner></ion-spinner>'
            });

            $scope.Product = {
                Search: '',
                Codigo: '',
                CodigoEquivalente: '',
                //Cantidad: 0,
                Descripcion: '',
                Precio: 0,
                Unidad: 0,
                Linea: 0,
                Leon: 0,
                Mexico: 0,
                Oaxaca: 0,
                Puebla: 0,
                Tuxtla: 0,
                Equivalencias: [],
                Products: []
            };

            productService.getProducts(search)
                .then(function (products) {

                    if ($cordovaKeyboard.isVisible()) {
                        $cordovaKeyboard.close();
                    }

                    $scope.isSearching = false;
                    $ionicLoading.hide();

                    if (products.length > 0) {
                        $scope.Product.Search = '';
                    }

                    if (products.length === 1) {
                        $scope.SelectItem(products[0].Codigo, '');
                    } else {
                        $scope.Product.Products = products;
                    }

                }, function (error) {

                    if ($cordovaKeyboard.isVisible()) {
                        $cordovaKeyboard.close();
                    }

                    $scope.isSearching = false;
                    $scope.Product.Search = '';
                    $ionicLoading.hide();
                    console.error('Error al consultar productos: ' + error.message);
                });
        }
    };

    $scope.SelectItem = function (codigo, codanterior) {

        if (codigo) {
            productService.getProduct(codigo)
                .then(function (producto) {
                    $scope.Product = producto;
                    $scope.Product.CodigoEquivalente = codanterior;
                    $scope.Product.Products = [];

                    productService.getEquivalencias($scope.Product.Codigo)
                        .then(function (equivalencias) {
                            $scope.Product.Equivalencias = [];
                            equivalencias.forEach(function (codigo) {
                                productService.getProduct(codigo)
                                    .then(function (producto) {
                                        producto.CodigoEquivalente = codigo;
                                        $scope.Product.Equivalencias.push(producto);
                                    }, function (error) {
                                        console.error('Error al consultar existencias: ' + error.message);
                                    });
                            });

                        }, function (error) {
                            console.error('Error al consultar Equivalencias: ' + error.message);
                        });
                }, function (error) {
                    console.error('Error al consultar Equivalencias: ' + error.message);
                });
        }
    };


    $scope.goCarteraClientes = function () {

        $ionicHistory.nextViewOptions({
            disableAnimate: true
        });

        $state.go('app.cartera', { cvepedido: $scope.Request.CvePedido }, { reload: true });
    };

    $scope.goBusquedProductos = function () {
        if ($scope.Request.Cliente === null) {
            //alert('Seleccione un cliente primero');
            window.plugins.toast.showWithOptions(
            {
                message: "Seleccione un cliente primero",
                duration: "short", // which is 2000 ms. "long" is 4000. Or specify the nr of ms yourself.
                position: "bottom",
                addPixelsY: -40  // added a negative value to move it up a bit (default 0)
            });
        } else {

            $scope.modal.show();
        }
    };

    $scope.goPedidosHistory = function () {
        $ionicHistory.nextViewOptions({
            disableAnimate: true,
            disableBack: true
        });
        $state.go('app.pedidossync', {}, { reload: true });
    };

    $scope.ActualizaPrecio = function () {

        $scope.Request.SubTotal = 0;
        $scope.Request.Iva = 0;
        $scope.Request.Total = 0;
        $scope.Request.NumArticulos = 0;

        if ($scope.Request.Partidas.length > 0) {



            var subTotal = $linq.Enumerable()
                .From($scope.Request.Partidas)
                .Sum(function (x) { return x.Cantidad * x.Precio; });

            var sumarizadoItems = $linq.Enumerable()
                .From($scope.Request.Partidas)
                .Sum(function (x) { return x.Cantidad; });

            $scope.Request.SubTotal = subTotal;
            $scope.Request.Iva = $scope.Request.SubTotal * .16;
            $scope.Request.Total = $scope.Request.SubTotal + $scope.Request.Iva;
            $scope.Request.NumArticulos = sumarizadoItems;
        }
    };

    $scope.RemoveInCart = function (item) {
        if (item && $scope.Request.Partidas.length > 0) {
            // A confirm dialog
            var confirmPopup = $ionicPopup.confirm({
                title: 'Eliminar articulo',
                template: 'Desea eliminar el articulo?'
            });

            confirmPopup.then(function (res) {

                if (res) {

                    var newPartidas = $linq.Enumerable().From($scope.Request.Partidas)
                    .Where(function (x) { return x.Codigo !== item.Codigo; }).ToArray();

                    $scope.Request.Partidas = newPartidas;

                    $scope.ActualizaPrecio();

                    $scope.SaveTemporal();
                }
            });
        }
    };

    $scope.AddCantidad = function (item) {
        if (item) {

            item.Cantidad = item.Cantidad + 1;

            $scope.ActualizaPrecio();

            $scope.SaveTemporal();
        }
    };

    $scope.RemoveCantidad = function (item) {

        if (item && item.Cantidad > 1) {

            item.Cantidad = item.Cantidad - 1;

            $scope.ActualizaPrecio();

            $scope.SaveTemporal();
        }
    };

    $scope.RemovePedido = function () {
        var confirmPopup = $ionicPopup.confirm({
            title: 'Eliminar pedido',
            template: '¿Desea eliminar el pedido?'
        });

        confirmPopup.then(function (res) {
            if (res) {

                pedidosService.removePedido($scope.Request)
                .then(function (result) {

                    //alert(result.Message);
                    window.plugins.toast.showWithOptions(
                    {
                        message: result.Message,
                        duration: "short", // which is 2000 ms. "long" is 4000. Or specify the nr of ms yourself.
                        position: "bottom",
                        addPixelsY: -40  // added a negative value to move it up a bit (default 0)
                    });

                    $ionicHistory.nextViewOptions({
                        disableAnimate: true,
                        disableBack: true
                    });

                    // refesca la pantalla con un nuevo pedido
                    $state.go('app.pedidosnew', {}, { reload: true });

                }, function (error) {

                    window.plugins.toast.showWithOptions(
                        {
                            message: 'Error al eliminar pedido: ' + error.message,
                            duration: "short", // which is 2000 ms. "long" is 4000. Or specify the nr of ms yourself.
                            position: "bottom",
                            addPixelsY: -40  // added a negative value to move it up a bit (default 0)
                        });

                    $ionicHistory.nextViewOptions({
                        disableAnimate: true,
                        disableBack: true
                    });

                    // refesca la pantalla con un nuevo pedido
                    $state.go('app.pedidosnew', {}, { reload: true });
                });
            }
        });
    };

    $scope.SaveTemporal = function () {

        if ($scope.Request.Cliente) {

            $scope.Request.Sincronizado = 2;

            $scope.Request.FechaCaptura = new Date();

            if ($scope.Request.CvePedido !== null) {

                pedidosService.savePedidoOffline($scope.Request)
                    .then(function (result) {

                        console.info('result: ' + JSON.stringify(result));
                    }, function (error) {
                        console.error('Error:' + JSON.stringify(error));
                    });
            }
        }
    };

    $scope.Validate = function (item) {

        if (item.Cantidad === null || item.Cantidad === 0 || item.Cantidad === undefined) {
            item.Cantidad = 1;
        }
        $scope.ActualizaPrecio();

        $scope.SaveTemporal();
    };

    $scope.SolicitaPedido = function () {

        if ($scope.Request.Cliente === null) {
            //alert('!Seleccione una cartera y cliente¡');
            window.plugins.toast.showWithOptions(
            {
                message: '!Seleccione una cartera y cliente¡',
                duration: "short", // which is 2000 ms. "long" is 4000. Or specify the nr of ms yourself.
                position: "bottom",
                addPixelsY: -40  // added a negative value to move it up a bit (default 0)
            });
            return;
        }

        if ($scope.Request.Cliente.Cartera === 'undefined' || $scope.Request.Cliente.Cartera === null) {

            window.plugins.toast.showWithOptions(
            {
                message: '!Seleccione una cartera y cliente¡',
                duration: "short", // which is 2000 ms. "long" is 4000. Or specify the nr of ms yourself.
                position: "bottom",
                addPixelsY: -40  // added a negative value to move it up a bit (default 0)
            });
            return;
        }

        var incidencias = $linq.Enumerable().From($scope.Request.Partidas)
                    .Where(function (x) { return x.Cantidad === null || x.Cantidad === 0 || x.Cantidad === undefined; }).ToArray();

        if (incidencias.length !== 0) {
            window.plugins.toast.showWithOptions(
            {
                message: '!Hay cantidades en cero o vacias¡, Revise antes de guardar',
                duration: "short", // which is 2000 ms. "long" is 4000. Or specify the nr of ms yourself.
                position: "bottom",
                addPixelsY: -40  // added a negative value to move it up a bit (default 0)
            });
            return;
        }

        if ($scope.Request.Iva === null || $scope.Request.Iva === 0) {
            window.plugins.toast.showWithOptions(
            {
                message: '!Inconsistencias en el IVA¡, Revise antes de guardar',
                duration: "short", // which is 2000 ms. "long" is 4000. Or specify the nr of ms yourself.
                position: "bottom",
                addPixelsY: -40  // added a negative value to move it up a bit (default 0)
            });
            return;
        }

        if ($scope.Request.SubTotal === null || $scope.Request.SubTotal === 0) {
            window.plugins.toast.showWithOptions(
            {
                message: '!Inconsistencias en el SubTotal¡, Revise antes de guardar',
                duration: "short", // which is 2000 ms. "long" is 4000. Or specify the nr of ms yourself.
                position: "bottom",
                addPixelsY: -40  // added a negative value to move it up a bit (default 0)
            });
            return;
        }

        if ($scope.Request.Total === null || $scope.Request.Total === 0) {
            window.plugins.toast.showWithOptions(
            {
                message: '!Inconsistencias en el SubTotal¡, Revise antes de guardar',
                duration: "short", // which is 2000 ms. "long" is 4000. Or specify the nr of ms yourself.
                position: "bottom",
                addPixelsY: -40  // added a negative value to move it up a bit (default 0)
            });
            return;
        }

        if ($scope.Request.Entrega === 'undefined' || $scope.Request.Entrega === null) {

            window.plugins.toast.showWithOptions(
            {
                message: '!Seleccione un domicilio de entrega¡',
                duration: "short", // which is 2000 ms. "long" is 4000. Or specify the nr of ms yourself.
                position: "bottom",
                addPixelsY: -40  // added a negative value to move it up a bit (default 0)
            });
            return;
        }

        if ($scope.Request.TipoEntrega === '' || $scope.Request.TipoEntrega === null) {

            window.plugins.toast.showWithOptions(
            {
                message: '¡Seleccione prioridad de entrega!',
                duration: "short", // which is 2000 ms. "long" is 4000. Or specify the nr of ms yourself.
                position: "bottom",
                addPixelsY: -40  // added a negative value to move it up a bit (default 0)
            });
            return;
        }

        if ($scope.Request.Partidas.length > 0) {

            var confirmPopup = $ionicPopup.confirm({
                title: 'Salvando pedido',
                template: '¿Desea almacenar el pedido?'
            });

            confirmPopup.then(function (res) {

                if (res) {

                    $scope.IsProcessing = true;

                    console.log('Procesando pedido...');

                    $scope.Request.FechaCaptura = new Date();
                    $scope.Request.Sincronizado = 0;

                    if ($scope.Request.UsuarioLogin) {
                        $scope.Request.UsuarioLogin = $scope.loginData;
                    }

                    pedidosService.savePedidoOffline($scope.Request)
                        .then(function (result) {

                            $scope.IsProcessing = false;

                            window.plugins.toast.showWithOptions(
                                {
                                    message: '¡Pedido almacenado con exito!',
                                    duration: "short", // which is 2000 ms. "long" is 4000. Or specify the nr of ms yourself.
                                    position: "bottom",
                                    addPixelsY: -40  // added a negative value to move it up a bit (default 0)
                                });

                            $ionicHistory.nextViewOptions({
                                disableAnimate: true,
                                disableBack: true
                            });

                            // refesca la pantalla con un nuevo pedido
                            $state.go('app.pedidosnew', {}, { reload: true });

                        }, function (error) {

                            $scope.IsProcessing = false;

                            window.plugins.toast.showWithOptions(
                                {
                                    message: '!Error al registrar pedido¡',
                                    duration: "short", // which is 2000 ms. "long" is 4000. Or specify the nr of ms yourself.
                                    position: "bottom",
                                    addPixelsY: -40  // added a negative value to move it up a bit (default 0)
                                });

                            $ionicHistory.nextViewOptions({
                                disableAnimate: true,
                                disableBack: true
                            });

                            // refesca la pantalla con un nuevo pedido
                            $state.go('app.pedidosnew', {}, { reload: true });
                        });
                }
            });

        }
    };

    if ($stateParams.cvepedido) {
        // actualización de pedido
        pedidosService.getPedido($stateParams.cvepedido, $scope.loginData)
        .then(function (result) {
            if (result) {
                $scope.Request = result;
                $scope.ActualizaPrecio();
            }
        }, function (error) {
            console.error("Error:" + JSON.stringify(error));
        });
    }
    else {
        // pedido nuevo        
        console.info('Pedido nuevo ...');
        $scope.Request.CvePedido = uuid4.generate();

    }

});