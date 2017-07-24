(function () {
    'use strict';

    angular
        .module('app')
        .controller('logincontroller', ['$scope', 'loginservice', 'toaster', function ($scope, loginservice, toaster) {

            //Scope Declaration
            $scope.responseData = "";

            $scope.userName = "";
            $scope.userLoginEmail = "";
            $scope.userLoginPassword = "";

            $scope.accessToken = sessionStorage.getItem('accessToken');

            //console.info('$scope.accessToken:' + $scope.accessToken);


            $scope.refreshToken = "";
            //Ends Here

            //Function to register user
            $scope.registerUser = function () {

                $scope.responseData = "";

                //The User Registration Information
                var userRegistrationInfo = {
                    Email: $scope.userRegistrationEmail,
                    Password: $scope.userRegistrationPassword,
                    ConfirmPassword: $scope.userRegistrationConfirmPassword
                };

                var promiseregister = loginservice.register(userRegistrationInfo);

                promiseregister.then(function (resp) {
                    $scope.responseData = "User is Successfully";
                    $scope.userRegistrationEmail = "";
                    $scope.userRegistrationPassword = "";
                    $scope.userRegistrationConfirmPassword = "";
                }, function (err) {
                    $scope.responseData = "Error " + err.status;
                });
            };


            $scope.redirect = function () {
                window.location.href = '/Home/Index';
            };

            //Function to Login. This will generate Token 
            $scope.login = function () {
                //This is the information to pass for token based authentication
                var userLogin = {
                    grant_type: 'password',
                    username: $scope.userLoginEmail,
                    password: $scope.userLoginPassword
                };

                var promiselogin = loginservice.login(userLogin);

                promiselogin.then(function (resp) {

                    $scope.userName = resp.data.userName;
                    //Store the token information in the SessionStorage
                    //So that it can be accessed for other views
                    sessionStorage.setItem('userName', resp.data.userName);
                    sessionStorage.setItem('accessToken', resp.data.access_token);
                    sessionStorage.setItem('refreshToken', resp.data.refresh_token);
                    window.location.href = '/Home/Dashboard';
                }, function (err) {
                    //$scope.responseData = "Error " + err.status;
                    //console.error($scope.responseData);
                    toaster.error('SAGAJI.Services', 'Error: ' + err.statusText);
                    //toaster.pop({
                    //    type: 'error',
                    //    title: 'SAGAJI.Services',
                    //    body: "Error " + err.status,
                    //    showCloseButton: true,
                    //    closeHtml: '<button>Close</button>'
                    //});
                });

            };

            $scope.logout = function () {
                loginservice.logout()
                .then(function (result) {
                    sessionStorage.removeItem('userName');
                    sessionStorage.removeItem('accessToken');
                    sessionStorage.removeItem('refreshToken');
                    $scope.accessToken = null;
                    $scope.redirect();
                }, function (error) {
                    $scope.responseData = "Error " + error.status;
                    sessionStorage.removeItem('userName');
                    sessionStorage.removeItem('accessToken');
                    sessionStorage.removeItem('refreshToken');
                    $scope.accessToken = null;
                });
            };

        }]);

})();
