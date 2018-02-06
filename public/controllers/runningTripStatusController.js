(function() {
    "use strict";

    app.controller('RunningTripStatusController', ['$scope', '$http', '$stateParams', '$rootScope', 'SweetAlert', '$timeout', '$window', '$interval', function($scope, $http, $stateParams, $rootScope, SweetAlert, $timeout, $window, $interval) {
        // $interval(runningTripStatus, 6000);
        $scope.itemsPerPage = 10;
        $scope.itemsPerPageDriver = 10;
        $scope.itemsPerPageDriverStatus = 10;
        $scope.currentPage = 0;
        $scope.runningTripStatus = function() {
            $http({
                method: 'GET',
                url: '/api/liveTripStatus',
            }).then(function successCallback(response) {
                $scope.liveTripList = response.data;;
                var table = $('#live-status-datatable').DataTable();
                table.destroy();
                setTimeout(function() {
                    $(document).ready(function() {
                        $('#live-status-datatable').DataTable({
                            "order": [
                                [0, "desc"]
                            ],
                            "lengthMenu": [
                                [10, 25, 50, -1],
                                [10, 25, 50, "All"]
                            ]
                        });
                    });
                });


            }, function errorCallback(response) {});

        };
    }]);

})();
