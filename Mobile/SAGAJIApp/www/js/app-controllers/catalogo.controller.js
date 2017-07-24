angular.module('catalogo.controllers', [])

.controller('catalogosCtrl', function ($scope, $state, $stateParams, $interval, $ionicHistory, $ionicLoading,
    syncService, productService) {


    $scope.step = "done";
    $scope.stop = null;
    $scope.catalogos = [];
    $scope.IsRunning = false;

    $scope.startTimer = {
        minute: 0,
        seconds: 0,
        msecondes: 0
    };

    $scope.process = {
        catalogo: "",
        total: 0,
        progress: 0,
        processed: 0,
        segmentos: [],
        status: ""
    };

    var downloadProcess = function (catalogo) {

        syncService.downloadCatalog(catalogo)
        .then(function (res) {
            // resultado de la descarga y parseo..
            if (res) {
                // guarda el resultado del parseo
                $scope.process = res;
                syncService.deleteCatalog(catalogo)
                .then(function (res) {
                    // estamos listos para empezar sincronización
                    $scope.step = "synchronizing";
                }, function (err) {
                    window.plugins.toast.showWithOptions({
                        message: "Falla al limpiar : " + name,
                        duration: "long", // which is 2000 ms. "long" is 4000. Or specify the nr of ms yourself.
                        position: "bottom",
                        addPixelsY: -40  // added a negative value to move it up a bit (default 0)
                    });
                    $scope.process.status = "Falla al limpiar : " + name;
                    console.error("Err: " + JSON.stringify(err));
                    $scope.step = "done";
                });
            }
        }, function (err) {
            window.plugins.toast.showWithOptions({
                    message: "Falla durante la descarga: " + name,
                    duration: "long", // which is 2000 ms. "long" is 4000. Or specify the nr of ms yourself.
                    position: "bottom",
                    addPixelsY: -40  // added a negative value to move it up a bit (default 0)
                });
            $scope.process.status = "Falla durante la descarga: " + name;
            console.error("Err: " + JSON.stringify(err));
            $scope.step = "done";
        });
    };

    var syncCatalogo = function (catalogo, segmento) {
        syncService.updateCatalog(catalogo, segmento)
            .then(function (res) {
                // segmento procesado, siguientesegmento sí lo hay.
                $scope.step = "synchronizing";
                $scope.process.processed = res;
                $scope.process.progress = Math.floor($scope.process.processed * 100 / $scope.process.total);
            }, function (err) {
                window.plugins.toast.showWithOptions({
                    message: "Falla durante la sincronización: " + name,
                    duration: "long", // which is 2000 ms. "long" is 4000. Or specify the nr of ms yourself.
                    position: "bottom",
                    addPixelsY: -40  // added a negative value to move it up a bit (default 0)
                });
                $scope.process.status = "Falla durante la sincronización: " + name;
                console.error("syncCatalogo Err:" + JSON.stringify(err));
                $scope.step = "done";
            });
    };

    var syncProcess = function () {

        console.log("step: " + $scope.step);

        switch ($scope.step) {            
            case "downloading":
                $scope.step = "wait";
                $scope.process.total = 0;
                $scope.process.progress = 0;
                $scope.process.segmentos = 0;
                $scope.process.catalogo = $scope.catalogos[0];
                $scope.process.status = "Descargando: " + $scope.process.catalogo;
                $scope.catalogos.splice(0, 1);
                downloadProcess($scope.process.catalogo);
                break;
            case "synchronizing":
                $scope.step = "wait";
                $scope.process.status = "Sincronizando: " + $scope.process.catalogo;

                if ($scope.process.segmentos.length > 0) {
                    $scope.segmento = $scope.process.segmentos[0];
                    $scope.process.segmentos.splice(0, 1);
                    syncCatalogo($scope.process.catalogo, $scope.segmento);
                } else {
                    $scope.step = "done";
                    $scope.process.status = "Proceso terminado con exito";
                    $scope.process.processed = 0;
                }
                break;
            case "wait":
                console.log("syncCatalogo:esperando ...");
                break;
            case "done":
                // se termino de procesar un catalogo
                if ($scope.catalogos.length > 0) {
                    $scope.IsRunning = true;
                    $scope.step = "downloading";
                } else {
                    // se termino....
                    $scope.step = "finish";
                }
                break;
            case "finish":
                $scope.process = {
                    catalogo: "",
                    total: 0,
                    progress: 0,
                    processed: 0,
                    segmentos: [],
                    status: "Sincronización completada"
                };
                $scope.process.time = null;
                $scope.IsRunning = false;

                stopSync();
                break;
        }
    };

    var syncAutomata = function () {

        if ($scope.stop === null) {
            $scope.stop = $interval(syncProcess, 100);
        }
    };

    var stopSync = function () {
        if ($scope.stop !== null) {
            $interval.cancel($scope.stop);
            $scope.stop = null;
        }
    };

    $scope.startSync = function (catalogo) {
        $scope.catalogos.push(catalogo);
        $scope.step = "done";
        $scope.startTime = new Date();
        syncAutomata();
    };

    $scope.startSyncAll = function () {

        $scope.catalogos = [];
        $scope.catalogos.push("existencias");
        $scope.catalogos.push("productos");
        $scope.catalogos.push("equivalencias");

        $scope.step = "done";
        syncAutomata();
    };

    $scope.startUser = function () {

        $scope.catalogos = [];
        $scope.catalogos.push("usuarios");
        $scope.catalogos.push("clientes");
        $scope.catalogos.push("carteras");
        $scope.catalogos.push("domicilios");

        $scope.step = "done";
        syncAutomata();
    };
   
    $scope.startDevoluciones = function() {
    $scope.catalogos = [];
      $scope.catalogos.push("devoluciones")
      
      $scope.step = "done";
      syncAutomata();
    };

    if ($stateParams.usuario) {

        window.plugins.toast.showWithOptions({
            message: "Espere sincronizando usuarios, carteras, clientes por primera vez",
            duration: "long", // which is 2000 ms. "long" is 4000. Or specify the nr of ms yourself.
            position: "bottom",
            addPixelsY: -40  // added a negative value to move it up a bit (default 0)
        });

        $scope.startUser();
    }

});