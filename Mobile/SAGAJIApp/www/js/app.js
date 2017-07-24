// Ionic Starter App

var db = null;
//var serviceUrlBase = "https://sagaji-webservice.azurewebsites.net/"; // desarrollo
var serviceUrlBase = "http://200.38.55.210/"; // producción

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', [
    'ionic',
    'ngStorage',
    'ngCordova',
    'papa-promise',
    'angular-linq',
    'monospaced.elastic',
    'ionic-datepicker',    
    'uuid',
    'cartera.services',
    'client.services',
    'cobranza.services',
    'cobranza.services',
    'dashboard.services',
    'devolucion.services',
    'pedido.services',
    'product.services',
    'settings.services',
    'sync.services',
    'file.services',
    'app.services',
    'starter.controllers',
    'catalogo.controllers',
    'cartera.controllers',
    'pedido.controllers',
    'cobranza.controllers',
    'devolucion.controllers',
    'deposito.controllers',
    'history.controllers',
    'settings.controllers',
    'scratch.controllers',
    'syncpedido.controllers',
    'search.controllers',
    'exit.controllers'
])

.run(function ($ionicPlatform, $rootScope, $cordovaSQLite, dashboardService) {
    $ionicPlatform.ready(function () {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            cordova.plugins.Keyboard.disableScroll(true);

        }
        if (window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.styleDefault();
        }

        if (window.cordova) {

            console.log('creating db ...');

            window.plugins.sqlDB.copy("sagajiapp.db", 0, function () {

                db = window.sqlitePlugin.openDatabase({ name: 'sagajiapp.db', createFromLocation: 0, location: 0 });

            }, function (error) {
                console.error("Error al copiar db: " + error.message);

                db = window.sqlitePlugin.openDatabase({ name: 'sagajiapp.db', createFromLocation: 0, location: 0 });

                dashboardService.getCount("Credentials")
                .then(function (res) {
                    console.log("Usuarios: ", res);
                }, function (err) {
                    console.error("Err:" + JSON.stringify(err));
                });

                dashboardService.getCount("Clientes")
                .then(function (res) {
                    console.log("Clientes: ", res);
                }, function (err) {
                    console.error("Err:" + JSON.stringify(err));
                });

                dashboardService.getCount("Carteras")
                .then(function (res) {
                    console.log("Carteras: ", res);
                }, function (err) {
                    console.error("Err:" + JSON.stringify(err));
                });

                dashboardService.getCount("Domicilios")
                .then(function (res) {
                    console.log("Domicilios: ", res);
                }, function (err) {
                    console.error("Err:" + JSON.stringify(err));
                });

                dashboardService.getCount("Productos")
                .then(function (res) {
                    console.log("Productos: ", res);
                }, function (err) {
                    console.error("Err:" + JSON.stringify(err));
                });

                dashboardService.getCount("Equivalencias")
                .then(function (res) {
                    console.log("Equivalencias: ", res);
                }, function (err) {
                    console.error("Err:" + JSON.stringify(err));
                });


                dashboardService.getCount("Existencias")
                .then(function (res) {
                    console.log("Existencias: ", res);
                }, function (err) {
                    console.error("Err:" + JSON.stringify(err));
                });

                dashboardService.getCount("Pedidos")
                .then(function (res) {
                    console.log("Pedidos: ", res);
                }, function (err) {
                    console.error("Err:" + JSON.stringify(err));
                });

                 dashboardService.getCount("Devoluciones")
                .then(function (res) {
                    console.log("Devoluciones: ", res);
                }, function (err) {
                    console.error("Err:" + JSON.stringify(err));
                });


            });
        } else {
            // Ionic serve syntax
            db = window.openDatabase("sagajiapp.db", "1.0", "sagaji.app", -1);
        }

    });
})

.config(function ($httpProvider) {
    $httpProvider.defaults.timeout = 1000 * 60;
})


.config(function (ionicDatePickerProvider) {
    var datePickerObj = {
        inputDate: new Date(),
        setLabel: 'Seleccionar',
        todayLabel: 'Hoy',
        closeLabel: 'Cerrar',
        mondayFirst: false,
        weeksList: ["D", "L", "M", "M", "J", "V", "S"],
        monthsList: ["Ene", "Feb", "Mar", "Abril", "May", "Junio", "Julio", "Ago", "Sept", "Oct", "Nov", "Dic"],
        templateType: 'popup',
        from: new Date(2016, 1, 1),
        to: new Date(2017, 1, 1),
        showTodayButton: true,
        dateFormat: 'dd MMMM yyyy',
        closeOnSelect: false,
        disableWeekdays: [6]
    };
    ionicDatePickerProvider.configDatePicker(datePickerObj);
})

