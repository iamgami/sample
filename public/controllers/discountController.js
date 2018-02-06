app.controller('DiscountController', ['$http', '$scope', 'SweetAlert', 'DiscountService','$stateParams','$rootScope', '$localStorage', function($http, $scope, SweetAlert, DiscountService,$stateParams, $rootScope, $localStorage) {
    //get all user with discount
    $scope.itemsPerPage = 10;
    $scope.currentPage = 0;
	
    $rootScope.changeMaalgaadiCity = function(){
        $scope.maalgaadi_city_id = $rootScope.default_city_id;
        $localStorage.defaultCityId = $rootScope.default_city_id;
    }
    $scope.showTableFlag = false;
    $scope.AllCustomerDiscount = function(pagenum = '1', requestType = '') {
        $scope.message = false;
        var data = { page: pagenum };
        var allCustomerDiscount = DiscountService.allCustomerDiscount(data);

        allCustomerDiscount.then(function successCallback(response) {

            if (response.data.success) {
                $scope.showTableFlag = true;
                $scope.AllDiscounList = response.data.result.data;
                $scope.showTableFlag = true;
                $scope.totalItems = response.data.result.total;
                $scope.currentPage = response.data.result.current_page;
                $scope.perPage = response.data.result.per_page;
                if (requestType == 1) {
                    setTimeout(function() {
                        $scope.currentPage = 1;
                        var previousActive = $('dir-pagination-controls ul li.active').find('a').text();
                        if (Number(previousActive) > 1) {
                            $('dir-pagination-controls ul li:nth-child(2)').find('a').click();
                        }
                    }, 400);
                }
            }
        }, function errorCallback(response) {});
    };

    $scope.discount = {};
    $scope.setCustomerDiscount = function() {
        var setCustomerDiscount = DiscountService.setCustomerDiscount();
        setCustomerDiscount.then(function successCallback(response) {
            $window.loginDriverDetials = response.data;
        }, function errorCallback(response) {});
    };

    $scope.organization = [];
    $scope.discount_customer_name = [];
    $scope.discount_customer_number = [];
    $scope.organizationFlag = false;
    $scope.organizationData = [];
    $scope.customedetails = [];


    //get all customer organization
    $scope.getOrganization = function() {
        var getOrganization = DiscountService.getOrganization();
        getOrganization.then(function successCallback(response) {
            $scope.organizationData = response.data;

            angular.forEach(response.data, function(value, key) {

                $scope.organization.push(value['cust_organization']);
                $scope.discount_customer_name.push(value['cust_name']);
                $scope.discount_customer_number.push(value['cust_number']);
            });
            $("#customer_name").autocomplete({ source: $scope.discount_customer_name });
            $("#customer_org").autocomplete({ source: $scope.organization });

            $scope.organizationFlag = true;
        }, function errorCallback(response) {});
    };
    //$scope.getOrganization();
    $scope.amountCheck = function() {

        if ($scope.discount.discount_amount > 100) {
            $scope.discount_form.$valid = false;
            $scope.discount_form.discount_amount.$error.limit = true;
        } else if ($scope.discount.discount_amount == '') {
            $scope.discount_form.$valid = false;
            $scope.discount_form.discount_amount.$error.limit = true;
        } else {
            $scope.discount_form.$valid = true;
            $scope.discount_form.discount_amount.$error.limit = false;
        }
    }

    $scope.getOrganizationData = function() {
        var compare = $scope.discount.cust_organization;
        angular.forEach($scope.organizationData, function(value, key) {
            if (compare == value['cust_organization']) {
                $scope.discount = value;
            }
        });
    };

    $scope.getOrganizationList = function(category) {
        var compareCustomerName = $scope.discount.customer_name;
        var compareCustomerOrg = $scope.discount.cust_org;
        var compareCustomerNumber = $scope.discount.cust_number;
        $scope.customedetails = [];

        angular.forEach($scope.organizationData, function(value, key) {

            if (compareCustomerName == value['cust_name'] && category == 'name') {

                $scope.discount.cust_org = '';
                $scope.discount.cust_number = '';
                $scope.discount.discount_amount = '';
                //$scope.discount.city='';
                $scope.discount.cust_org = value['cust_organization'];
                $scope.discount.cust_number = value['cust_number'];
                //$scope.discount.city=value['city_id'];
                $scope.discount.id = value['id'];
                if (value['cust_discount_percent'] != 0) {
                    $scope.discount.discount_amount = value['cust_discount_percent'];
                }
                //$scope.discount.discount_amount=value['cust_discount_percent'];
                //console.log(value['cust_discount_percent'])
                //$scope.freezeAll=true
            }

            if (compareCustomerOrg == value['cust_organization'].trim() && category == 'org') {
                //console.log(value)
                //$scope.discount.city='';
                $scope.discount.customer_name = '';
                $scope.discount.cust_number = '';
                $scope.discount.discount_amount = '';
                //$scope.discount.city=value['city_id'];                                
                $scope.discount.customer_name = value['cust_name'];
                $scope.discount.cust_number = value['cust_number'];
                $scope.discount.id = value['id'];
                if (value['cust_discount_percent'] != 0) {
                    $scope.discount.discount_amount = value['cust_discount_percent'];
                }
                //$scope.freezeAll=true
            }

            if (compareCustomerNumber == value['cust_number'] && category == 'number') {


                $scope.discount.customer_name = '';
                $scope.discount.cust_org = ''
                $scope.discount.discount_amount = ''

                $scope.discount.customer_name = value['cust_name'];
                $scope.discount.cust_org = value['cust_organization'];
                $scope.discount.id = value['id'];
                if (value['cust_discount_percent'] != 0) {
                    $scope.discount.discount_amount = value['cust_discount_percent'];
                }
                //$scope.discount.discount_amount=value['cust_discount_percent'];
                //$scope.freezeAll=true
            }

        });
        //  $scope.freezeAll=true;
    };
    $scope.discountvalue = false;
    $scope.addCustomerDiscount = function(id) {

        if ($scope.discount.discount_amount <= 100) {
            var data = $scope.discount;
            var addCustomerDiscount = DiscountService.addCustomerDiscount(data);
            addCustomerDiscount.then(function successCallback(response) {

                if (response.data.success) {
                    var message = response.data.success.message;
                    SweetAlert.swal({
                        title: response.data.stats,
                        text: response.data.success.message,
                        type: "success",
                        showCancelButton: false,
                        closeOnConfirm: false
                    }, function() {
                        location.href = '/discount-coupon';
                    });
                } else {
                    $scope.discountvalue = false;
                }

            }, function errorCallback(response) {});
        } // if 100 %check
    };

    $scope.searchCustomer = function(serchBy) {
        $scope.message = false;
        var data = serchBy;
        var searchResponse = DiscountService.searchCustomer(data);
        searchResponse.then(function successCallback(response) {

            if (response.data.result.length) {
                $scope.showTableFlag = true;
                $scope.AllDiscounList = response.data.result;
                $scope.totalItems = 0;
                $scope.currentPage = 0;
                $scope.perPage = 0;
            } else {
                $scope.AllDiscounList = [];
                $scope.message = true;
            }
        }, function errorCallback(response) {});

    };

    $scope.resetCustomerSearch = function() {
        $scope.AllDiscounList = [];
        $scope.customer = [];
        $scope.AllCustomerDiscount();
    };
    $scope.exportDiscount = function(customer) {
        var customername = '';
        var custOrg = '';
        if (customer) {

            customername = customer.cust_name;
            custOrg = customer.cust_org;
        } else {
            $customername = '';
            $custOrg = '';
        }
        window.location = 'api/AllCustomerDiscount?export=export&cust_name=' + customername + '&cust_org=' + custOrg;
    }

    $scope.getVechicleCategory = function(city_id) {
    	console.log(city_id, "category")
        var data = {city_id : city_id};
        $http({
            method: 'GET',
            url: '/api/vehicle',
            params: data
        }).then(function successCallback(response) {
            $scope.vehicleCategoryDetials = response.data.result;
        }, function errorCallback(response) {});
    };
     
    $scope.discountvalue = false;
    $scope.addDiscountCoupon = function(id) {
        var booking_type = [];
        $("input[name='booking_type[]']:checked").each(function(){
            booking_type.push($(this).val());
        });
        var billing_type = [];
        $("input[name='billing_type[]']:checked").each(function(){
            billing_type.push($(this).val());
        });
        var day_of_week = [];
        $("input[name='day_of_week[]']:checked").each(function(){
            day_of_week.push($(this).val());
        });
        var applicable_on = [];
        $("input[name='applicable_on[]']:checked").each(function(){
            applicable_on.push($(this).val());
        });
        var vehicle = [];
        $("input[name='vehicle[]']:checked").each(function(){
            vehicle.push($(this).val());
        });

        var data = $scope.discount;

        data.booking_type   = JSON.stringify(booking_type);
        data.billing_type   = JSON.stringify(billing_type);
        data.day_of_week    = JSON.stringify(day_of_week);
        data.applicable_on  = JSON.stringify(applicable_on);
        data.city_id        = $scope.maalgaadi_city_id;
        data.vehicle_id     = JSON.stringify(vehicle);
        var addDiscountCoupon = DiscountService.addDiscountCoupon(data);
        addDiscountCoupon.then(function successCallback(response) {
            console.log(response);
            if (response.data.success) {
                var message = response.data.success.message;
                SweetAlert.swal({
                    title: response.data.success.title,
                    text: response.data.success.message,
                    type: "success",
                    showCancelButton: false,
                    closeOnConfirm: false
                }, function() {
                    location.href = '/discount-coupon-list';
                });
            } else {
                SweetAlert.swal({
                    title: 'Error',
                    text: response.data.error.message,
                    type: "error",
                    showCancelButton: false,
                    closeOnConfirm: false
                });
                $scope.discountvalue = false;
            }

        }, function errorCallback(response) {});
    };


    $scope.getDiscountCoupon = function(pagenum = '1', requestType = '') {
        $scope.message = false;
        if(angular.isUndefined($scope.maalgaadi_city_id)){
            return false;
        }
        var data = { page: pagenum , code : $scope.code , type : $scope.type, city_id : $scope.maalgaadi_city_id};
        var getDiscountCoupon = DiscountService.getDiscountCoupon(data);
        $scope.onSubmitLoader = true;
        $scope.onSubmitResult = false;
        getDiscountCoupon.then(function successCallback(response) {
            console.log(response)
            if (response.data.success) {
                $scope.onSubmitLoader = false;
                $scope.onSubmitResult = true;
                $scope.AllDiscounList = response.data.result.data;
                $scope.totalItems = response.data.result.total;
                $scope.currentPage = response.data.result.current_page;
                $scope.perPage = response.data.result.per_page;
                if (requestType == 1) {
                    setTimeout(function() {
                        $scope.currentPage = 1;
                        var previousActive = $('dir-pagination-controls ul li.active').find('a').text();
                        if (Number(previousActive) > 1) {
                            $('dir-pagination-controls ul li:nth-child(2)').find('a').click();
                        }
                    }, 400);
                }
            }
        }, function errorCallback(response) {});
    };

    $scope.changeCouponStatus = function(status,id) {
        if(status == 2)
        {
            var statusText = 'delete';
        }
        else if(status == 1)
        {
            var statusText = 'disable';
        } 
        else
        {
            var statusText = 'enable';
        }
        SweetAlert.swal({
        title: "Are you sure?",
        text: "You want to "+statusText+" this code?",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Yes",
        closeOnConfirm: false
        }, function(isConfirm) {
            if (isConfirm) {
                var data = {id : id, status : status };
                var changeCouponStatus = DiscountService.changeCouponStatus(data);
                changeCouponStatus.then(function successCallback(response) {
                    if (response.data.success) {
                        var message = response.data.success.message;
                        SweetAlert.swal({
                            title: response.data.success.title,
                            text: response.data.success.message,
                            type: "success",
                            showCancelButton: false,
                            closeOnConfirm: false
                        }, function() {
                            location.href = '/discount-coupon-list';
                        });
                    } else {
                        SweetAlert.swal({
                            title: 'Error',
                            text: response.data.error.message,
                            type: "error",
                            showCancelButton: false,
                            closeOnConfirm: false
                        });
                        $scope.discountvalue = false;
                    }

                }, function errorCallback(response) {});
            }
        });
    };

    $scope.getCoupon = function() {
       var data = {id :  $stateParams.Id };
        var getCoupon = DiscountService.getCoupon(data);
        getCoupon.then(function successCallback(response) {
            console.log(response, "get")
            if (response.data.success) {
                $scope.discount.city_id = response.data.result.city_id;
                $scope.discount.type  = response.data.result.type;
                $scope.getVechicleCategory(response.data.result.city_id)
                $scope.discount.discount_type = response.data.result.discount_type;
                $scope.discount.discount_percentage = response.data.result.discount_percent;
                $scope.discount.discount_amount = response.data.result.discount_amount;
                $scope.discount.discount_max_amount = response.data.result.discount_max_amount;
                $scope.discount.discount_code = response.data.result.discount_code;
                $scope.discount.valid_from = response.data.result.valid_from;
                $scope.discount.valid_to = response.data.result.valid_to;
                if(response.data.result.max_user_per_day != 0)
                {
                    $scope.discount.max_user_per_day = response.data.result.max_user_per_day;
                }
                if(response.data.result.multiple_use_per_day != 0)
                {
                    $scope.discount.multiple_use_per_day = response.data.result.multiple_use_per_day;
                }
                if(response.data.result.minimum_bill_amount != 0)
                {
                    $scope.discount.minimum_bill_amount = response.data.result.minimum_bill_amount;
                }
                
                if(response.data.result.apply_on_number_of_booking != 0)
                {
                    $scope.discount.apply_on_number_of_booking = response.data.result.apply_on_number_of_booking;
                }
                if(response.data.result.apply_on_number_of_days != 0)
                {
                    $scope.discount.apply_on_number_of_days = response.data.result.apply_on_number_of_days;
                }

                $scope.discount.max_limit_to_use = response.data.result.max_limit_to_use;
                
                $scope.discount.vehicle_id  = response.data.result.vehicle_id;
                $scope.discount.pickup_area_points = response.data.result.pickup_area_points;
                $scope.discount.pickup_area_lat = response.data.result.pickup_area_lat;
                $scope.discount.pickup_area_lng = response.data.result.pickup_area_lng;
                $scope.discount.pickup_radius = response.data.result.pickup_radius;
                $scope.discount.time_from = new Date(response.data.result.time_from);
                $scope.discount.time_to = new Date(response.data.result.time_to); 
                $scope.discount.drop_area_points = response.data.result.drop_area_points;
                $scope.discount.drop_area_lat = response.data.result.drop_area_lat;
                $scope.discount.drop_area_lng = response.data.result.drop_area_lng;
                $scope.discount.drop_radius = response.data.result.drop_radius;
                $scope.discount.description = response.data.result.description;
                if(response.data.result.day_of_week){
                    var day_of_week = JSON.parse(response.data.result.day_of_week);
                    for(i in day_of_week){
                        $('input[name="day_of_week[]"][value='+day_of_week[i]+']').prop('checked', true);
                    }
                }
                if(response.data.result.billing_type){
                    var billing_type = JSON.parse(response.data.result.billing_type);
                    for(i in billing_type){
                        $('input[name="billing_type[]"][value='+billing_type[i]+']').prop('checked', true);
                    }
                }

                if(response.data.result.booking_type){
                    var booking_type = JSON.parse(response.data.result.booking_type);
                    for(i in booking_type){
                        $('input[name="booking_type[]"][value='+booking_type[i]+']').prop('checked', true);
                    }
                }
                if(response.data.result.applicable_on){
                    var applicable_on = JSON.parse(response.data.result.applicable_on);
                    for(i in applicable_on){
                        $('input[name="applicable_on[]"][value='+applicable_on[i]+']').prop('checked', true);
                    }
                }
                
                setTimeout(function(){
                    if(response.data.result.vehicle_id){
                        var vehicle_id = response.data.result.vehicle_id;
                        console.log(vehicle_id);
                        for(i in vehicle_id){
                            var vehicleId = vehicle_id[i];
                            $('input[name="discount_vehicle[]"][value='+vehicleId+']').prop('checked', true);
                            console.log(vehicleId); 
                        }
                    }     
            },500);
                
            }
        }, function errorCallback(response) {});
    };

    $scope.updateDiscountCoupon = function(id) {
        var booking_type = [];
        $("input[name='booking_type[]']:checked").each(function(){
            booking_type.push($(this).val());
        });
        var billing_type = [];
        $("input[name='billing_type[]']:checked").each(function(){
            billing_type.push($(this).val());
        });
        var day_of_week = [];
        $("input[name='day_of_week[]']:checked").each(function(){
            day_of_week.push($(this).val());
        });
        var applicable_on = [];
        $("input[name='applicable_on[]']:checked").each(function(){
            applicable_on.push($(this).val());
        });
        
        var discount_vehicle = [];
        $("input[name='discount_vehicle[]']:checked").each(function(){
            discount_vehicle.push($(this).val());
        });
        
        var data = $scope.discount;
        data.booking_type   = JSON.stringify(booking_type);
        data.billing_type   = JSON.stringify(billing_type);
        data.day_of_week    = JSON.stringify(day_of_week);
        data.applicable_on  = JSON.stringify(applicable_on);
        data.discount_vehicle  = JSON.stringify(discount_vehicle);
        
        data.Id  = $stateParams.Id;
        var updateDiscountCoupon = DiscountService.updateDiscountCoupon(data);
        updateDiscountCoupon.then(function successCallback(response) {
            if (response.data.success) {
                var message = response.data.success.message;
                SweetAlert.swal({
                    title: response.data.success.title,
                    text: response.data.success.message,
                    type: "success",
                    showCancelButton: false,
                    closeOnConfirm: false
                }, function() {
                    location.href = '/discount-coupon-list';
                });
            } else {
                SweetAlert.swal({
                    title: 'Error',
                    text: response.data.error.message,
                    type: "error",
                    showCancelButton: false,
                    closeOnConfirm: false
                });
                $scope.discountvalue = false;
            }

        }, function errorCallback(response) {});
    };

    $("input#discount_code").on({
      keydown: function(e) {
        if (e.which === 32)
          return false;
      },
      change: function() {
        this.value = this.value.replace(/\s/g, "");
      }
    });
    $(function() {
        $('.card-box').on('keydown', '.number', function(e){-1!==$.inArray(e.keyCode,[46,8,9,27,13,110,190])||/65|67|86|88/.test(e.keyCode)&&(!0===e.ctrlKey||!0===e.metaKey)||35<=e.keyCode&&40>=e.keyCode||(e.shiftKey||48>e.keyCode||57<e.keyCode)&&(96>e.keyCode||105<e.keyCode)&&e.preventDefault()});
    });
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
}]);
