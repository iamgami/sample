app.controller('VehicleController', ['$scope', '$http', '$rootScope', 'SweetAlert', '$location', '$stateParams', 'PromiseUtils', 'VehicleService','CommonService','$localStorage', function($scope, $http, $rootScope, SweetAlert, $location, $stateParams, PromiseUtils, VehicleService, CommonService, $localStorage) {
    //check login authentication
    $scope.category = {};

    $scope.itemsPerPage = 10;
    $scope.currentPage = 0;
    $scope.showTableFlag = false;
    $scope.surge = {};
    $scope.date = {};
    $scope.days = {};
    $scope.waitingRange = {};

    $scope.setting = {};
    $scope.vehicleGoods = {};
    $scope.vehicleGoods.types ={};
    $scope.all=false;

    $rootScope.changeMaalgaadiCity = function(){
        $scope.maalgaadi_city_id = $rootScope.default_city_id;
        $localStorage.defaultCityId = $rootScope.default_city_id;
        $scope.getVechicleCategory($scope.maalgaadi_city_id);
    }
    $scope.checkAll = function() {
        var data={ischeck:$scope.all}
         $http({
            method: 'GET',
            url: '/api/goodListing',
            params:data
        }).then(function successCallback(response) {
            $scope.goods  = response.data;
            var ln= $scope.goods.length;
            for(var i=0; i<ln;i++){
                var j=$scope.goods[i].id;
                var selected=$scope.goods[i].selected;
                var ret=false;
                if(selected==1){
                    ret = true;
                }
                $scope.vehicleGoods.types[j]=ret;
            }
        }, function errorCallback(response) {});

    };
    
    $scope.getVechicleCategory = function(city_id) 
    {   
        if(angular.isUndefined(city_id))
        {
            var data = {city_id : $localStorage.defaultCityId};
        }
        else
        {
            var data = {city_id : city_id};
        }

        var vehicleDetails = CommonService.getDetails(data, 'vehicle');
        vehicleDetails.then(function(response) {
            $scope.vehicleCategoryDetialsByCity = response.result;
        });
    };

    $scope.gettypeOfGoods = function(city_id, vehicle_id = '') {
        if(vehicle_id == '' || vehicle_id == null){
            $scope.typeOfGoods = {};
            return false;
        }
        var data = {city_id : city_id,vehicle_id:vehicle_id};
        var typeOfGoods = VehicleService.typeOfGoods(data);
        typeOfGoods.then(function(response) {
            $scope.typeOfGoods = response.data;
        });
    };

    $scope.addVehicleGoodsCharge = function(vehicle, goods) {

        var data = {vehicle_id : vehicle.id, loading_charge : vehicle.loading_charge, unloading_charge : vehicle.unloading_charge, goods_id : goods.id};
        var addVehiclegoodsCharge = VehicleService.addVehicleGoodsCharge(data);
    };

    $scope.getVehicleGoodsChargesPageChange = function(newPage, category) 
    {   
        if(category == ''){
            category = {}
        }
        if(angular.isUndefined($scope.maalgaadi_city_id)){
            return false;
        }
        category.city_id = $scope.maalgaadi_city_id;
        getVehicleGoodsCharges(newPage, category);
    }

    function getVehicleGoodsCharges(pageNumber, category = '') 
    {
        $scope.onSubmitLoader = true;
        $scope.onSubmitResult = false;
        var data = {city_id : category.city_id, vehicle_id : category.vehicle_id, goods_id : category.goods_id, page : pageNumber, entries : category.entries};

        var getVehicleGoodsCharges = VehicleService.getVehicleGoodsCharges(data);
        getVehicleGoodsCharges.then(function(response) {
            $scope.onSubmitLoader = false;
            $scope.onSubmitResult = true;
            $scope.vehicleGoodsCharges = response.data.data.data;

            $scope.totalItems = response.data.pagination.total;
            $scope.currentPage = response.data.pagination.current_page;
            $scope.perPage = response.data.pagination.per_page;
            $scope.mypage = response.data.pagination.current_page;
            if ($scope.mypage == 0) {
                $scope.perpg = response.data.pagination.total;
            } else {

               $scope.perpg = response.data.pagination.per_page;
            }
            if (pageNumber == 1) {
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


    $scope.searchVehicleGoodsDetails = function() {
        var $rows = $('#vehicle-goods-record tbody tr');
        $('#search_record').keyup(function() {
            var val = $.trim($(this).val()).replace(/ +/g, ' ').toLowerCase();

            $rows.show().filter(function() {
                var text = $(this).text().replace(/\s+/g, ' ').toLowerCase();
                return !~text.indexOf(val);
            }).hide();
        });
    };

    $scope.addVechicleCategory = function() {

        if ($scope.category.vehicle_name != undefined) {

            var data = $scope.category;
            VehicleService.addVechicleCategory(data);
        }

    };

    $scope.editVehicle = function() {
        var data = { vehicle_id: $stateParams.vehicleId };
        var vehicleDetials = VehicleService.editVehicle(data);
        vehicleDetials.then(function(result) {
            $scope.vehicle = result;
        });
    };

    $scope.editVechicleCategory = function(id, data) {
        var data = $scope.vehicle;
        VehicleService.editVechicleCategory(id, data);
    };

    $scope.deleteVechicleCategory = function(id) {

        VehicleService.deleteVechicleCategory(id);

    };

    $scope.editVehicleGoods = function() {
        var data = { id: $stateParams.id };
       
        var vehicleDetials = VehicleService.editVehicleGoods(data);
        vehicleDetials.then(function(response) {
            $scope.vehicle = response.vehicleDetials;
            $scope.category = response.vehicle;
            $scope.getVechicleCategory($scope.category.city_id);
            $scope.gettypeOfGoods($scope.category.city_id, $scope.category.id);

        });
    };

    $scope.updateVehicleGoodsCharge = function(vehicle) {
        if(angular.isUndefined($scope.maalgaadi_city_id)){
            return false;
        }
        vehicle.city_id = $scope.maalgaadi_city_id;
        VehicleService.updateVehicleGoodsCharge(vehicle);
    };

    $scope.deleteVehicleGoodsDetails = function(id) {
        VehicleService.deleteVehicleGoodsDetails(id);
    };


    $scope.editable = function(vehicleCategory) {
        $scope.category.id = vehicleCategory.id;
        $scope.category.vehicle_name = vehicleCategory.vehicle_name;
        $scope.category.first_ten_kms_rate = vehicleCategory.first_ten_kms_rate;
        $scope.category.loading_charge = vehicleCategory.loading_charge;
        $scope.category.unloading_charge = vehicleCategory.unloading_charge;
        $scope.category.min_fare = vehicleCategory.min_fare;
        $scope.category.allowed_drop_point = vehicleCategory.allowed_drop_point;
        $scope.category.rate_per_drop_point = vehicleCategory.rate_per_drop_point;
        $scope.category.waiting_charge = vehicleCategory.waiting_charge;
        $scope.category.pod_charge = vehicleCategory.pod_charge;
        $scope.category.rate = vehicleCategory.rate;
        $scope.category.loading_unloading_time_allowed = vehicleCategory.loading_unloading_time_allowed;
        $scope.category.city_id = vehicleCategory.city_id;
        $scope.category.city_name = vehicleCategory.city_name;
    };

    $scope.getVechicleCategoryById = function(vehicle_id) {
        if(vehicle_id){
            data = {vehicle_id : vehicle_id};
            var vehicleDetails = CommonService.getDetails(data,'getVechicleCategoryById');
            vehicleDetails.then(function(response) {
                $scope.showTableFlag        = true;
                $scope.singleVehicle        = response.success.vehicleData;
                $scope.usageSurge           = response.success.usageSurgeData;
                $scope.dateSurge            = response.success.dateSurgeData;
                $scope.daysSurge            = response.success.daysSurgeData;
                $scope.surgeSetting         = response.success.surgeSetting;
                $scope.goods                = response.success.goods;
                $scope.driverChargesSetting = response.success.driverChargesSetting;
                $scope.waitingRange         = response.success.waitingRange;
                $scope.tips                 = response.success.tips;
                $scope.time                 = response.success.time;
                
                // if(angular.isDefined($scope.driverChargesSetting.status)){
                    // $scope.driverChargesSetting.status = 1;
                // }
                var ln= $scope.goods.length;
                for(var i=0; i<ln;i++){
                    var j=$scope.goods[i].id;
                    var selected=$scope.goods[i].selected;
                    var ret=false;
                    if(selected==1){
                        ret = true;
                    }
                    //$scope.vehicleGoods.types[j]='';
                    $scope.vehicleGoods.types[j]=ret;
                }

            });
        }
    };
    $scope.usageSurge = {};
    $scope.addUsageSurge = function(usage){
        if(usage.days_rang_from > usage.days_rang_to) {
            $("#dateTo").focus();
            SweetAlert.swal({
                title: "Error",
                text: "Days range to should be equal or less than to Days range from.",
                type: "error",
                showCancelButton: false,
                closeOnConfirm: true
            });
            return false;
        }

        var data = {id : usage.id, days_rang_from : usage.days_rang_from , days_rang_to : usage.days_rang_to ,days_rang_per : usage.days_rang_per,vehicle_id:$scope.singleVehicle.id};
        var vehicleDetails = VehicleService.addUsageSurge(data);
        vehicleDetails.then(function(response) {
            if(response.success){
                SweetAlert.swal({
                    title: "Success",
                    text: "Added Successfully",
                    type: "success",
                    showCancelButton: false,
                    closeOnConfirm: true
                 }, function() {
                    $("#usageAddNewRule").modal('hide');
                });
                $scope.usageSurge = response.success.data;
            } else {
                 SweetAlert.swal({
                    title: "Error",
                    text: response.error.message,
                    type: "error",
                    showCancelButton: false,
                    closeOnConfirm: true
                });
            }
             
        });
            
    };
    
    $scope.editUsageSurge = function(base) {
        $scope.surge.days_rang_from  = base.days_range_from;
        $scope.surge.days_rang_to  = base.days_range_to;
        $scope.surge.days_rang_per  = base.surge_percentage;
        $scope.surge.id  = base.id;
    };

    $scope.addDateSurge = function(surgeDate){
        var from = $("#dateFrom").val();
        var to = $("#dateTo").val();

        if(from > to){
           SweetAlert.swal({
                title: "Error",
                text: "Invalid Date Range.",
                type: "error",
                showCancelButton: false,
                closeOnConfirm: true
            });
           return false;
        }
        var data = {id : surgeDate.id, date_from : surgeDate.date_from , date_to : surgeDate.date_to ,date_surge_percentage : surgeDate.date_percentage,vehicle_id:$scope.singleVehicle.id};
        var vehicleDetails = VehicleService.addDateSurge(data);
        vehicleDetails.then(function(response) {
            if(response.success){
                 SweetAlert.swal({
                    title: "Success",
                    text: "Added Successfully",
                    type: "success",
                    showCancelButton: false,
                    closeOnConfirm: true
                 }, function() {
                    $("#dateAddNewRule").modal('hide');
                });
                $scope.dateSurge = response.success.data;
            } else {
                 SweetAlert.swal({
                    title: "Error",
                    text: response.error.message,
                    type: "error",
                    showCancelButton: false,
                    closeOnConfirm: true
                });
            }
        });
    };

    $scope.editDateSurge = function(dateSurge) {
        $scope.date.date_from  = dateSurge.date_from;
        $scope.date.date_to = dateSurge.date_to;
        $scope.date.date_percentage  = dateSurge.date_surge_percentage;
        $scope.date.id  = dateSurge.id;
    };

    $scope.addDaysSurge = function(surDay){

        var data = { 
                        id : surDay.id,
                        sun : surDay.sun,
                        mon : surDay.mon,
                        tue : surDay.tue,
                        wed : surDay.wed,
                        thu : surDay.thu,
                        fri : surDay.fri,
                        sat : surDay.sat,
                        vehicle_id:$scope.singleVehicle.id
                   };
        var vehicleDetails = VehicleService.addDaysSurge(data);
        vehicleDetails.then(function(response) {
             SweetAlert.swal({
                title: "Success",
                text: "Added Successfully",
                type: "success",
                showCancelButton: false,
                closeOnConfirm: true
             }, function() {
                $("#dayAddNewRule").modal('hide');
            });
            $scope.daysSurge = response.success.data;
        });
    };

    $scope.editDaysSurge = function(surgeDay) {
        $scope.days.sun = surgeDay.sun;
        $scope.days.mon = surgeDay.mon;
        $scope.days.tue = surgeDay.tue;
        $scope.days.wed = surgeDay.wed;
        $scope.days.thu = surgeDay.thu;
        $scope.days.fri = surgeDay.fri;
        $scope.days.sat = surgeDay.sat;
        $scope.days.id  = surgeDay.id;
    };


    $scope.removeUsageSurge = function(base){
        var data = {id : base.id , vehicle_id:$scope.singleVehicle.id};
        SweetAlert.swal({
            title: "Confirm",
            text: "Do you want to remove this rule!",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            imageUrl: "assets/images/ic_launcher.png"
        }, function(isConfirm) {
            if (isConfirm) {
                var vehicleDetails =  VehicleService.removeUsageSurge(data);
                vehicleDetails.then(function(response) {
                    $scope.usageSurge = response.success.data;
                });
            }
        });

    };

    $scope.removeDateSurge = function(dateSurg){
        var data = {id : dateSurg.id , vehicle_id:$scope.singleVehicle.id };
        SweetAlert.swal({
            title: "Confirm",
            text: "Do you want to remove this rule!",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            imageUrl: "assets/images/ic_launcher.png"
        }, function(isConfirm) {
            if (isConfirm) {
                var vehicleDetails =  VehicleService.removeDateSurge(data);
                vehicleDetails.then(function(response) {
                    $scope.dateSurge = response.success.data;
                });
            }
        });

    };

    $scope.resetSurgeForm = function(){
        $scope.date = {};
        $scope.surge = {};
        $scope.waiting = {};
    };

    $scope.editSurgeSetting = function(settingSurge){
        $scope.setting.allow_max_limit  = settingSurge.allow_max_limit;
        $scope.setting.allow_normal     = settingSurge.allow_normal;
        $scope.setting.allow_fixed      = settingSurge.allow_fixed;
        $scope.setting.allow_hourly     = settingSurge.allow_hourly;
        $scope.setting.id               = settingSurge.id;
    };


    $scope.updateSurgeSetting = function(setting){
       var data = { 
                    id : setting.id,
                    allow_max_limit : setting.allow_max_limit,
                    allow_normal : setting.allow_normal,
                    allow_fixed : setting.allow_fixed,
                    allow_hourly : setting.allow_hourly,
                    vehicle_id:$scope.singleVehicle.id
                   };
        var vehicleDetails = VehicleService.updateSurgeSetting(data);
        vehicleDetails.then(function(response) {
             SweetAlert.swal({
                title: "Success",
                text: "Update Successfully",
                type: "success",
                showCancelButton: false,
                closeOnConfirm: true
             }, function() {
                $("#surgeSrettingNew").modal('hide');
            });
            $scope.surgeSetting = response.success.data;
        });
    };
    $scope.organization = [];
    $scope.customer_name = [];
    $scope.getOrganization = function() {
        $http({
            method: 'GET',
            url: '/api/getNonCorporateCustomer',
        }).then(function successCallback(response) {
            $scope.organizationData = response.data;
           
            angular.forEach(response.data, function(value, key) {
                $scope.organization.push(value['cust_organization']);
                $scope.customer_name.push(value['cust_name']);
                $("#organization").autocomplete({ source: $scope.organization });

            });
        }, function errorCallback(response) {});
        $scope.getCorporateCustomer();
    };

    $scope.getCorporateCustomer = function(customer ='',pagenum = 1, ) {
        $scope.onsubmitbookingReportDataShow = true;
        var type = "10";
        if(customer.type == undefined){
           var type = "10"; 
        } else {
            var type = customer.type
        } 
        var data = {page: pagenum , type : type }
        $http({
            method: 'GET',
            url: '/api/getCorporateCustomer',
            params: data
        }).then(function successCallback(response) {
            $scope.corporateCustomer = response.data.data;
            $scope.totalItems = response.data.total;
            $scope.currentPage = response.data.current_page;
            $scope.perPage = response.data.per_page;
            if (pagenum == 1) {
                setTimeout(function() {
                    $scope.currentPage = 1;
                    var previousActive = $('dir-pagination-controls ul li.active').find('a').text();
                    if (Number(previousActive) > 1) {
                        $('dir-pagination-controls ul li:nth-child(2)').find('a').click();
                    }
                }, 400);

            }
            $scope.onsubmitbookingReportDataShow = false;
        }, function errorCallback(response) {});

    };
    
    $scope.addCustomerToCorporate = function(customer,changeTo){
        var pagenum = 1;
        var data = {cust_organization : customer.cust_organization, changeTo : changeTo}
        $http({
            method: 'GET',
            url: '/api/updateCustomerType',
            params: data
        }).then(function successCallback(response) {
            $scope.corporateCustomer = response.data.data;
            $scope.totalItems = response.data.total;
            $scope.currentPage = response.data.current_page;
            $scope.perPage = response.data.per_page;
            $scope.customer.cust_organization = '';
            if (pagenum == 1) {
                setTimeout(function() {
                    $scope.currentPage = 1;
                    var previousActive = $('dir-pagination-controls ul li.active').find('a').text();
                    if (Number(previousActive) > 1) {
                        $('dir-pagination-controls ul li:nth-child(2)').find('a').click();
                    }
                }, 400);

            }
            $scope.getCorporateCustomer();
            $scope.onsubmitbookingReportDataShow = false;
        }, function errorCallback(response) {});
    };
    
    $scope.searchRecord = function() {
        var $rows = $('table tbody tr');
        $('#search_record').keyup(function() {
            var val = $.trim($(this).val()).replace(/ +/g, ' ').toLowerCase();
            $rows.show().filter(function() {
                var text = $(this).text().replace(/\s+/g, ' ').toLowerCase();
                return !~text.indexOf(val);
            }).hide();

        });
    };

    $scope.setting = {};
    $scope.getSurgeSetting = function() {

        $http({
            method: 'GET',
            url: '/api/getSurgeSetting',
        }).then(function successCallback(response) {
            if (response.data) {
                if(response.data.success.data[0].key == 'allow_surge_max_limit_for_base' )
                {
                    $scope.setting.allow_surge_max_limit_for_base = response.data.success.data[0].value;
                } 
                else 
                {
                    $scope.setting.allow_surge_max_limit_for_base = 5;
                }

                if(response.data.success.data[1].key == 'call_center_booking_surge_percentage' )
                {
                    $scope.setting.call_center_booking_surge_percentage = Number(response.data.success.data[1].value);
                }
                else
                {
                    $scope.setting.call_center_booking_surge_percentage = 0;
                }
            } else {
                $scope.setting.allow_surge_max_limit_for_base = 5;
                $scope.setting.call_center_booking_surge_percentage = 0;
            }
            
        }, function errorCallback(response) {});
        
    };

    $scope.updateMainSurgeSetting = function(setting) {
        var data = { allow_surge_max_limit_for_base: setting.allow_surge_max_limit_for_base ,call_center_booking_surge_percentage : setting.call_center_booking_surge_percentage};
        $http({
            method: 'GET',
            url: '/api/updateMainSurgeSetting',
            params: data
        }).then(function successCallback(response) {
            if (response.data) {
                if(response.data.success.data.key == 'allow_surge_max_limit_for_base' )
                {
                    $scope.setting.allow_surge_max_limit_for_base = response.data.success.data.value;
                }
                if(response.data.success.data.key == 'call_center_booking_surge_percentage' )
                {
                    $scope.setting.call_center_booking_surge_percentage = response.data.success.data.value;
                }
            } else {
                $scope.setting.allow_surge_max_limit_for_base = 5;
                $scope.setting.call_center_booking_surge_percentage = 0;
            }
            SweetAlert.swal({
                title: "Success",
                text: "Update Successfully",
                type: "success",
                showCancelButton: false,
                closeOnConfirm: true
            });
        }, function errorCallback(response) {});
      
    };

    $scope.ddValue = [];
    $scope.getNumOfDays = function() {
        for (var i = 1; i < 32; i++) {
            $scope.ddValue.push(i);
        }
    };

    $scope.updateVehicleGoods = function(goodIds) {
        //alert($scope.vehicle.id);
       var data = {goodids:goodIds.types,vehicleId:$scope.vehicle.id};
        $http({
            method: 'GET',
            url: '/api/updateVehicleGoods',
            params: data
        }).then(function successCallback(response) {
            SweetAlert.swal({
            title: "Success",
            text: "Update Successfully",
            type: "success",
            showCancelButton: false,
            closeOnConfirm: true
            });
             $scope.goods         = response.success.goods;
            var ln= $scope.goods.length;
            for(var i=0; i<ln;i++){
                var j=$scope.goods[i].id;
                var selected=$scope.goods[i].selected;
                var ret=false;
                if(selected==1){
                    ret = true;
                }
                //$scope.vehicleGoods.types[j]='';
                $scope.vehicleGoods.types[j] = ret;
            }
        }, function errorCallback(response) {});

    };

    $scope.editDriverWaitCharge = function(data){
        $scope.chargeSetting = {}
        $scope.chargeSetting.min_time_at_pickup = data.min_time_at_pickup;
        $scope.chargeSetting.max_time_at_pickup = data.max_time_at_pickup;
        $scope.chargeSetting.min_time_at_drop = data.min_time_at_drop;
        $scope.chargeSetting.max_time_at_drop = data.max_time_at_drop;
        $scope.chargeSetting.min_travel_time = data.min_travel_time;
        $scope.chargeSetting.max_travel_time = data.max_travel_time;
        $scope.chargeSetting.max_waiting_charge = data.max_waiting_charge;

        $scope.chargeSetting.status = data.status;
        console.log($scope.chargeSetting,'charge')
    }
    $scope.updateDriverWaitCharge = function(data,driverWaitCharge){console.log(driverWaitCharge,'driver');
        data.vehicle_id = driverWaitCharge.vehicle_id;console.log(data,'driver1');
        var vehicleDetails = CommonService.saveAndUpdateDetails(data, 'updateDriverWaitChargee');
            vehicleDetails.then(function(response) {
                $scope.driverChargesSetting.min_time_at_pickup = data.min_time_at_pickup;
                $scope.driverChargesSetting.max_time_at_pickup = data.max_time_at_pickup;
                $scope.driverChargesSetting.min_time_at_drop = data.min_time_at_drop;
                $scope.driverChargesSetting.max_time_at_drop = data.max_time_at_drop;
                $scope.driverChargesSetting.min_travel_time = data.min_travel_time;
                $scope.driverChargesSetting.max_travel_time = data.max_travel_time;
                $scope.driverChargesSetting.max_waiting_charge = data.max_waiting_charge;
                $scope.driverChargesSetting.status = data.status;
                if(angular.isDefined(response.success)){
                    SweetAlert.swal({
                        title: "Success",
                        text: "Update Successfully",
                        type: "success",
                        showCancelButton: false,
                        closeOnConfirm: true
                    });
                    $("#driverWaitCharge").modal('hide');
                }
            });
    };

    $scope.usageSurge = {};
    $scope.addWaitingRange = function(waiting){
        console.log(waiting);
        if(waiting.days_rang_from > waiting.days_rang_to) {
            $("#days_rang_from").focus();
            SweetAlert.swal({
                title: "Error",
                text: "Amount range to should be equal or less than to Days range from.",
                type: "error",
                showCancelButton: false,
                closeOnConfirm: true
            });
            return false;
        }

        var data = {id : waiting.id, amount_range_from : waiting.amount_range_from , amount_range_to : waiting.amount_range_to ,waiting_charge_percentage : waiting.waiting_charge_percentage,vehicle_id:$scope.singleVehicle.id};
        var vehicleDetails = VehicleService.addWaitingRange(data);
        vehicleDetails.then(function(response) {
            if(response.success){
                SweetAlert.swal({
                    title: "Success",
                    text: "Added Successfully",
                    type: "success",
                    showCancelButton: false,
                    closeOnConfirm: true
                 }, function() {
                    $("#waitingAddNewRule").modal('hide');
                });
                $scope.waitingRange = response.success.data;
            } else {
                 SweetAlert.swal({
                    title: "Error",
                    text: response.error.message,
                    type: "error",
                    showCancelButton: false,
                    closeOnConfirm: true
                });
            }
             
        });
            
    };
    $scope.waiting = {};
    $scope.editWaitingRange = function(wait) {
        
        $scope.waiting.amount_range_from  = wait.amount_range_from;
        $scope.waiting.amount_range_to  = wait.amount_range_to;
        $scope.waiting.waiting_charge_percentage  = wait.waiting_charge_percentage;
        $scope.waiting.id  = wait.id;
    };

    $scope.removeWaitingRange = function(wait){
        var data = {id : wait.id , vehicle_id:$scope.singleVehicle.id};
        SweetAlert.swal({
            title: "Confirm",
            text: "Do you want to remove this rule!",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            imageUrl: "assets/images/ic_launcher.png"
        }, function(isConfirm) {
            if (isConfirm) {
                var vehicleDetails =  VehicleService.removeWaitingRange(data);
                vehicleDetails.then(function(response) {
                    $scope.waitingRange = response.success.data;
                });
            }
        });

    };

    $scope.tips = {};
    $scope.addTipCharge = function(tip){
        
        var data = {id : tip.id, tip : tip.tip , vehicle_id:$scope.singleVehicle.id};
        var vehicleDetails = VehicleService.addTipCharge(data);
        vehicleDetails.then(function(response) {
            if(response.success){
                SweetAlert.swal({
                    title: "Success",
                    text: "Added Successfully",
                    type: "success",
                    showCancelButton: false,
                    closeOnConfirm: true
                 }, function() {
                    $("#tipAddNewRule").modal('hide');
                });
                $scope.tips = response.success.data;
            } else {
                 SweetAlert.swal({
                    title: "Error",
                    text: response.error.message,
                    type: "error",
                    showCancelButton: false,
                    closeOnConfirm: true
                });
            }
             
        });
            
    };
    $scope.tip = {};
    $scope.editTip = function(tip) {
        
        $scope.tip.tip  = tip.tip;
        $scope.tip.id  = tip.id;
    };

    $scope.removeTipCharge = function(wait){
        var data = {id : wait.id , vehicle_id:$scope.singleVehicle.id};
        SweetAlert.swal({
            title: "Confirm",
            text: "Do you want to remove this rule!",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            imageUrl: "assets/images/ic_launcher.png"
        }, function(isConfirm) {
            if (isConfirm) {
                var vehicleDetails =  VehicleService.removeTipCharge(data);
                vehicleDetails.then(function(response) {
                    $scope.tips = response.success.data;
                });
            }
        });
    };

    $scope.addBookingWaitingTimeRange = function(time){
        console.log(time)
        // return false;
        var data = {id : time.id, time : time.time , vehicle_id:$scope.singleVehicle.id};
        var vehicleDetails = VehicleService.addBookingWaitingTimeRange(data);
        vehicleDetails.then(function(response) {
            if(response.success){
                SweetAlert.swal({
                    title: "Success",
                    text: "Added Successfully",
                    type: "success",
                    showCancelButton: false,
                    closeOnConfirm: true
                 }, function() {
                    $("#addWaitingTimeRange").modal('hide');
                });
                $scope.time = response.success.data;
            } else {
                 SweetAlert.swal({
                    title: "Error",
                    text: response.error.message,
                    type: "error",
                    showCancelButton: false,
                    closeOnConfirm: true
                });
            }
             
        });
            
    };
 
    $scope.editBookingWaitTimeRange = function(time) {
        
        $scope.time.time  = time.time_in_hour;
        $scope.time.id  = time.id;
    };
     
    $scope.removeBookingWaitTimeRange = function(time){
        var data = {id : time.id , vehicle_id:$scope.singleVehicle.id};
        SweetAlert.swal({
            title: "Confirm",
            text: "Do you want to remove this rule!",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            imageUrl: "assets/images/ic_launcher.png"
        }, function(isConfirm) {
            if (isConfirm) {
                var vehicleDetails =  VehicleService.removeBookingWaitTimeRange(data);
                vehicleDetails.then(function(response) {
                    $scope.time = response.success.data;
                });
            }
        });

    };
 
     
}]);
