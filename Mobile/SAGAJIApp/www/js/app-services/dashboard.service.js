angular.module('dashboard.services', [])

.factory('dashboardService', function ($q, $cordovaSQLite) {

    var getCount = function (name) {
        var defered = $q.defer();
        var query = "SELECT COUNT(*) FROM " + name;
        var numRecords = 0;

        $cordovaSQLite.execute(db, query, [])
            .then(function (result) {
                if (result.rows.length > 0) {
                    numRecords = result.rows.item(0)['COUNT(*)'];
                    console.info(name + ':Registros: ' + numRecords);
                }
                defered.resolve(numRecords);
            }, function (error) {
                console.error('Error al consultar Equivalencias: ' + error.message);
            });

        return defered.promise;
    };

    var services = {
        getCount: getCount
    };

    return services;
});