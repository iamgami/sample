app.controller('NearestController', ['$scope', '$http', 'SweetAlert', function($scope, $http, SweetAlert) {
    //Gunjan

    $scope.getDistance = function() {
        $http({
            method: 'GET',
            url: '/api/getDistanceDetials',
        }).then(function successCallback(response) {
            $scope.distanceDriver = response.data;
            // console.log(response.data,"distanceDriver");

            var data = { lat: $scope.distanceDriver[0].lat, lng: $scope.distanceDriver[0].lng, driver_id: $scope.distanceDriver[0].driver_id };
            $http({
                method: 'GET',
                url: '/api/getDistanceBookingLatLng',
                params: data
            }).then(function successCallback(response) {
                $scope.bookingDistanceDetialsList = response.data;

                var driverId = $scope.distanceDriver[0].driver_id;
                var bookingId = $scope.bookingDistanceDetialsList[0].booking_id;

            }, function errorCallback(response) {});
        }, function errorCallback(response) {});
    };
    $scope.tripDistanceAllotment = function(bookingId) {
        var driverId = $scope.distanceDriver[0].driver_id;
        var data = { booking_id: bookingId, driver_id: driverId };


        $http({
            method: 'GET',
            url: '/api/allotnotification',
            params: data
        }).then(function successCallback(response) {
                location.href = '/booking-list';
            },
            function errorCallback(response) {});
    };

    // end code

    $scope.getNearestDriver = function() {
        var data = { near: $scope.near };
        $http({
            method: 'GET',
            url: '/api/getNearestDriverDetials',
            params: data
        }).then(function successCallback(response) {
            $scope.nearestDriver = response.data;
        }, function errorCallback(response) {});
    };

    $scope.getVechicleCategory = function(city_id) {
        var data = {city_id : city_id};
        $http({
            method: 'GET',
            url: '/api/vehicle',
            params: data
        }).then(function successCallback(response) {
            $scope.vehicleCategoryDetials = response.data.result;
        }, function errorCallback(response) {});
    };
    $scope.getVechicleCategory();

    $scope.category = [];
    $scope.pushArray = function(id) {
        if ($scope.category.indexOf(id) !== -1) {
            var temp = $scope.category.indexOf(id);
            console.log(temp);
            $scope.category.splice(temp, 1);
        } else {
            $scope.category.push(id);
        }
    }

    $scope.selected = [];
    $scope.selected.driver = [];
    $scope.near = {};
    $scope.searchBy = {};
    $scope.searchBy.vehicle_category_id = {};
    $scope.searchBy.vehicle_category_id.id = '';
    $scope.getNearestBooking = function(searchBy = '') {

        $scope.bookingDetialsList = [];
        $scope.near.lat = $scope.near.driver.lat;
        if ($scope.category.length != 0) {
            $scope.near.vehicle = $scope.category;
            $scope.category = [];
        } else {
            $scope.near.vehicle = 'all';
            $scope.category = [];
        }
        $scope.near.lng = $scope.near.driver.lng;
        $scope.near.driver_id = $scope.near.driver.driver_id;

        if (searchBy) {
            if (searchBy.vehicle_category_id) {
                var byVehicleId = searchBy.vehicle_category_id;
            } else {
                var byVehicleId = '';
            }

        } else {
            var byVehicleId = '';
        }

        var data = { checks: $scope.near, byVehicleId: byVehicleId };
        $http({
            method: 'GET',
            url: '/api/getNearestBookingLatLng',
            params: data
        }).then(function successCallback(response) {
            $scope.category = [];
            $scope.bookingDetialsList = response.data;
        }, function errorCallback(response) {

        });
    };

    $scope.getNearestBooking1 = function() {
        $scope.bookingDetialsList = [];
        $scope.near.lat = $scope.near.driver.lat;
        if ($scope.category.length != 0) {
            $scope.near.vehicle = $scope.category;
            $scope.category = [];
        } else {
            $scope.near.vehicle = 'all';
            $scope.category = [];
        }
        $scope.near.lng = $scope.near.driver.lng;
        $scope.near.driver_id = $scope.near.driver.driver_id;
        var data = { checks: $scope.near };
        $http({
            method: 'GET',
            url: '/api/getNearestBookingLatLng1',
            params: data
        }).then(function successCallback(response) {
            $scope.bookingDetialsList = response.data;
        }, function errorCallback(response) {

        });
    };


    $scope.checkAll = function() {
        $scope.category = [];
    };

    $scope.tripAllotment = function(bookingId, driverId) {
        var driverId = driverId;
        if (angular.isUndefined(driverId)) {
            SweetAlert.swal({
                title: "Opps?",
                text: "No, Free Driver Availble!",
                imageUrl: "images/opps.jpg",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
            }, function(isConfirm) {
                // location.reload();
            });
        } else {
            SweetAlert.swal({
                title: "Are you sure?",
                text: "You want to allot this booking!",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Yes, Allot it!",
                closeOnConfirm: false
            }, function(isConfirm) {
                if (isConfirm) {
                    var data = { booking_id: bookingId, driver_id: driverId };
                    $http({
                        method: 'GET',
                        url: '/api/notification',
                        params: data
                    }).then(function successCallback(response) {
                            console.log(response.data);
                            swal({
                                title: "Allot!",
                                text: "Your Booking alloted successfully!",
                                type: "success",
                                showCancelButton: false,
                                closeOnConfirm: false
                            }, function() {
                                location.href = '/booking-list';
                            });
                        },
                        function errorCallback(response) {});
                }
            });
        }
    };

    $scope.changeVehicleCat = function(near) {

        $scope.searchBy.vehicle_category_id = near.vehicleID;
        $scope.searchBy.new_vehicle_category_id = near.vehicleID;
        console.log($scope.searchBy.new_vehicle_category_id);
    };


}]);
