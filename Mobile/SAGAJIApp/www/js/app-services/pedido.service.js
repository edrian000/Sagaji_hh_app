angular.module('pedido.services', [])

.factory('pedidosService', function ($http, connectivityMonitor, $cordovaSQLite, $q, $linq) {


    var removePedido = function (pedido) {
        var defered = $q.defer();

        var response = { Message: 'Error al eliminar pedido', Status: 1 };

        var query = 'DELETE FROM Pedidos WHERE id = ? and login = ? ';
        $cordovaSQLite.execute(db, query, [pedido.CvePedido, pedido.UsuarioLogin])
        .then(function (result) {

            if (result.rowsAffected > 0) {
                response.Message = 'Pedido eliminado exitosamente!';
                response.Status = 0;
            } else {
                response.Message = 'No fue posible eliminar el registro!';
            }

            defered.resolve(response);

        }, function (error) {
            defered.reject(error);
        });

        return defered.promise;
    };

    var getPedidos = function (login) {
        var defered = $q.defer();

        var query = 'SELECT pedido, status FROM Pedidos WHERE status = 0 AND login = ? ORDER BY register DESC';
        //var query = 'SELECT pedido, status, login FROM Pedidos WHERE status = 0 ORDER BY register DESC'

        $cordovaSQLite.execute(db, query, [login])
        //$cordovaSQLite.execute(db, query, [])
            .then(function (result) {
                var pedidos = [];
                if (result.rows.length > 0) {
                    for (var i = 0; i < result.rows.length; i++) {
                        try {
                            var pedido = JSON.parse(result.rows.item(i)['pedido']);
                            var status = result.rows.item(i)['status'];
                            var llogin = result.rows.item(i)['login'];
                            pedidos.push(pedido);

                        } catch (err) {
                            console.error('Error al parsear pedido: ' + err.message);
                        }
                    }
                }
                defered.resolve(pedidos);
            }, function (error) {
                defered.reject(error);
            });

        return defered.promise;
    };

    var getPedido = function (cvePedido, login) {
        var defered = $q.defer();

        var query = 'SELECT pedido, status FROM Pedidos WHERE id = ? AND login = ? ';

        $cordovaSQLite.execute(db, query, [cvePedido, login])
        .then(function (result) {
            var pedido = null;
            if (result.rows.length === 1) {
                try {
                    pedido = JSON.parse(result.rows.item(0)['pedido']);
                } catch (err) {
                    console.error('Error al parsear pedido: ' + err.message);
                }
            }
            defered.resolve(pedido);
        }, function (error) {
            defered.reject(error);
        });

        return defered.promise;
    };

    var syncPedido = function (pedido) {

        var defered = $q.defer();

        var isOnline = connectivityMonitor.isOnline();

        var response = { Message: 'Error al sincronzar pedido, conexión fuera de linea', Status: 1 };

        var inconsistencias = $linq.Enumerable().From(pedido.Partidas)
                    .Where(function (x) { return x.Cantidad === null || x.Cantidad === 0; }).ToArray();

        if (inconsistencias.length > 0) {
            response = { Message: 'El pedido tien incosistencias en las partidas, por favor reviselo', Status: 1 };
        } else if (pedido.Iva === null || pedido.Total === 0 || pedido.SubTotal === 0) {
            response = { Message: '!El pedido tiene incosistencias en sus montos, por favor reviselo!', Status: 1 };
        } else if (isOnline) {

            var jpedido = JSON.stringify(pedido);

            console.log("Sync Pedido:" + jpedido);

            $http.post(serviceUrlBase + 'api/Pedidos/SyncPedido', pedido)
                .then(function (result) {

                    response = result.data;

                    if (response.Status === 0) {

                        pedido.Sincronizado = 1;

                        savePedidoOffline(pedido)
                            .then(function (result) {

                                defered.resolve(result);

                            }, function (error) {
                                defered.reject(error);
                            });

                    } else {
                        defered.resolve(response);
                    }

                }, function (error) {
                    //var err = { status: error.status, message: error.data.Message };
                    defered.reject(error);
                });
        } else {
            defered.resolve(response);
        }
        return defered.promise;
    };

    var savePedidoOffline = function (pedido) {
        var defered = $q.defer();

        var query = 'SELECT pedido FROM Pedidos where id = ? and login = ? ';

        if (pedido.CvePedido === null) {
            defered.reject({ status: -1, message: 'clave de pedido invalida!' });
        } else {
            $cordovaSQLite.execute(db, query, [pedido.CvePedido, pedido.UsuarioLogin])
                .then(function (result) {
                    var jpedido = JSON.stringify(pedido);
                    var status = pedido.Sincronizado;
                    var register = pedido.FechaCaptura;

                    if (result.rows.length === 0) {
                        // insert
                        query = 'INSERT INTO Pedidos (id, nocliente,login, pedido, register, status) VALUES(?, ?, ?, ?, ?, ?)';
                        $cordovaSQLite.execute(db, query, [pedido.CvePedido, pedido.Cliente.NoCliente, pedido.UsuarioLogin, jpedido, register, status])
                        .then(function (result) {
                            console.info('Pedido insertado: ', status);
                            defered.resolve({ cvepedido: pedido.CvePedido, nocliente: pedido.Cliente.NoCliente, message: 'registros afectados' + result.rowsAffected });
                        }, function (error) {
                            defered.reject(error);
                        });
                    } else {
                        // update
                        query = 'UPDATE Pedidos set pedido = ?, register = ?, status= ?  WHERE id = ? and login= ? ';
                        $cordovaSQLite.execute(db, query, [jpedido, register, status, pedido.CvePedido, pedido.UsuarioLogin])
                        .then(function (result) {
                            console.info('Pedido actualizado: ', status);
                            defered.resolve({ cvepedido: pedido.CvePedido, nocliente: pedido.Cliente.NoCliente, message: 'registros afectados' + result.rowsAffected });
                        }, function (error) {
                            defered.reject(error);
                        });
                    }
                }, function (error) {
                    defered.reject(error);
                });
        }

        return defered.promise;
    };

    var searchPedidosTemporales = function (nocliente, login) {
        var defered = $q.defer();

        var query = 'select pedido, status from Pedidos where status = 2 and nocliente = ? and login = ? ';

        $cordovaSQLite.execute(db, query, [nocliente, login])
            .then(function (result) {
                var pedido = null;
                if (result.rows.length > 0) {
                    try {
                        pedido = JSON.parse(result.rows.item(0)['pedido']);
                        var status = result.rows.item(0)['status'];

                    } catch (err) {
                        console.error('Error al parsear pedido: ' + err.message);
                    }
                }

                defered.resolve(pedido);

            }, function (error) {
                defered.reject(error);
            });

        return defered.promise;
    };

    var getPedidosTemporales = function (login) {
        var defered = $q.defer();

        var query = 'select nocliente, pedido, status from Pedidos where status = 2 and login = ? order by nocliente ';

        $cordovaSQLite.execute(db, query, [login])
            .then(function (result) {
                var pedidos = [];

                if (result.rows.length > 0) {
                    try {
                        for (var i = 0; i < result.rows.length; i++) {
                            var pedido = JSON.parse(result.rows.item(i)['pedido']);
                            var status = result.rows.item(0)['status'];
                            pedidos.push(pedido);
                        }

                    } catch (err) {
                        console.error('Error al parsear pedido: ' + err.message);
                    }
                }

                defered.resolve(pedidos);

            }, function (error) {
                defered.reject(error);
            });

        return defered.promise;
    };

    var getPedidosEnviados = function (login) {
        var defered = $q.defer();

        var query = 'select nocliente, pedido, status from Pedidos where status = 1 and login = ? order by nocliente ';

        $cordovaSQLite.execute(db, query, [login])
            .then(function (result) {
                var pedidos = [];

                if (result.rows.length > 0) {
                    try {
                        for (var i = 0; i < result.rows.length; i++) {
                            var pedido = JSON.parse(result.rows.item(i)['pedido']);
                            var status = result.rows.item(0)['status'];
                            pedido.Show = false;
                            pedidos.push(pedido);
                        }

                    } catch (err) {
                        console.error('Error al parsear pedido: ' + err.message);
                    }
                }

                defered.resolve(pedidos);

            }, function (error) {
                defered.reject(error);
            });

        return defered.promise;
    };

    var services = {
        searchPedidosTemporales: searchPedidosTemporales,
        savePedidoOffline: savePedidoOffline,
        removePedido: removePedido,
        syncPedido: syncPedido,
        getPedidos: getPedidos,
        getPedido: getPedido,
        getPedidosTemporales: getPedidosTemporales,
        getPedidosEnviados: getPedidosEnviados
    };

    return services;
});