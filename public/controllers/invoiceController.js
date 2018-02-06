app.controller('InvoiceController', ['$scope', '$http', '$stateParams', 'SweetAlert', function($scope, $http, $stateParams, SweetAlert) {
    $scope.bookingLogCompleted = '';
    $scope.bookingLogRating = '';
    $scope.bookingLogBilling = '';
    $scope.bookingLogUnloading = '';
    $scope.bookingLogOntrip = '';
    $scope.bookingLogLoading = '';
    $scope.bookingLogToCustomer = '';
    $scope.bookingLogBooked = '';
    $scope.bookingLogUploadingPod = '';
    $scope.sendBookingInvoice = function(email) {
        // console.log($scope.bookingLogLoadingTime)
        //  console.log($scope.bookingLogOntripTime)
        if (!$scope.bookingLogLoadingTime) {
            $scope.bookingLogLoadingTime = ''
        }

        if (!$scope.bookingLogUnloadingTime) {
            $scope.bookingLogUnloadingTime = ''
        }
        var data = {
            booking_id: $stateParams.bookingId,
            bookingFinal: $scope.allotBookingDetials.bookingFinal,
            bookingEstimate: $scope.allotBookingDetials.bookingEstimate,
            customerDetials: $scope.allotBookingDetials.customer_detials,
            favoriteLocationDetials: $scope.allotBookingDetials.favorite_location_detials,
            vehicleDetials: $scope.allotBookingDetials.vehicle_detials,
            current_status: $scope.allotBookingDetials.current_status,
            drop_points: $scope.allotBookingDetials.drop_points,
            pickup_time: $scope.bookingLogLoadingTime,
            drop_time: $scope.bookingLogUnloadingTime,
            email: $scope.billing_invoice_email

        };

        $http({
            method: 'POST',
            url: '/api/sendBookingInvoice',
            params: data
        }).then(function successCallback(response) {
            SweetAlert.swal({
                title: "Success",
                text: "Email Sent Successfully",
                type: "success",
                showCancelButton: false,
                closeOnConfirm: false
            }, function() {
                location.href = '/booking-list';
            });
        }, function errorCallback(response) {});
    };

    $scope.viewBookingDetail = function() {
        
        var bookingId = $stateParams.bookingId;
        $http({
            method: 'GET',
            url: '/api/booking/' + bookingId
        }).then(function successCallback(response) {
            
            $scope.allotBookingDetials = response.data;
            var tripRoute = response.data.tripRouteDetail;

            $scope.getTravelledDistance($scope.allotBookingDetials.id);

            $scope.prev_balance = response.data.prev_balance;
            $scope.after_balance = response.data.after_balance;

            if ($scope.prev_balance <= 0) {
                $scope.mgMoneyDeduct = 0;
            } else {
                if ($scope.allotBookingDetials.bookingFinal.total_final_amount < $scope.prev_balance) {
                    $scope.mgMoneyDeduct = $scope.allotBookingDetials.bookingFinal.total_final_amount;
                } else {
                    $scope.mgMoneyDeduct = $scope.prev_balance;
                }
            }
            // Estimated Received Amount
            $scope.allotBookingDetials.estimatedReceivedAmount = 0;
            var estimatedAmount = $scope.allotBookingDetials.bookingEstimate.total_amount;
            var customerBalance = $scope.allotBookingDetials.customer_wallet;

            if(isNaN(customerBalance))
            {
                customerBalance = 0;
            }
            var credit_limit    = $scope.allotBookingDetials.credit_limit;
            
            if(customerBalance > credit_limit) {
               var customerBalance = credit_limit + (customerBalance); 
            }
            else
            {
                var customerBalance = credit_limit - (customerBalance);
            } 
            
            if (customerBalance <= 0 ) {
                $scope.allotBookingDetials.estimatedReceivedAmount = estimatedAmount - (customerBalance);
            }
            if (customerBalance > 0) {
                if (estimatedAmount > customerBalance) {
                    $scope.allotBookingDetials.estimatedReceivedAmount = estimatedAmount - customerBalance;
                } else {
                    $scope.allotBookingDetials.estimatedReceivedAmount = 0;
                }
            }


            $scope.billing_invoice_email = $scope.allotBookingDetials.customer_detials.cust_email;
            for (var i = 0; i < $scope.allotBookingDetials.bookingLogTime.length; i++) {
                if ($scope.allotBookingDetials.bookingLogs[i].booking_status == 'completed') {
                    $scope.bookingLogCompleted = "completed";
                    $scope.bookingLogCompletedTime = $scope.allotBookingDetials.bookingLogs[i].created;
                }
                if ($scope.allotBookingDetials.bookingLogs[i].booking_status == 'rating') {
                    $scope.bookingLogRating = "rating";
                    $scope.bookingLogRatingTime = $scope.allotBookingDetials.bookingLogs[i].created;
                }
                if ($scope.allotBookingDetials.bookingLogs[i].booking_status == 'billing') {
                    $scope.bookingLogBilling = "billing";
                    $scope.bookingLogBillingTime = $scope.allotBookingDetials.bookingLogs[i].created;
                }
                if ($scope.allotBookingDetials.bookingLogs[i].booking_status == 'unloading') {
                    $scope.bookingLogUnloading = "unloading";
                    $scope.bookingLogUnloadingTime = $scope.allotBookingDetials.bookingLogs[i].created;
                }
                if ($scope.allotBookingDetials.bookingLogs[i].booking_status == 'on-trip') {
                    $scope.bookingLogOntrip = "on-trip";
                    $scope.bookingLogOntripTime = $scope.allotBookingDetials.bookingLogs[i].created;
                }
                if ($scope.allotBookingDetials.bookingLogs[i].booking_status == 'loading') {
                    $scope.bookingLogLoading = "loading";
                    $scope.bookingLogLoadingTime = $scope.allotBookingDetials.bookingLogs[i].created;
                }
                if ($scope.allotBookingDetials.bookingLogs[i].booking_status == 'to-customer') {
                    $scope.bookingLogToCustomer = "to-customer";
                    $scope.bookingLogToCustomerTime = $scope.allotBookingDetials.bookingLogs[i].created;
                }
                if ($scope.allotBookingDetials.bookingLogs[i].booking_status == 'booked') {
                    $scope.bookingLogBooked = "booked";
                    $scope.bookingLogBookedTime = $scope.allotBookingDetials.bookingLogs[i].created;
                }
                if ($scope.allotBookingDetials.bookingLogs[i].booking_status == 'uploading-pod') {
                    $scope.bookingLogUploadingPod = "uploading-pod";
                    $scope.bookingLogUploadingPodTime = $scope.allotBookingDetials.bookingLogs[i].created;
                }
            }

            if ($scope.allotBookingDetials.current_status == 'completed') {
                $scope.totalAllFinal = parseInt($scope.allotBookingDetials.bookingFinal.trip_charge) + parseInt($scope.allotBookingDetials.bookingFinal.loading_charge) + parseInt($scope.allotBookingDetials.bookingFinal.unloading_charge) + parseInt($scope.allotBookingDetials.bookingFinal.drop_points) + parseFloat($scope.allotBookingDetials.bookingFinal.waiting_charge);
            } else {
                $scope.totalAll = parseInt($scope.allotBookingDetials.bookingEstimate.trip_charge) + parseInt($scope.allotBookingDetials.bookingEstimate.loading_charge) + parseInt($scope.allotBookingDetials.bookingEstimate.unloading_charge) + parseInt($scope.allotBookingDetials.bookingEstimate.drop_points);
                $scope.extraDropPoints = parseInt($scope.allotBookingDetials.drop_points) - parseInt($scope.allotBookingDetials.vehicle_detials.allowed_drop_point);
            }

            if ($scope.allotBookingDetials.current_status == 'completed' && $scope.allotBookingDetials.bookingFinal.pod_image_url != undefined && $scope.allotBookingDetials.bookingFinal.pod_image_url != null) {
                $scope.image_url = $scope.allotBookingDetials.bookingFinal.pod_image_url.replace("/public/", "");
            }

            var firstPoint = '';
            var lastPoint = '';
            initMap();
            function initMap() {
                var directionsService = new google.maps.DirectionsService;
                var directionsDisplay = new google.maps.DirectionsRenderer;
                if (tripRoute) {
                    wayPointRoot = JSON.parse(tripRoute.routes);
                        if (wayPointRoot.length > 0) {
                            var map = new google.maps.Map(document.getElementById('map'), {
                                zoom: 6,
                                center: { lat: parseFloat(wayPointRoot[0]['lat']), lng: parseFloat(wayPointRoot[0]['lng']) }
                            });
                            directionsDisplay.setMap(map);
                            calculateAndDisplayRoute(directionsService, directionsDisplay, wayPointRoot);
                        } else {
                            showgoogleMap();
                        }
                } else {
                    showgoogleMap();
                }
            }

            function showgoogleMap() {
                var directionsService = new google.maps.DirectionsService;
                var directionsDisplay = new google.maps.DirectionsRenderer;
                var map = new google.maps.Map(document.getElementById('map'), {
                    zoom: 10,
                    center: { lat: 22.7219, lng: 75.8778 }
                });
                directionsDisplay.setMap(map);
            }

            function calculateAndDisplayRoute(directionsService, directionsDisplay, wayPointRoot) {
                var waypts = [];
                var checkboxArray = [];
                for (var i = 0; i < wayPointRoot.length; i++) {
                    waypts.push({
                        location: new google.maps.LatLng(wayPointRoot[i].lat, wayPointRoot[i].lng),
                        stopover: false
                    });
                }

                if (wayPointRoot.length > 0) {
                    firstPoint = new google.maps.LatLng(wayPointRoot[0].lat, wayPointRoot[0].lng);
                }
                if (wayPointRoot.length > 1) {
                    var lastLen = wayPointRoot.length - 1;
                    lastPoint = new google.maps.LatLng(parseFloat(wayPointRoot[lastLen].lat), parseFloat(wayPointRoot[lastLen].lng));
                }
                directionsService.route({
                    origin: firstPoint,
                    destination: lastPoint,
                    waypoints: waypts,
                    optimizeWaypoints: true,
                    travelMode: 'DRIVING'
                }, function(response, status) {
                    if (status === 'OK') {
                        directionsDisplay.setDirections(response);
                        var route = response.routes[0];
                        var summaryPanel = document.getElementById('directions-panel');
                    }
                });
            }
            initMap();
        }, function errorCallback(response) {});

    };

    $scope.printRating = function(rating) {
       return new Array(rating);  
    };

    $scope.printToCart = function(printSectionId) {
        var innerContents = document.getElementById(printSectionId).innerHTML;
        var popupWinindow = window.open('', '_blank', 'width=600,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
        popupWinindow.document.open();
        popupWinindow.document.write('<html><head><link rel="stylesheet" type="text/css" href="style.css" /></head><body onload="window.print()">' + innerContents + '</html>');
        popupWinindow.document.close();
    };


    $scope.getTravelledDistance = function(bookingId) {
        var data = { booking_id: bookingId };
        $http({
            method: 'GET',
            url: '/api/getTravelledDistance',
            params: data
        }).then(function successCallback(response) {
            $scope.distanceTravelled = response.data;
        }, function errorCallback(response) {});
    };
}]);
