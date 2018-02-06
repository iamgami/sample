app.controller('CancellationReasonController', ['$scope', '$http', '$rootScope', 'SweetAlert', '$location', '$stateParams', 'PromiseUtils', 'CancellationReasonService', function($scope, $http, $rootScope, SweetAlert, $location, $stateParams, PromiseUtils, CancellationReasonService) {
    $scope.customerCancellation = {};

    $scope.itemsPerPage = 10;
    $scope.currentPage = 0;
    $scope.showTableFlag = false;

    $scope.getCustomerCancellationReasonsPageChange = function(newPage, reason) {
        getCustomerCancellationReasons(newPage, reason)
    }

    function getCustomerCancellationReasons(pageNumber, reason = '') {

        var data = {entries : reason.entries, page : pageNumber};

        var getCustomerCancellationReasons = CancellationReasonService.getCustomerCancellationReasons(data);
        getCustomerCancellationReasons.then(function(response) {
            $scope.showTableFlag = true;
            $scope.cancellationReasons = response.data;
            $scope.totalItems = response.total;
            $scope.currentPage = response.current_page;
            $scope.perPage = response.per_page;
            $scope.mypage = response.current_page;
            if ($scope.mypage == 0) {
                $scope.perpg = response.total;
            } else {

                $scope.perpg = response.per_page;
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

        });

    };

    $scope.addBookingCancellationReason = function(customerCancellation) {

        var data = { reason: customerCancellation.reason };
        CancellationReasonService.addBookingCancellationReason(data);

    };


    $scope.editCancellationReason = function() {
        var data = { reason_id: $stateParams.reasonId };
        var editCancellationReason = CancellationReasonService.editCancellationReason(data);
        editCancellationReason.then(function(result) {
            $scope.cancelReason = result.data;
        });
    };

    $scope.updateCancellationReason = function(id) {
        var data = $scope.cancelReason;
        var updateCancellationReason = CancellationReasonService.updateCancellationReason(id, data);
        updateCancellationReason.then(function(response) {
            SweetAlert.swal({
                title: "Success",
                text: "Reason Updated Successfully",
                type: "success",
                showCancelButton: false,
                closeOnConfirm: true
            }, function() {
                $location.path('cancellation-reasons-list');
            });
        }, function(response) {});
    };


    $scope.deleteCancellationReason = function(id) {

        SweetAlert.swal({
            title: "Are you sure?",
            text: "You want to delete this reason!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes",
            closeOnConfirm: false
        }, function(isConfirm) {
            if (isConfirm) {
                var deleteCancellationReason = CancellationReasonService.deleteCancellationReason(id);
                deleteCancellationReason.then(function successCallback(response) {
                    swal({
                        title: "Delete!",
                        text: "Delete Successfully!",
                        type: "success",
                        showCancelButton: false,
                        closeOnConfirm: false
                    }, function() {
                        location.href = '/cancellation-reasons-list';
                    });
                }, function errorCallback(response) {});
            }
        });
    };

}]);
