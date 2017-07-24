angular.module('cartera.services', [])

.factory('carteraService', function ($http, connectivityMonitor, $q, $cordovaSQLite, $linq, $rootScope) {

    var saveCartera = function (login, cartera) {

        var query = 'SELECT * FROM Carteras where  cartera = ? and lower(login) = ? ';

        $cordovaSQLite.execute(db, query, [cartera, login]).then(
                function (result) {

                    if (result.rows.length === 0) {
                        // nueva cartera
                        query = 'INSERT INTO Carteras (cartera, login) values(?,?)';
                        $cordovaSQLite.execute(db, query, [cartera, login]).then(function (result) {
                            if (result.rowsAffected > 0) {
                                console.info('cartera registrada');
                            }
                            console.info('cartera registrada');
                        }, function (error) {
                            console.error('Error al actualizar cartera: ' + error.message);
                        });
                    } else {
                        //query = 'UPDATE Carteras set login = ? WHERE cartera = ? and login ';
                        //$cordovaSQLite.execute(db, query, [login, cartera]).then(function (result) {
                        //    if (result.rowsAffected > 0) {
                        //        console.info('cartera actualizada');
                        //    }
                        //}, function (error) {
                        //    console.error('Error al actualizar cartera: ' + error.message);
                        //});
                    }
                }, function (error) {
                    console.error('Error al actualizar cartera: ' + error.message);
                });

    };

    var syncCartera = function (login) {
        var isOnline = connectivityMonitor.isOnline();
        var defered = $q.defer();

        if (isOnline) {

            $http.get(serviceUrlBase + 'api/Catalogos/Carteras?login=' + login)
                .then(function (result) {

                    var carteras = result.data;

                    //console.log('consulta de carteras exitosa!');

                    $rootScope.$broadcast('onCarterasSyncChange', { Count: carteras.length, Message: 'Sincronizando carteras' });

                    carteras.forEach(function (cartera) {
                        $rootScope.$broadcast('onCarterasSyncChange', { Count: carteras.length--, Message: 'Sincronizando cartera:' + cartera });
                        saveCartera(login.toLowerCase(), cartera);
                    });

                    defered.resolve(carteras);

                }, function (error) {
                    defered.reject(error);
                });
        }

        return defered.promise;
    };

    var getCartera = function (usuario) {

        var defered = $q.defer();
        // consulta offline
        var query = 'SELECT cartera FROM Carteras where lower(login) = ? order by cartera';
        $cordovaSQLite.execute(db, query, [usuario.toLowerCase()])
            .then(function (result) {
                var carteras = [];

                if (result.rows.length > 0) {

                    for (var i = 0; i < result.rows.length; i++) {
                        carteras.push(result.rows.item(i)['cartera']);
                    }
                }
                defered.resolve(carteras);
            }, function (error) {
                defered.reject(error);

            });

        return defered.promise;
    };

    var services = {
        saveCartera: saveCartera,
        getCartera: getCartera,
        syncCartera: syncCartera
    };

    return services;
});