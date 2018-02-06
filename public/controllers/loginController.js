app.controller('LoginController', ['$scope', '$location', '$window', 'LoginService', function($scope, $location, $window, LoginService) {
    //check login authentication
    $scope.login = function() {
        var data = { email: $scope.auth.email, password: $scope.auth.pass };
        var check = LoginService.login(data);
        check.then(function successCallback(response) {
            var message = response.data.success.message;
        }, function errorCallback(response) {});
    };

    $scope.showMessage = false;
    $scope.sendResetLink = function(email) {
        var data = { email: email };
        var resetLink = LoginService.sendResetLink(data);
        resetLink.then(function successCallback(response) {

            if (response.data.success) {
                $scope.showMessage = true;
            }
        }, function errorCallback(response) {});
    };

    $scope.changePassword = function(login) {
        var data = { password: login.password };
        var changePassword = LoginService.changePassword(data);
        changePassword.then(function successCallback(response) {

            if (response.data.success) {
                $window.location.href = '/login';
            }
        }, function errorCallback(response) {});
    }
}]);
