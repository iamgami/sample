app.controller('FinalBookingController', ['$scope', '$http', '$stateParams', '$rootScope', 'SweetAlert', function($scope, $http, $stateParams, $rootScope, SweetAlert) {
    $scope.booking = {};
    $scope.booking.customer = {};
    $scope.booking.pick = {};
    $scope.mapData = {};
    $scope.booking.drop = {};
    $scope.booking.billing = {};
    $scope.booking.billing.final_amount = 0;
    $scope.booking.billing.discount_amount = 0;
    $scope.booking.billing.discount = 0;
    $scope.booking.billing.drop_point_charge = 0;
    $scope.booking.billing.trip_charge = 0;
    $scope.booking.billing.unloading_charge = 0;
    $scope.booking.billing.loading_charge = 0;
    $scope.booking.billing.estimated_distance = 0;
    $scope.booking.billing.buffer_estimated_distance = 0;
    // $scope.booking.info = {booking_schedule_time: ''};
    $scope.myname = 'Garima';
    $scope.booking_type_normal = true;
    $scope.booking_type_fixed = false;
    $scope.checkType = function() {
        console.log($scope.booking_type_normal, "bookinggg type normal value");
        console.log($scope.booking_type_fixed, "booking type fixed value");
    };

    $scope.setPaymentDetials = function() {
        $scope.booking.vehicle = $scope.booking.vehicle.vehicle_category_id;
        // $scope.calculateEsitmated();
    };

    $scope.getMobileNumber = function() {
        $http({
            method: 'GET',
            url: '/api/getMobileNumber',
        }).then(function successCallback(response) {
            $scope.number = response.data;
            $scope.loadingIsDone = true;
        }, function errorCallback(response) {});
    };

    $scope.getMobileNumber();

    

    $scope.getCustomerDetials = function() {
        var data = { phone: $scope.booking.customer.mobile };
        $http({
            method: 'GET',
            url: '/api/getCustomerDetials',
            params: data
        }).then(function successCallback(response) {

            $scope.bookingDetials = response.data;
            $scope.drop = response.data.drop;
            $scope.pick = response.data.pick;
            $scope.booking.customer.customerId = $scope.bookingDetials.id;
            $scope.booking.customer.cust_organization = $scope.bookingDetials.cust_organization;
            $scope.booking.customer.cust_name = $scope.bookingDetials.cust_name;
            $scope.booking.customer.cust_email = $scope.bookingDetials.cust_email;
            $scope.booking.customer.cust_address = $scope.bookingDetials.cust_address;
            $scope.booking.customer.cust_discount_percent = $scope.bookingDetials.cust_discount_percent;
            if ($scope.bookingDetials.wallet != undefined) {
                $scope.booking.customer.wallet = $scope.bookingDetials.wallet;
            } else {
                $scope.booking.customer.wallet = 0;
            }
        }, function errorCallback(response) {});
    };

    $scope.setDropPoint = function(dropDetials) {
        $scope.booking.drop.drop_name = dropDetials[0];
        $scope.booking.drop.drop_number = dropDetials[1];
        $scope.booking.drop.drop_organization = dropDetials[4];
        $scope.booking.drop.drop_location = dropDetials[2];
        $scope.booking.drop.drop_landmark = dropDetials[3];
        $scope.booking.drop.lat = dropDetials[5];
        $scope.booking.drop.lng = dropDetials[6];
        $scope.calculateEsitmated();
    };

    $scope.setPickPoint = function(pickDetials) {
        $scope.booking.pick.pickup_name = pickDetials[0];
        $scope.booking.pick.pickup_number = pickDetials[1];
        $scope.booking.pick.pickup_organization = pickDetials[4];
        $scope.booking.pick.pickup_location = pickDetials[2];
        $scope.booking.pick.pickup_landmark = pickDetials[3];
        $scope.booking.pick.lat = pickDetials[5];
        $scope.booking.pick.lng = pickDetials[6];
        $scope.fetchNearestDriver($scope.booking.pick.lat, $scope.booking.pick.lng);
        $scope.calculateEsitmated();
    };

    $scope.calculateEstimatedAmount = function() {
        $scope.calculateEsitmated();

        function initMap() {
            var directionsDisplay = new google.maps.DirectionsRenderer;
            var directionsService = new google.maps.DirectionsService;
            var map = new google.maps.Map(document.getElementById('route'), {
                zoom: 13,
                center: {
                    lat: 22.7196,
                    lng: 75.8577
                }
            });
            directionsDisplay.setMap(map);
            calculateAndDisplayRoute(directionsService, directionsDisplay);
        }

        function calculateAndDisplayRoute(directionsService, directionsDisplay) {
            var pickLat = $scope.booking.pick.lat;
            var pickLng = $scope.booking.pick.lng;
            var dropLat = $scope.booking.drop.lat;
            var dropLng = $scope.booking.drop.lng;

            directionsService.route({
                origin: { lat: pickLat, lng: pickLng },
                destination: { lat: dropLat, lng: dropLng },
                travelMode: google.maps.TravelMode["DRIVING"]
            }, function(response, status) {
                if (status == google.maps.DirectionsStatus.OK) {
                    directionsDisplay.setDirections(response);
                } else {
                    console.log('Directions request failed due to ' + status);
                }
            });
        }

        initMap();
    }

    $scope.addBooking = function() {

        if ($scope.booking_type_fixed == true && $scope.booking.billing.fixedamount != '') {
            $scope.booking.billing.drop_point_charge = 0;
            $scope.booking.billing.final_amount = 0;
            $scope.booking.billing.loading_charge = 0;
            $scope.booking.billing.pod_charge = 0;
            $scope.booking.billing.trip_charge = 0;
            $scope.booking.billing.unloading_charge = 0;
            console.log($scope.booking.billing, "Billing details check");
        }

        if ($scope.bookingDetials.error == undefined) {
            console.log("dont add customer");
            var data = { pick: $scope.booking.pick, drop: $scope.booking.drop, customer: $scope.booking.customer, vehicle: $scope.booking.vehicle, info: $scope.booking.info, billing: $scope.booking.billing };

            console.log(data, "Full Final Data");
            $http({
                method: 'GET',
                url: '/api/addBookingtest',
                params: data
            }).then(function successCallback(response) {
                console.log(response.data);
                SweetAlert.swal("Success!", "Booking Added Successfully!", "success");
            }, function errorCallback(response) {});
        } else {
            console.log("add customer");
            var addcustomer = {};
            addcustomer.cust_number = $scope.booking.customer.mobile;
            addcustomer.cust_name = $scope.booking.customer.cust_name;
            addcustomer.cust_email = $scope.booking.customer.cust_email;
            addcustomer.cust_address = $scope.booking.customer.cust_address;
            addcustomer.cust_organization = $scope.booking.customer.cust_organization;
            addcustomer.cust_business_product = '';
            addcustomer.cust_city = { id: '' };
            addcustomer.cust_password = 12345;
            $http({
                method: 'POST',
                url: '/api/customer',
                params: addcustomer
            }).then(function successCallback(response) {
                $scope.addcustomerId = response.data.customer.id;
                $scope.booking.customer.customerId = $scope.addcustomerId;
                var data = { pick: $scope.booking.pick, drop: $scope.booking.drop, customer: $scope.booking.customer, vehicle: $scope.booking.vehicle, info: $scope.booking.info, billing: $scope.booking.billing };
                console.log(data, "Customer");
                $http({
                    method: 'GET',
                    url: '/api/addBookingtest',
                    params: data
                }).then(function successCallback(response) {
                    console.log(response.data);
                    SweetAlert.swal("Success!", "Booking Added Successfully!", "success");
                    //location.reload();
                    location.href = '/booking';
                }, function errorCallback(response) {});
            }, function errorCallback(response) {});
        }
    };

    $scope.calculateEsitmated = function() {
        $scope.drawRouteMap();
        console.log($scope.booking.billing, "billing detials in normal booking");
        var data = { pick: $scope.booking.pick, drop: $scope.booking.drop, customer: $scope.booking.customer, vehicle: $scope.booking.vehicle, info: $scope.booking.info, billing: $scope.booking.billing };
        $http({
            method: 'GET',
            url: '/api/calculateEsitmated',
            params: data
        }).then(function successCallback(response) {
            console.log(response.data);
            $scope.booking.billing = response.data;
            console.log(response.data);
            $scope.mapData = response.data;
        }, function errorCallback(response) {});
    };

    $scope.fetchNearestDriver = function(lat, lng) {
        $scope.calculateEsitmated();
        $scope.nearestDriver = [];
        var data = { lat: lat, lng: lng };
        $http({
            method: 'GET',
            url: '/api/getNearestDriver',
            params: data
        }).then(function successCallback(response) {
            console.log($scope.nearestDriver);
            $scope.nearestDriver = response.data;
        }, function errorCallback(response) {

        });
    }

    $scope.getLoginDriversDetials = function() {
        $http({
            method: 'GET',
            url: '/api/getFreeDriversDetials',
        }).then(function successCallback(response) {
            $scope.driverDetials = response.data;
        }, function errorCallback(response) {});
    };
    $scope.getLoginDriversDetials();

    $scope.viewBookingDetail = function() {
        var bookingId = $stateParams.bookingId;
        $http({
            method: 'GET',
            url: '/api/booking/' + bookingId
        }).then(function successCallback(response) {
            $scope.fetchNearestDriver(response.data.favorite_location_detials.pickup_lat, response.data.favorite_location_detials.pickup_lng);
            $scope.allotBookingDetials = response.data;
        }, function errorCallback(response) {});

    }

    $scope.getBooking = function() {
        $http({
            method: 'GET',
            url: '/api/booking',
        }).then(function successCallback(response) {

            $scope.bookingDetialsList = response.data;

        }, function errorCallback(response) {});
    };
    $scope.getBooking();

    $scope.getCustomerDetialKnow = function(phone) {
        var data = { phone: phone };
        $http({
            method: 'GET',
            url: '/api/getCustomerDetials',
            params: data
        }).then(function successCallback(response) {
            $scope.bookingDetials = response.data;
            $scope.drop = response.data.drop;
            $scope.pick = response.data.pick;
            $scope.booking.customer.customerId = $scope.bookingDetials.id;
            $scope.booking.customer.cust_organization = $scope.bookingDetials.cust_organization;
            $scope.booking.customer.cust_name = $scope.bookingDetials.cust_name;
            $scope.booking.customer.cust_email = $scope.bookingDetials.cust_email;
            $scope.booking.customer.cust_address = $scope.bookingDetials.cust_address;
            $scope.booking.customer.cust_discount_percent = $scope.bookingDetials.cust_discount_percent;
            $scope.booking.customer.wallet = $scope.bookingDetials.wallet;

        }, function errorCallback(response) {});
    };

    $scope.allotBooking = function() {
        $rootScope.allotBookingId = $stateParams.bookingId;
    };
    $scope.allotBooking();

    $scope.cancelBooking = function() {
        $scope.booking.pick = '';
        $scope.booking.drop = '';
        $scope.booking.customer = '';
        $scope.booking.vehicle = '';
        $scope.booking.info = '';
        $scope.booking.billing = '';
    };

    $scope.tripAllotment = function(driverId) {
        var bookingId = $stateParams.bookingId;
        console.log(driverId);
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

    $scope.cancelBooking = function(bookingId) {
        SweetAlert.swal({
            title: "Are you sure?",
            text: "You want to cancel this booking!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, Cancel it!",
            closeOnConfirm: false
        }, function(isConfirm) {
            if (isConfirm) {
                var data = { booking_id: bookingId };
                $http({
                    method: 'POST',
                    url: '/api/cancelBooking',
                    params: data
                }).then(function successCallback(response) {
                    swal({
                        title: "Cancelled!",
                        text: "You Booking cancelled successfully!",
                        type: "success",
                        showCancelButton: false,
                        closeOnConfirm: false
                    }, function() {
                        location.reload();
                    });
                }, function errorCallback(response) {

                });
            }
        });
    };


    $scope.setLatLong = function() {
        $scope.fetchNearestDriver($scope.booking.pick.lat, $scope.booking.pick.lng);
    }
}]);
