angular.module('settings.services', [])

.factory('settingsService', function ($cordovaSQLite, $q) {

    var services = {
        loadSettings: function () {

            var defered = $q.defer();
            var query = 'select settings from AppSettings';

            $cordovaSQLite.execute(db, query, [])
                .then(function (result) {
                    var settings;
                    var appSettings;

                    if (result.rows.length > 0) {
                        console.log("SELECTED -> " + result.rows.item(0).settings);
                        settings = result.rows.item(0).settings;
                        appSettings = JSON.parse(settings);
                    } else {
                        console.log("NO ROWS EXIST");
                    }
                    defered.resolve(appSettings);
                }, function (error) {
                    console.error(error);
                    defered.reject(error);
                });

            return defered.promise;

        },
        newInstance: function () {
            var defered = $q.defer();
            var appSettings = {
                UserInfo: {},
                DefaultCarteraCliente: {},
                CarterasClientes: [],
                Productos: [],
                Pedidos: []
            };


            var query = 'INSERT INTO  AppSettings ( settings) values(?)';
            var settings = JSON.stringify(appSettings);

            $cordovaSQLite.execute(db, query, [settings]).then(function (result) {
                defered.resolve(result);
            }, function (error) {
                defered.reject(error);
            });

            return defered.promise;
        },
        saveSettings: function (appSettings) {
            var defered = $q.defer();
            var query = 'UPDATE  AppSettings set settings= ?';
            var settings = JSON.stringify(appSettings);

            $cordovaSQLite.execute(db, query, [settings]).then(function (result) {
                defered.resolve(result);
            }, function (error) {
                defered.reject(error);
            });
            return defered.promise;
        }
    };

    return services;
})

