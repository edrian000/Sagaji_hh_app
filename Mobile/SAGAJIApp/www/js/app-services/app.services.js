"use strict";

//var urlServiceBase = "http://sagaji-webservice.azurewebsites.net/";

angular.module("app.services", [])

.factory("authServices", function ($http, $timeout, $q) {

    var doLogin = function (userlogin) {
        var defered = $q.defer();
        var resp = $http({
            //url: "/TOKEN",
            url: serviceUrlBase + "api/Account/Login",
            method: "POST",
            data: $.param({ grant_type: 'password', Username: userlogin.username, Password: userlogin.password }),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).then(function (res) {
            defered.resolve(res);
        }, function (err) {
            defered.reject(err);
        });

        return defered.promise;
    };

    var doLogout = function () {
        var defered = $q.defer();

        $http.post(urlServiceBase + "api/Account/Logout")
        .then(function (res) {
            defered.resolve(res);
        }, function (err) {
            defered.reject(err);
        });

        return defered.promise;
    };

    var promises = {
        doLogin: doLogin,
        doLogout: doLogout
    };

    return promises;
})

.factory("menuServices", function () {
    var menuLogout = function () {
        var menuItems = [
            { icon: "ion ion-log-in", label: "Acceso", url: "login", rightContent: "" },
            { icon: "ion ion-information", label: "Acerca de ...", url: "about", rightContent: "" }

        ];

        return menuItems;
    };

    var menuLogin = function () {
        var menuItems = [
            { icon: "ion ion-bag", label: "Pedidos", url: "pedidos", rightContent: "template/search.html" },
            { icon: "ion ion-backspace-outline", label: "Devoluciones", url: "devoluciones", rightContent: "template/index.html" },
            { icon: "ion ion-cash", label: "Depósitos", url: "depositos" },
            { icon: "ion ion-card", label: "Cobranza", url: "cobranza" },
            { icon: "ion ion-settings", label: "Catálogos", url: "sync" },
            { icon: "ion ion-settings", label: "Versión 7.1.2", url: "" }
        ];

        return menuItems;
    };

    var promises = {
        menuLogout: menuLogout,
        menuLogin: menuLogin
    };

    return promises;
});