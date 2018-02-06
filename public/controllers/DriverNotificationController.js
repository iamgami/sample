app.controller('DriverNotificationController', ['$scope', '$http', '$rootScope', 'SweetAlert', '$location', '$stateParams', 'PromiseUtils', 'DriverNotificationService','$localStorage', function($scope, $http, $rootScope, SweetAlert, $location, $stateParams, PromiseUtils, DriverNotificationService, $localStorage) {
    $scope.driverMessage = {};

    $scope.itemsPerPage = 10;
    $scope.currentPage = 0;
    $scope.pagination = {};
    $scope.totalItems = 0;
    $scope.showTableFlag = false;

    $rootScope.changeMaalgaadiCity = function(){
        $scope.maalgaadi_city_id = $rootScope.default_city_id;
        $localStorage.defaultCityId = $rootScope.default_city_id;
    }

    $scope.getDriverMessagePageChange = function(newPage, notification) {
        getDriverMessage(newPage, notification);
    };

    function getDriverMessage(pageNum, search = '') {

        if(angular.isUndefined($scope.maalgaadi_city_id)){
            return false;
        }
        $scope.onSubmitLoader = true;
        $scope.onSubmitResult = false;
        var data = {page: pageNum, city_id: $scope.maalgaadi_city_id, type: search.type};
        var getDriverMessage = DriverNotificationService.getDriverMessage(data);
        getDriverMessage.then(function(res) {
            $scope.onSubmitLoader = false;
            $scope.onSubmitResult = true;
            $scope.driverNotificationDetials = res.data.data;
            $scope.totalItems = res.pagination.total;
            $scope.currentPage = res.pagination.current_page;
            $scope.perPage = res.pagination.per_page;
            if (pageNum == 1) {
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

    $scope.searchRecord = function() {
        var $rows = $('#driverNotification-datatable-buttons tbody tr');
        $('#search_record').keyup(function() {
            var val = $.trim($(this).val()).replace(/ +/g, ' ').toLowerCase();

            $rows.show().filter(function() {
                var text = $(this).text().replace(/\s+/g, ' ').toLowerCase();
                return !~text.indexOf(val);
            }).hide();
        });
    };

    $scope.notificationValue = false;

    $scope.addDriverNotification = function(driverMessage) {
        if(angular.isUndefined(driverMessage.city_id)){
            driverMessage.city_id = '';
        }
        if (driverMessage.title != undefined) 
        {
            if (driverMessage.message == undefined && driverMessage.image == null) 
            {
                swal("Fill either Message or Image or Both");
            } 
            else 
            {
                DriverNotificationService.addDriverNotification(driverMessage);
            }
        } 
        else 
        {
            if (driverMessage.title == undefined && driverMessage.message == undefined && driverMessage.image == null) 
            {
                swal("Fill either Message or Image or Both");
            } 
            else 
            {
                DriverNotificationService.addDriverNotification(driverMessage);
            }
        }

    };

    $scope.sendDriverNotification = function(id, driver_status) {

        if (driver_status == undefined) {
            swal("Please select driver type");
        } else {


            SweetAlert.swal({
                title: "Are you sure?",
                text: "You want to send this notification!",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Yes",
                closeOnConfirm: false
            }, function(isConfirm) {
                if (isConfirm) {
                    var sendDriverNotification = DriverNotificationService.sendDriverNotification(id, driver_status);
                    sendDriverNotification.then(function successCallback(response) {
                        // $scope.getdriverMessage();
                        swal({
                            title: "Send!",
                            text: "Send Successfully!",
                            type: "success",
                            showCancelButton: false,
                            closeOnConfirm: false
                        }, function() {
                            location.href = '/notification-message-list';
                        });
                    }, function errorCallback(response) {});
                }
            });
        }
    };

    $scope.deleteDriverNotification = function(id) {

        SweetAlert.swal({
            title: "Are you sure?",
            text: "You want to delete this notification!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes",
            closeOnConfirm: false
        }, function(isConfirm) {
            if (isConfirm) {
                var deleteDriverNotification = DriverNotificationService.deleteDriverNotification(id);
                deleteDriverNotification.then(function successCallback(response) {
                    // $scope.getdriverMessage();
                    swal({
                        title: "Delete!",
                        text: "Delete Successfully!",
                        type: "success",
                        showCancelButton: false,
                        closeOnConfirm: false
                    }, function() {
                        location.href = '/notification-message-list';
                    });
                }, function errorCallback(response) {});
            }
        });

    };

    $scope.togleImage = function(image) {
        $scope.toggleImage = image;
    };

}]);
