angular.module('search.controllers', [])

.controller('searchController', function ($scope, $rootScope, $ionicLoading,
    $ionicHistory, productService, $cordovaKeyboard, $stateParams, pedidosService, $ionicPopup, $linq) {

    console.log('searchController ...');

    if (sessionStorage.getItem("loginData") === null) {
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
            $scope.Request = res;
        }, function (error) {
            console.error("Error:" + JSON.stringify(error));
            $state.go('app.pedidosnew', {}, { reload: true });
        });
    }

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

                        // salva pedido
                        $scope.Request.Sincronizado = 2;
                        $scope.Request.FechaCaptura = new Date();
                        pedidosService.savePedidoOffline($scope.Request)
                                .then(function (result) {
                                    console.info('RESULT: ' + JSON.stringify(result));
                                }, function (error) {
                                    console.error('Error:' + JSON.stringify(error));
                                });
                    }

                });
            } else {
                $scope.Request.Partidas.push($scope.Product);

                // salva pedido
                $scope.Request.Sincronizado = 2;
                $scope.Request.FechaCaptura = new Date();
                pedidosService.savePedidoOffline($scope.Request)
                        .then(function (result) {
                            console.info('RESULT: ' + JSON.stringify(result));
                        }, function (error) {
                            console.error('Error:' + JSON.stringify(error));
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



});