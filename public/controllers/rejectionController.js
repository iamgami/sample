app.controller('RejectionController', ['$scope', '$http', '$stateParams', function($scope, $http, $stateParams) {
    $scope.RejectionResion = {};
    $scope.rejectionReportDataShow = false;

    $scope.getRejectionResaon = function(searchRejection) {
        $scope.rejectionReasonList = false;
        $scope.onsubmitRejectionDataShow = true;
        var data = { startDate: $scope.searchRejection.complete_time, endDate: $scope.searchRejection.accept_time};
        $http({
            method: 'GET',
            url: '/api/rejectionReason',
            params: data
          }).then(function successCallback(response) {
            $('#customer-revenue-datatable-buttons').DataTable().destroy();
            setTimeout(function() {
                $(document).ready(function() {
                    $('#customer-revenue-datatable-buttons').DataTable({
                        dom: 'lBfrtip',
                        destroy: true,
                        buttons: [
                            'csv', 'print', 'copy'
                        ],
                        "lengthMenu": [
                            [10, 25, 50, -1],
                            [10, 25, 50, "All"]
                        ],
                        destroy: true,
                    });

                });
            });
              $scope.rejectListData = response.data.result;
              $scope.onsubmitRejectionDataShow = false;
              $scope.rejectionReasonList = true;
        }, function errorCallback(response) {

        });
    };
}]);
