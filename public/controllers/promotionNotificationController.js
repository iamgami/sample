app.controller('PromotionNotificationController', ['$scope', '$http', '$rootScope', 'SweetAlert', '$location', '$stateParams', 'PromiseUtils', 'fileUpload','$localStorage', function($scope, $http, $rootScope, SweetAlert, $location, $stateParams, PromiseUtils, fileUpload, $localStorage) {
    $scope.promotionalMessage = {};

    $scope.itemsPerPage = 10;
    $scope.currentPage = 0;
    $scope.perPage = 10;
    $scope.currentPage = 0;
    $scope.pagination = {};
    $scope.totalItems = 0;

    $scope.showTableFlag = false;

    $rootScope.changeMaalgaadiCity = function(){
        $scope.maalgaadi_city_id = $rootScope.default_city_id;
        $localStorage.defaultCityId = $rootScope.default_city_id;
    }

    $scope.getPromotionalMessagePageChange = function(newPage, notification) {
        getPromotionalMessage(newPage, notification);
    };

    function getPromotionalMessage (pageNum, search = '') {
        if(search == ''){
            search = {}
        }
        if(angular.isUndefined($scope.maalgaadi_city_id)){
            return false;
        }
        search.city_id = $scope.maalgaadi_city_id;
        var data = {page: pageNum, city_id: search.city_id, type: search.type};
        if(angular.isUndefined(search.city_id)){
            return false;
        }
        $scope.onSubmitResult = false;
        $scope.onSubmitLoader = true;
        // console.log(data,"test")
        var getPromotionalMessage = fileUpload.getPromotionalMessage(data);
        getPromotionalMessage.then(function(res) {
            $scope.onSubmitResult = true;
            $scope.onSubmitLoader = false;
            $scope.customerNotificationDetials = res.data.data;
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
        var $rows = $('#promotion-datatable-buttons tbody tr');
        $('#search_record').keyup(function() {
            var val = $.trim($(this).val()).replace(/ +/g, ' ').toLowerCase();

            $rows.show().filter(function() {
                var text = $(this).text().replace(/\s+/g, ' ').toLowerCase();
                return !~text.indexOf(val);
            }).hide();
        });
    };

    $scope.notificationValue = false;

    // $scope.addPromotionalNotification = function(promotionalMessage) {
    //     if(angular.isUndefined(promotionalMessage.city_id)){
    //         promotionalMessage.city_id = '';
    //     }
    //     if (promotionalMessage.image == null || promotionalMessage.image == undefined) 
    //     {
    //         swal('Select image');
    //         return false;
    //     }
        
    //     fileUpload.addPromotionalNotification(promotionalMessage);

    // };
    $scope.addPromotionalNotification = function(promotionalMessage) {
        console.log(promotionalMessage, "jh")

        if(angular.isUndefined(promotionalMessage.city_id)){
            promotionalMessage.city_id = '';
        }

        if (promotionalMessage.title != undefined) 
        {
            if (promotionalMessage.message == undefined && promotionalMessage.image == null) 
            {
                swal("Fill either Message or Image or Both");
            } 
            else if (promotionalMessage.title == undefined && promotionalMessage.message == undefined && promotionalMessage.type == 'non-promotional') 
            {
                swal("Enter some message");
            } 
            else 
            {
                fileUpload.addPromotionalNotification(promotionalMessage);
            }
        } 
        else 
        {
            if (promotionalMessage.title == undefined && promotionalMessage.message == undefined && promotionalMessage.image == null) 
            {
                swal("Fill either Message or Image or Both");
            }
            else if (promotionalMessage.title == undefined && promotionalMessage.message == undefined && promotionalMessage.type == 'non-promotional') 
            {
                swal("Enter some message");
            } 
            else 
            {
                fileUpload.addPromotionalNotification(promotionalMessage);
            }
        }

        
        // fileUpload.addPromotionalNotification(promotionalMessage);

    };


    $scope.sendPromotionalNotification = function(id) {

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
                var sendPromotionalNotification = fileUpload.sendPromotionalNotification(id);
                sendPromotionalNotification.then(function successCallback(response) {
                    // $scope.getPromotionalMessage();
                    swal({
                        title: "Send!",
                        text: "Send Successfully!",
                        type: "success",
                        showCancelButton: false,
                        closeOnConfirm: false
                    }, function() {
                        location.href = '/message-list';
                    });
                }, function errorCallback(response) {});
            }
        });
    };


    $scope.deletePromotionalNotification = function(id) {

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
                var deletePromotionalNotification = fileUpload.deletePromotionalNotification(id);
                deletePromotionalNotification.then(function successCallback(response) {
                    swal({
                        title: "Delete!",
                        text: "Delete Successfully!",
                        type: "success",
                        showCancelButton: false,
                        closeOnConfirm: false
                    }, function() {
                        location.href = '/message-list';
                    });
                }, function errorCallback(response) {});
            }
        });
    };

    $scope.togleImage = function(image) {
        $scope.toggleImage = image;
    };

}]);