.config(function ($stateProvider, $urlRouterProvider, $ionicConfigProvider) {

    var backText = "";
    $ionicConfigProvider.backButton.previousTitleText(false).text(backText).icon('ion-ios-arrow-back');

    $stateProvider

        .state('app', {
            url: '/app',
            abstract: true,
            templateUrl: 'templates/menu.html',
            controller: 'AppCtrl'
        })

        .state('app.login', {
            url: '/login',
            views: {
                'menuContent': {
                    templateUrl: 'templates/login.html',
                    controller: 'LoginCtrl'
                }
            }
        })

        .state('app.cartera', {
            url: '/cartera/:cvepedido',
            views: {
                'menuContent': {
                    templateUrl: 'templates/cartera/index.html',
                    controller: 'carteraCtrl'
                }
            }
        })

        .state('app.pedidos', {
            url: '/pedidos',
            views: {
                'menuContent': {
                    templateUrl: 'templates/pedidos/index.html',
                    controller: 'menuPedidoCtrl'
                }
            }
        })

        .state('app.pedidosnew', {
            url: '/pedidosnew',
            views: {
                'menuContent': {
                    templateUrl: 'templates/pedidos/pedido.html',
                    controller: 'pedidoCtrl'
                }
            }
        })

        .state('app.pedidosedit', {
            url: '/pedidosedit/:cvepedido',
            views: {
                'menuContent': {
                    templateUrl: 'templates/pedidos/pedido.html',
                    controller: 'pedidoCtrl'
                }
            }
        })

        .state('app.pedidossearch', {
            url: '/pedidossearch/:cvepedido',
            views: {
                'menuContent': {
                    templateUrl: 'templates/pedidos/search.html',
                    controller: 'searchController'
                }
            }
        })

        .state('app.pedidostemp', {
            url: '/pedidostemp',
            views: {
                'menuContent': {
                    templateUrl: 'templates/pedidos/temp.html',
                    controller: 'scratchController'
                }
            }
        })

        .state('app.pedidossync', {
            url: '/pedidossync',
            views: {
                'menuContent': {
                    templateUrl: 'templates/pedidos/sync.html',
                    controller: 'syncPedidoCtrl'
                }
            }
        })

        .state('app.pedidoshistory', {
            url: '/pedidoshistory',
            views: {
                'menuContent': {
                    templateUrl: 'templates/pedidos/history.html',
                    controller: 'historyController'
                }
            }
        })

        .state('app.devoluciones', {
            url: '/devoluciones',
            views: {
                'menuContent': {
                    templateUrl: 'templates/devoluciones/index.html',
                    controller: 'devolucionCtrl'
                }
            }
        })

        .state('app.depositos', {
            url: '/depositos',
            views: {
                'menuContent': {
                    templateUrl: 'templates/depositos/index.html',
                    controller: 'depositoCtrl'
                }
            }
        })

        .state('app.cobranza', {
            url: '/cobranza',
            views: {
                'menuContent': {
                    templateUrl: 'templates/cobranza/index.html',
                    controller: 'cobranzaCtrl'
                }
            }
        })

        .state('app.sync', {
            url: '/sync',
            views: {
                'menuContent': {
                    templateUrl: 'templates/config/index.html',
                    controller: 'catalogosCtrl'
                }
            }
        })

        .state('app.sync2', {
            url: '/sync/:usuario',
            views: {
                'menuContent': {
                    templateUrl: 'templates/config/index.html',
                    controller: 'catalogosCtrl'
                }
            }
        })

        .state('app.about', {
            url: '/about',
            views: {
                'menuContent': {
                    templateUrl: 'templates/config/about.html',
                    controller: 'settingsCtrl'
                }
            }
        })

        .state('app.exit', {
            url: '/exit',
            views: {
                'menuContent': {
                    templateUrl: 'templates/config/exit.html',
                    controller: 'exitController'
                }
            }
        })

        .state('app.catalogs', {
            url: '/catalogs',
            views: {
                'sync-tab': {
                    templateUrl: 'templates/config/sync.html',
                    controller: 'settingsCtrl'
                }
            }
        })

        .state('app.config', {
            url: '/config',
            views: {
                'settings-tab': {
                    templateUrl: 'templates/config/settings.html',
                    controller: 'settingsCtrl'
                }
            }
        });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/app/login');
})

.directive('selectOnClick', function ($window) {
    // Linker function
    return function (scope, element, attrs) {
        element.bind('click', function () {
            this.select();
        });
    };
});
