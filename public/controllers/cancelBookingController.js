app.controller('CancelBookingController', ['$scope', '$http', 'SweetAlert','$stateParams', function($scope, $http, SweetAlert,$stateParams)
{
        $scope.message='';
        $scope.issues_type='';
        $scope.action='';

    $scope.cancelBooking = function() {
  
        SweetAlert.swal({   
            title: "Are you sure?",            
            text: "You want to cancel this booking!",                 
                showCancelButton: true,  
                closeOnConfirm: false,  
                animation: "slide-from-top", 
                inputPlaceholder: "Give Reason"
                  }, function(inputValue){   
                    if (inputValue === false) 
                        return false;    
                    if (inputValue === "") {   
                       swal.showInputError("You need to give reason!"); 
                          return false   }
                        var data = { booking_id: $stateParams.bookingId , reason: $scope.message,issues_type: $scope.issues_type,action: $scope.action};
                        $http({
                            method: 'POST',
                            url: '/api/cancelBooking',
                            params: data
                        }).then(function successCallback(response) {
                            //console.log(response)
                            if(response.data.error.message){
                                console.log(response.data.error)
                                swal({
                                title: "Error!",
                                text: "Booking is Completed so can not cancel this booking!",
                                type: "error",
                                showCancelButton: false,
                                closeOnConfirm: true
                            });
                            return false;
                            }
                            swal({
                                title: "Cancelled!",
                                text: "You Booking cancelled successfully!",
                                type: "success",
                                showCancelButton: false,
                                closeOnConfirm: true
                            }, function() {
                                
                              location.href = '/booking-list';
                                ///redirectToBooking()
                          
                            });
                        }, function errorCallback(response) {

                        }); 
                 });
                 
    };

	$scope.viewBookingDetail = function() {
        var bookingId = $stateParams.bookingId;
        $http({
            method: 'GET',
            url: '/api/booking/' + bookingId
        }).then(function successCallback(response) {
            $scope.allotBookingDetials = response.data;
            console.log(response.data);
            $scope.billing_invoice_email = $scope.allotBookingDetials.customer_detials.cust_email;
            for (var i = 0; i < $scope.allotBookingDetials.bookingLogs.length; i++) {
                if ($scope.allotBookingDetials.bookingLogs[i].booking_status == 'completed') {
                    $scope.bookingLogCompleted = "completed";
                    $scope.bookingLogCompletedTime = $scope.allotBookingDetials.bookingLogs[i].created_at;
                }
                if ($scope.allotBookingDetials.bookingLogs[i].booking_status == 'rating') {
                    $scope.bookingLogRating = "rating";
                    $scope.bookingLogRatingTime = $scope.allotBookingDetials.bookingLogs[i].created_at;
                }
                if ($scope.allotBookingDetials.bookingLogs[i].booking_status == 'billing') {
                    $scope.bookingLogBilling = "billing";
                    $scope.bookingLogBillingTime = $scope.allotBookingDetials.bookingLogs[i].created_at;
                }
                if ($scope.allotBookingDetials.bookingLogs[i].booking_status == 'unloading') {
                    $scope.bookingLogUnloading = "unloading";
                    $scope.bookingLogUnloadingTime = $scope.allotBookingDetials.bookingLogs[i].created_at;
                }
                if ($scope.allotBookingDetials.bookingLogs[i].booking_status == 'on-trip') {
                    $scope.bookingLogOntrip = "on-trip";
                    $scope.bookingLogOntripTime = $scope.allotBookingDetials.bookingLogs[i].created_at;
                }
                if ($scope.allotBookingDetials.bookingLogs[i].booking_status == 'loading') {
                    $scope.bookingLogLoading = "loading";
                    $scope.bookingLogLoadingTime = $scope.allotBookingDetials.bookingLogs[i].created_at;
                }
                if ($scope.allotBookingDetials.bookingLogs[i].booking_status == 'to-customer') {
                    $scope.bookingLogToCustomer = "to-customer";
                    $scope.bookingLogToCustomerTime = $scope.allotBookingDetials.bookingLogs[i].created_at;
                }
                if ($scope.allotBookingDetials.bookingLogs[i].booking_status == 'booked') {
                    $scope.bookingLogBooked = "booked";
                    $scope.bookingLogBookedTime = $scope.allotBookingDetials.bookingLogs[i].created_at;
                }
                if ($scope.allotBookingDetials.bookingLogs[i].booking_status == 'uploading-pod') {
                    $scope.bookingLogUploadingPod = "uploading-pod";
                    $scope.bookingLogUploadingPodTime = $scope.allotBookingDetials.bookingLogs[i].created_at;
                }
            }

            if ($scope.allotBookingDetials.current_status == 'completed') {
                $scope.totalAllFinal = parseInt($scope.allotBookingDetials.bookingFinal.trip_charge) + parseInt($scope.allotBookingDetials.bookingFinal.loading_charge) + parseInt($scope.allotBookingDetials.bookingFinal.unloading_charge) + parseInt($scope.allotBookingDetials.bookingFinal.drop_points) + parseFloat($scope.allotBookingDetials.bookingFinal.waiting_charge);
            } else {
                $scope.totalAll = parseInt($scope.allotBookingDetials.bookingEstimate.trip_charge) + parseInt($scope.allotBookingDetials.bookingEstimate.loading_charge) + parseInt($scope.allotBookingDetials.bookingEstimate.unloading_charge) + parseInt($scope.allotBookingDetials.bookingEstimate.drop_points);
                $scope.extraDropPoints = parseInt($scope.allotBookingDetials.drop_points) - parseInt($scope.allotBookingDetials.vehicle_detials.allowed_drop_point);
            }
            console.log($scope.allotBookingDetials);
            if ($scope.allotBookingDetials.current_status == 'completed' && $scope.allotBookingDetials.bookingFinal.pod_image_url != undefined && $scope.allotBookingDetials.bookingFinal.pod_image_url != null) {
                $scope.image_url = $scope.allotBookingDetials.bookingFinal.pod_image_url.replace("/public/", "");
            }
        }, function errorCallback(response) {});
	};
}]);