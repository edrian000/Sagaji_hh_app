angular.module('sync.services', [])

.factory('syncService', function ($http, $q, $rootScope, $cordovaSQLite, connectivityMonitor, $timeout, $cordovaFile, Papa) {

    var sleep = function (miliseconds) {
        var currentTime = new Date().getTime();

        while (currentTime + miliseconds >= new Date().getTime()) {
            console.info(".");
        }
    };


    var downloadCatalog = function (name) {
        var defered = $q.defer();
        var isOnline = connectivityMonitor.isOnline();

        var loginData = sessionStorage.getItem("loginData");

        if (isOnline) {
            var url;
            var trustHosts = true;
            var options = {};
            var fileName = name + '.txt';


            var config = {
                delimiter: '',
                header: false,
                dynamicTyping: false,
                skipEmptyLines: false,
                preview: 0,
                step: undefined,
                encoding: '',
                worker: false,
                comments: '',
                download: true
            };

            switch (name) {
                case 'domicilios':
                    url = serviceUrlBase + 'api/Catalogos/Domicilios?login=' + loginData;
                    break;
                case 'carteras':
                    url = serviceUrlBase + 'api/Catalogos/Carteras?login=' + loginData;
                    break;
                case 'clientes':
                    url = serviceUrlBase + 'api/Catalogos/Clientes?login=' + loginData;
                    break;
                case 'usuarios':
                    url = serviceUrlBase + 'api/Catalogos/Usuarios?login=' + loginData;
                    break;
                case 'existencias':
                    url = serviceUrlBase + 'api/Catalogos/Existencias?login=' + loginData;
                    break;
                case 'productos':
                    url = serviceUrlBase + 'api/Catalogos/Productos?login=' + loginData;
                    break;
                case 'equivalencias':
                    url = serviceUrlBase + 'api/Catalogos/Equivalencias?login=' + loginData;
                    break;
                case 'devoluciones':
                    url = serviceUrlBase + 'api/Catalogos/Devoluciones?login=' + loginData;
                    break;
            }

            console.log("descargando catalogo:" + name + " ...");
            Papa.parse(url, config)
            .then(function (result) {
                if (result.data.length - 1 > 0) {
                    var process = {
                        catalogo: name,
                        total: result.data.length - 1,
                        progress: 0,
                        processed: 0,
                        segmentos: [],
                        status: "Descarga terminada con exito"
                    };

                    var segmentSize = process.total;

                    if (segmentSize >= 100000) {
                        //segmentSize = Math.floor(process.total / 100);
                        segmentSize = Math.floor(process.total / 8);
                    } else if (segmentSize >= 25000 && segmentSize < 100000) {
                        segmentSize = 25000;
                    }

                    var segment = [];

                    while (result.data.length - 1 > 0) {

                        if (result.data.length - 1 !== 0 && result.data.length - 1 < segmentSize) {
                            segmentSize = result.data.length - 1;
                        }

                        segment = result.data.splice(0, segmentSize);

                        if (segment.length > 0) {
                            process.segmentos.push(segment);
                        }
                    }

                    defered.resolve(process);
                } else {
                    defered.reject({ statusn: -1, message: "¡error catalogo " + name + " vacio!" });
                }

            }, function (error) {
                defered.reject(error);
            });

        } else {
            defered.reject({ status: -1, message: '¡Sin conexión!' });
        }
        return defered.promise;
    };

    var deleteCatalog = function (tableName) {

        if (tableName === 'usuarios') {
            tableName = 'credentials';
        }

        var defered = $q.defer();

        if (db !== null) {

            var query = 'DELETE FROM ' + tableName + ' ; ';

            $cordovaSQLite.execute(db, query, [])
               .then(function (result) {
                   var rowsAffected = result.rowsAffected;
                   console.info('table: ' + tableName + 'registro borrados: ' + rowsAffected);
                   defered.resolve(rowsAffected);
               }, function (error) {
                   defered.reject(error);
               });

        }

        return defered.promise;
    };

    var syncDomicilios = function (data) {
        var defered = $q.defer();
        console.log('syncDomicilios:' + data.length);
        var query = 'INSERT INTO Domicilios (id,nocliente, domentrega) VALUES(?,?,?)';

        db.transaction(function (tx) {
            console.info('insertando: ' + data.length + ' ...');
            $.each(data, function (i, tokens) {
                if (tokens.length === 3) {
                    var id = tokens[0].length > 0 ? parseInt(tokens[0]) : 0;
                    var params = [id, tokens[1], tokens[2]];
                    //console.log('insertando: ' + JSON.stringify(params));
                    tx.executeSql(query, params);
                } else {
                    console.log('Domicilio invalido: ' + JSON.stringify(params));
                }
            });
        }, function (error) {
            console.log('Error al insertar domicilios: ' + error.message);
            defered.reject(error);
        }, function () {
            db.executeSql('SELECT COUNT(*) FROM Domicilios', [], function (res) {
                var records = res.rows.item(0)['COUNT(*)'];
                console.log('Registros insertados: ' + JSON.stringify(res.rows.item(0)));
                defered.resolve(records);
            });
        });
        return defered.promise;
    };

    var syncCarteras = function (data) {
        var defered = $q.defer();
        console.log('syncCarteras:' + data.length);
        var query = 'INSERT INTO Carteras (login, cartera) VALUES(?,?)';

        db.transaction(function (tx) {

            console.info('insertando: ' + data.length + ' ...');

            $.each(data, function (i, params) {

                if (params.length === 2) {
                    //console.log('insertando: ' + JSON.stringify(params));
                    tx.executeSql(query, params);
                } else {
                    console.log('Cartera invalido: ' + JSON.stringify(params));
                }
            });
        }, function (error) {
            console.log('Error al insertar carteras: ' + error.message);
            defered.reject(error);
        }, function () {
            db.executeSql('SELECT COUNT(*) FROM Carteras', [], function (res) {
                var records = res.rows.item(0)['COUNT(*)'];
                console.log('Carteras insertados: ' + JSON.stringify(res.rows.item(0)));
                defered.resolve(records);
            });
        });

        return defered.promise;
    };

    var syncClientes = function (data) {
        var defered = $q.defer();
        console.log('syncClientes:' + data.length);
        var query = 'INSERT INTO Clientes (cartera, nocliente, nombre, rfc, domfiscal, telefono, credito) VALUES(?,?,?,?,?,?,?)';

        db.transaction(function (tx) {
            console.info('insertando: ' + data.length + ' ...');
            $.each(data, function (i, params) {

                if (params.length === 7) {
                    //console.log('insertando: ' + JSON.stringify(params));
                    tx.executeSql(query, params);
                } else {
                    console.log('Cliente invalido: ' + JSON.stringify(params));
                }
            });
        }, function (error) {
            console.log('Error al insertar clientes: ' + error.message);
            defered.reject(error);
        }, function () {
            db.executeSql('SELECT COUNT(*) FROM Clientes', [], function (res) {
                var records = res.rows.item(0)['COUNT(*)'];
                console.log('Registros insertados: ' + JSON.stringify(res.rows.item(0)));
                defered.resolve(records);
            });
        });
        return defered.promise;
    };

    var syncExistencias = function (data) {
        var defered = $q.defer();
        console.log('syncExistencias:' + data.length);
        var query = 'INSERT INTO Existencias (codigo, almacen, existencia) VALUES(?,?,?)';

        db.transaction(function (tx) {
            console.info('insertando: ' + data.length + ' ...');
            $.each(data, function (i, tokens) {

                if (tokens.length === 3) {
                    var params = [tokens[0], tokens[1], parseFloat(tokens[2])];
                    //console.info('insertando: ' + i, +' : ' + JSON.stringify(params));
                    tx.executeSql(query, params);
                } else {
                    console.log('Existencia invalido: ' + JSON.stringify(tokens));
                }
            });
        }, function (error) {
            console.log('Error al insertar Existencias: ' + error.message);
            defered.reject(error);
        }, function () {
            db.executeSql('SELECT COUNT(*) FROM Existencias', [], function (res) {
                var records = res.rows.item(0)['COUNT(*)'];
                console.log('Registros insertados: ' + JSON.stringify(res.rows.item(0)));
                defered.resolve(records);
            });
        });
        return defered.promise;
    };

    var syncProductos = function (data) {
        var defered = $q.defer();
        console.log('syncProductos:' + data.length);
        var query = 'INSERT INTO Productos (codigo, descripcion, precio, unidad, linea) VALUES(?,?,?,?,?)';

        if (db) {
            db.transaction(function (tx) {
                console.info('insertando: ' + data.length + ' ...');
                $.each(data, function (i, tokens) {

                    if (tokens.length === 5) {
                        var params = [tokens[0], tokens[1], parseFloat(tokens[2]), tokens[3], tokens[4]];
                        //console.info('insertando: ' + i, ' : ' + JSON.stringify(params));
                        tx.executeSql(query, params);
                    } else {
                        console.log('Producto invalido: ' + JSON.stringify(tokens));
                    }
                });
            }, function (error) {
                console.log('Error al insertar Productos: ' + error.message);
                defered.reject(error);
            }, function () {
                db.executeSql('SELECT COUNT(*) FROM Productos', [], function (res) {
                    var records = res.rows.item(0)['COUNT(*)'];
                    console.log('Registros insertados: ' + JSON.stringify(res.rows.item(0)));
                    defered.resolve(records);
                });
            });
        } else {
            defered.reject({ status: -1, message: 'No existe db' });
        }

        return defered.promise;
    };

    var syncEquivalencias = function (data) {
        var defered = $q.defer();
        console.log('syncEquivalencias:' + data.length);
        var query = 'INSERT INTO Equivalencias (codigo, codigoequiv) VALUES(?,?)';

        db.transaction(function (tx) {
            console.info('insertando: ' + data.length + ' ...');
            $.each(data, function (i, params) {

                if (params.length === 2) {
                    //console.info('insertando: ' + i + ': ' + JSON.stringify(params));
                    tx.executeSql(query, params);
                } else {
                    console.log('Equivalencia invalido: ' + JSON.stringify(params));
                }
            });
        }, function (error) {
            console.log('Error al insertar Equivalencias: ' + error.message);
            defered.reject(error);
        }, function () {
            db.executeSql('SELECT COUNT(*) FROM Equivalencias', [], function (res) {
                var records = res.rows.item(0)['COUNT(*)'];
                console.log('Equivalencias insertadas: ' + JSON.stringify(res.rows.item(0)));
                defered.resolve(records);
            });
        });
        return defered.promise;
    };

    var syncCredentials = function (data) {
        var defered = $q.defer();
        console.log('syncCredentials:' + data.length);
        var query = 'INSERT INTO Credentials (login , password , fullname , email , perfil ) VALUES(?,?,?,?,?)';

        db.transaction(function (tx) {
            console.info('insertando: ' + data.length + ' ...');
            $.each(data, function (i, params) {

                if (params.length === 5) {
                    //console.info('insertando: ' + i + ': ' + JSON.stringify(params));
                    tx.executeSql(query, params);
                } else {
                    console.log('Credentials invalido: ' + JSON.stringify(params));
                }
            });
        }, function (error) {
            console.log('Error al insertar Credentials: ' + error.message);
            defered.reject(error);
        }, function () {
            db.executeSql('SELECT COUNT(*) FROM Credentials', [], function (res) {
                var records = res.rows.item(0)['COUNT(*)'];
                console.log('Credentilas insertadas: ' + JSON.stringify(res.rows.item(0)));
                defered.resolve(records);
            });
        });
        return defered.promise;
    };

    var syncDevoluciones = function (data) {
        var defered = $q.defer();
        console.log('syncDevoluciones:' + data.length);
        var query = 'INSERT INTO Devoluciones (pedido, cliente) VALUES(?,?)';

        db.transaction(function (tx) {
            console.info('insertando: ' + data.length + ' ...');
            $.each(data, function (i, params) {

                if (params.length === 2) {
                    //console.info('insertando: ' + i + ': ' + JSON.stringify(params));
                    tx.executeSql(query, params);
                } else {
                    console.log('Devolucion invalido: ' + JSON.stringify(params));
                }
            });
        }, function (error) {
            console.log('Error al insertar Devoluciones: ' + error.message);
            defered.reject(error);
        }, function () {
            db.executeSql('SELECT COUNT(*) FROM Devoluciones', [], function (res) {
                var records = res.rows.item(0)['COUNT(*)'];
                console.log('Devoluciones insertadas: ' + JSON.stringify(res.rows.item(0)));
                defered.resolve(records);
            });
        });
        return defered.promise;
    };


    var updateCatalog = function (name, data) {
        var defered = $q.defer();
        var fileName = name + '.txt';

        var promise;
        switch (name) {
            case 'domicilios':
                promise = syncDomicilios(data);
                break;
            case 'carteras':
                promise = syncCarteras(data);
                break;
            case 'clientes':
                promise = syncClientes(data);
                break;
            case 'existencias':
                promise = syncExistencias(data);
                break;
            case 'productos':
                promise = syncProductos(data);
                break;
            case 'equivalencias':
                promise = syncEquivalencias(data);
                break;
            case 'usuarios':
                promise = syncCredentials(data);
                break;
             case 'devoluciones':
                promise = syncDevoluciones(data);
                break;
        }

        promise.then(function (records) {
            defered.resolve(records);
        }, function (error) {
            defered.reject(error);
        });


        return defered.promise;
    };

    var promise = {
        downloadCatalog: downloadCatalog,
        deleteCatalog: deleteCatalog,
        updateCatalog: updateCatalog
    };

    return promise;
});