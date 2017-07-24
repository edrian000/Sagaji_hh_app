angular.module('devolucion.controllers', [])

.controller('devolucionCtrl', function ($scope, $ionicHistory, $state, ionicDatePicker) {

    console.log('devolucionCtrl ...');

    if (sessionStorage.getItem("loginData") == null) {
        $ionicHistory.nextViewOptions({
            disableAnimate: true,
            disableBack: true
        });

        $state.go('app.login', {}, { reload: true });
    }

    $scope.loginData = sessionStorage.getItem("loginData");

    $scope.Model = {
        DateFilter: new Date(),

        Facturas: []
    };

    var ipObj1 = {
        callback: function (val) {  //Mandatory
            console.log('Return value from the datepicker popup is : ' + val, new Date(val));
            $scope.Model.DateFilter = new Date(val);
        },
        disabledDates: [            //Optional
          new Date(2016, 2, 16),
          new Date(2015, 3, 16),
          new Date(2015, 4, 16),
          new Date(2015, 5, 16),
          new Date('Wednesday, August 12, 2015'),
          new Date("08-16-2016"),
          new Date(1439676000000)
        ],
        from: new Date(2016, 1, 1), //Optional
        to: new Date(), //Optional
        inputDate: new Date(),      //Optional
        mondayFirst: true,          //Optional
        disableWeekdays: [0],       //Optional
        closeOnSelect: true,       //Optional
        templateType: 'popup'       //Optional
    };


    $scope.clickMe = function (item) {

    };

    $scope.isGroupShowing = function (item) {

    };

    $scope.editMe = function (item) {

    };

    $scope.selectDate = function (item) {
        ionicDatePicker.openDatePicker(ipObj1);
    };

    
});