.factory('accessService', function ($http, connectivityMonitor, $q, $cordovaSQLite, authServices) {

    var actualizaCredenciales = function (user) {
        var query = 'SELECT * FROM Credentials WHERE login=? and password=? ';
        // operaciones fuera de linea
        var parameters = [user.UserLogin, user.UserPassword, user.UserEmail];

        $cordovaSQLite.execute(db, query, [user.UserLogin.toLowerCase(), user.UserPassword])
        .then(function (result) {
            if (result.rows.length === 0) {
                $cordovaSQLite.execute(db, "INSERT INTO Credentials (login ,password ,email) VALUES (? , ? , ? )", parameters)
                    .then(function (result) {
                        console.log('usuario registrado..');
                    }, function (error) {
                        console.error('falla al registrar usuario: ' + error.message);
                    });
            } else {
                parameters = [user.UserEmail, user.UserLogin, user.UserPassword];
                $cordovaSQLite.execute(db, "UPDATE Credentials set email=? WHERE login=? and password=? ", parameters)
                    .then(function (result) {
                        console.log('usuario registrado..');
                    }, function (error) {
                        console.error('falla al registrar usuario: ' + error.message);
                    });
            }
        }, function () {
            console.error('falla al consultario credenciales: ' + error.message);
        });
    };

    var saveCredentialOffline = function (user) {
        var parameters = [user.UserLogin, user.UserPassword];
        var insertQuery = 'INSERT INTO Credentials ([login] ,[password] ,[email]) VALUES (? , ? , ?)';
        var updateQuery = 'UPDATE Credentials SET [password] = ?  WHERE login = ?';
        var query = 'SELECT count(*) FROM Credentials WHERE login = ? and password= ? ';
        //var query = 'SELECT * FROM Credentials';

        $cordovaSQLite.execute(db, query, [user.UserLogin.toLowerCase(), user.UserPassword])
                .then(function (result) {
                    if (result.rows.length === 0) {
                        $cordovaSQLite.execute(db, insertQuery, [user.UserLogin.toLowerCase(), user.UserPassword, user.UserEmail.toLowerCase()]).then(function (result) {
                            if (result.rowsAffected > 0) {
                                console.error('Actualizaci�n de credenciales exitosa');
                            }
                        }
                        , function (error) {
                            console.error('Error al insertar usuario: ' + error.message);
                        });
                    } else {
                        $cordovaSQLite.execute(db, updateQuery, [user.UserPassword, user.UserLogin.toLowerCase()]).then(function (result) {
                            if (result.rowsAffected > 0) {
                                console.error('Actualizaci�n de credenciales exitosa');
                            }
                        }, function (error) {
                            console.error('Error al actualizar usuario: ' + error.message);
                        });
                    }

                }, function (error) {
                    console.error('Error al consultar credenciales: ' + error.message);
                });
    };

    var doLogin = function (user) {

        var defered = $q.defer();

        if (db === null) {
            defered.reject({ status: -1, message: 'db invalida!' });
        } else {
            // operaciones fuera de linea
            var parameters = [user.UserLogin.toLowerCase(), user.UserPassword];

            try {
                $cordovaSQLite.execute(db, 'SELECT email FROM Credentials WHERE  login = ? and  password = ? ', parameters)
               .then(function (result) {

                   if (result.rows.length === 0) {

                       console.log("no existen usuarios en la bd");

                       if (connectivityMonitor.isOnline) {

                           var userLogin = {
                               grant_type: 'password',
                               username: user.UserLogin.toLowerCase(),
                               password: user.UserPassword
                           };

                           authServices.doLogin(userLogin)
                           .then(function (res) {
                               //console.log("res: " + JSON.stringify(res));
                               defered.resolve(res);
                           }, function (err) {
                               console.error("ERR: " + JSON.stringify(err));
                               defered.reject(err);
                           });

                       } else {
                           console.log("¡No hay datos!");
                           defered.reject({ status: -1, message: "¡Se requiere línea para sincronizar usuarios!" });
                       }
                   }

                   if (result.rows.length === 1) {

                       user.UserEmail = result.rows.item(0)['email'];

                       user.AccressGranted = "local";

                       defered.resolve(user);
                   }
               }, function (error) {
                   console.error('Error en login interno: ' + error.message);
                   defered.reject(error);
               });
            } catch (ex) {
                console.error('Error en login interno: ' + JSON.stringify(ex));
                defered.reject({ status: -1, message: ex.message });
            }
        }

        return defered.promise;
    };

    var doRegister = function (user) {
        var defered = $q.defer();
        var query = 'select * from Credentials where login= ? and password = ?';
        // operaciones fuera de linea
        var parameters = [user.UserLogin.toLowerCase(), user.UserPassword, user.UserEmail];

        $cordovaSQLite.execute(db, query, [user.UserLogin, user.UserPassword])
        .then(function (result) {
            if (result.rows.length === 0) {
                $cordovaSQLite.execute(db, "INSERT INTO Credentials (login ,password ,email) VALUES (? , ? , ? )", parameters)
                    .then(function (result) {
                        defered.resolve(result.insertId);
                    }, function (error) {
                    });
            }
        }, function () {
            defered.reject(error);
        });

        return defered.promise;
    };

    var doLogout = function () {

    };

    var services = {
        doLogout: doLogout,
        actualizaCredenciales: actualizaCredenciales,
        saveCredentialOffline: saveCredentialOffline,
        doLogin: doLogin,
        doRegister: doRegister
    };

    return services;
})

.factory('connectivityMonitor', function ($rootScope, $cordovaNetwork) {

    return {
        isOnline: function () {
            if (ionic.Platform.isWebView()) {
                return $cordovaNetwork.isOnline();
            } else {
                return navigator.onLine;
            }
        },
        isOffline: function () {
            if (ionic.Platform.isWebView()) {
                return !$cordovaNetwork.isOnline();
            } else {
                return !navigator.onLine;
            }
        },
        startWatching: function () {
            if (ionic.Platform.isWebView()) {

                $rootScope.$on('$cordovaNetwork:online', function (event, networkState) {
                    console.log("went online");
                });

                $rootScope.$on('$cordovaNetwork:offline', function (event, networkState) {
                    console.log("went offline");
                });
            }
            else {

                window.addEventListener("online", function (e) {
                    console.log("went online");
                }, false);

                window.addEventListener("offline", function (e) {
                    console.log("went offline");
                }, false);
            }
        }
    };
});