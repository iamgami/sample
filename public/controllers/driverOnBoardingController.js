app.controller('DriverOnBoardingController', ['$scope', '$http', 'SweetAlert', '$window', '$location', '$stateParams', '$timeout', 'CommonService','$rootScope','$localStorage', function($scope, $http, SweetAlert, $window, $location, $stateParams, $timeout, CommonService, $rootScope, $localStorage) {

    $scope.baseURL = '';
    $scope.owner_number = ''
    $scope.itemsPerPage = 10;
    $scope.currentPage = 0;
    $scope.showTableFlag = false;
    // $scope.driver.entries = '10';

    $rootScope.changeMaalgaadiCity = function(){
        $scope.maalgaadi_city_id = $rootScope.default_city_id;
        $localStorage.defaultCityId = $rootScope.default_city_id;
    }

    $scope.getdriverListPageChange = function(newPage, driver) {
        driverList(newPage, driver);
    };

    function driverList(pageNumber, driver = '') 
    {
        var url = 'driverList';
        var registrationNo = '';
        if(angular.isUndefined($scope.maalgaadi_city_id)){
            return false;
        }
        if(angular.isDefined(driver.registration_no)){
            registrationNo = driver.registration_no;
        }
        if(driver == ''){
            driver = {}
        }
        driver.city_id = $scope.maalgaadi_city_id;

        $scope.onSubmitLoader = true;
        $scope.onSubmitResult = false;
        var dataObj = {city_id : driver.city_id, page : pageNumber, entries : driver.entries, registration_no: registrationNo};

        var driverList = CommonService.getDetails(dataObj, url);
        driverList.then(function successCallback(response) {
            $scope.driverData = response.data;
            $scope.onSubmitLoader = false;
            $scope.onSubmitResult = true;
            $scope.totalItems = response.total;
            $scope.currentPage = response.current_page;
            $scope.perPage = response.per_page;
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
    $scope.exportOnBoardingDriverList = function(driver = ''){
        var registrationNo = '';
        if(driver == ''){
            driver = {}
        }
        if(angular.isDefined(driver.registration_no)){
            registrationNo = driver.registration_no;
        }
        if(angular.isUndefined($scope.maalgaadi_city_id)){
            return false;
        }
        driver.city_id = $scope.maalgaadi_city_id;
        window.location = 'api/driverList?city_id=' + driver.city_id+'&registration_no='+ registrationNo+'&export=excel';
    }
    $scope.searchRecord = function() {
        var $rows = $('#driver-datatable-buttons tbody tr');
        $('#search_record').keyup(function() {
            var val = $.trim($(this).val()).replace(/ +/g, ' ').toLowerCase();

            $rows.show().filter(function() {
                var text = $(this).text().replace(/\s+/g, ' ').toLowerCase();
                return !~text.indexOf(val);
            }).hide();
        });
    };

    $scope.bankDetailsList = function() {
        var url = 'bankList';
        var dataObj = '';
        var bankDetailsList = CommonService.getDetails(dataObj, url);
        bankDetailsList.then(function successCallback(response) {
            $scope.bankdata = response;
            $scope.showTableFlag = true;
        }, function errorCallback(response) {});
    };


    $scope.ownerNumber = function() {
        $http({
            method: 'POST',
            url: '/api/ownerNumber',
        }).then(function successCallback(response) {
            $scope.mobileNumber = response.data;
            $("#column0_search").autocomplete({ source: $scope.mobileNumber });
        }, function errorCallback(response) {});
    };
    $scope.showTableFlag = true;
    $scope.showdata = false;

    $scope.getOwnerData = function() {

        if ($scope.owner_number == '') {
            alert("Please enter Mobile Number");
            return false;
        }


        var data = { owner_number: $scope.owner_number }
        $http({
            method: 'POST',
            url: '/api/getOwnerData',
            params: data,
        }).then(function successCallback(response) {

            //console.log(response)
            if (response.data.success.message == "No data available") {
                // alert("no data")
                $scope.ownerData = '';
                $scope.showTableFlag = true;
                $scope.showdata = false;
            } else {
                $scope.ownerData = response.data.success;
                $scope.showTableFlag = true;
                $scope.showdata = true;

            }
            console.log(response.data.success)
            console.log(response.data.success.message)

        }, function errorCallback(response) {});
    };

    //$scope.getOwnerData();

    $scope.driverApprove = function($id) {


        $http({
            method: 'POST',
            url: '/api/addDriver/' + $id,
        }).then(function successCallback(response) {
            console.log(response.data)
                //console.log(response)
            if (response.data.success) {

                alert(response.data.success.message);

            } else {
                alert(response.data.error.message);

            }


        }, function errorCallback(response) {});

    }


    $scope.driverEdit = function($id) {
        $http({
            method: 'POST',
            url: '/api/driverEdit/' + $id,
        }).then(function successCallback(response) {
            if (response.data.success) {
                alert(response.data.success.message);
            } else {
                alert(response.data.error.message);
            }
        }, function errorCallback(response) {});

    }

    $scope.getOwnerMobileData = function(){
        var mobileNo = $stateParams.mobileNo;
        if(mobileNo){
            $scope.owner_number = mobileNo;
            $timeout( function(){
                $scope.getOwnerData();
            }, 1000 );
        }
    }
}]);
