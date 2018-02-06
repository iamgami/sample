app.controller('AutomaticController', ['$http', '$scope', 'SweetAlert', 'DiscountService', '$window', function($http, $scope, SweetAlert, DiscountService, $window) {
    //get all user with discount
   

    $scope.allotedBookingDetails = function(allotmentBooking = ''){
        $scope.autometicAllot = 0;
        $scope.appBookingAllot = 0;
        $scope.customerAppBooking = 0;
        $scope.customerPanelBooking = 0;
        console.log(allotmentBooking);
        if(allotmentBooking){
            $http({
                method: 'GET',
                url: '/api/getAllotBookingDetails',
                params: allotmentBooking
            }).then(function successCallback(response) {
                    if(response.data.error){
                        swal(response.data.error.message);
                    }else{
                        $scope.autometicAllot = response.data.autometicAllot;
                        $scope.appBookingAllot = response.data.appBookingAllot;
                        $scope.customerAppBooking = response.data.customerAppBooking;
                        $scope.customerPanelBooking = response.data.customerPanelBooking;
                    }
                },
                function errorCallback(response) {});
        }
    }

    
}]);
