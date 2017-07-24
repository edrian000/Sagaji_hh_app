(function () {
    'use strict';

    angular
        .module('app')
        .controller('app_controller', ['$scope', '$upload', 'plataformService', 'appService', 'toaster', 'cfpLoadingBar',
            function ($scope, $upload, plataformService, appService, toaster, cfpLoadingBar) {

                $scope.ProcessMessage = '';
                $scope.isUploading = false;
                $scope.upload = [];
                $scope.Plataforms = [];
                $scope.Apps = [];

                $scope.app = {
                    Platform: 0,
                    Version: ''
                };

                $scope.GetPlatformName = function (platform) {
                    return $scope.Plataforms[platform].Text;
                };

                $scope.Remove = function (app) {
                    if (app) {
                        appService.removeApp(app.Version, app.Platform)
                        .then(function (result) {
                            appService.getApps().then(function (result) {
                                $scope.Apps = result.data;
                            }, function (error) {
                                console.error('Error al cargar aplicaciones: ' + error.message);
                                //toaster.error('Error al cargar aplicaciones: ' + error.message, 'Aplicación');
                            });
                        }, function (error) {
                            var message = 'Error al eliminar aplicación: ' + error.message;
                            console.error(message);
                            //toaster.error(message, 'Aplicación');
                        });
                    }
                }

                cfpLoadingBar.start();

                plataformService.getPlataforms()
                .then(function (result) {
                    $scope.Plataforms = result.data;
                }, function (error) {
                    console.error('Error al cargar plataformas: ' + error.message);
                    //toaster.error('Error al cargar plataformas: ' + error.message, 'Aplicación');
                });

                appService.getApps()
                .then(function (result) {
                    cfpLoadingBar.complete();
                    $scope.Apps = result.data;
                }, function (error) {
                    console.error('Error al cargar aplicaciones: ' + error.message);
                    //toaster.error('Error al cargar aplicaciones: ' + error.message, 'Aplicación');
                    cfpLoadingBar.complete();
                });

                $scope.Download = function (app) {
                    appService.downloadApp(app.Version, app.Platform)
                    .then(function (result) {
                        //toaster.success('Descarga exitosa', 'Aplicación');
                    }, function (error) {
                        console.error('Error al descargar app: ' + error.message);
                        //toaster.error(error.message, 'Aplicación');
                    });
                };

                $scope.onFileSelect = function ($files) {
                    $scope.ProcessMessage = '';

                    if ($scope.app.Version.length === 0) {
                        return;
                    }

                    $scope.ProcessMessage = 'Subiendo aplicación...';

                    var accesstoken = sessionStorage.getItem('accessToken');

                    var authHeaders = {};

                    if (accesstoken) {
                        authHeaders.Authorization = 'Bearer ' + accesstoken;
                    }

                    //$files: an array of files selected, each file has name, size, and type.
                    for (var i = 0; i < $files.length; i++) {
                        var $file = $files[i];
                        (function (index) {
                            $scope.isUploading = true;
                            $scope.upload[index] = $upload.upload({
                                url: "/api/App/Upload", // webapi url
                                method: "POST",
                                data: { fileUploadObj: $scope.app },
                                headers: authHeaders,
                                file: $file
                            }).progress(function (evt) {
                                // get upload percentage
                                console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
                            }).success(function (data, status, headers, config) {
                                // file is uploaded successfully
                                $scope.ProcessMessage = 'Subiendo cargada exitosamente';
                                $scope.isUploading = false;
                                console.log(data);
                                appService.getApps()
                                    .then(function (result) {
                                        $scope.Apps = result.data;
                                    }, function (error) {
                                        console.error('Error al cargar plataformas: ' + error.message);
                                        //toaster.error(error.message, 'Aplicación');
                                    });
                            }).error(function (data, status, headers, config) {
                                // file failed to upload
                                $scope.ProcessMessage = 'Falla al cargar aplicación: ' + data;
                                $scope.isUploading = false;
                                console.log(data);
                                //toaster.error(data, 'Aplicación');
                            });
                        })(i);
                    }
                };

                $scope.abortUpload = function (index) {
                    $scope.isUploading = false;
                    $scope.upload[index].abort();
                    //toaster.warning('Carga de aplicación cancelada', 'Aplicación');
                };

            }]);


})();
