(function () {
    'use strict';

    angular
        .module('app')
        .controller('app_controller', ['$scope', '$upload', 'plataformService', 'appService',
            function ($scope, $upload, plataformService, appService) {
                $scope.upload = [];
                $scope.Plataforms = [];
                $scope.Apps = [];

                $scope.app = {
                    Platform: 0,
                    Version: ''
                };

                plataformService.getPlataforms()
                .then(function (result) {
                    $scope.Plataforms = result.data;
                }, function (error) {
                    console.error('Error al cargar plataformas: ' + error.message);
                });

                appService.getApps()
                .then(function (result) {
                    $scope.Apps = result.data;
                }, function (error) {
                    console.error('Error al cargar plataformas: ' + error.message);
                });

                $scope.Download = function(app){
                    appService.downloadApp(app.Version, app.Platform)
                    .then(function (result) {
                        if (result) {

                        }
                    }, function (error) {
                        console.error('Error al descargar app: ' + error.message);
                    });
                };

                $scope.onFileSelect = function ($files) {
                    if ($scope.app.Version.length === 0) {
                        return;
                    }
                    //$files: an array of files selected, each file has name, size, and type.
                    for (var i = 0; i < $files.length; i++) {
                        var $file = $files[i];
                        (function (index) {
                            $scope.upload[index] = $upload.upload({
                                url: "/api/App/Upload", // webapi url
                                method: "POST",
                                data: { fileUploadObj: $scope.app },
                                file: $file
                            }).progress(function (evt) {
                                // get upload percentage
                                console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
                            }).success(function (data, status, headers, config) {
                                // file is uploaded successfully
                                console.log(data);
                                appService.getApps()
                                    .then(function (result) {
                                        $scope.Apps = result.data;
                                    }, function (error) {
                                        console.error('Error al cargar plataformas: ' + error.message);
                                    });
                            }).error(function (data, status, headers, config) {
                                // file failed to upload
                                console.log(data);
                            });
                        })(i);
                    }
                };

                $scope.abortUpload = function (index) {
                    $scope.upload[index].abort();
                };

            }]);


})();
