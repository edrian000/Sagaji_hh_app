angular.module('product.services', [])

.factory('productService', function ($http, $q, $cordovaSQLite, connectivityMonitor, $rootScope, $timeout) {

    var getExistencia = function (codigo) {
        var defered = $q.defer();

        if (db !== null) {
            $cordovaSQLite.execute(db, 'SELECT almacen, existencia FROM Existencias where codigo = ? order by almacen desc ', [codigo])
                .then(function (result) {
                    var existencias = [];
                    if (result.rows.length > 0) {
                        for (var i = 0; i < result.rows.length; i++) {
                            var existencia = {
                                Almacen: result.rows.item(i)['almacen'],
                                Existencia: result.rows.item(i)['existencia']
                            };

                            existencias.push(existencia);
                        }
                    }
                    defered.resolve(existencias);
                }, function (error) {
                    defered.reject(error);
                });
        } else {
            defered.reject({ status: -1, message: 'Base de datos no instanciada!' });
        }



        return defered.promise;
    };

    var getEquivalenciasPorSincronizar = function (today) {

        var defered = $q.defer();
        var codigos = [];

        if (db !== null) {

            var hoy = today.toISOString().substring(0, 10);

            $cordovaSQLite.execute(db, 'SELECT codigo from Equivalencias where order by codigo  desc ', [])
            .then(function (result) {
                if (result.rows.length > 0) {

                    for (var i = 0; i < result.rows.length; i++) {
                        var codigo = result.rows.item(i)['codigo'];
                        //var codigo = result.rows.item(i)['codigoequiv'];
                        codigos.push(codigo);
                    }

                    defered.resolve(codigos);
                }
            }, function (error) {
                defered.reject(error);
            });
        }
        else {
            defered.reject({ status: -1, message: 'la bd no esta instanciada' });
        }

        return defered.promise;
    };

    var getProduct = function (codigo) {
        var defered = $q.defer();
        var producto = {};

        if (db !== null) {
            $cordovaSQLite.execute(db, 'SELECT codigo, descripcion, precio, unidad, linea FROM Productos where codigo = ? ', [codigo])
                    .then(function (result) {

                        if (result.rows.length > 0) {
                            producto = {
                                Codigo: result.rows.item(0)['codigo'],
                                Descripcion: result.rows.item(0)['descripcion'],
                                Precio: result.rows.item(0)['precio'],
                                Unidad: result.rows.item(0)['unidad'],
                                Linea: result.rows.item(0)['linea'],
                                //Cantidad: 0,
                                Mexico: 0,
                                Leon: 0,
                                Puebla: 0,
                                Tuxtla: 0,
                                Oaxaca: 0
                            };

                            getExistencia(producto.Codigo)
                            .then(function (existencias) {
                                if (existencias.length > 0) {
                                    existencias.forEach(function (existencia) {
                                        switch (existencia.Almacen) {
                                            case 'MEXICO':
                                                producto.Mexico = existencia.Existencia;
                                                break;
                                            case 'LEON':
                                                producto.Leon = existencia.Existencia;
                                                break;
                                            case 'OAXACA':
                                                producto.Oaxaca = existencia.Existencia;
                                                break;
                                            case 'PUEBLA':
                                                producto.Puebla = existencia.Existencia;
                                                break;
                                            case 'TUXTLA':
                                                producto.Tuxtla = existencia.Existencia;
                                                break;
                                        }
                                    });
                                }
                                defered.resolve(producto);
                            }, function (error) {
                                defered.reject(error);
                            });
                        }

                    }, function (error) {
                        console.error('Error al consultar Domicilios: ' + error.message);
                        defered.reject(error);
                    });
        } else {
            defered.resolve(producto);
        }

        return defered.promise;
    };

    var getEquivalencias = function (codigo) {
        var defered = $q.defer();
        var equivalencias = [];

        if (db !== null) {
            $cordovaSQLite.execute(db, 'SELECT codigoequiv FROM Equivalencias where codigo = ? ', [codigo])
                    .then(function (result) {
                        if (result.rows.length > 0) {
                            for (var i = 0; i < result.rows.length; i++) {
                                equivalencias.push(result.rows.item(i)['codigoequiv']);
                            }
                            defered.resolve(equivalencias);
                        }
                        else {
                            defered.resolve([]);
                        }
                    }, function (error) {
                        console.error('Error al consultar Equivalencias: ' + error.message);
                        defered.reject(error);
                    });
        } else {
            defered.resolve(equivalencias);
        }
        return defered.promise;
    };

    var saveProduct = function (producto) {

        var query = 'select * from Productos where codigo = ?';

        $cordovaSQLite.execute(db, query, [producto.Codigo])
            .then(function (result) {

                if (result.rows.length === 0) {
                    // insert

                    query = 'INSERT INTO Productos (codigo, descripcion, precio, unidad, linea) values(?, ?, ?, ?, ?)';

                    $cordovaSQLite.execute(db, query, [
                        producto.Codigo,
                        producto.Descricpion,
                        producto.Precio,
                        producto.Unidad,
                        producto.Linea
                    ]).then(function (result) {
                        if (result.rowsAffected > 0) {
                            //console.info('Registro exitoso de producto: ' + producto.Codigo);
                        }
                    }, function (error) {
                        console.error(codigo + ': Error al registrar Producto: ' + error.message);
                    });
                }
                else {

                    query = 'UPDATE Productos set descripcion = ?, precio = ? WHERE codigo = ?';

                    $cordovaSQLite.execute(db, query, [
                    producto.Descripcion,
                    producto.Precio,
                    producto.Codigo])
                    .then(function (result) {
                        if (result.rowsAffected > 0) {
                            //console.info('Actualización exitoso de producto: ' + producto.Codigo);
                        }
                    },
                    function (error) {
                        console.error(codigo + ': Error al actualizar Producto: ' + error.message);
                    });
                }

            }, function (error) {
                console.error('Error al consultar Productos: ' + error.message);
            });
    };

    var saveEqvialencia = function (producto) {
        var query = 'select * from Equivalencias where codigo = ? and codigoequiv = ? ';

        $cordovaSQLite.execute(db, query, [producto.Codigo])
            .then(function (result) {
                if (result.rows.length === 0) {
                    // insert

                    query = 'INSERT INTO Equivalencias (codigo, codigoequiv,  descripcion, unidad, preciomen, preciomay, sincronizado) values(?, ?, ?, ?, ?, ?, ?)';

                    $cordovaSQLite.execute(db, query, [
                        producto.Codigo,
                        producto.CodigoEquivalente,
                        producto.Descricpion,
                        producto.Unidad,
                        producto.PrecioMenudeo,
                        producto.PrecioMayoreo,
                        producto.Sincronizado
                    ]).then(function (result) {
                        if (result.rowsAffected > 0) {
                            //console.info('Registro exitoso de equivalencia: ' + producto.CodigoEquivalente + 'Sincronizado: ' + producto.Sincronizado);
                        }
                    }, function (error) {
                        console.error(producto.Codigo + ': Error al registrar Equivalencias: ' + error.message);
                    });
                }
                else {

                    query = 'UPDATE Equivalencias set descripcion = ?, preciomen = ?, preciomay = ?, sincronizado = ? WHERE codigo = ? and codigoequiv = ? ';

                    $cordovaSQLite.execute(db, query, [
                    producto.Descricpion,
                    producto.PrecioMenudeo,
                    producto.PrecioMayoreo,
                    producto.Sincronizado,
                    producto.Codigo,
                    producto.CodigoEquivalente])
                    .then(function (result) {
                        if (result.rowsAffected > 0) {
                            //console.info('Actualización exitoso de Equivalencia: ' + prodproducto.CodigoEquivalente + 'Sincronizado: ' + producto.Sincronizado);
                        }
                    },
                    function (error) {
                        console.error(producto.Codigo + ': Error al actualizar Equivalencia: ' + error.message);
                    });
                }
            }, function (error) {
                console.error('Error al consultar Productos: ' + error.message);
            });
    };




    var syncProductos = function () {
        var defered = $q.defer();

        var isOnline = connectivityMonitor.isOnline();
        if (isOnline) {
            $http.get(serviceUrlBase + 'api/Catalogos/Productos')
            .then(function (result) {
                defered.resolve(result);
            }, function (error) {
                defered.reject(error);
            });
        } else {
            defered.reject({ status: -1, message: '¡Sin conexión!' });
        }

        return defered.promise;
    };

    var syncExistencias = function () {
        var defered = $q.defer();

        var isOnline = connectivityMonitor.isOnline();
        if (isOnline) {
            $http.get(serviceUrlBase + 'api/Catalogos/Existencias')
                .then(function (result) {
                    defered.resolve(result);
                }, function (error) {
                    defered.reject(error);
                });
        }
        else {
            defered.reject({ status: -1, message: '¡Sin conexión!' });
        }

        return defered.promise;
    };

    var syncEquivalencias = function (codigo, hoy) {

        var defered = $q.defer();

        var isOnline = connectivityMonitor.isOnline();

        var equivalencias = [];

        var response = { status: -1, message: '¡Valide que tenga conexión!' };

        if (isOnline) {

            $http.get(serviceUrlBase + 'api/Catalogos/Equivalencias?codigo=' + codigo)
            .then(function (result) {
                equivalencias = result.data;

                if (equivalencias.length > 0) {

                    //console.log('Sincronizando equivalencias para: ' + codigo);
                    //$rootScope.$broadcast('onEquivalenciasSyncChange', { Count: equivalencias.length, Message: 'Sincronizando equivalencias' });

                    equivalencias.forEach(function (equivalencia) {

                        //$rootScope.$broadcast('onEquivalenciasSyncChange', { Count: equivalencias.length--, Message: 'Sincronizando equivalencia: ' + equivalencia.CodigoEquivalente });

                        equivalencia.Sincronizado = hoy;
                        saveEqvialencia(equivalencia);
                    });
                    response.status = 0;
                    response.message = 'Actualizando equivalencias';
                    defered.resolve(response);
                }
            }, function (error) {
                console.error('Error al actualizar equvalencias:' + error.message);
                response.message = error.message;
                defered.resolve(response);
            });

        } else {
            defered.resolve(response);
        }

        return defered.promise;
    };

    //var syncEquivalencias = function () {
    //    var defered = $q.defer();

    //    var isOnline = connectivityMonitor.isOnline();

    //    if (isOnline) {
    //        $http.get(serviceUrlBase + 'api/Catalogos/Equivalencias')
    //            .then(function (result) {
    //                defered.resolve(result);
    //            }, function (error) {
    //                defered.reject(error);
    //            });
    //    }
    //    else {
    //        defered.reject({ status: -1, message: '¡Sin conexión!' });
    //    }

    //    return defered.promise;
    //};

    var syncCarteras = function (login) {
        var defered = $q.defer();

        var isOnline = connectivityMonitor.isOnline();

        if (isOnline) {
            $http.get(serviceUrlBase + 'api/Catalogos/Carteras?login=')
                .then(function (result) {
                    defered.resolve(result);
                }, function (error) {
                    defered.reject(error);
                });
        }
        else {
            defered.reject({ status: -1, message: '¡Sin conexión!' });
        }

        return defered.promise;
    };

    var syncClientes = function (login) {
        var defered = $q.defer();

        var isOnline = connectivityMonitor.isOnline();

        if (isOnline) {
            $http.get(serviceUrlBase + 'api/Catalogos/Clientes?login=')
            .then(function (result) {
                defered.resolve(result);
            }, function (error) {
                defered.reject(error);
            });
        }
        else {
            defered.reject({ status: -1, message: '¡Sin conexión!' });
        }

        return defered.promise;
    };

    var syncDomicilios = function (login) {
        var defered = $q.defer();

        var isOnline = connectivityMonitor.isOnline();

        if (isOnline) {
            $http.get(serviceUrlBase + 'api/Catalogos/Domicilios?login=')
            .then(function (result) {
                defered.resolve(result);
            }, function (error) {
                defered.reject(error);
            });
        }
        else {
            defered.reject({ status: -1, message: '¡Sin conexión!' });
        }


        return defered.promise;
    };

    var syncStockProducts = function (catalogo) {

        var defered = $q.defer();

        var isOnline = connectivityMonitor.isOnline();

        var response = { status: -1, message: 'error al sincronizar existencia se requiere conexión' };

        if (isOnline) {

            console.log('descargando catalogo de  ' + catalogo + ':' + new Date());

            var login = sessionStorage.getItem("loginData");

            switch (catalogo) {
                case 'productos':
                    syncProductos()
                    .then(function (result) {
                        console.log('catalogo ' + catalogo + 'descargado');
                        defered.resolve(result);
                    }, function (error) {
                        console.error('Error al sincronizar productos');
                        defered.reject(error);
                    });
                    break;
                case 'existencias':
                    syncExistencias()
                    .then(function (result) {
                        console.log('catalogo ' + catalogo + 'descargado');
                        defered.resolve(result);
                    }, function (error) {
                        console.error('Error al sincronizar productos');
                        defered.reject(error);
                    });
                    break;
                case 'equivalencias':
                    syncEquivalencias()
                    .then(function (result) {
                        console.log('catalogo ' + catalogo + 'descargado');
                        defered.resolve(result);
                    }, function (error) {
                        console.error('Error al sincronizar productos');
                        defered.reject(error);
                    });
                    break;
                case 'carteras':
                    syncCarteras(login)
                    .then(function (result) {
                        console.log('catalogo ' + catalogo + 'descargado');
                        defered.resolve(result);
                    }, function (error) {
                        console.error('Error al sincronizar productos');
                        defered.reject(error);
                    });
                    break;
                case 'clientes':
                    syncClientes(login)
                    .then(function (result) {
                        console.log('catalogo ' + catalogo + 'descargado');
                        defered.resolve(result);
                    }, function (error) {
                        console.error('Error al sincronizar productos');
                        defered.reject(error);
                    });
                    break;
                case 'domicilios':
                    syncDomicilios(login)
                    .then(function (result) {
                        console.log('catalogo ' + catalogo + 'descargado');
                        defered.resolve(result);
                    }, function (error) {
                        console.error('Error al sincronizar productos');
                        defered.reject(error);
                    });
                    break;
            }


        } else {
            defered.resolve(response);
        }


        return defered.promise;
    };

    var getProductosPorSincronizar = function (today) {

        var defered = $q.defer();

        var codigos = [];

        if (db !== null) {

            var hoy = today.toISOString().substring(0, 10);

            $cordovaSQLite.execute(db, 'SELECT codigo from Productos order by codigo desc ', [])
            .then(function (result) {
                if (result.rows.length > 0) {

                    for (var i = 0; i < result.rows.length; i++) {
                        var codigo = result.rows.item(i)['codigo'];
                        codigos.push(codigo);
                    }

                    defered.resolve(codigos);
                }
            }, function (error) {
                defered.reject(error);
            });
        } else {
            defered.reject({ status: -1, message: 'la bd no esta instanciada' });
        }


        return defered.promise;
    };

    var getProducts = function (filter) {
        var defered = $q.defer();
        var query = 'SELECT codigo, descripcion, precio, unidad FROM Productos order by codigo desc';
        var params = [];
        var products = [];
        var tokens = null;

        if (filter.length === 0) {
            defered.reject({ status: -1, message: "¡filtro invalido!" });
        } else {
            tokens = filter.split(" ");

            if (tokens.length === 1) {
                console.log('query Productos por codigo ...');

                query = 'SELECT codigo, descripcion, precio, unidad, linea FROM Productos  WHERE  upper(codigo) =  ? order by codigo';
                params.push(filter.toUpperCase());

                console.log('query: ' + query);

                $cordovaSQLite.execute(db, query, params)
                .then(function (result) {

                    if (result.rows.length > 0) {
                        for (var i = 0; i < result.rows.length; i++) {
                            var producto = {
                                Codigo: result.rows.item(i)['codigo'],
                                Descripcion: result.rows.item(i)['descripcion'],
                                Precio: result.rows.item(i)['precio'],
                                Unidad: result.rows.item(i)['unidad'],
                                Mexico: 0,
                                Leon: 0,
                                Puebla: 0,
                                Tuxtla: 0,
                                Oaxaca: 0,
                                Linea: 0
                            };

                            products.push(producto);
                        }
                        defered.resolve(products);
                    } else {
                        if (filter.length > 1) {
                            console.log('query Productos aprox codigo ...');
                            query = 'SELECT codigo, descripcion, precio, unidad, linea FROM Productos  WHERE  upper(codigo) LIKE  ? order by codigo LIMIT 50';
                            console.log('query: ' + query);

                            $cordovaSQLite.execute(db, query, ['%' + filter.toUpperCase() + '%'])
                            .then(function (result) {
                                if (result.rows.length > 0) {
                                    for (var i = 0; i < result.rows.length; i++) {
                                        var product = {
                                            Codigo: result.rows.item(i)['codigo'],
                                            Descripcion: result.rows.item(i)['descripcion'],
                                            Precio: result.rows.item(i)['precio'],
                                            Unidad: result.rows.item(i)['unidad'],
                                            Mexico: 0,
                                            Leon: 0,
                                            Puebla: 0,
                                            Tuxtla: 0,
                                            Oaxaca: 0,
                                            Linea: 0
                                        };
                                        products.push(product);
                                    }
                                    defered.resolve(products);
                                } else {
                                    console.log('query Productos descripcion...');

                                    query = 'SELECT codigo, descripcion, precio, unidad, linea FROM Productos  WHERE  upper(descripcion) LIKE  ? order by descripcion desc LIMIT 50 ';
                                    console.log('query: ' + query);

                                    $cordovaSQLite.execute(db, query, ['%' + filter.toUpperCase() + '%'])
                                    .then(function (result) {
                                        if (result.rows.length > 0) {
                                            for (var i = 0; i < result.rows.length; i++) {
                                                var product = {
                                                    Codigo: result.rows.item(i)['codigo'],
                                                    Descripcion: result.rows.item(i)['descripcion'],
                                                    Precio: result.rows.item(i)['precio'],
                                                    Unidad: result.rows.item(i)['unidad'],
                                                    Mexico: 0,
                                                    Leon: 0,
                                                    Puebla: 0,
                                                    Tuxtla: 0,
                                                    Oaxaca: 0,
                                                    Linea: 0
                                                };
                                                products.push(product);
                                            }
                                        }
                                        defered.resolve(products);
                                    }, function (error) {
                                        defered.reject(error);
                                    });
                                }
                            }, function (error) {
                                defered.reject(error);
                            });
                        }
                        else {
                            defered.resolve(products);
                        }
                    }


                }, function (error) {
                    defered.reject(error);
                });
            }
            else {
                // búsqueda por varios items
                query = "SELECT codigo, descripcion, precio, unidad, linea FROM Productos  WHERE  ";
                var aux = "";
                for (var i = 0; i < tokens.length; i++) {
                    if (i === 0) {
                        aux += "upper(descripcion) LIKE '%" + tokens[i].toUpperCase() + "%' ";
                    } else {
                        aux += "and upper(descripcion) LIKE '%" + tokens[i].toUpperCase() + "%' ";
                    }
                    //params.push(tokens[i].toUpperCase());
                }

                query += aux + " order by descripcion desc";

                console.log('query: ' + query);

                $cordovaSQLite.execute(db, query, params)
                .then(function (result) {
                    if (result.rows.length > 0) {
                        for (var i = 0; i < result.rows.length; i++) {
                            var product = {
                                Codigo: result.rows.item(i)['codigo'],
                                Descripcion: result.rows.item(i)['descripcion'],
                                Precio: result.rows.item(i)['precio'],
                                Unidad: result.rows.item(i)['unidad'],
                                Mexico: 0,
                                Leon: 0,
                                Puebla: 0,
                                Tuxtla: 0,
                                Oaxaca: 0,
                                Linea: 0
                            };
                            products.push(product);
                        }
                    }
                    defered.resolve(products);
                }, function (error) {
                    defered.reject(error);
                });
            }

        }





        return defered.promise;
    };

    var deleteCatalogo = function (name) {
        var defered = $q.defer();
        return defered.promise;
    };

    var services = {
        deleteCatalogo: deleteCatalogo,
        getExistencia: getExistencia,
        getProducts: getProducts,
        getProduct: getProduct,
        getEquivalencias: getEquivalencias,
        getProductosPorSincronizar: getProductosPorSincronizar,
        getEquivalenciasPorSincronizar: getEquivalenciasPorSincronizar,
        syncStockProducts: syncStockProducts,
        saveProduct: saveProduct
    };

    return services;
});