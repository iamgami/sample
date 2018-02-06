app.controller('AdjustmentController', ['$scope', '$http', 'SweetAlert', 'adjusmentServices', 'reportServices', '$stateParams', '$filter', 'DriverService', 'CommonService','$location','$rootScope','$localStorage', function($scope, $http, SweetAlert, adjusmentServices, reportServices, $stateParams, $filter, DriverService, CommonService, $location, $rootScope, $localStorage) {
    //$scope.customercash.customer_id ='';
    $scope.customercash = {};
    $scope.dicountcount = {};
    $scope.BalanceReport = {};
    $scope.randomadjust = {};
    $scope.drivercashreceive = {};
    $scope.drivercashreceiveamount = {};
    $scope.driversecuritydeposit = {};
    $scope.drivercashcommission = {};
    $scope.driverpenalty = {};
    $scope.PayOffline = {};
    $scope.DriverWallet = {};
    $scope.amountDetials = {};
    $scope.billamountDetials = {};
    $scope.tollChargeDetials = {};
    $scope.drivercancellationDetials = {};
    $scope.driverwaitingDetials = {};
    $scope.viewofflinetripreport = {};
    $scope.swepcharges = {};
    $scope.pagination = {};
    $scope.totalItems = 0;
    $scope.customer = {};
    $scope.currentPage = 0;
    $scope.showLoader = false;
    $scope.searchdata = {};
    $scope.type = 10;
    /*$scope.creditWallet = 0;
    $scope.debitWallet = 0;
    */

    $rootScope.changeMaalgaadiCity = function(){
        $scope.maalgaadi_city_id = $rootScope.default_city_id;
        $localStorage.defaultCityId = $rootScope.default_city_id;
    } 

    $scope.searchRecordBookingList = function() {
        var $rows = $('#data-list tbody tr');
        $('#search_record').keyup(function() {
            var val = $.trim($(this).val()).replace(/ +/g, ' ').toLowerCase();

            $rows.show().filter(function() {
                var text = $(this).text().replace(/\s+/g, ' ').toLowerCase();
                return !~text.indexOf(val);
            }).hide();
        });
    };
    $scope.getDriverListAutocomplete = function() {
        $scope.type = 10;
        var dataResponse = DriverService.getDriverListAutocomplete();
        dataResponse.then(function successCallback(response) {
            $scope.driver_name = response.data.driverNames;
            $scope.driver_number = response.data.driverNumbers;
            $scope.driver_address = response.data.driverAddresses;
            $scope.driver_mgId = response.data.driverMgIds;
            $("#driver_name").autocomplete({ source: $scope.driver_name });
            $("#driver_number").autocomplete({ source: $scope.driver_number });
            $("#driver_address").autocomplete({ source: $scope.driver_address });
            $("#driver_mgId").autocomplete({ source: $scope.driver_mgId });
        }, function errorCallback(response) {});

    };
    $scope.exportCorporatePayments = function(search) {
        var city_id = '';
        var mgid = '';
        if(angular.isDefined(search.driver_mgId)){
            mgid = search.driver_mgId;
        }
        if(angular.isDefined(search.city_id)){
            city_id = search.city_id;
        }
        window.location = "/api/searchPaymentDetails?start=" + search.startdate + "&end=" + search.endate + "&export=export&mgid=" + mgid + "&city_id="+ city_id;
    };
    $scope.getCorporatePayments = function(search, pagenum, requestType) {
        var city_id = '';
        var mgid = '';
        if(angular.isDefined(search.driver_mgId)){
            mgid = search.driver_mgId;
        }
        if(angular.isDefined(search.city_id)){
            city_id = search.city_id;
        }
        $scope.onsubmitbookingReportDataShow = true;
        var type = $scope.searchBooking.type;
        var data = { mgid: mgid, start: search.startdate, end: search.endate, page: pagenum, type: type ,city_id: city_id};
       
        var getData = CommonService.getDetails(data,'searchPaymentDetails');
        getData.then(function successCallback(response) {
            $scope.corporatedata = response.data;
            $scope.totalPaidAmount = response.total_paid_amount;
            $scope.totalBalance = response.total_balance;
            $scope.totalItems = response.pagination.total;
            $scope.currentPage = response.pagination.current_page;
            $scope.perPage = response.pagination.per_page;
            $scope.mypage = response.pagination.current_page;
            if ($scope.mypage == 0) {
                $scope.perpg = response.pagination.total;
            } else {

                $scope.perpg = response.pagination.per_page;
            }


            if (requestType == 1) {
                setTimeout(function() {
                    $scope.currentPage = 1;
                    var previousActive = $('dir-pagination-controls ul li.active').find('a').text();
                    if (Number(previousActive) > 1) {
                        $('dir-pagination-controls ul li:nth-child(2)').find('a').click();
                    }
                }, 400);

            }
            $scope.data = {};
        });
    };





    $scope.getAmountReceived = function() {

        var bookingId = $scope.bookingid;
        var amountReceiveResult = adjusmentServices.getAmountReceived(bookingId);
        amountReceiveResult.then(function(response) {
            console.log(response);
            $scope.customerBookingDetails = response.data.customer_details;
            $scope.driverBookingDetails = response.data.driver_details;
        }, function(reason) {
            swal("Something went wrong");
        });
    };
    $scope.editable = function(driveramount) {
        $scope.driveramountDetials = driveramount;
    };
    $scope.addAmount = function() {
        var data = { booking_id: $scope.customerBookingDetails.booking_id, amount: $scope.amount };
        var getData = CommonService.saveAndUpdateDetails(data,'addamount');
        getData.then(function successCallback(response) {
            if (response.success) {
                SweetAlert.swal({
                    title: "success!",
                    text: response.success.message,
                    type: "success",
                    showCancelButton: false,
                    closeOnConfirm: true
                }, function() {
                    $location.path('show-adjustment');
                });

            } else {
                SweetAlert.swal({
                    title: "error!",
                    text: response.error.message,
                    type: "error",
                    showCancelButton: false,
                    closeOnConfirm: true
                }, function() {
                    $location.path('change-amount-received');
                });
            }
        });
    };

    // change bill amount
    $scope.getBillAmountReceived = function() {

        var data = { id: $scope.bookingid };
        var billAmountResult = adjusmentServices.getBillAmountReceived(data.id);
        billAmountResult.then(function(response) {
            console.log(response);
            $scope.billamountDetials = response.data;
        }, function(reason) {
            swal("Something went wrong");
        });
    };
    // $scope.editbilltable = function(driveramount) {
    //     $scope.driverbillamountDetials = driveramount;        
    // };

    $scope.customerWalletReport = function() {
        var cust_number = $stateParams.mobileNo;
        $('.knowlarity-modal').addClass('knowlarity-popup-hide');
        $('.knowlarity-overlay').removeClass('overlay-knowlarity');
        if (cust_number) {
            var data = { cust_number: cust_number };
            var customerBalanceResult = adjusmentServices.addAdjusmentCustomerAccountService(data, 'getCustomerCashRecieveDetials');
            customerBalanceResult.then(function(response) {
                $scope.CashRecieveDetials = response.data;
                $scope.customercash.customer_id = $scope.CashRecieveDetials.id;
                $scope.customercash.cust_name = $scope.CashRecieveDetials.cust_name;
                $scope.dicountcount.customer_id = $scope.CashRecieveDetials.id;
                $scope.dicountcount.cust_name = $scope.CashRecieveDetials.cust_name;
                $scope.BalanceReport.customer_id = $scope.CashRecieveDetials.id;
                $scope.BalanceReport.cust_name = $scope.CashRecieveDetials.cust_name;
                $scope.BalanceReport.cust_number = $scope.CashRecieveDetials.cust_number;
                $scope.BalanceReport.cust_email = $scope.CashRecieveDetials.cust_email;
                $scope.BalanceReport.cust_organization = $scope.CashRecieveDetials.cust_organization;
                var date = new Date();
                var currentDate = $filter('date')(date, "yyyy-MM-dd");
                var startDate = new Date(date.getTime() - 30 * 24 * 60 * 60 * 1000);
                $scope.BalanceReport.startdate = $filter('date')(startDate, "yyyy-MM-dd");
                // $scope.BalanceReport.startdate = startdate;
                $scope.BalanceReport.endate = currentDate;
                var balanceReport = $scope.BalanceReport;
                $scope.getCustomerBalanceReport(balanceReport);
            }, function(reason) {});
        }
    }

    $scope.addBillAmount = function() {


        var data = {
            booking_id: $scope.customerBookingDetails.booking_id,
            driver_amount: $scope.driver_amount,
            customer_amount: $scope.customer_amount,
        };
        var getData = CommonService.saveAndUpdateDetails(data,'addbillamount');
        getData.then(function successCallback(response) {
            if (response.success) {
                SweetAlert.swal({
                    title: "success!",
                    text: response.success.message,
                    type: "success",
                    showCancelButton: false,
                    closeOnConfirm: true
                }, function() {
                    $location.path('show-adjustment');
                });

            } else {
                SweetAlert.swal({
                    title: "error!",
                    text: response.error.message,
                    type: "error",
                    showCancelButton: false,
                    closeOnConfirm: true
                }, function() {
                    $location.path('change-bill-amount');
                });
            }
        }, function errorCallback(response) {});  
    };

    //toll charge
    $scope.getTollChargeShow = function() {

        var data = { id: $scope.bookingid };
        var tollChargeResult = adjusmentServices.getTollChargeShow(data.id);
        tollChargeResult.then(function(response) {
            $scope.tollChargeDetials = response.data;
        }, function(reason) {
            swal("Something went wrong");
        });
    };

    $scope.addTollCharge = function() {
        var data = {
            booking_id: $scope.customerBookingDetails.booking_id,
            amount: $scope.amount,
            narration: $scope.narration,
        };

        var getData = CommonService.saveAndUpdateDetails(data,'addtollcharge');
        getData.then(function successCallback(response) {
            if (response.success) {
                SweetAlert.swal({
                    title: "success!",
                    text: response.success.message,
                    type: "success",
                    showCancelButton: false,
                    closeOnConfirm: true
                }, function() {
                    $location.path('show-adjustment');
                });

            } else {
                SweetAlert.swal({
                    title: "error!",
                    text: response.error.message,
                    type: "error",
                    showCancelButton: false,
                    closeOnConfirm: true
                }, function() {
                    $location.path('toll-charge');
                });
            }
        }, function errorCallback(response) {});       
    };


    $scope.getViewAmountReceived = function(pagenum, requestType) {
        $scope.onSubmitLoader = true;
        $scope.onSubmitResult = false;
        if(angular.isUndefined($scope.maalgaadi_city_id)){
            return false;
        }
        var data = { fromdate: $scope.fromdate, todate: $scope.todate, city_id: $scope.maalgaadi_city_id,page : pagenum, paginate: $scope.type};
        var getData = CommonService.getDetails(data,'viewamount');
        getData.then(function successCallback(response) {
            $scope.onSubmitLoader = false;
            $scope.onSubmitResult = true;
            $scope.viewAmountDetialsTotalCredit = 0;
            $scope.viewAmountDetialsTotalDebit = 0;
            angular.forEach(response.data, function(value, key) {
                $scope.viewAmountDetialsTotalCredit += parseInt(value.credit);
                $scope.viewAmountDetialsTotalDebit += parseInt(value.debit);
            });
            $scope.viewAmountDetials = response.data;
            $scope.viewbillAmountDetials = response.data;

            $scope.totalItems = response.total;
            $scope.currentPage = response.current_page;
            $scope.perPage = response.per_page;
            $scope.mypage = response.current_page;
            if ($scope.mypage == 0) {
                $scope.perpg = response.total;
            } else {

                $scope.perpg = response.per_page;
            }


            if (requestType == 1) {
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

    $scope.exportAmountReceivedDetails = function(){
        window.location = '/api/viewamount?city_id='+$scope.maalgaadi_city_id+'&fromdate='+$scope.fromdate+'&todate='+ $scope.todate+'&export=excel';
    }

    $scope.exportTollCharge = function(){
        if(angular.isUndefined($scope.maalgaadi_city_id)){
            return false;
        }
        window.location = '/api/viewtollcharge?city_id='+$scope.maalgaadi_city_id+'&fromdate='+$scope.fromdate+'&todate='+ $scope.todate+'&export=excel';
    }
    //view-driver-cancellation
    $scope.getViewDriverCancellation = function(pagenum, requestType) {
        $scope.onSubmitLoader = true;
        $scope.onSubmitResult = false;
        if(angular.isUndefined($scope.maalgaadi_city_id)){
            return false;
        }
        var data = { fromdate: $scope.fromdate, todate: $scope.todate,page: pagenum, paginate: $scope.type,city_id: $scope.maalgaadi_city_id };
        var getData = CommonService.getDetails(data,'viewdrivercancellationtrip');
        getData.then(function successCallback(response) {
            $scope.onSubmitLoader = false;
            $scope.onSubmitResult = true;
            
            $scope.viewDriverCancellationCredit = 0;
            $scope.viewDriverCancellationTripAmount = 0;
            angular.forEach(response.data, function(value, key) {
                $scope.viewDriverCancellationCredit += parseInt(value.credit);
                $scope.viewDriverCancellationTripAmount += parseInt(value.trip_amount);
            });
            $scope.viewDriverCancellation = response.data;


            $scope.totalItems = response.total;
            $scope.currentPage = response.current_page;
            $scope.perPage = response.per_page;
            $scope.mypage = response.current_page;
            if ($scope.mypage == 0) {
                $scope.perpg = response.total;
            } else {

                $scope.perpg = response.per_page;
            }


            if (requestType == 1) {
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


    $scope.exportDriverCancellation = function(){
        if(angular.isUndefined($scope.maalgaadi_city_id)){
            return false;
        }
        window.location = '/api/viewdrivercancellationtrip?city_id='+$scope.maalgaadi_city_id+'&fromdate='+$scope.fromdate+'&todate='+ $scope.todate+'&export=excel';
    }
    
    $scope.getViewCustomerCancellation = function(pagenum, requestType) {
        if(angular.isUndefined($scope.maalgaadi_city_id)){
            return false;
        }
        $scope.onSubmitLoader = true;
        $scope.onSubmitResult = false;
        var data = { fromdate: $scope.fromdate, todate: $scope.todate,page: pagenum, paginate: $scope.type,city_id: $scope.maalgaadi_city_id };
        var getData = CommonService.getDetails(data,'viewCustomercancellationtrip');
        getData.then(function successCallback(response) {
            $scope.onSubmitLoader = false;
            $scope.onSubmitResult = true;
            
            $scope.viewCustomerCancellationCredit = 0;
            $scope.viewCustomerCancellationDebit = 0;
            angular.forEach(response.data, function(value, key) {
                $scope.viewCustomerCancellationCredit += parseInt(value.credit);
                $scope.viewCustomerCancellationDebit += parseInt(value.debit);
            });
            $scope.viewCustomerCancellation = response.data;


            $scope.totalItems = response.total;
            $scope.currentPage = response.current_page;
            $scope.perPage = response.per_page;
            $scope.mypage = response.current_page;
            if ($scope.mypage == 0) {
                $scope.perpg = response.total;
            } else {

                $scope.perpg = response.per_page;
            }


            if (requestType == 1) {
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

    $scope.exportViewCustomerCancellation = function(){
        if(angular.isUndefined($scope.maalgaadi_city_id)){
            return false;
        }
        window.location = '/api/viewCustomercancellationtrip?city_id='+$scope.maalgaadi_city_id+'&fromdate='+$scope.fromdate+'&todate='+ $scope.todate+'&export=excel';
    }
    //view-customer-amount-received
    $scope.getViewCustomerAmountReceived = function(pagenum, requestType) {
        if(angular.isUndefined($scope.maalgaadi_city_id)){
            return false;
        }
        $scope.onSubmitLoader = true;
        $scope.onSubmitResult = false;
        var data = { fromdate: $scope.fromdate, todate: $scope.todate,city_id: $scope.maalgaadi_city_id,page:pagenum,paginate: $scope.type };
        var getData = CommonService.getDetails(data,'viewcustomeramount');
        getData.then(function successCallback(response) {
            $scope.onSubmitLoader = false;
            $scope.onSubmitResult = true;
            
            $scope.viewCustomeAmountDetialsCredit = 0;
            $scope.viewCustomeAmountDetialsDebit = 0;
            angular.forEach(response.data, function(value, key) {
                $scope.viewCustomeAmountDetialsCredit += parseInt(value.credit);
                $scope.viewCustomeAmountDetialsDebit += parseInt(value.debit);
            });
            $scope.viewCustomeAmountDetials = response.data;

            $scope.viewbillAmountDetials = response.data;


            $scope.totalItems = response.total;
            $scope.currentPage = response.current_page;
            $scope.perPage = response.per_page;
            $scope.mypage = response.current_page;
            if ($scope.mypage == 0) {
                $scope.perpg = response.total;
            } else {

                $scope.perpg = response.per_page;
            }


            if (requestType == 1) {
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

    $scope.exportViewCustomerAmountReceived = function(){
        if(angular.isUndefined($scope.maalgaadi_city_id)){
            return false;
        }
        window.location = '/api/viewcustomeramount?city_id='+$scope.maalgaadi_city_id+'&fromdate='+$scope.fromdate+'&todate='+ $scope.todate+'&export=excel';
    }
    //View Bill Amount
    $scope.getViewbillAmountReceived = function(pagenum, requestType) {
        $scope.onSubmitLoader = true;
        $scope.onSubmitResult = false;
        if(angular.isUndefined($scope.maalgaadi_city_id)){
            return false;
        }
        var data = { fromdate: $scope.fromdate, todate: $scope.todate,city_id: $scope.maalgaadi_city_id,page:pagenum,paginate: $scope.type };
        var getData = CommonService.getDetails(data,'viewbillamount');
        getData.then(function successCallback(response) {
            $scope.onSubmitLoader = false;
            $scope.onSubmitResult = true;
            
            $scope.viewbillAmountDetialsCredit = 0;
            $scope.viewbillAmountDetialsDebit = 0;
            $scope.viewbillAmountDetialsBalance = 0;
            angular.forEach(response.data, function(value, key) {
                $scope.viewbillAmountDetialsCredit += parseInt(value.credit);
                $scope.viewbillAmountDetialsDebit += parseInt(value.debit);
                $scope.viewbillAmountDetialsBalance += parseInt(value.balance);
            });
            $scope.viewbillAmountDetials = response.data;

            $scope.viewbillAmountDetials = response.data;
            $scope.totalItems = response.total;
            $scope.currentPage = response.current_page;
            $scope.perPage = response.per_page;
            $scope.mypage = response.current_page;
            if ($scope.mypage == 0) {
                $scope.perpg = response.total;
            } else {

                $scope.perpg = response.per_page;
            }


            if (requestType == 1) {
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

    $scope.exportBillAmountReceivedDetials = function(){
        if(angular.isUndefined($scope.maalgaadi_city_id)){
            return false;
        }
        window.location = '/api/viewbillamount?city_id='+$scope.maalgaadi_city_id+'&fromdate='+$scope.fromdate+'&todate='+ $scope.todate+'&export=excel';
    }
    //customer-bill-amount
    $scope.getViewCustomerbillAmountReceived = function(pagenum, requestType) {
        if(angular.isUndefined($scope.maalgaadi_city_id)){
            return false;
        }
        $scope.onSubmitLoader = true;
        $scope.onSubmitResult = false;
        var data = { fromdate: $scope.fromdate, todate: $scope.todate,city_id: $scope.maalgaadi_city_id,page:pagenum,paginate: $scope.type };
        var getData = CommonService.getDetails(data,'viewcustomerbillamount');
        getData.then(function successCallback(response) {
            $scope.onSubmitLoader = false;
            $scope.onSubmitResult = true;
            
            $scope.viewCustomerbillAmountDetialsCredit = 0;
            $scope.viewCustomerbillAmountDetialsDebit = 0;
            angular.forEach(response.data, function(value, key) {
                $scope.viewCustomerbillAmountDetialsCredit += parseInt(value.credit);
                $scope.viewCustomerbillAmountDetialsDebit += parseInt(value.debit);
            });
            $scope.viewCustomerbillAmountDetials = response.data;


            $scope.totalItems = response.total;
            $scope.currentPage = response.current_page;
            $scope.perPage = response.per_page;
            $scope.mypage = response.current_page;
            if ($scope.mypage == 0) {
                $scope.perpg = response.total;
            } else {

                $scope.perpg = response.per_page;
            }


            if (requestType == 1) {
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

    $scope.exportViewCustomerbillAmountReceived = function(){
        if(angular.isUndefined($scope.maalgaadi_city_id)){
            return false;
        }
        window.location = '/api/viewcustomerbillamount?city_id='+$scope.maalgaadi_city_id+'&fromdate='+$scope.fromdate+'&todate='+ $scope.todate+'&export=excel';
    }

    //View Toll Charge
    $scope.getViewTollCharge = function(pagenum, requestType) {
        if(angular.isUndefined($scope.maalgaadi_city_id)){
            return false;
        }
        var data = { fromdate: $scope.fromdate, todate: $scope.todate , city_id: $scope.maalgaadi_city_id, page:pagenum, paginate : $scope.type};
        var getData = CommonService.getDetails(data,'viewtollcharge');
        getData.then(function successCallback(response) {
            $scope.onSubmitLoader = false;
            $scope.onSubmitResult = true;

             $scope.viewtollChargeDetialsCredit = 0;
            $scope.viewtollChargeDetialsDebit = 0;
            angular.forEach(response.data, function(value, key) {
                if (value.credit) {
                    $scope.viewtollChargeDetialsCredit += parseInt(value.credit);
                }
                if (value.debit) {
                    $scope.viewtollChargeDetialsDebit += parseInt(value.debit);
                }

            });
            $scope.viewtollChargeDetials = response.data;

            $scope.viewbillAmountDetials = response.data;

            $scope.totalItems = response.total;
            $scope.currentPage = response.current_page;
            $scope.perPage = response.per_page;
            $scope.mypage = response.current_page;
            if ($scope.mypage == 0) {
                $scope.perpg = response.total;
            } else {

                $scope.perpg = response.per_page;
            }


            if (requestType == 1) {
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
    //View Customer Toll Charge
    $scope.getViewCustomertollCharge = function(pagenum, requestType) {
         if(angular.isUndefined($scope.maalgaadi_city_id)){
            return false;
        }
        var data = { fromdate: $scope.fromdate, todate: $scope.todate , city_id: $scope.maalgaadi_city_id, page:pagenum, paginate : $scope.type};
        var getData = CommonService.getDetails(data,'viewcustomertollcharge');
        getData.then(function successCallback(response) {
            $scope.onSubmitLoader = false;
            $scope.onSubmitResult = true;

            $scope.viewCustomertollChargeDetialsCredit = 0;
            $scope.viewCustomertollChargeDetialsDebit = 0;
            angular.forEach(response.data, function(value, key) {
                $scope.viewCustomertollChargeDetialsCredit += parseInt(value.credit);
                if (value.debit) {
                    $scope.viewCustomertollChargeDetialsDebit += parseInt(value.debit);
                }
            });

            $scope.viewCustomertollChargeDetials = response.data;
            console.log($scope.viewCustomertollChargeDetials);
            $scope.totalItems = response.total;
            $scope.currentPage = response.current_page;
            $scope.perPage = response.per_page;
            $scope.mypage = response.current_page;
            if ($scope.mypage == 0) {
                $scope.perpg = response.total;
            } else {

                $scope.perpg = response.per_page;
            }

            if (requestType == 1) {
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

    $scope.exportViewCustomertollCharge = function(){
        if(angular.isUndefined($scope.maalgaadi_city_id)){
            return false;
        }
        window.location = '/api/viewcustomertollcharge?city_id='+$scope.maalgaadi_city_id+'&fromdate='+$scope.fromdate+'&todate='+ $scope.todate+'&export=excel';
    }

    // getdrivertripreport
    $scope.getdrivertripreport = function() {
        $scope.onsubmitReportDataShow = true;
        $scope.recordData = false;
        var data = { fromdate: $scope.fromdate, todate: $scope.todate, status: $scope.status };
        $http({
            method: 'GET',
            url: '/api/viewdrivertrip',
            params: data
        }).then(function successCallback(response) {
            $scope.onsubmitReportDataShow = false;
            $scope.recordData = true;
            $scope.viewDriverTripTotaltrip_charge = 0;
            $scope.viewDriverTripTotalLoading_charge = 0;
            $scope.viewDriverTripTotalunloading_charge = 0;
            $scope.viewDriverTripTotaldrop_points = 0;
            $scope.viewDriverTripTotaltotal_charge = 0;
            angular.forEach(response.data, function(value, key) {
                $scope.viewDriverTripTotaltrip_charge += parseInt(value.trip_charge);
                $scope.viewDriverTripTotalLoading_charge += parseInt(value.loading_charge);
                $scope.viewDriverTripTotalunloading_charge += parseInt(value.unloading_charge);
                $scope.viewDriverTripTotaldrop_points += parseInt(value.drop_points);
                $scope.viewDriverTripTotaltotal_charge += parseInt(value.total_charge);
            });
            $scope.viewDriverTripDetials = response.data;
            var loadingFinal = 0;
            var loadingTotal = 0;
            var tripTotal = 0;
            var tripFinal = 0;
            var unloadingTotal = 0;
            var unloadingFinal = 0;
            var dropTotal = 0;
            var dropFinal = 0;
            var total = 0;

            for (var i = 0; i < response.data.length; i++) {
                if (angular.isDefined(response.data[i].trip_charge)) {
                    tripTotal = response.data[i].trip_charge;
                    tripFinal = tripFinal + tripTotal;
                }
                if (angular.isDefined(response.data[i].loading_charge)) {
                    loadingTotal = response.data[i].loading_charge;
                    loadingFinal = loadingFinal + loadingTotal;
                }
                if (angular.isDefined(response.data[i].unloading_charge)) {
                    unloadingTotal = response.data[i].unloading_charge;
                    unloadingFinal = unloadingFinal + unloadingTotal;
                }
                if (angular.isDefined(response.data[i].drop_points)) {
                    dropTotal = response.data[i].drop_points;
                    dropFinal = dropFinal + dropTotal;
                }
                total = total + loadingFinal + tripFinal + unloadingFinal + dropFinal;
            }
            $scope.totalAmount = total;
            $scope.loadingFinal = loadingFinal;
            $scope.tripFinal = tripFinal;
            $scope.unloadingFinal = unloadingFinal;
            $scope.dropFinal = dropFinal;

        }, function errorCallback(response) {});
    };

    // show table structure on pageload
    $scope.showTableStructure = function() {
            $scope.onsubmitReportDataShow = false;
            $scope.recordData = true;
        }
        //Add Customer Cash     
    $scope.addCustomerCash = function(customercash) {
        $scope.submitdisable = true;
        var data = { customer_id: $scope.customercash.customer_id, cust_organization: $scope.customercash.cust_organization, cust_name: $scope.customercash.cust_name, cust_amount: $scope.customercash.cust_amount, cust_narration: $scope.customercash.cust_narration };
        var getData = CommonService.saveAndUpdateDetails(data,'addcustomercashamount');
        getData.then(function successCallback(response) {
            if (response.success) {
                SweetAlert.swal({
                    title: "success!",
                    text: response.success.message,
                    type: "success",
                    showCancelButton: false,
                    closeOnConfirm: true
                }, function() {
                    $location.path('show-adjustment');
                });

            } else {
                $scope.submitdisable = false;
                SweetAlert.swal({
                    title: "error!",
                    text: response.error.message,
                    type: "error",
                    showCancelButton: false,
                    closeOnConfirm: true
                }, function() {
                    $location.path('add-customer-cash-recieve');
                });
            }
        }, function errorCallback(response) {});
    };

    //customer-wallet-report
    $scope.getCustomerBalanceReport = function(BalanceReport) {
        var data = { customer_id: $scope.BalanceReport.customer_id, cust_city: $scope.BalanceReport.cust_city, cust_name: $scope.BalanceReport.cust_name, cust_business_product: $scope.BalanceReport.cust_organization, startdate: $scope.BalanceReport.startdate, endate: $scope.BalanceReport.endate};
        var customerBalanceResult = adjusmentServices.addAdjusmentCustomerAccountService(data, 'customerbalancereport');
        customerBalanceResult.then(function(response) {
            $scope.debitWallet = 0;
            $scope.creditWallet = 0;
            angular.forEach(response.data, function(value, key) {
                if (!isNaN(value.credit)) {
                    $scope.creditWallet += parseInt(value.credit);
                }
                if (!isNaN(value.debit)) {
                    $scope.debitWallet += parseInt(value.debit);
                }
            });
            $scope.viewCustomerBalanceReportDetials = response.data;
        }, function(reason) {
            swal("Something went wrong");
        });
    };
    $scope.getCustomerAdjustmenReport = function(BalanceReport) {
        var data = { customer_id: $scope.BalanceReport.customer_id, cust_city: $scope.BalanceReport.cust_city, cust_name: $scope.BalanceReport.cust_name, cust_business_product: $scope.BalanceReport.cust_organization, startdate: $scope.BalanceReport.startdate, endate: $scope.BalanceReport.endate };            
        $http({
            method: 'GET',
            url: '/api/customerAdjustment',
            params: data
        }).then(function successCallback(response) {
            if(response.data.length==0){
                swal("Records Not Found ");
            }
            $scope.viewCustomerBalanceReportDetials = response.data;
        }, function errorCallback(response) {});
    };
    $scope.exportCustomerAdjustmenReport = function(BalanceReport) {
        // var data = {  , startdate: $scope.BalanceReport.startdate, endate: $scope.BalanceReport.endate };            
        if(angular.isDefined(BalanceReport)){
            var customerId = '';
            var customerCity = '';
            var customerName = '';
            var customerOrganization = '';
            var startDate = '';
            var endDate = '';
            if(angular.isDefined($scope.BalanceReport.customer_id)){
                customerId = $scope.BalanceReport.customer_id;
            }
            if(angular.isDefined($scope.BalanceReport.cust_city)){
                customerCity = $scope.BalanceReport.cust_city;
            }
            if(angular.isDefined($scope.BalanceReport.cust_name)){
                customerName = $scope.BalanceReport.cust_name;
            }
            if(angular.isDefined($scope.BalanceReport.cust_organization)){
                customerOrganization = $scope.BalanceReport.cust_organization;
            }
            if(angular.isDefined($scope.BalanceReport.startdate) && angular.isDefined($scope.BalanceReport.endate)){
                startDate = $scope.BalanceReport.startdate;
                endDate = $scope.BalanceReport.endate;
                window.location = '/api/customerAdjustment?export=excel&customer_id='+customerId+'&cust_city='+customerCity+'&cust_name='+customerName+'&cust_business_product='+customerOrganization+'&startdate='+startDate+'&endate='+endDate;       
            }else{
                swal('Please Select required fileds!');
            }
            
        }
        
    };
    //customer-wallet-report
    $scope.getCustomerBalanceMailReport = function(BalanceReport) {

        var data = { cust_email: $scope.BalanceReport.cust_email, cust_name: $scope.BalanceReport.cust_name, customer_id: $scope.BalanceReport.customer_id, cust_business_product: $scope.BalanceReport.cust_organization, startdate: $scope.BalanceReport.startdate, endate: $scope.BalanceReport.endate };

        $http({
            method: 'GET',
            url: '/api/customerbalancemailreport',
            params: data
        }).then(function successCallback(response) {

            //$scope.viewCustomerBalanceReportDetials = response.data;
        }, function errorCallback(response) {});
    };

    //view Customer cash

    $scope.exportgetViewCustomerCash = function(search) {
        window.location.href = '/api/cashreceive?city_id='+search.city_id+'&export=excel&fromdate='+search.fromdate+'&todate='+search.todate;
    };

    $scope.getViewCustomerCashPageChange = function(newPage, search) {
        getViewCustomerCash(newPage, search);
    };
    
    function getViewCustomerCash(pagenum, search = '') {
        var data = { fromdate: search.fromdate, todate: search.todate, city_id : search.city_id, page : pagenum, entries : search.entries};

        var customerCashReceviedResult = adjusmentServices.getCustomerCashReceived(data);
        customerCashReceviedResult.then(function(response) {
            $scope.viewcustomercashreceiveCredit = 0;
            $scope.viewcustomercashreceiveDebit = 0;
            angular.forEach(response.data.data, function(value, key) {
                $scope.viewcustomercashreceiveCredit += parseInt(value.credit);
                $scope.viewcustomercashreceiveDebit += parseInt(value.debit);
            });
            $scope.viewcustomercashreceive = response.data.data;
            $scope.totalItems = response.data.total;
            $scope.currentPage = response.data.current_page;
            $scope.perPage = response.data.per_page;
            $scope.mypage = response.data.current_page;
            if ($scope.mypage == 0) {
                $scope.perpg = response.data.total;
            } else {

               $scope.perpg = response.data.per_page;
            }
            if (pagenum == 1) {
                setTimeout(function() {
                    $scope.currentPage = 1;
                    var previousActive = $('dir-pagination-controls ul li.active').find('a').text();
                    if (Number(previousActive) > 1) {
                        $('dir-pagination-controls ul li:nth-child(2)').find('a').click();
                    }
                }, 400);
            }

        }, function(reason) {
            swal("Something went wrong");
        });
    };



    //Add Discount Amount     
    $scope.addDiscountAmount = function(dicountcount) {
        var data = { customer_id: $scope.dicountcount.customer_id, dicountcount: $scope.dicountcount.cust_organization, cust_name: $scope.dicountcount.cust_name, cust_amount: $scope.dicountcount.cust_amount, cust_narration: $scope.dicountcount.cust_narration };
        $scope.submitdisable = true;
        var getData = CommonService.saveAndUpdateDetails(data,'addcustomerdiscountamount');
        getData.then(function successCallback(response) {
            if (response.success) {
                SweetAlert.swal({
                    title: "success!",
                    text: response.success.message,
                    type: "success",
                    showCancelButton: false,
                    closeOnConfirm: true
                }, function() {
                    $location.path('show-adjustment');
                });

            } else {
                $scope.submitdisable = false;
                SweetAlert.swal({
                    title: "error!",
                    text: response.error.message,
                    type: "error",
                    showCancelButton: false,
                    closeOnConfirm: true
                }, function() {
                    $location.path('add-discount-amount');
                });
            }
        }, function errorCallback(response) {});
       
    };

    //view Discount cash

    $scope.exportViewDiscountCash= function(search) {

        window.location.href = '/api/discountcash?city_id='+search.city_id+'&export=excel&fromdate='+search.fromdate+'&todate='+search.todate;
    };

    $scope.getViewDiscountCashPageChange = function(newPage, search) {
        getViewDiscountCash(newPage, search);
    };

    function getViewDiscountCash(pageNumber, search = '') {

        var data = { fromdate: search.fromdate, todate: search.todate, page : pageNumber, entries : search.entries, city_id : search.city_id};
        var discountCashResult = adjusmentServices.getDiscountCashDetail(data);
        discountCashResult.then(function(response) {
            console.log(response, "res")
            $scope.viewdiscountcashCredit = 0;
            $scope.viewdiscountcashDebit = 0;
            angular.forEach(response.data.data, function(value, key) {
                $scope.viewdiscountcashCredit += parseInt(value.credit);
                $scope.viewdiscountcashDebit += parseInt(value.debit);
            });
            $scope.viewdiscountcash = response.data.data;
            $scope.totalItems = response.data.total;
            $scope.currentPage = response.data.current_page;
            $scope.perPage = response.data.per_page;
            $scope.mypage = response.data.current_page;
            if ($scope.mypage == 0) {
                $scope.perpg = response.data.total;
            } else {

               $scope.perpg = response.data.per_page;
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
            
        }, function(reason) {
            swal("Something went wrong");
        });
    };

    // View Revenue Report
    $scope.showTableFlag = true;
    $scope.getRevenueReportPageChange = function(newPage, search) {
        getViewrevenue(newPage, search);
    };

    function getViewrevenue (pagenum, search = '') {
        
        if(angular.isUndefined($scope.maalgaadi_city_id)){
            return false;
        }
        search.city_id = $scope.maalgaadi_city_id;

        var data = { page: pagenum, fromdate: search.fromdate, todate: search.todate, city_id : search.city_id, entries : search.entries};
        console.log(data)
        $scope.showTableFlag = false;

        var revenueReportResult = adjusmentServices.addAdjusmentCustomerAccountService(data, 'revenuereport');
        revenueReportResult.then(function(response) {
            console.log(response, "data")
            $scope.showTableFlag = true;
            $scope.viewRevenueReportTripCharge = 0;
            $scope.viewRevenueReportLoading = 0;
            $scope.viewRevenueReportUnloading = 0;
            $scope.viewRevenueReportDropPoint = 0;
            $scope.viewRevenueReportDiscount = 0;
            $scope.viewRevenueReportWaitingCharge = 0;
            $scope.viewRevenueReportCredit = 0;
            $scope.viewRevenueReportFinal = 0;
            $scope.viewRevenueReportSurgeAmount = 0;
            $scope.viewRevenueReportPOD = 0;
            $scope.viewRevenueReportTip = 0;
            angular.forEach(response.data.data, function(value, key) {
                $scope.viewRevenueReportTripCharge += parseInt(value.trip_charge);
                $scope.viewRevenueReportLoading += parseInt(value.loading_charge);
                $scope.viewRevenueReportUnloading += parseInt(value.unloading_charge);
                $scope.viewRevenueReportPOD += parseInt(value.pod_charge);
                $scope.viewRevenueReportDiscount += parseInt(value.discount_amount);
                $scope.viewRevenueReportDropPoint += parseInt(value.drop_points);
                $scope.viewRevenueReportWaitingCharge += parseInt(value.waiting_charge);
                $scope.viewRevenueReportSurgeAmount += parseInt(value.surge_amount);
                $scope.viewRevenueReportCredit += parseInt(value.credit);
                $scope.viewRevenueReportFinal += parseInt(value.final_balance);
                $scope.viewRevenueReportTip += parseInt(value.tip_charge);
            });
            $scope.viewrevenuereport = response.data.data;
            $scope.totalItems = response.data.pagination.total;
            $scope.currentPage = response.data.pagination.current_page;
            $scope.perPage = response.data.pagination.per_page;
            $scope.mypage = response.data.pagination.current_page;
            if ($scope.mypage == 0) {
                $scope.perpg = response.data.pagination.total;
            } else {

               $scope.perpg = response.data.pagination.per_page;
            }
            if (pagenum == 1) {
                setTimeout(function() {
                    $scope.currentPage = 1;
                    var previousActive = $('dir-pagination-controls ul li.active').find('a').text();
                    if (Number(previousActive) > 1) {
                        $('dir-pagination-controls ul li:nth-child(2)').find('a').click();
                    }
                }, 400);
            }

        }, function(reason) {
            swal("Something went wrong");
        });
    };

    $scope.searchRevenueRecord = function() {
        var $rows = $('#revenue-report tbody tr');
        $('#search_record').keyup(function() {
            var val = $.trim($(this).val()).replace(/ +/g, ' ').toLowerCase();

            $rows.show().filter(function() {
                var text = $(this).text().replace(/\s+/g, ' ').toLowerCase();
                return !~text.indexOf(val);
            }).hide();
        });
    };

    $scope.exportRevenueReport = function(search) 
    {
        window.location = '/api/revenuereport?fromdate=' + search.fromdate + '&todate=' + search.todate + '&export=excel'+ '&city_id='+$scope.maalgaadi_city_id;
    }
        // pay-offline
    $scope.getOfflineline = function() {

        var data = { bookingid: $scope.bookingid };
        var result = adjusmentServices.adjusmentDriverAccountService(data, 'offlinetrip');
        result.then(function(response) {
            $scope.viewofflinetripreport = response.data;
        }, function(reason) {
            swal("Something went wrong");
        });

    };
    $scope.getOfflinevehcile = function(PayOffline) {
        var offline_trip_charge = $scope.viewofflinetripreport[0].trip_charge;
        var offline_credit = $scope.viewofflinetripreport[0].credit;

        var data = { vehicle_reg_no: $scope.PayOffline.vehicle_reg_no, trip_charge: $scope.viewofflinetripreport[0].trip_charge, bookingid: $scope.bookingid, credit: $scope.viewofflinetripreport[0].credit };

        $http({
            method: 'GET',
            url: '/api/offlinetripvehicle',
            params: data
        }).then(function successCallback(response) {
            $scope.viewofflinetripreport = response.data;
        }, function errorCallback(response) {});
    };
    //Random Adjust

    $scope.addRandomAdjust = function(randomadjust) {
        var data = { vehicle_reg_no: $scope.randomadjust.vehicle_reg_no, trip_amount: $scope.randomadjust.trip_amount, payment: $scope.randomadjust.payment, driver_narration: $scope.randomadjust.driver_narration };
        $scope.submitdisable = true;
        var getData = CommonService.saveAndUpdateDetails(data,'addrandomadjust');
        getData.then(function successCallback(response) {
            if (response.success) {
                SweetAlert.swal({
                    title: "success!",
                    text: response.success.message,
                    type: "success",
                    showCancelButton: false,
                    closeOnConfirm: true
                }, function() {
                    $location.path('show-adjustment');
                });

            } else {
                $scope.submitdisable = false;
                SweetAlert.swal({
                    title: "error!",
                    text: response.error.message,
                    type: "error",
                    showCancelButton: false,
                    closeOnConfirm: true
                }, function() {
                    $location.path('random');
                });
            }
        }, function errorCallback(response) {});
    };

    //view Random 

    $scope.exportViewRandom = function(search) 
    {
        window.location = '/api/driverramdom?fromdate=' + search.fromdate + '&todate=' + search.todate + '&export=excel&city_id='+search.city_id;
    }

    $scope.getViewRandomPageChange = function(newPage, search) {
        getViewRandom(newPage, search);
    };

    function getViewRandom (pagenum, search = '') {

        var data = { fromdate: search.fromdate, todate: search.todate, page : pagenum, entries : search.entries, city_id : search.city_id };
        console.log(data, "data")
        $http({
            method: 'GET',
            url: '/api/driverramdom',
            params: data
        }).then(function successCallback(response) {
            console.log(response)
            $scope.viewDiscountCashTotalCredit = 0;
            $scope.viewDiscountCashTotalDebit = 0;
            angular.forEach(response.data.data, function(value, key) {
                $scope.viewDiscountCashTotalCredit += parseInt(value.credit);
                $scope.viewDiscountCashTotalDebit += parseInt(value.debit);
            });
            $scope.viewdiscountcash = response.data.data;
            $scope.totalItems = response.data.total;
            $scope.currentPage = response.data.current_page;
            $scope.perPage = response.data.per_page;
            $scope.mypage = response.data.current_page;
            if ($scope.mypage == 0) {
                $scope.perpg = response.data.total;
            } else {

               $scope.perpg = response.data.per_page;
            }
            if (pagenum == 1) {
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

    //Add Driver Cash Paid

    $scope.addDriverCash = function(drivercashreceive) {
        $scope.submitdisable = true;
        var data = { vehicle_reg_no: $scope.drivercashreceive.vehicle_reg_no, trip_amount: $scope.drivercashreceive.trip_amount, driver_narration: $scope.drivercashreceive.driver_narration };
        var addDriverCashResult = adjusmentServices.adjusmentDriverAccountService(data, 'adddrivercashreceive');
        addDriverCashResult.then(function(response) {
            if (response.data.success) {
                swal({
                    title: "success!",
                    text: response.data.success.message,
                    type: "success",
                    showCancelButton: false,
                    closeOnConfirm: false
                }, function() {
                    location.href = '/show-adjustment';
                });

            } else {
                $scope.submitdisable = false;
                swal({
                    title: "error!",
                    text: response.data.error.message,
                    type: "error",
                    showCancelButton: false,
                    closeOnConfirm: false
                }, function() {
                    location.href = '/add-driver-cash-receive';
                });
            }
        }, function(reason) {
            swal("Something went wrong");
        });

    };

    //View Driver Cash  
     $scope.exportViewDriverPaid = function(search) 
    {
        window.location = '/api/drivercashpaid?fromdate=' + search.fromdate + '&todate=' + search.todate + '&export=excel&city_id='+search.city_id;
    }

    $scope.getViewDriverPaidPageChange = function(newPage, search) {
        getViewDriverPaid(newPage, search);
    };

    function getViewDriverPaid (pagenum, search = '') {

        var data = { fromdate: search.fromdate, todate: search.todate, page : pagenum, entries : search.entries, city_id : search.city_id };

        $http({
            method: 'GET',
            url: '/api/drivercashpaid',
            params: data
        }).then(function successCallback(response) {
            $scope.viewDriverCashPaidTotalCredit = 0;
            $scope.viewDriverCashPaidTotalDebit = 0;
            angular.forEach(response.data.data, function(value, key) {
                $scope.viewDriverCashPaidTotalCredit += parseInt(value.credit);
                $scope.viewDriverCashPaidTotalDebit += parseInt(value.debit);
            });
            $scope.viewdrivercashpaid = response.data.data;
            $scope.totalItems = response.data.total;
            $scope.currentPage = response.data.current_page;
            $scope.perPage = response.data.per_page;
            $scope.mypage = response.data.current_page;
            if ($scope.mypage == 0) {
                $scope.perpg = response.data.total;
            } else {

               $scope.perpg = response.data.per_page;
            }
            if (pagenum == 1) {
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

    //Add Driver Cash Paid

    $scope.adddrivercashreceiveamount = function(drivercashreceiveamount) {
        $scope.submitdisable = true;
        var data = { vehicle_reg_no: $scope.drivercashreceiveamount.vehicle_reg_no, trip_amount: $scope.drivercashreceiveamount.trip_amount, driver_narration: $scope.drivercashreceiveamount.driver_narration };
        var amountReceiveResult = adjusmentServices.adjusmentDriverAccountService(data, 'adddrivercashreceiveamount');
        amountReceiveResult.then(function(response) {
            if (response.data.success) {
                swal({
                    title: "success!",
                    text: response.data.success.message,
                    type: "success",
                    showCancelButton: false,
                    closeOnConfirm: false
                }, function() {
                    location.href = '/show-adjustment';
                });

            } else {
                $scope.submitdisable = false;
                swal({
                    title: "error!",
                    text: response.data.error.message,
                    type: "error",
                    showCancelButton: false,
                    closeOnConfirm: false
                }, function() {
                    location.href = '/driver-cash-receive';
                });
            }
        }, function(reason) {
            swal("Something went wrong");
        });
    };

    //view-cash-paid
    $scope.getViewDriverNewPaid = function() {

        var data = { fromdate: $scope.fromdate, todate: $scope.todate };

        $http({
            method: 'GET',
            url: '/api/drivercashnewpaid',
            params: data
        }).then(function successCallback(response) {
            $scope.viewDriverCashNewPaidTotalCredit = 0;
            $scope.viewDriverCashNewPaidTotalDebit = 0;
            angular.forEach(response.data, function(value, key) {
                $scope.viewDriverCashNewPaidTotalCredit += parseInt(value.credit);
                $scope.viewDriverCashNewPaidTotalDebit += parseInt(value.debit);
            });
            $scope.viewdrivercashnewpaid = response.data;
            var table = $('#datatable-buttons').DataTable();
            table.destroy();
            setTimeout(function() {
                $('#datatable-buttons').DataTable({
                    dom: 'lBfrtip',
                    buttons: [
                        'copy', 'csv', 'excel', 'pdf', 'print'
                    ],
                    "lengthMenu": [
                        [-1],
                        ["All"]
                    ],
                    "bLengthChange": false
                });
            }, 200);
        }, function errorCallback(response) {});
    };

    //commission
    $scope.adddrivercashcommission = function(drivercashcommission) {
        $scope.submitdisable = true;
        var data = { vehicle_reg_no: $scope.drivercashcommission.vehicle_reg_no, trip_amount: $scope.drivercashcommission.trip_amount, driver_narration: $scope.drivercashcommission.driver_narration };
        var result = adjusmentServices.adjusmentDriverAccountService(data, 'adddrivercommission');
        result.then(function(response) {
            if (response.data.success) {
                swal({
                    title: "success!",
                    text: response.data.success.message,
                    type: "success",
                    showCancelButton: false,
                    closeOnConfirm: false
                }, function() {
                    location.href = '/show-adjustment';
                });

            } else {
                $scope.submitdisable = false;
                swal({
                    title: "error!",
                    text: response.data.error.message,
                    type: "error",
                    showCancelButton: false,
                    closeOnConfirm: false
                }, function() {
                    location.href = '/commission';
                });
            }
        }, function(reason) {
            swal("Something went wrong");
        });
    };

    
    $scope.getViewCommission = function() {

        var data = { fromdate: $scope.fromdate, todate: $scope.todate };
        var result = adjusmentServices.adjusmentDriverAccountService(data, 'viewdrivercommission');
        result.then(function(response) {
            $scope.viewDriverCommissionTotalCredit = 0;
            $scope.viewDriverCommissionTotalDebit = 0;
            $scope.driverCommissionFinalBalance = 0;
            angular.forEach(response.data, function(value, key) {
                $scope.viewDriverCommissionTotalCredit += parseInt(value.credit);
                $scope.viewDriverCommissionTotalDebit += parseInt(value.debit);
                $scope.driverCommissionFinalBalance += parseInt(value.balance);
            });
            $scope.viewdrivercommission = response.data;
            var table = $('#datatable-buttons').DataTable();
            table.destroy();
            setTimeout(function() {
                $('#datatable-buttons').DataTable({
                    dom: 'lBfrtip',
                    buttons: [
                        'copy', 'csv', 'excel', 'pdf', 'print'
                    ],
                    "lengthMenu": [
                        [-1],
                        ["All"]
                    ],
                    "bLengthChange": false
                });
            }, 200);
        }, function(reason) {
            swal("Something went wrong");
        });

    };

    // View Booking Commission
    //view-commission

    $scope.exportgetViewBookingCommission = function(search) 
    {
        window.location = '/api/viewdriverbookingcommission?fromdate=' + search.fromdate + '&todate=' + search.todate + '&export=excel&city_id='+search.city_id + '&driver_mg_code='+ search.driver_mg_code;
    }

    $scope.getViewBookingCommissionPageChange = function(newPage, search) {
        getViewBookingCommission(newPage, search);
    };

    function getViewBookingCommission (pagenum, search = '') {
        var data = { fromdate: search.fromdate, todate: search.todate, page : pagenum, entries : search.entries, city_id : search.city_id, driver_mg_code: search.driver_mg_code };
        var result = adjusmentServices.adjusmentDriverAccountService(data, 'viewdriverbookingcommission');
        result.then(function(response) {
            console.log(response);

            $scope.viewDriverCommissionTotalCredit = 0;
            $scope.viewDriverCommissionTotalDebit = 0;
            $scope.driverCommissionFinalBalance = 0;
            $scope.totalTripAmount = 0;
            angular.forEach(response.data.data, function(value, key) {
                $scope.viewDriverCommissionTotalCredit += parseInt(value.credit);
                $scope.viewDriverCommissionTotalDebit += parseInt(value.debit);
                $scope.driverCommissionFinalBalance += parseInt(value.balance);
                if (value.trip_amount) {
                    $scope.totalTripAmount += parseInt(value.trip_amount);
                }
            });
            $scope.viewdrivercommission = response.data.data;
            $scope.totalItems = response.data.total;
            $scope.currentPage = response.data.current_page;
            $scope.perPage = response.data.per_page;
            $scope.mypage = response.data.current_page;
            if ($scope.mypage == 0) {
                $scope.perpg = response.data.total;
            } else {

               $scope.perpg = response.data.per_page;
            }
            if (pagenum == 1) {
                setTimeout(function() {
                    $scope.currentPage = 1;
                    var previousActive = $('dir-pagination-controls ul li.active').find('a').text();
                    if (Number(previousActive) > 1) {
                        $('dir-pagination-controls ul li:nth-child(2)').find('a').click();
                    }
                }, 400);
            }

        }, function(reason) {
            // swal("Something went wrong");
        });
    };

    //security-deposit
    $scope.adddriversecuritydeposit = function(driversecuritydeposit) {
        var data = { vehicle_reg_no: $scope.driversecuritydeposit.vehicle_reg_no, trip_amount: $scope.driversecuritydeposit.trip_amount, driver_narration: $scope.driversecuritydeposit.driver_narration };
        $scope.submitdisable = true;
        var getData = CommonService.saveAndUpdateDetails(data,'adddriversecuritydeposit');
        getData.then(function successCallback(response) {
             if (response.success) {
                SweetAlert.swal({
                    title: "success!",
                    text: response.success.message,
                    type: "success",
                    showCancelButton: false,
                    closeOnConfirm: true
                }, function() {
                    $location.path('show-adjustment');
                });

            } else {
                $scope.submitdisable = false;
                SweetAlert.swal({
                    title: "error!",
                    text: response.error.message,
                    type: "error",
                    showCancelButton: false,
                    closeOnConfirm: true
                }, function() {
                    $location.path('driver-security-deposit');
                });
            }
        }, function errorCallback(response) {});
    };
    //view-security-deposit
    $scope.getViewSecurityDeposit = function() {

        var data = { fromdate: $scope.fromdate, todate: $scope.todate };

        $http({
            method: 'GET',
            url: '/api/viewdriversecuritydeposit',
            params: data
        }).then(function successCallback(response) {
            $scope.viewDriverSecurityDepositTotalCredit = 0;
            $scope.viewDriverSecurityDepositTotalDebit = 0;
            angular.forEach(response.data, function(value, key) {
                $scope.viewDriverSecurityDepositTotalCredit += parseInt(value.credit);
                $scope.viewDriverSecurityDepositTotalDebit += parseInt(value.debit);
            });
            $scope.viewdriversecuritydeposit = response.data;
            var table = $('#datatable-buttons').DataTable();
            table.destroy();
            setTimeout(function() {
                $('#datatable-buttons').DataTable({
                    dom: 'lBfrtip',
                    buttons: [
                        'copy', 'csv', 'excel', 'pdf', 'print'
                    ],
                    "lengthMenu": [
                        [-1],
                        ["All"]
                    ],
                    "bLengthChange": false
                });
            }, 200);
        }, function errorCallback(response) {});
    };
    //driver-penalty
    $scope.addDriverPenalty = function(driverpenalty) {
        var data = { vehicle_reg_no: $scope.driverpenalty.vehicle_reg_no, penatly_amount: $scope.driverpenalty.penatly_amount, penatly_id: $scope.driverpenalty.penatly_id, driver_narration: $scope.driverpenalty.driver_narration };
        $scope.submitdisable = true;
        var getData = CommonService.saveAndUpdateDetails(data,'adddriverpenalty');
        getData.then(function successCallback(response) {
            if (response.success) {
                SweetAlert.swal({
                    title: "success!",
                    text: response.success.message,
                    type: "success",
                    showCancelButton: false,
                    closeOnConfirm: true
                }, function() {
                    $location.path('show-adjustment');
                });

            } else {
                $scope.submitdisable = false;
                SweetAlert.swal({
                    title: "error!",
                    text: response.error.message,
                    type: "error",
                    showCancelButton: false,
                    closeOnConfirm: true
                }, function() {
                    $location.path('driver-penalty');
                });
            }
        }, function errorCallback(response) {});
    };

    //view-driver-penalty
    $scope.exportgetViewDriverPenalty = function(search) 
    {
        window.location = '/api/viewdriverpenalty?fromdate=' + search.fromdate + '&todate=' + search.todate + '&export=excel&city_id='+search.city_id;
    }

    $scope.getViewDriverPenaltyPageChange = function(newPage, search) {
        getViewDriverPenalty(newPage, search);
    };

    function getViewDriverPenalty (pagenum, search = '') {

        var data = { fromdate: search.fromdate, todate: search.todate, page : pagenum, entries : search.entries, city_id : search.city_id};

        $http({
            method: 'GET',
            url: '/api/viewdriverpenalty',
            params: data
        }).then(function successCallback(response) {
            $scope.viewDriverPenaltyTotalCredit = 0;
            $scope.viewDriverPenaltyTotalDebit = 0;
            angular.forEach(response.data.data, function(value, key) {
                $scope.viewDriverPenaltyTotalCredit += parseInt(value.credit);
                $scope.viewDriverPenaltyTotalDebit += parseInt(value.debit);
            });
            $scope.viewdriverpenalty = response.data.data;
            $scope.totalItems = response.data.total;
            $scope.currentPage = response.data.current_page;
            $scope.perPage = response.data.per_page;
            $scope.mypage = response.data.current_page;
            if ($scope.mypage == 0) {
                $scope.perpg = response.data.total;
            } else {

               $scope.perpg = response.data.per_page;
            }
            if (pagenum == 1) {
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

    ///driver-cancellation-charge
    $scope.getDriverCancellation = function() {

        var data = { id: $scope.bookingid };

        $http({
            method: 'GET',
            url: '/api/getdrivercancellation',
            params: data
        }).then(function successCallback(response) {

            $scope.drivercancellationDetials = response.data;

        }, function errorCallback(response) {});
    };

    $scope.addCancellationAmount = function() {
        var data = {
            booking_id: $scope.drivercancellationDetials[0].id,
            customer_id: $scope.drivercancellationDetials[0].customer_id,
            driver_id: $scope.drivercancellationDetials[0].driver_id,
            payment_recevied: $scope.drivercancellationDetials[0].payment_recevied,
            amount: $scope.amount,
            driver_balance: $scope.drivercancellationDetials[0].balance,
            customer_balance: $scope.drivercancellationDetials[0].final_balance
        };

        $http({
            method: 'GET',
            url: '/api/addcancelamount',
            params: data
        }).then(function successCallback(response) {
            if (response.data.success) {
                swal({
                    title: "success!",
                    text: response.data.success.message,
                    type: "success",
                    showCancelButton: false,
                    closeOnConfirm: false
                }, function() {
                    location.href = '/show-adjustment';
                });

            } else {
                swal({
                    title: "error!",
                    text: response.data.error.message,
                    type: "error",
                    showCancelButton: false,
                    closeOnConfirm: false
                }, function() {
                    location.href = '/driver-cancellation-charge';
                });
            }
        }, function errorCallback(response) {});
    };


    //view-driver-cancel
    $scope.exportgetViewCancellation = function(search) 
    {
        window.location = '/api/viewdrivercancellation?fromdate=' + search.fromdate + '&todate=' + search.todate + '&export=excel&city_id='+search.city_id;
    }

    $scope.getViewCancellationPageChange = function(newPage, search) {
        getViewCancellation(newPage, search);
    };

    function getViewCancellation (pagenum, search = '') {

        var data = { fromdate: search.fromdate, todate: search.todate, page : pagenum, entries : search.entries, city_id : search.city_id};

        $http({
            method: 'GET',
            url: '/api/viewdrivercancellation',
            params: data
        }).then(function successCallback(response) {
            $scope.viewDriverCancellationTotalCredit = 0;
            $scope.viewDriverCancellationTotalDebit = 0;
            angular.forEach(response.data.data, function(value, key) {
                $scope.viewDriverCancellationTotalCredit += parseInt(value.credit);
                $scope.viewDriverCancellationTotalDebit += parseInt(value.debit);
            });
            $scope.viewdrivercancellationdetails = response.data.data;
            $scope.totalItems = response.data.total;
            $scope.currentPage = response.data.current_page;
            $scope.perPage = response.data.per_page;
            $scope.mypage = response.data.current_page;
            if ($scope.mypage == 0) {
                $scope.perpg = response.data.total;
            } else {

               $scope.perpg = response.data.per_page;
            }
            if (pagenum == 1) {
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
   
    $scope.addDriverWaitingCharge = function() {
        var data = {
            booking_id: $scope.customerBookingDetails.booking_id,
            amount: $scope.amount
        };
        var getData = CommonService.saveAndUpdateDetails(data,'addwaitingcharge');
        getData.then(function successCallback(response) {
            if (response.success) {
                SweetAlert.swal({
                    title: "success!",
                    text: response.success.message,
                    type: "success",
                    showCancelButton: false,
                    closeOnConfirm: true
                }, function() {
                    $location.path('show-adjustment');
                });

            } else {
                SweetAlert.swal({
                    title: "error!",
                    text: response.error.message,
                    type: "error",
                    showCancelButton: false,
                    closeOnConfirm: true
                }, function() {
                    $location.path('pay-waiting-charges');
                });
            }
        }, function errorCallback(response) {});
        

    };
    //view-waiting-charges
    $scope.exportgetViewWaitingCharge = function(search) 
    {
        window.location = '/api/viewdriverwaitingcharge?fromdate=' + search.fromdate + '&todate=' + search.todate + '&export=excel&city_id='+search.city_id;
    }

    $scope.getViewWaitingChargePageChange = function(newPage, search) {
        getViewWaitingCharge(newPage, search);
    };

    function getViewWaitingCharge (pagenum, search = '') {

        var data = { fromdate: search.fromdate, todate: search.todate, page : pagenum, entries : search.entries, city_id : search.city_id};

        $http({
            method: 'GET',
            url: '/api/viewdriverwaitingcharge',
            params: data
        }).then(function successCallback(response) {
            $scope.viewDriverWaitingChargeCredit = 0;
            $scope.viewDriverWaitingChargeDebit = 0;
            angular.forEach(response.data.data, function(value, key) {
                $scope.viewDriverWaitingChargeCredit += parseInt(value.credit);
                $scope.viewDriverWaitingChargeDebit += parseInt(value.debit);
            });
            $scope.viewdriverwaitingchargedetails = response.data.data;
            $scope.totalItems = response.data.total;
            $scope.currentPage = response.data.current_page;
            $scope.perPage = response.data.per_page;
            $scope.mypage = response.data.current_page;
            if ($scope.mypage == 0) {
                $scope.perpg = response.data.total;
            } else {

               $scope.perpg = response.data.per_page;
            }
            if (pagenum == 1) {
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

    $scope.getDistanceCustomer = function() {

        data = { lowerlimit: $scope.lowerlimit, uperlimit: $scope.uperlimit, startDate: $scope.startDate, endDate: $scope.endDate };
        var result = adjusmentServices.adjusmentDriverAccountService(data, 'viewdistancecustomer');
        result.then(function(response) {
            $scope.viewdistancecustomerdetails = response.data;
        }, function(reason) {
            swal("Something went wrong");
        });

    };

    //view-driver-penalty
    $scope.exportgetViewDistCust = function(search) 
    { 
       var url = '/api/viewdistcust?fromdate=' + search.fromdate + '&todate=' + search.todate + '&export=excel&city_id='+search.city_id +'&tripId='+ search.trip_id + '&mgCode=' +search.mg_code;
       console.log(search)
       console.log(url)
       window.location = '/api/viewdistcust?fromdate=' + search.fromdate + '&todate=' + search.todate + '&export=excel&city_id='+search.city_id +'&tripId='+ search.trip_id + '&mgCode=' +search.mg_code;
    }

    $scope.getViewDistCustPageChange = function(newPage, search) {
        getViewDistCust(newPage, search);
    };

    function getViewDistCust (pagenum, search = '') {

        $scope.onsubmitReportDataShow = true;
        $scope.recordData = false;
        var data = { fromdate: search.fromdate, todate: search.todate, tripId: search.trip_id, mgCode: search.mg_code, page : pagenum, entries : search.entries, city_id : search.city_id };

        console.log(data)
        $http({
            method: 'GET',
            url: '/api/viewdistcust',
            params: data
        }).then(function successCallback(response) {
            $scope.onsubmitReportDataShow = false;
            $scope.recordData = true;
            $scope.viewDistCustomer = response.data.data;
            $scope.totalMaxDtcDistance = 0;
            $scope.totalMaxDtcCharges = 0;
            $scope.totalDtcGiven = 0;
            $scope.totalDistanceTravel = 0;
            angular.forEach(response.data.data, function(value, key) {
                $scope.totalMaxDtcDistance += parseFloat(value.max_dtc_distance);
                $scope.totalMaxDtcCharges += parseFloat(value.max_dtc);
                $scope.totalDtcGiven += parseFloat(value.credit);
                $scope.totalDistanceTravel += parseFloat(value.actual_dtc);
            });
            $scope.totalItems = response.data.total;
            $scope.currentPage = response.data.current_page;
            $scope.perPage = response.data.per_page;
            $scope.mypage = response.data.current_page;
            if ($scope.mypage == 0) {
                $scope.perpg = response.data.total;
            } else {

               $scope.perpg = response.data.per_page;
            }
            if (pagenum == 1) {
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

    $scope.exportTableInformation = function(filename) {
        $("table").tableToCSV(filename);
    }
    $scope.searchTableRecord = function() {
            var $rows = $('.table tbody tr');
            $('#search_record').keyup(function() {
                var val = $.trim($(this).val()).replace(/ +/g, ' ').toLowerCase();

                $rows.show().filter(function() {
                    var text = $(this).text().replace(/\s+/g, ' ').toLowerCase();
                    return !~text.indexOf(val);
                }).hide();
            });
        }
        //unmatch-report
    $scope.getunmatchreport = function(pagenum, requestType) {
        $scope.onSubmitLoader = true;
        $scope.onSubmitResult = false;
        var data = { startDate: $scope.startDate, endDate: $scope.endDate, city_id: $scope.city_id,page : pagenum, paginate: $scope.type};
        var getData = CommonService.getDetails(data,'viewunmatchreport');
        getData.then(function successCallback(response) {
            $scope.onSubmitLoader = false;
            $scope.onSubmitResult = true;
            console.log(response);
            $scope.viewUnmatchReport = response.data;
        });

    };

    $scope.swapCharge = [];
    $scope.swapCharges = function() {
        var getData = CommonService.saveAndUpdateDetails($scope.swapCharge,'setswapcharges');
        getData.then(function successCallback(response) {
            if (response.success) {
                SweetAlert.swal({
                    title: "Success!",
                    text: "Swaped all amount to driver wallet",
                    type: "success"
                },
                function() {
                    $location.path('show-adjustment');
                });
            }
        }, function errorCallback(response) {});
    };

    $scope.remove = function(item) {
        var index = $scope.swapCharge.indexOf(item);
        $scope.swapCharge.splice(index, 1);
    };




    $scope.addtrip = function() {
        var na = $scope.viewofflinetripreport;

        var data = { mgId: $scope.mgId, oldmgId: $scope.viewofflinetripreport.mg_id, bookingid: $scope.viewofflinetripreport.booking_id, total_bill: $scope.viewofflinetripreport.total_bill, payment_recevied: $scope.viewofflinetripreport.payment_recevied };
        var result = adjusmentServices.adjusmentDriverAccountService(data, 'addoffflinetrip');
        result.then(function(response) {
            swal({
                title: "success!",
                text: "Wallet Add Successfully",
                type: "success",
                showCancelButton: false,
                closeOnConfirm: false
            }, function() {
                location.href = '/show-adjustment';
            });
        }, function(reason) {
            swal("Something went wrong");
        });
    };


    //view-offline-trip
    $scope.getViewofflineTrip = function() {

        var data = { fromdate: $scope.fromdate, todate: $scope.todate };
        $http({
            method: 'GET',
            url: '/api/viewofflinetrip',
            params: data
        }).then(function successCallback(response) {
            $scope.viewofflinetripCredit = 0;
            $scope.viewofflinetripDebit = 0;
            angular.forEach(response.data, function(value, key) {
                $scope.viewofflinetripCredit += parseInt(value.credit);
                $scope.viewofflinetripDebit += parseInt(value.debit);
            });
            $scope.viewofflinetrip = response.data;

        }, function errorCallback(response) {});
    };

    //pay-cancellation
    $scope.getCancellationCharge = function() {

        var data = { bookingid: $scope.bookingid };
        $http({
            method: 'GET',
            url: '/api/viewcancellationcharge',
            params: data
        }).then(function successCallback(response) {

            $scope.cancellationcharge = response.data;

        }, function errorCallback(response) {});
    };
    $scope.debitWallet = 0;
    $scope.creditWallet = 0;

    $scope.exportgetdriverwalletview = function(DriverWallet) 
    {
        window.location = '/api/driverwalletview?startDate=' + $scope.DriverWallet.fromdate + '&endDate=' + $scope.DriverWallet.todate + '&mg_id=' + $scope.DriverWallet.mg_id + '&export=excel'
    }

    $scope.getdriverwalletview = function(DriverWallet) {

        data = { mg_id: $scope.DriverWallet.mg_id, startDate: $scope.DriverWallet.startDate, endDate: $scope.DriverWallet.endDate };
        console.log(data)
        var result = adjusmentServices.adjusmentDriverAccountService(data, 'driverwalletview');
        result.then(function(response) {
            $scope.debitWallet = 0;
            $scope.creditWallet = 0;
            angular.forEach(response.data, function(value, key) {
                if (!isNaN(value.credit)) {
                    $scope.creditWallet += parseInt(value.credit);

                }
                if (!isNaN(value.debit)) {
                    $scope.debitWallet += parseInt(value.debit);

                }

            });
            $scope.viewdriverwalletdetails = response.data;

        }, function(reason) {
            swal("Something went wrong");
        });
    };


    $scope.getCancellation = function() {

        data = { startDate: $scope.startDate, endDate: $scope.endDate };
        var cancellationResult = adjusmentServices.getCancellation(data);
        cancellationResult.then(function(response) {
            console.log(response);
            $scope.viewCancellation = response.data;
        }, function(reason) {
            swal("Something went wrong");
        });
    };

    $scope.FixAmount = {};
    $scope.DiffAmount = {};
    $scope.CustAmount = {};

    $scope.getFixAmount = function() {
        if($.isEmptyObject($scope.FixAmount) == false || $.isEmptyObject($scope.DiffAmount) == false || $.isEmptyObject($scope.CustAmount) == false){
            var data = { fixAmount: $scope.FixAmount, diffAmount: $scope.DiffAmount, custAmount: $scope.CustAmount };console.log(data);
            var getData = CommonService.saveAndUpdateDetails(data,'getfixAmount');
            getData.then(function successCallback(response) {
                if(response.success){
                    SweetAlert.swal({
                        title: "success!",
                        text: "Wallet Add Successfully",
                        type: "success",
                        showCancelButton: false,
                        closeOnConfirm: true
                    }, function() {
                        $location.path('show-adjustment');
                    });
                }
            }, function errorCallback(response) {});
           
        }
    };

    $scope.DTCAmount = {};

    $scope.addDistToCust = function() {

        var data = { dtcAmount: $scope.DTCAmount };
        var result = adjusmentServices.adjusmentDriverAccountService(data, 'getDTCAmount');
        result.then(function(response) {
            swal({
                title: "success!",
                text: "Driver Wallet Add Successfully",
                type: "success",
                showCancelButton: false,
                closeOnConfirm: false
            }, function() {
                location.href = '/show-adjustment';
            });
        }, function(reason) {
            swal("Something went wrong");
        });

    };


    //view_swap_charges
    $scope.exportgetswapcharge = function(search) 
    {
        window.location = '/api/getswapcharge?fromdate=' + search.fromdate + '&todate=' + search.todate + '&export=excel&city_id='+search.city_id;
    }

    $scope.getswapchargePageChange = function(newPage, search) {
        getswapcharge(newPage, search);
    };

    function getswapcharge (pagenum, search = '') {

        var data = { fromdate: search.fromdate, todate: search.todate, page : pagenum, entries : search.entries, city_id : search.city_id};

        $http({
            method: 'GET',
            url: '/api/getswapcharge',
            params: data
        }).then(function successCallback(response) {
            $scope.viewSwapChargeCredit = 0;
            $scope.viewSwapChargeDebit = 0;
            $scope.viewSwapChargeBalance = 0;
            angular.forEach(response.data.data, function(value, key) {
                $scope.viewSwapChargeCredit += parseInt(value.credit);
                $scope.viewSwapChargeDebit += parseInt(value.debit);
                $scope.viewSwapChargeBalance += parseInt(value.balance);
            });
            $scope.viewswapchargedetails = response.data.data;

            $scope.totalItems = response.data.total;
            $scope.currentPage = response.data.current_page;
            $scope.perPage = response.data.per_page;
            $scope.mypage = response.data.current_page;
            if ($scope.mypage == 0) {
                $scope.perpg = response.data.total;
            } else {

               $scope.perpg = response.data.per_page;
            }
            if (pagenum == 1) {
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

   
    $scope.getCustomerCashRecieveDetials = function(cust_org) {
        var customer_id = $("#organization_id").val();
        var data = { cust_organization: cust_org, customer_id:customer_id };

        $http({
            method: 'GET',
            url: '/api/getCustomerCashRecieveDetials',
            params: data
        }).then(function successCallback(response) {

            $scope.CashRecieveDetials = response.data;

            $scope.customercash.customer_id = $scope.CashRecieveDetials.id;
            $scope.customercash.cust_name = $scope.CashRecieveDetials.cust_name;
            $scope.dicountcount.customer_id = $scope.CashRecieveDetials.id;
            $scope.dicountcount.cust_name = $scope.CashRecieveDetials.cust_name;
            $scope.BalanceReport.customer_id = $scope.CashRecieveDetials.id;
            $scope.BalanceReport.cust_name = $scope.CashRecieveDetials.cust_name;
            $scope.BalanceReport.cust_number = $scope.CashRecieveDetials.cust_number;
            $scope.BalanceReport.cust_email = $scope.CashRecieveDetials.cust_email;

        }, function errorCallback(response) {});
    };

    $scope.getDriverReg = function() {
        $http({
            method: 'GET',
            url: '/api/getDriverReg',
        }).then(function successCallback(response) {
            $scope.vehicle = response.data;
            $("#omschrijving").autocomplete({ source: $scope.vehicle });
            $scope.loadingIsDones = true;
        }, function errorCallback(response) {});
    };
    $scope.getDriverWalletMgCode = function() {
        var mgCode = $stateParams.mgCode;
        if (mgCode) {
            var date = new Date();
            var currentDate = $filter('date')(date, "yyyy-MM-dd");
            var startDate = new Date(date.getTime() - 30 * 24 * 60 * 60 * 1000);
            var startDate = $filter('date')(startDate, "yyyy-MM-dd");
            $scope.DriverWallet.vehicle_reg_no = mgCode;
            $scope.DriverWallet.startDate = startDate;
            $scope.DriverWallet.endDate = currentDate;
            setTimeout(function() {
                DriverWallet = $scope.DriverWallet;
                $scope.getdriverwalletview(DriverWallet);
            }, 200);
        }
    }
    $scope.getDriverReg();

    $scope.exportAction = function() {

        $scope.$broadcast('export-excel', {});

    }

    $scope.getDriverWalletDetails = function(driverWallet) {
        console.log(driverWallet);
        $http({
            method: 'GET',
            url: '/api/getDriverWalletDetails',
            params: driverWallet
        }).then(function successCallback(response) {
            console.log(response.data);
            $scope.driverWalletDetails = response.data;
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
}]).directive('exportTable', function() {

    var link = function($scope, elm, attr) {

        $scope.$on('export-pdf', function(e, d) {
            elm.tableExport({ type: 'pdf', escape: false });
        });
        $scope.$on('export-excel', function(e, d) {
            elm.tableExport({ type: 'excel', escape: false });
        });
        $scope.$on('export-doc', function(e, d) {
            elm.tableExport({ type: 'doc', escape: false });
        });
    }

    return {
        restrict: 'C',
        link: link
    }


});
