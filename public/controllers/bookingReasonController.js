app.controller('BookingReasonController', ['$scope', '$http', '$stateParams', '$rootScope', 'SweetAlert', function($scope, $http, $stateParams, $rootScope, SweetAlert) {

    $scope.getReasonsPageChange = function(newPage, reason) {
        getReasons(newPage, reason)
    }

    function getReasons(pageNumber, reason = ''){

        var data = {entries : reason.entries, page : pageNumber};
        $http({
            method: 'GET',
            url: '/api/getReasons',
            params : data
        }).then(function successCallback(response) {
            console.log(response)
            $scope.reasons = response.data.data;
            $scope.totalItems = response.data.total;
            $scope.currentPage = response.data.current_page;
            $scope.perPage = response.data.per_page;
            $scope.mypage = response.data.current_page;
            if ($scope.mypage == 0) {
                $scope.perpg = response.data.total;
            } else {

                $scope.perpg = response.data.per_page;
            }
            if (pageNumber == 1) {
                setTimeout(function() {
                    $scope.currentPage = 1;
                    var previousActive = $('dir-pagination-controls ul li.active').find('a').text();
                    if (Number(previousActive) > 1) {
                        $('dir-pagination-controls ul li:nth-child(2)').find('a').click();
                    }
                }, 400);

            }
           
        }, function errorCallback(response) {});
    };

    $scope.addReason = function(reason) {
        var data = reason;
        $http({
            method: 'GET',
            url: '/api/addRejectReason',
            params: data
        }).then(function successCallback(response) {
            if (response.data.success) {
                swal({
                    title: 'Reason',
                    text: response.data.success.message,
                    showCancelButton: false,
                    closeOnConfirm: false,
                    imageUrl: "assets/images/ic_launcher.png"
                }, function() {
                    location.href = '/reasons-list';
                });
            } else {
                swal({
                    title: 'Reason',
                    text: response.data.error.message,
                    showCancelButton: false,
                    closeOnConfirm: false,
                    imageUrl: "assets/images/ic_launcher.png"
                }, function() {
                    location.href = '/reasons-list';
                });
            }
        }, function errorCallback(response) {});

    };

    $scope.editReason = function(reason) {
        var data = reason;
        $http({
            method: 'GET',
            url: '/api/editReason/' + $stateParams.reasonId,
            params: data
        }).then(function successCallback(response) {
            if (response.data.success) {
                swal({
                    title: 'Reason',
                    text: response.data.success.message,
                    showCancelButton: false,
                    closeOnConfirm: false,
                    imageUrl: "assets/images/ic_launcher.png"
                }, function() {
                    location.href = '/reasons-list';
                });
            } else {
                swal({
                    title: 'Reason',
                    text: response.data.error.message,
                    showCancelButton: false,
                    closeOnConfirm: false,
                    imageUrl: "assets/images/ic_launcher.png"
                }, function() {
                    location.href = '/reasons-list';
                });
            }
        }, function errorCallback(response) {});
    };

    $scope.getReasonDetails = function() {
        $http({
            method: 'GET',
            url: '/api/getReasonDetails/' + $stateParams.reasonId,
        }).then(function successCallback(response) {
            $scope.reason = response.data;
        }, function errorCallback(response) {});
    };

    $scope.deleteReason = function(id) {

        var data = { id: id };
        SweetAlert.swal({
            title: "Confirm",
            text: "Do you want to remove this reason!",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            imageUrl: "assets/images/ic_launcher.png"
        }, function(isConfirm) {
            if (isConfirm) {
                $http({
                    method: 'POST',
                    url: '/api/deleteReason',
                    params: data
                }).then(function successCallback(response) {
                    if (response.data.success) {
                        swal({
                            title: 'Reason',
                            text: response.data.success.message,
                            showCancelButton: false,
                            closeOnConfirm: false,
                            imageUrl: "assets/images/ic_launcher.png"
                        }, function() {
                            location.href = '/reasons-list';
                        });
                    } else {
                        swal({
                            title: 'Reason',
                            text: response.data.error.message,
                            showCancelButton: false,
                            closeOnConfirm: false,
                            imageUrl: "assets/images/ic_launcher.png"
                        }, function() {
                            location.href = '/reasons-list';
                        });
                    }

                }, function errorCallback(response) {});
            }
        });
    };

}]);
