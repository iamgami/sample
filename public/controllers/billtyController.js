app.controller('BilltyController', ['$scope', '$http', 'SweetAlert', '$window', '$location', '$stateParams', 'BilityService','CommonService','$rootScope','$localStorage', function($scope, $http, SweetAlert, $window, $location, $stateParams, BilityService, CommonService, $rootScope, $localStorage) {
    // $scope.userId = {};
    $scope.ordernew = 'desc';
    $scope.billtyList = {};

    $rootScope.changeMaalgaadiCity = function(){
        $scope.maalgaadi_city_id = $rootScope.default_city_id;
        $localStorage.defaultCityId = $rootScope.default_city_id;
    } 

    $scope.getBilltyPageChange = function(newPage) {
   
        getBillty(newPage);
    };
    $scope.pendingOption = function(){
         $scope.billtyList.pendingOption = '';
    }
    function getBillty(pagenum) {
        var data = { page: pagenum };
        var datanew = { page: 1, pickupBy: '', bookingId: '', organization: '', customerNumber: '', mgCode: '', driverNumber: '', pendingOption: '' };
        var postData = BilityService.getBilltySearch(datanew);

        postData.then(function(response) {
            $scope.billty = response.data.data;
            $scope.totalItems = response.data.pagination.total;
            $scope.currentPage = response.data.pagination.current_page;
            $scope.perPage = response.data.pagination.per_page;
        }, function(reason) {
            alert("Something went wrong");
        });
    };
    $scope.getBilltyAutocomplete = function() {
        var postData = BilityService.getBilltyAutocomplete();
        postData.then(function successCallback(response) {
            console.log(response);
            $scope.bookingId = response.data.bookingId;
            $scope.customerOrg = response.data.customerOrg;
            $scope.customerNum = response.data.customerNum;
            $scope.mgId = response.data.mgId;
            $scope.driverNum = response.data.driverNum;
            //$("#bookingId").autocomplete({ source: $scope.bookingId });
            $("#customerOrg").autocomplete({ source: $scope.customerOrg });
            $("#customerNum").autocomplete({ source: $scope.customerNum });
            $("#mgId").autocomplete({ source: $scope.mgId });
            $("#driverNum").autocomplete({ source: $scope.driverNum });
            $scope.loadingIsDones = true;
        }, function errorCallback(response) {});
    };
    $scope.getBilltyAutocomplete();

    $scope.getBilltyReportSearch = function(billtyList, newPage) {
        if(angular.isUndefined(billtyList.startDate) || angular.isUndefined(billtyList.endDate) || angular.isUndefined($scope.maalgaadi_city_id)){
            return false;
        }
        billtyList.city_id = $scope.maalgaadi_city_id;
        // console.log(billtyList,"BilityService")
        getBilltySearch(billtyList, newPage);
    };

    function getBilltySearch(billtyList, pagenum) 
    {

        mgCode = '';
        city_id = '';
        pickupby = '';
        bookingId = '';
        pendingOption = '';
        customerNumber = '';
        customerOrganization = '';
        
        if(billtyList.pendingOption != null || billtyList.pendingOption != undefined)
        {
            pendingOption= billtyList.pendingOption; 
        }

        if(billtyList.pickupby != null || billtyList.pickupby != undefined)
        {
            pickupby = billtyList.pickupby;
        }

        if(billtyList.bookingId != null || billtyList.bookingId != undefined)
        {
            bookingId = billtyList.bookingId;
        }

        if(billtyList.customerOrganization != null || billtyList.customerOrganization != undefined)
        {
            customerOrganization = billtyList.customerOrganization;
        }

        if(billtyList.customerNumber != null || billtyList.customerNumber != undefined)
        {
            customerNumber = billtyList.customerNumber
        }

        if(billtyList.mgCode != null || billtyList.mgCode != undefined)
        {
            mgCode = billtyList.mgCode;
        }

        if(billtyList.city_id != undefined || billtyList.city_id != null)
        {
            city_id = billtyList.city_id;
        }
       
        var sort = $scope.ordernew;
        $scope.onsubmitReportDataShow = true;
        $scope.reportDataShow = false;
        var datanew = { sort: sort, page: pagenum, pendingOption:pendingOption ,startDate:billtyList.startDate,endDate:billtyList.endDate, pickupBy: pickupby, bookingId: bookingId, organization: customerOrganization, customerNumber:customerNumber, mgCode:mgCode, city_id:city_id};
        var responsedata = BilityService.getBilltySearch(datanew);
        responsedata.then(function(response) {

            $scope.onsubmitReportDataShow = false;
            $scope.reportDataShow = true;
            $scope.billty = response.data.data;
            $scope.totalItems = response.data.pagination.total;
            $scope.currentPage = response.data.pagination.current_page;
            $scope.perPage = response.data.pagination.per_page;
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
            alert("Something went wrong");
        });
    };

    $scope.addUser = function(billty) {
        var addUser = BilityService.addUser(billty);
        addUser.then(function successCallback(response) {
            console.log(response.data);
        });
    };

    $scope.getCityBilltyUsers = function(billty, pagenum, requestType) {console.log(billty, pagenum, requestType);
        var paginate = 10;
        if(angular.isUndefined(billty)){
            billty = {}
        }
        if(angular.isUndefined($scope.maalgaadi_city_id)){
            return false;
        }
        billty.city_id = $scope.maalgaadi_city_id;
        if(angular.isDefined(billty.type)){
            paginate = billty.type;
        }


        $scope.onSubmitLoader = true;
        $scope.onSubmitResult = false;console.log(billty);
        var data = { city_id: billty.city_id, page : pagenum, paginate:paginate}
        var getData = CommonService.getDetails(data,'billty/getUser');
        getData.then(function successCallback(response) {
            $scope.onSubmitLoader = false;
            $scope.onSubmitResult = true;  
            
            $scope.billtyUser = response.data.data;
            $scope.totalItems = response.data.total;
            $scope.currentPage = response.data.current_page;
            $scope.perPage = response.data.per_page;
            $scope.mypage = response.data.current_page;
            if ($scope.mypage == 0) {
                $scope.perpg = response.data.total;
            } else {

                $scope.perpg = response.data.per_page;
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
        },
        function(reason) {});
    };

    $scope.getBilltyUsers = function(city_id){
        if(city_id == ''){
            $scope.billtyUser = '';
            return false;
        }
        var data = {city_id:city_id}
        var getData = CommonService.getDetails(data,'billty/getBilltyUser');
        getData.then(function successCallback(response) {
            if(angular.isDefined(response.success)){
                $scope.billtyUser = response.success.data;
            }else{
                $scope.billtyUser = '';
            }
        })
    }


    $scope.exportCityBilltyUsers = function(billty){
        if(angular.isUndefined($scope.maalgaadi_city_id)){
            return false;
        }
        window.location = 'api/billty/getUser?city_id='+$scope.maalgaadi_city_id+'&export=excel';
    }

    $scope.podUrl = function(url) {
        $scope.url = url;
    };

    $scope.checkPod = function(id) {
        var data = { pod_id: id };
        var checkPod = BilityService.checkPod(data);
        checkPod.then(function successCallback(response) {
                console.log(response.data);
                $scope.getBillty();
            },
            function errorCallback(response) {});
    };

    $scope.reAssignBillty = function() {
        var data = { user_id: $scope.userId.id, booking_id: $stateParams.bookingId };
        var reAssignBillty = BilityService.reAssignBillty(data);
        reAssignBillty.then(function successCallback(response) {
                console.log(response.data);
                $window.location.href = '/billty';
            },
            function errorCallback(response) {});
    };


    $scope.onUserChange = function(index) {
        console.log($scope.userId);
    };

    $scope.exportbilty = function(billtyList) {
        var sort = $scope.ordernew;
        if(angular.isUndefined(billtyList.startDate) || angular.isUndefined(billtyList.endDate) || angular.isUndefined($scope.maalgaadi_city_id)){
            return false;
        }
        billtyList.city_id = $scope.maalgaadi_city_id;
        var bookingId = '';
        var organization = '';
        var mgCode = '';
        var pickupBy = '';
        var billtyOption = '';
        if(angular.isDefined(billtyList.pickupby)){
            pickupBy = billtyList.pickupby;
        }
        if(angular.isDefined(billtyList.mgCode)){
            mgCode = billtyList.mgCode;
        }
        if(angular.isDefined(billtyList.customerOrganization)){
            organization = billtyList.customerOrganization;
        }
        if(angular.isDefined(billtyList.bookingId)){
            bookingId = billtyList.bookingId;
        }
        if(angular.isDefined(billtyList.pendingOption)){
            billtyOption = billtyList.pendingOption;
        }
        // var datanew = { page: pagenum, pickupBy: billtyList.pickupby, bookingId: billtyList.bookingId, organization: billtyList.customerOrganization, customerNumber: billtyList.customerNumber, mgCode: billtyList.mgCode, driverNumber: billtyList.driverNumber };
        window.location = '/api/billty/getBilltySearch?startDate=' + billtyList.startDate + '&endDate=' + billtyList.endDate + '&pickupBy=' + pickupBy + '&bookingId=' +bookingId + '&organization=' + organization + '&mgCode=' + mgCode +'&pendingOption=' + billtyOption+'&city_id='+billtyList.city_id+'&city_id='+billtyList.city_id+ '&export=excel';
    };

    $scope.sortByCustom = function(billtyList, order) {
        //alert(order);
        var sort = 'asc';

        if (order == '1') {
            $("#bookingsort2").show();
            $("#bookingsort1").hide();
            var sort = 'asc';
            $scope.ordernew = 'asc';
        }
        if (order == '2') {
            $("#bookingsort1").show();
            $("#bookingsort2").hide();
            var sort = 'desc';
            $scope.ordernew = 'desc';
        }

        $scope.onsubmitReportDataShow = true;
        $scope.reportDataShow = false;
        var pagenum = 1;
        var datanew = { page: pagenum, sort: sort, pickupBy: billtyList.pickupby, bookingId: billtyList.bookingId, organization: billtyList.customerOrganization, customerNumber: billtyList.customerNumber, mgCode: billtyList.mgCode, driverNumber: billtyList.driverNumber };
        var responsedata = BilityService.getBilltySearch(datanew);
        responsedata.then(function(response) {
            $scope.onsubmitReportDataShow = false;
            $scope.reportDataShow = true;
            $scope.billty = response.data.data;
            $scope.totalItems = response.data.pagination.total;
            $scope.currentPage = response.data.pagination.current_page;
            $scope.perPage = response.data.pagination.per_page;
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
            alert("Something went wrong");
        });



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

}]);
