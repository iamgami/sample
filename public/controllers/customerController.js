app.controller('CustomerController', ['$rootScope','$scope', '$http', '$window', '$stateParams', 'SweetAlert', '$location', 'CustomerServices','CommonService','$localStorage', function($rootScope, $scope, $http, $window, $stateParams, SweetAlert, $location, CustomerServices, CommonService, $localStorage) {
    $scope.customer = {};
    $scope.isConfirm = false;
    $scope.itemsPerPage = 10;
    $scope.currentPage = 0;
    $scope.showTableFlag = false;
    $scope.searchCustomer = {};
    $scope.searchCustomer.type = "10";
    //$scope.pattern ='/^[A-Za-z()-/ \d\s]+$/';
      $scope.defaultdiv = false;
    $scope.defaultGoodValue = function(type) {
           //alert(type);
           if(type=='Others'){
                $scope.defaultdiv = true;  
           }else{
                $scope.defaultdiv = false;
           }
     };
    $rootScope.changeMaalgaadiCity = function(){
        $scope.maalgaadi_city_id = $rootScope.default_city_id;
        $localStorage.defaultCityId = $rootScope.default_city_id;
    }
    $scope.searchRecordBookingList = function() {
            var $rows = $('#customer-datatable-buttons tbody tr');
            $('#search_record').keyup(function() {
                var val = $.trim($(this).val()).replace(/ +/g, ' ').toLowerCase();

                $rows.show().filter(function() {
                    var text = $(this).text().replace(/\s+/g, ' ').toLowerCase();
                    return !~text.indexOf(val);
                }).hide();
            });
        };
    $scope.exportCustomerDetials = function(search) {
        var cust_org = '';
        var cust_name = '';
        var cust_email = '';
        var cust_number = '';
        var city_id = '';
        var cust_business_product = '';
        if(angular.isUndefined($scope.maalgaadi_city_id)){
            return false;
        }
        search.city_id = $scope.maalgaadi_city_id;
        if (!angular.isUndefined(search)) {

            cust_org = search.cust_org;
            cust_name = search.cust_name;
            cust_email = search.cust_email;
            cust_number = search.cust_number;
            city_id = search.city_id;
            cust_business_product = search.cust_business_product;
        }

        window.location = '/api/customerExport?orgName=' + cust_org + '&custName=' + cust_name + '&custEmail=' + cust_email + '&custNum=' + cust_number + '&city_id=' + city_id + '&landlineNum=' + cust_business_product;
    };
    $scope.getCustomerDetialsPageChange = function(newPage, searchCustomer) {
        getCustomerDetials(newPage, searchCustomer);
    };

    function getCustomerDetials(pageNum, search = '') {
        if(angular.isUndefined($scope.maalgaadi_city_id)){
            return false;
        }
        search.city_id = $scope.maalgaadi_city_id;
        $scope.onSubmitResult = false;
        $scope.onSubmitLoader = true;
        var data = {
            page: pageNum,
            orgName: search.cust_org,
            custName: search.cust_name,
            custEmail: search.cust_email,
            custNum: search.cust_number,
            city_id: search.city_id,
            landlineNum: search.cust_business_product,
            type: search.type
        }
        var resultData = CustomerServices.getCustomerDetials(data);
        resultData.then(function successCallback(response) {
            $scope.onSubmitResult = true;
            $scope.onSubmitLoader = false;
            $scope.customerDetials = response.data.data.data;
            $scope.totalItems = response.data.pagination.total;
            $scope.currentPage = response.data.pagination.current_page;
            $scope.perPage = response.data.pagination.per_page;
            if (pageNum == 1) {
                setTimeout(function() {
                    $scope.currentPage = 1;
                    var previousActive = $('dir-pagination-controls ul li.active').find('a').text();
                    if (Number(previousActive) > 1) {
                        $('dir-pagination-controls ul li:nth-child(2)').find('a').click();
                    }
                }, 400);

            }
        }, function(reason) {
            alert("Something went wrong");
        });
    };
    $scope.getCustomerAutocomplete = function() {
        var postData = CustomerServices.getCustomerAutocomplete();
        postData.then(function successCallback(response) {
            $scope.custOrg = response.data.custOrg;
            $scope.custName = response.data.custName;
            $scope.custNum = response.data.custNum;
            $scope.custEmail = response.data.custEmail;
            $scope.custAddress = response.data.custAddress;
            $scope.custLandline = response.data.custLandline;
            $("#customerOrg").autocomplete({ source: $scope.custOrg });
            $("#customerName").autocomplete({ source: $scope.custName });
            $("#customerNum").autocomplete({ source: $scope.custNum });
            $("#custEmail").autocomplete({ source: $scope.custEmail });
            $("#custAddress").autocomplete({ source: $scope.custAddress });
            $("#custLandline").autocomplete({ source: $scope.custLandline });
            $scope.loadingIsDones = true;
        }, function errorCallback(response) {});
    };

    $scope.customervalue = false;
    $scope.addCustomer = function(customer) {
        if (customer.cust_password != customer.cust_repassword) {
            alert("Password and confirm password is not match");
            return false;
        }
        $http({
            method: 'POST',
            url: '/api/customer',
            params: customer
        }).then(function successCallback(response) {

            if (response.data.stats == 'Success') {
                var message = response.data.success.message;
                getCustomerDetials();
                SweetAlert.swal({
                    title: response.data.stats,
                    text: response.data.success.message,
                    type: "success",
                    showCancelButton: false,
                    closeOnConfirm: false
                }, function() {
                    location.href = '/customer-list';
                });
            } else {
                $scope.customervalue = false;
            }
        }, function errorCallback(response) {});

    };

    $scope.editCustomer = function(customer) {
 
        if ( $scope.customer.cust_organization != undefined && $scope.customer.cust_name != undefined && $scope.customer.cust_email != undefined &&
            $scope.customer.cust_number != undefined && $scope.customer.cust_address != undefined  && (($scope.customer.type_of_goods.goods_name=='Others' && $scope.customer.other_goods!=undefined) || ($scope.customer.type_of_goods.goods_name!='Others') )  ){
            $http({
                method: 'GET',
                url: '/api/customer/' + customer.id,
                params: customer
            }).then(function successCallback(response) {
                $location.path('customer-list');
            }, function errorCallback(response) {});
        };
    };
    $scope.editable = function(customer) {
        $scope.customer = customer;
        $scope.customer.id = customer.id;
    };


    $scope.getCustomer = function() {
        $scope.customer = [];
        $http({
            method: 'GET',
            url: '/api/singlecustomer/' + $stateParams.bookingId,
        }).then(function successCallback(response) {
            console.log(response.data);
            $scope.customer = response.data;
            $scope.customer.type_of_goods = response.data.type_of_goods;
            if(response.data.type_of_goods.goods_name=='Others'){
                $scope.defaultdiv = true;  
            }else{
                $scope.defaultdiv = false;
            }
        }, function errorCallback(response) {});
    }

    $scope.deleteCustomer = function(id) {
        SweetAlert.swal({
            title: "Are you sure?",
            text: "You want to delete this customer!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes",
            closeOnConfirm: false
        }, function(isConfirm) {
            if (isConfirm) {
                $http({
                    method: 'DELETE',
                    url: '/api/customer/' + id,
                }).then(function successCallback(response) {

                    getCustomerDetials();

                    swal({
                        title: "Delete!",
                        text: "Delete Successfully!",
                        type: "success",
                        showCancelButton: false,
                        closeOnConfirm: false
                    }, function() {
                        location.href = '/customer-list';
                    });
                }, function errorCallback(response) {});
            }
        });
    };

    $scope.emailAlready = false;
    $scope.checkEmail = function() {
        var data = { email: $scope.customer.cust_email };
        $http({
            method: 'GET',
            url: '/api/checkEmail',
            params: data
        }).then(function successCallback(response) {

            if (response.data.success) {
                $scope.emailAlready = true;
            } else {
                $scope.emailAlready = false;
            }
        }, function errorCallback(response) {});
    };

    $scope.phoneAlready = false;
    $scope.checkPhone = function() {
        var data = { phone: $scope.customer.cust_number };
        $http({
            method: 'GET',
            url: '/api/checkPhone',
            params: data
        }).then(function successCallback(response) {

            if (response.data.success) {
                $scope.phoneAlready = true;
            } else {
                $scope.phoneAlready = false;
            }
        }, function errorCallback(response) {});
    };

    $scope.newCustomerDetialsPageChange = function(newPage, customer) 
    {
        newCustomerDetials(newPage, customer);
    }

    function newCustomerDetials(pageNumber, customer = '')
    {
        if(angular.isUndefined($scope.maalgaadi_city_id)){
            return false;
        }
        customer.city_id = $scope.maalgaadi_city_id;
        var data = { startDate: customer.start, endDate: customer.end, city_id : customer.city_id, page : pageNumber, entries : customer.entries};
        $scope.onSubmitLoader = true;
        $scope.onSubmitResult = false;
        var newCustomerDetials = CustomerServices.newCustomerDetials(data);
        newCustomerDetials.then(function successCallback(response) {
            $scope.onSubmitLoader = false;
            $scope.onSubmitResult = true;
            $scope.newCustomer = response.data.data;
            $scope.totalItems = response.data.total;
            $scope.currentPage = response.data.current_page;
            $scope.perPage = response.data.per_page;
            if (pageNumber == 1) {
                setTimeout(function() {
                    $scope.currentPage = 1;
                    var previousActive = $('dir-pagination-controls ul li.active').find('a').text();
                    if (Number(previousActive) > 1) {
                        $('dir-pagination-controls ul li:nth-child(2)').find('a').click();
                    }
                }, 400);

            }
        }, function errorCallback(response) {});
    };

    $scope.exportNewCustomers = function(customer) {
        if(angular.isUndefined($scope.maalgaadi_city_id)){
            return false;
        }
        if ($scope.maalgaadi_city_id != undefined) 
        {
            window.location ='/api/getNewlyAddedCustomer?startDate='+customer.start+'&endDate='+customer.end +'&export=export'+'&city_id='+$scope.maalgaadi_city_id;
        } 
        else
        {
            window.location ='/api/getNewlyAddedCustomer?startDate='+customer.start+'&endDate='+customer.end +'&export=export';
        }     
    };
  
    $scope.getGoods = function() {
        $http({
            method: 'GET',
            url: '/api/getGoods',
        }).then(function successCallback(response) {
            $scope.goodsDetials = response.data;
        }, function errorCallback(response) {});
    };

    $scope.getCustomerSetting = function(){
        var data = {id: $stateParams.customerId}
        var customerSettingDetail = CustomerServices.getCustomerSetting(data);
        customerSettingDetail.then(function successCallback(response) {
            var customerDetials = '';
            console.log(response);
            if(response.data.success && response.data.success.result){
                customerDetials = response.data.success.result;
            }
            console.log(customerDetials,'getCustomerSetting');
            if(customerDetials == ''){
                $scope.customer.customer_id = '';
                $scope.customer.customer_id = $stateParams.customerId;
            }else{
                $scope.customer = customerDetials;
                if( $scope.customer){
                    $scope.customer.type_of_goods = { 'id':$scope.customer.type_of_good}
                }
            }
        }, function errorCallback(response) {});
        $scope.customer.loadingSms = '1';
    }

    $scope.addCustomerSetting = function(customer){
        customer.msg_on_reaching_pickup_point = $('input[name=msg_on_reaching_pickup_point]:checked').length;
        customer.msg_on_reaching_destination = $('input[name=msg_on_reaching_destination]:checked').length;
        customer.msg_on_billing = $('input[name=msg_on_billing]:checked').length;
        customer.msg_on_vehicle_allotment = $('input[name=msg_on_vehicle_allotment]:checked').length;
        customer.msg_on_invoice = $('input[name=msg_on_invoice]:checked').length;
        customer.msg_on_pod = $('input[name=msg_on_pod]:checked').length;

        customer.noti_on_vehicle_allotment = $('input[name=noti_on_vehicle_allotment]:checked').length;
        customer.noti_on_reaching_pickup_point = $('input[name=noti_on_reaching_pickup_point]:checked').length;
        customer.noti_on_reaching_destination = $('input[name=noti_on_reaching_destination]:checked').length;
        customer.noti_on_billing = $('input[name=noti_on_billing]:checked').length;
        customer.noti_on_invoice = $('input[name=noti_on_invoice]:checked').length;
        customer.noti_on_pod = $('input[name=noti_on_pod]:checked').length;

        customer.all_sms = '0';
        if(customer.msg_on_reaching_pickup_point == '1' && customer.msg_on_reaching_destination == '1' && customer.msg_on_billing == '1' && customer.msg_on_vehicle_allotment == '1'){
            customer.all_sms = '1';
        }
        customer.all_notification = '0';
        if(customer.noti_on_vehicle_allotment == '1' && customer.noti_on_reaching_pickup_point == '1' && customer.noti_on_reaching_destination == '1' && customer.noti_on_billing == '1'){
            customer.all_notification = '1';
        }
        if(angular.isDefined(customer.type_of_goods)){
            customer.type_of_good = customer.type_of_goods.id;
        }
        var customerSettingResult = CustomerServices.addCustomerSetting(customer);
        customerSettingResult.then(function successCallback(response) {
            console.log(response);
            if(response.data.success){
                swal(response.data.success.message);
            }else{
                swal(response.data.error.message);
            }
        }, function errorCallback(response) {});
    }

    $scope.status = function(customerid, status){
        $scope.customerId = customerid;
        $scope.activeInactiveStatus = status;

    }

    // $scope.changeCustomerStatus = function(id,status) {
    //     var data = {id: id, status : status};
    //     SweetAlert.swal({
    //         title: "Are you sure?",
    //         text: "You want to "+status+" this customer!",
    //         type: "warning",
    //         showCancelButton: true,
    //         confirmButtonColor: "#DD6B55",
    //         confirmButtonText: "Yes",
    //         closeOnConfirm: false
    //     }, function(isConfirm) {
    //         if (isConfirm) {
    //             $http({
    //                 method: 'POST',
    //                 url: '/api/changeCustomerStatus',
    //                 params : data
    //             }).then(function successCallback(response) {
    //                 getCustomerDetials();
    //                 swal({
    //                     title: "Success",
    //                     text: "Changed Successfully!",
    //                     type: "success",
    //                     showCancelButton: false,
    //                     closeOnConfirm: false
    //                  }, function() {
    //                     location.href = '/customer-list';
    //                 });
    //             }, function errorCallback(response) {});
    //         }
    //     });
    // };
    $scope.changeCustomerStatus = function(id,status, activeInactive) {
        console.log(activeInactive)

        if (activeInactive.reason == "" || activeInactive.reason == undefined) 
        {
            return false;
        }

        if (angular.isDefined(activeInactive.resume_date)) 
        {
            var data = {id: id, status : status, reason : activeInactive.reason, resume_date : activeInactive.resume_date};
        }
        else
        {
            var data = {id: id, status : status, reason : activeInactive.reason};
        }

        $http({
            method: 'POST',
            url: '/api/changeCustomerStatus',
            params : data
        }).then(function successCallback(response) {
            getCustomerDetials();
            swal({
                title: "Success",
                text: "Changed Successfully!",
                type: "success",
                showCancelButton: false,
                closeOnConfirm: false
             }, function() {
                location.href = '/customer-list';
            });
        }, function errorCallback(response) {});

    };

    $scope.getCustomerClusterPageChange = function(newPage, customer) 
    {   
        console.log(newPage, customer)
        getCustomerCluster(newPage, customer);
    }

    function getCustomerCluster(pageNumber, customer = ''){ 
        if(angular.isUndefined($scope.maalgaadi_city_id)){
            return false;
        }
        customer.city_id = $scope.maalgaadi_city_id;
        var data = { startDate: customer.startDate, endDate: customer.endDate, city_id : customer.city_id, page : pageNumber, entries : customer.entries};
        $scope.onSubmitLoader = true;
        $scope.onSubmitResult = false;
        var getCustomerCluster = CommonService.getDetails(data,'getCustomerCluster');
        getCustomerCluster.then(function successCallback(response) {
        
            $scope.customerClusterDetials = response.data;
            $scope.onSubmitResult = true;
            $scope.onSubmitLoader = false;
            $scope.totalItems = response.pagination.total;
            $scope.currentPage = response.pagination.current_page;
            $scope.perPage = response.pagination.per_page;
            $scope.mypage = response.pagination.current_page;
            if ($scope.mypage == 0) {
                $scope.perpg = response.pagination.total;
            } else {

                $scope.perpg = response.pagination.per_page;
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
        }, function errorCallback(response) {});
    };

    $scope.exportCustomerCluster = function(customer){
        if(angular.isUndefined($scope.maalgaadi_city_id)){
            return false;
        }
        window.location = '/api/getCustomerCluster?export=excel&city_id='+$scope.maalgaadi_city_id+'&startDate='+customer.startDate+'&endDate='+customer.endDate;
    }
    
}]);
