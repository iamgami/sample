app.controller('CreditController', ['$scope', '$http', '$location', 'CreditService','CommonService','$rootScope','$localStorage', function($scope, $http, $location, CreditService, CommonService, $rootScope, $localStorage) {
    $scope.credit = {};
    $scope.itemsPerPage = 10;
    $scope.currentPage = 0;
    $scope.showTableFlag = false;

    $rootScope.changeMaalgaadiCity = function(){
        $scope.maalgaadi_city_id = $rootScope.default_city_id;
        $localStorage.defaultCityId = $rootScope.default_city_id;
    }

    $scope.getCustomerDetials = function(type) {
        var customer_id = $("#organization_id").val();
        var data = { organization: $scope.credit.organization ,customer_id : customer_id ,phone: $scope.credit.phone ,email : $scope.credit.email};
        var url = '/api/getCustomerCreditDetials';
        var customerDetails = CreditService.get(data, url);
        customerDetails.then(function successCallback(response) {
            // console.log('customerDetails');
            if ($scope.disableAll) {
                $scope.disableAll = true;
            } else {
                $scope.disableAll = false;
            }
            $scope.credit.customerId = response.data.id;
            $scope.credit.phone = response.data.cust_number;
            $scope.credit.email = response.data.cust_email;
            $scope.credit.organization = response.data.cust_organization;
            $scope.credit.name = response.data.cust_name;
            $scope.credit.credit = response.data.credit_limit;

        }, function errorCallback(response) {

        });
    };

    $scope.loadUsers = function() {
        var data = {};
        var url = '/api/getMobileNumberDetials';
        var load = CreditService.get(data, url);
        load.then(function successCallback(response) {
            // console.log('loadd');
            $scope.phone = response.data.number;
            $scope.name = response.data.customer_name;
            $scope.email = response.data.email;
            $scope.organization = response.data.organization;
            $scope.loadingIsDone = true;
        }, function errorCallback(response) {

        });
    };

    $scope.loadUsers();

    $scope.creditvalue = false;
    $scope.addCredit = function() {
        var data = { id: $scope.credit.customerId, credit_limit: $scope.credit.credit };
        var url = '/api/addCredit';
        var addedCreditDetails = CreditService.get(data, url);
        addedCreditDetails.then(function successCallback(response) {
            // console.log('addCredit');
            if (response.data.success) {
                swal({
                    title: "Update!",
                    text: response.data.success.message,
                    type: "success",
                    showCancelButton: false,
                    closeOnConfirm: true
                }, function() {
                    $location.path('credit-list');
                });
            } else {
                $scope.creditvalue = false;
            }

        }, function errorCallback(response) {

        });

    };

    $scope.exportgetCredit = function(creditSearch) {
	 if(angular.isUndefined($scope.maalgaadi_city_id)){
            return false;
        }
        window.location.href = '/api/getCredit?city_id=' + $scope.maalgaadi_city_id + '&export=export';
    };

    $scope.getCreditPageChange = function(newPage, creditSearch) {
        getCredit(newPage, creditSearch);
    };

    function getCredit(pageNumber, creditSearch = '') {
        if(angular.isUndefined($scope.maalgaadi_city_id)){
            return false;
        }
        $scope.onSubmitLoader = true;
        $scope.onSubmitResult = false;
        var data = {city_id : $scope.maalgaadi_city_id, page : pageNumber, entries : creditSearch.entries};
        var creditDetails = CommonService.getDetails(data, 'getCredit');
        creditDetails.then(function successCallback(response) {
            console.log(response)
            $scope.onSubmitLoader = false;
            $scope.onSubmitResult = true;
            $scope.userCreditDetials = response.data;
            $scope.totalItems = response.total;
            $scope.currentPage = response.current_page;
            $scope.perPage = response.per_page;console.log($scope.userCreditDetials);
            if (pageNumber == 1) {
                setTimeout(function() {
                    $scope.currentPage = 1;
                    var previousActive = $('dir-pagination-controls ul li.active').find('a').text();
                    if (Number(previousActive) > 1) {
                        $('dir-pagination-controls ul li:nth-child(2)').find('a').click();
                    }
                }, 400);

            } 

        }, function errorCallback(response) {

        });
        
    };

    $scope.searchRecord = function() {
        var $rows = $('#customer-datatable-buttons tbody tr');
        $('#search_record').keyup(function() {
            var val = $.trim($(this).val()).replace(/ +/g, ' ').toLowerCase();

            $rows.show().filter(function() {
                var text = $(this).text().replace(/\s+/g, ' ').toLowerCase();
                return !~text.indexOf(val);
            }).hide();
        });
    };

    $scope.approveCredit = function(id) {
            var data = { customer_id: id };
            var url = '/api/approveCredit';
            var approve = CreditService.post(data, url);
            approve.then(function successCallback(response) {
                // console.log('approve');
                if (response.data.error) {
                    swal({
                        title: "Error!",
                        text: response.data.error.message,
                        type: "warning",
                        showCancelButton: false,
                        closeOnConfirm: true
                    }, function() {
                        $window.location.href = '/credit-list';
                    });
                } else if (response.data.success) {
                    swal({
                        title: "Update!",
                        text: response.data.success.message,
                        type: "success",
                        showCancelButton: false,
                        closeOnConfirm: true
                    }, function() {
                        $window.location.href = '/credit-list';
                    });
                }
            });
        },
        function errorCallback(response) {

        };

}]);
