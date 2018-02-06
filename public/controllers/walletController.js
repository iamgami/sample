app.controller('WalletController', ['$scope', '$http', function($scope, $http) {
    $scope.driverFlag = false;
    $scope.reverse = '';
    $scope.drivers = [];
    $scope.getDrivers = function() {
        $http({
            method: 'GET',
            url: '/api/driver',
        }).then(function successCallback(response) {
            $scope.driversDetials = response.data;
            console.log(response.data);
            angular.forEach($scope.drivers, function(value, key) {
                $scope.drivers.push(value['driver_name']);
            });
            $scope.driverFlag = true;
        }, function errorCallback(response) {});
    };
    $scope.getDrivers();

    $scope.sort_by = function(newSortingOrder) {
        if ($scope.sortingOrder == newSortingOrder) {
            $scope.reverse = !$scope.reverse;
        }
        $scope.sortingOrder = newSortingOrder;
    };
    $scope.bookingReportDataShow = false;
    $scope.getIndividualDriverWalletDetials = function() {

        var data = { start: $scope.startDate, end: $scope.endDate, driver_id: $scope.driverId.id };
        $http({
            method: 'GET',
            url: '/api/getIndividualDriverWalletDetials',
            params: data
        }).then(function successCallback(response) {
            var table = $('#ind-driver-wallet-datatable-buttons').DataTable();
            table.destroy();

            $scope.driverWalletDetials = response.data;
            setTimeout(function() {
                $(document).ready(function() {
                    $('#ind-driver-wallet-datatable-buttons').DataTable({
                        "order": [
                            [1, "desc"]
                        ],
                        "lengthMenu": [
                            [10, 25, 50, -1],
                            [10, 25, 50, "All"]
                        ]
                    });

                });
                $scope.bookingReportDataShow = true;
            }, 1000);


        }, function errorCallback(response) {});
    };

    $scope.getIndividualCustomerWalletDetials = function() {
        var data = { start: $scope.startDate, end: $scope.endDate, customer_id: $scope.customerId.id };
        $http({
            method: 'GET',
            url: '/api/getIndividualCustomerWalletDetials',
            params: data
        }).then(function successCallback(response) {
            var table = $('#ind-customer-wallet-datatable-buttons').DataTable();
            table.destroy();
            $scope.customerWalletDetials = response.data;
            setTimeout(function() {
                $(document).ready(function() {
                    $('#ind-customer-wallet-datatable-buttons').DataTable({
                        "order": [
                            [1, "desc"]
                        ],
                        "lengthMenu": [
                            [10, 25, 50, -1],
                            [10, 25, 50, "All"]
                        ]
                    });

                });


                $('#column1_search').on('keyup', function() {
                    $('#ind-customer-wallet-datatable-buttons').DataTable()
                        .columns(1)
                        .search(this.value)
                        .draw();
                });

                $('#column2_search').on('keyup', function() {
                    $('#ind-customer-wallet-datatable-buttons').DataTable()
                        .columns(2)
                        .search(this.value)
                        .draw();
                });

                $scope.bookingReportDataShow = true;
            }, 1000);
        }, function errorCallback(response) {});
    };

    $scope.getDriver = function() {
        $http({
            method: 'GET',
            url: '/api/driver',
        }).then(function successCallback(response) {
            $scope.driver = response.data;
        }, function errorCallback(response) {});
    };

    $scope.getCustomer = function() {
        $http({
            method: 'GET',
            url: '/api/customer',
        }).then(function successCallback(response) {
            $scope.customer = response.data;
        }, function errorCallback(response) {});
    };

    $scope.getDriverWallet = function(driverWallet) {
        console.log(driverWallet);
        var data = { mgid: driverWallet.mg, startDate: driverWallet.startDate, endDate: driverWallet.endDate };
        console.log(data);
        $http({
            method: 'GET',
            url: '/api/getDriverWalletDisplay',
            params: data
        }).then(function successCallback(response) {
            $scope.driverWalletviews = response.data.result;

            $scope.creditWallet = 0;
            angular.forEach(response.data.result, function(value, key) {
                if (!isNaN(value.finalBalance)) {
                    $scope.creditWallet += parseInt(value.finalBalance);
                }

            });


            $scope.last_final_payment = response.data.last_final_payment;

        }, function errorCallback(response) {});
    };

    $scope.getDriverReg = function() {
        $http({
            method: 'GET',
            url: '/api/getDriverReg',
        }).then(function successCallback(response) {
            $scope.vehicle = response.data;
            $("#omschrijving").autocomplete({ source: $scope.vehicle });
            $scope.loadingIsDones = true;
        }, function errorCallback(response) {});
    };
    $scope.getDriverReg();


}]);
