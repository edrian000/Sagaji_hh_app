angular.module('client.services', [])

.factory('clientService', function ($http, connectivityMonitor, $cordovaSQLite, $q, $rootScope) {

    var saveCliente = function (cliente) {
        var query = 'SELECT nocliente FROM Clientes where cartera = ? and nocliente = ? ';

        $cordovaSQLite.execute(db, query, [cliente.Cartera, cliente.NoCliente])
            .then(function (result) {
                if (result.rows.length == 0) {
                    // inserta
                    query = 'INSERT INTO  Clientes (cartera, nocliente, nombre, rfc, domfiscal, telefono, credito) values(?, ?, ?, ?, ?, ?, ?)';
                    $cordovaSQLite.execute(db, query, [cliente.Cartera, cliente.NoCliente, cliente.Nombre, cliente.Rfc, cliente.Domfiscal, cliente.Telefono, cliente.Credito])
                    .then(function (result) {
                        console.info(cliente.Cartera + ': registro de cliente exitoso!');
                        if (cliente.Domicilios.length > 0) {
                            cliente.Domicilios.forEach(function (domicilio) {
                                updateDomicilio(cliente.NoCliente, domicilio);
                            });
                        }
                    }, function (error) {
                        console.error('Error al registrar clientes: ' + error.message);
                    });
                } else {
                    // actualiza
                    query = 'UPDATE Clientes set nombre = ?, rfc = ?, domfiscal = ?, telefono = ?, credito= ?  WHERE cartera = ? and nocliente = ? ';
                    $cordovaSQLite.execute(db, query, [cliente.Nombre, cliente.Rfc, cliente.Domfiscal, cliente.Telefono, cliente.Credito, cliente.Cartera, cliente.NoCliente])
                        .then(function (result) {
                            //console.info(cliente.Cartera + ': actualización de cliente exitoso!');
                            if (cliente.Domicilios.length > 0) {
                                cliente.Domicilios.forEach(function (domicilio) {
                                    updateDomicilio(cliente.NoCliente, domicilio);
                                });
                            }
                        }, function (error) {
                            console.error('Error al actualizar clientes: ' + error.message);
                        });
                }
            }, function (error) {
                console.error('Error al consultar clientes: ' + error.message);
            });
    };

    var updateDomicilio = function (nocliente, domicilio) {
        var query = 'select id, domentrega from  Domicilios where nocliente = ? and id = ? ';
        $cordovaSQLite.execute(db, query, [nocliente, domicilio.Id])
        .then(function (result) {
            if (result.rows.length == 0) {
                // insert
                query = 'INSERT INTO Domicilios (id, nocliente, domentrega) values (?, ?, ?) ';
                $cordovaSQLite.execute(db, query, [domicilio.Id, nocliente, domicilio.DomEntrega])
                .then(function (result) {
                    //console.info('registro de domicilio exitoso!');
                }, function (error) {
                    console.error('Error al agregar domicilio: ' + error.message);
                });
            } else {
                // update
                query = 'UPDATE Domicilios set domentrega= ?   WHERE nocliente = ? and id = ? ';
                $cordovaSQLite.execute(db, query, [domicilio.DomEntrega, nocliente, domicilio.Id])
                .then(function (result) {
                    //console.info('actualización de domicilio exitoso!');
                }, function (error) {
                    console.error('Error al actualizar domicilio: ' + error.message);
                });
            }
        }, function (error) {
            console.error('Error al consultar domicilios: ' + error.message);
        });
    };

    var saveDomicilios = function (cliente) {
        var defered = $q.defer();
        //var query = 'select count(*) from  Domicilios where nocliente = ? ';
        var query = 'delete from  Domicilios where nocliente = ? ';

        $cordovaSQLite.execute(db, query, [cliente.NoCliente])
        .then(function (result) {
            if (result.rowsAffected > 0) {
            }

            $rootScope.$broadcast('onDomiciliosSyncChange', { Count: cliente.Domicilios.length, Message: 'Sincronizando domicilios' });

            cliente.Domicilios.forEach(function (domicilio) {

                $rootScope.$broadcast('onDomiciliosSyncChange', { Count: cliente.Domicilios.length--, Message: 'Sincronizando domicilio:' + domicilio.Id });

                updateDomicilio(cliente.NoCliente, domicilio);
            });
            defered.resolve('Registrando domicilios');
        }, function (error) {
            defered.reject(error);
        });

        return defered.promise;
    };

    var getDomicilios = function (noCliente) {
        var defered = $q.defer();
        var query = 'select id, domentrega from  Domicilios where nocliente = ? ';

        $cordovaSQLite.execute(db, query, [noCliente])
        .then(function (result) {
            var domicilios = [];
            if (result.rows.length > 0) {
                for (var i = 0; i < result.rows.length; i++) {
                    var dom = {
                        Id: result.rows.item(i)['id'],
                        DomEntrega: result.rows.item(i)['domentrega'],
                    };
                    domicilios.push(dom);
                }
            }
            defered.resolve(domicilios);
        }, function (error) {
            defered.reject(error);
        });
        return defered.promise;
    };

    var getClientes = function (cartera) {

        var defered = $q.defer();

        var isOnline = connectivityMonitor.isOnline();

        var query = 'select nocliente, nombre, rfc, domfiscal, telefono, credito  from Clientes where cartera= ? ';

        console.log('query: ' + query + ' cartera:' + cartera);

        try {
            $cordovaSQLite.execute(db, query, [cartera])
            .then(function (result) {
                var clientes = [];
                if (result.rows.length > 0) {
                    for (var i = 0; i < result.rows.length; i++) {
                        var client = {
                            Cartera: cartera,
                            NoCliente: result.rows.item(i)['nocliente'],
                            Nombre: result.rows.item(i)['nombre'],
                            Rfc: result.rows.item(i)['rfc'],
                            DomFiscal: result.rows.item(i)['domfiscal'],
                            Telefono: result.rows.item(i)['telefono'],
                            Credito: result.rows.item(i)['credito'],
                            Domicilios: []
                        };

                        clientes.push(client);
                    }
                }
                defered.resolve(clientes);
            }, function (error) {
                defered.reject(error);
            });
        } catch (ex) {
            console.error('Err: ' + ex.message);
        }


        return defered.promise;
    };


    var getClientesPorSincronizar = function (today) {
        var defered = $q.defer();
        if (db != null) {
            var clientes = [];
            var hoy = today.toISOString().substring(0, 10);

            //$cordovaSQLite.execute(db, 'SELECT nocliente from Clientes where register != ? order by nocliente  desc ', [hoy])
            $cordovaSQLite.execute(db, 'SELECT nocliente from Clientes order by nocliente  desc ', [])
            .then(function (result) {
                if (result.rows.length > 0) {
                    for (var i = 0; i < result.rows.length; i++) {
                        var nocliente = result.rows.item(i)['nocliente'];
                        clientes.push(nocliente);
                    }
                }
                defered.resolve(clientes);
            }, function (error) {
                defered.reject(error);
            });

        } else {
            defered.reject({ status: -1, message: 'la bd no esta instanciada' });
        }
        return defered.promise;
    };

    var services = {
        getClientes: getClientes,
        getDomicilios: getDomicilios,
        updateDomicilio: updateDomicilio,
        getClientesPorSincronizar: getClientesPorSincronizar,
        saveDomicilios: saveDomicilios
    };

    return services;
});