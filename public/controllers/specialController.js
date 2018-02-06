app.controller('SpecialController', ['$scope', '$http', 'SweetAlert', 'SpecialService', function($scope, $http, SweetAlert, SpecialService) {
    $scope.forwardEmail = function() {
        var data = { htmlTxt: $scope.text };
        var forwardEmail = SpecialService.forwardEmail(data);
        forwardEmail.then(function successCallback(response) {

        }, function errorCallback(response) {});
    };

    $scope.sendNotificationDriver = function() {
        var data = { text: $scope.text, subject: $scope.subject };
        var sendNotificationDriver = SpecialService.sendNotificationDriver(data);
        sendNotificationDriver.then(function successCallback(response) {
            SweetAlert.swal({
                title: "Sent Successfully",
                text: "Driver will receive this message shortly!!",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                imageUrl: "assets/images/ic_launcher.png"
            }, function(isConfirm) {
                location.reload();
            });
            console.log(response.data);
        }, function errorCallback(response) {});
    };
}]);
