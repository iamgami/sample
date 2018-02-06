app.controller('DriverController', ['$scope', '$http', 'SweetAlert', '$window', '$location', '$stateParams', 'reportServices', 'DriverService','CommonService','$localStorage','$rootScope', function($scope, $http, SweetAlert, $window, $location, $stateParams, reportServices, DriverService, CommonService, $localStorage, $rootScope) {
    $scope.driverDetials = {};
    $scope.itemsPerPage = 10;
    $scope.itemsPerPageDriver = 10;
    $scope.itemsPerPageDriverStatus = 10;
    $scope.currentPage = 0;
    $scope.currentPageDriver = 0;
    $scope.currentPageDriverStatus = 0;
    $scope.reverse = '';
    /*$scope.driver ={};
    $scope.driver.type=10;*/
    $scope.driver = {};
    $scope.driver.type = "10";

    $scope.terminate = {};

    $rootScope.changeMaalgaadiCity = function(){
        $scope.maalgaadi_city_id = $rootScope.default_city_id;
        $localStorage.defaultCityId = $rootScope.default_city_id;
    } 
    $scope.range = function() {
        var rangeSize = 5;
        var ret = [];
        var start;

        start = $scope.currentPage;
        if (start > $scope.pageCount() - rangeSize) {
            start = $scope.pageCount() - rangeSize + 1;
        }

        for (var i = start; i < start + rangeSize; i++) {
            ret.push(i);
        }
        return ret;
    };
    $scope.setNumberDetials = function() {
        $scope.itemsPerPage = $scope.number;
    };
    // $scope.getVechicleCategory($rootScope.auth.city_id);
    $scope.getVechicleCategory = function(cityId) {       
        var data = {city_id: cityId};
        $scope.vehicleCategoryDetials = []
        var dataResponse = CommonService.getDetails(data, 'vehicle');
        dataResponse.then(function successCallback(response) {
            $scope.vehicleCategoryDetials = response.result;
        }, function errorCallback(response) {});
    };
    // console.log($rootScope.auth,'auth');
    
    $scope.mgidAlready = false;
    $scope.checkMGid = function() {
        var data = { mgid: $scope.driver.mg_id };
        $http({
            method: 'GET',
            url: '/api/checkMgidDriver',
            params: data
        }).then(function successCallback(response) {

            if (response.data.success) {
                $scope.mgidAlready = true;
            } else {
                $scope.mgidAlready = false;
            }
        }, function errorCallback(response) {});
    };

    $scope.phoneAlready = false;
    $scope.checkPhone = function() {
        var data = { phone: $scope.driver.driver_number };
        $http({
            method: 'GET',
            url: '/api/checkPhoneDriver',
            params: data
        }).then(function successCallback(response) {

            if (response.data.success) {
                $scope.phoneAlready = true;
            } else {
                $scope.phoneAlready = false;
            }
        }, function errorCallback(response) {});
    };
    $scope.dirivervalue = false;
    $scope.addDriver = function(driver) {

        if ($scope.driver != undefined) {

            $http({
                method: 'POST',
                url: '/api/driver',
                params: driver
            }).then(function successCallback(response) {
                if (response.data.success) {
                    swal({
                        title: "Success!",
                        text: response.data.success.message,
                        type: "success",
                        showCancelButton: false,
                        closeOnConfirm: false
                    }, function() {
                        location.href = '/driver-list';
                    });
                    $scope.getDriver();
                } else {
                    $scope.dirivervalue = false;
                }


            }, function errorCallback(response) {

            });
        }
    };

    $scope.showTableFlag = false;
    $scope.getDriver = function() {
        $http({
            method: 'GET',
            url: '/api/driver'
        }).then(function successCallback(response) {
            console.log(response.data);
            if (response.data.success) {
                console.log(response.data);
                $scope.showTableFlag = true;
                $scope.driverDetials = response.data.result;
                setTimeout(function() {
                    $(document).ready(function() {
                        $('#driver-datatable-buttons').DataTable({
                            "order": [
                                [0, "desc"]
                            ],
                            "lengthMenu": [
                                [10, 25, 50, -1],
                                [10, 25, 50, "All"]
                            ]
                        });
                    });

                    $('#column1_search').on('keyup', function() {
                        console.log('Nj');
                        $('#driver-datatable-buttons').DataTable()
                            .columns(1)
                            .search(this.value)
                            .draw();
                    });
                    $('#column2_search').on('keyup', function() {
                        $('#driver-datatable-buttons').DataTable()
                            .columns(2)
                            .search(this.value)
                            .draw();
                    });
                    $('#column3_search').on('keyup', function() {
                        $('#driver-datatable-buttons').DataTable()
                            .columns(3)
                            .search(this.value)
                            .draw();
                    });

                    $('#column4_search').on('keyup', function() {
                        $('#driver-datatable-buttons').DataTable()
                            .columns(6)
                            .search(this.value)
                            .draw();
                    });
                }, 2000);
            }

        }, function errorCallback(response) {

        });
    };
    // $scope.getDriver();

    $scope.editable = function() {

        $http({
            method: 'GET',
            url: '/api/drivers/' + $stateParams.driverId,
        }).then(function successCallback(response) {
            $scope.driver = response.data;console.log($scope.driver,'drivera');
            $scope.getVechicleCategory($scope.driver.city_id);
            $scope.driver.driver_vehicle = response.data.vehicle_category_id;
        }, function errorCallback(response) {});

    };

    $scope.editdriver = function(driver) {
        var dataResponse = DriverService.editdriver(driver);
        dataResponse.then(function successCallback(response) {
            $location.path('driver-list');
        }, function errorCallback(response) {});
    };

    $scope.deletedriver = function(id) {
        console.log($scope.terminate.reason)

        if ($scope.terminate.reason == '' || $scope.terminate.reason == undefined) {
            $scope.terminate.error = 'Please enter reason first';
            return false;
        }

        var data = { reason: $scope.terminate.reason , resume_date : $scope.terminate.resume_date};

        $http({
            method: 'DELETE',
            url: '/api/driver/' + $scope.terminate.id,
            params: data,
        }).then(function successCallback(response) {
                if (response.data == 'Sent successfully') {
                    $scope.terminate.reason = '';
                    $('#myModal').modal('toggle');
                    $window.location.href = '/driver-list';
                } else {
                    $scope.terminate.error = 'Driver is not terminated please try after some time';
                }

            },
            function errorCallback(response) {});
    };


    $scope.sort_by = function(newSortingOrder) {

        if ($scope.sortingOrder == newSortingOrder) {
            $scope.reverse = !$scope.reverse;
        }
        //console.log($scope.reverse)
        $scope.sortingOrder = newSortingOrder;
    };
    $scope.showTableFlag = false;

    $scope.getAllDriverDetials = function(pagenum = '', requestType = '') {
         var typeval=$scope.driver.type;
        var data = { page: pagenum,type:typeval };
        //$scope.type =10; 
        console.log(pagenum);
        var dataResponse = DriverService.getAllDriverDetials(data);
        dataResponse.then(function successCallback(response) {
            if (response.data.success) {
                //console.log(response.data); 
                $scope.showTableFlag = true;
                $scope.totalItems = response.data.result.total;
                $scope.currentPage = response.data.result.current_page;
                $scope.perPage = response.data.result.per_page;
                $scope.AllDriverStatus = response.data.result.data;
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
            $scope.AllDriverStatusLength = response.data.length;
        }, function errorCallback(response) {});
    };



    $scope.activateDriver = function() {
        if ($scope.activate.reason == '' || $scope.activate.reason == undefined) {
            $scope.activate.error = 'Please enter reason first';
            return false;
        }
        var data = { reason: $scope.activate.reason };
        var dataResponse = DriverService.activateDriver($scope.activationId, data);
        dataResponse.then(function successCallback(response) {
            if (response.data.success) {
                $scope.terminate.reason = '';
                $('#myModal').modal('toggle');
                $window.location.href = '/driver-list';
            } else if (response.data.error) {
                SweetAlert.swal("Error!", response.data.error.message, "error");
            }
        }, function errorCallback(response) {});
    };

    $scope.getDriverTerminateDetials = function(id) {
        $scope.terminate.id = id;
        $scope.terminate.error = '';
    }


    $scope.getTerminateDetialsPageChange = function(newPage) {
        getTerminateDetials(newPage);
    }

    function getTerminateDetials(pagenum) {
        $scope.onsubmitReportDataShow = true;
        $scope.reportDataShow = false;
        var data = { page: pagenum };
        var getPostsData = reportServices.getTerminateDetials(data);
        getPostsData.then(function(response) {
            $scope.onsubmitReportDataShow = false;
            $scope.reportDataShow = true;
            $scope.driverTermination = response.data.data;
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
    $scope.getDriverTerminateAutocomplete = function() {
        var postData = reportServices.getDriverAutocomplete();
        postData.then(function successCallback(response) {
            $scope.driver_name = response.data.driverName;
            $scope.driver_number = response.data.driverNumber;
            $scope.terminated_by = response.data.terminatedBy;
            $scope.driver_mgId = response.data.driverMgId;
            $("#driver_name").autocomplete({ source: $scope.driver_name });
            $("#driver_number").autocomplete({ source: $scope.driver_number });
            $("#terminated_by").autocomplete({ source: $scope.terminated_by });
            $("#driver_mgId").autocomplete({ source: $scope.driver_mgId });
            $scope.loadingIsDones = true;
        }, function errorCallback(response) {});
    };
    $scope.getDriverTerminateAutocomplete();

    $scope.getDriverTerminationPageChange = function(driver, newPage) {
        getDriverTerminationSearch(driver, newPage);
    };

    function getDriverTerminationSearch(driverList, pagenum) {
        $scope.onsubmitReportDataShow = true;
        $scope.reportDataShow = false;

        var datanew = { page: pagenum, driver_name: driverList.driver_name, driver_number: driverList.driver_number, driver_mgId: driverList.driver_mgId, terminated_by: driverList.terminated_by };
        var customerdata = reportServices.getDriverTerminationSearch(datanew);
        customerdata.then(function(response) {
            $scope.onsubmitReportDataShow = false;
            $scope.reportDataShow = true;
            $scope.driverTermination = response.data.data;
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
    $scope.getActivateDetails = function(id) {
        $scope.activationId = id;
        $scope.activate = [];
    };

    $scope.exportTerminationReport = function(searchBy) {
        var cityId = '';
         if(angular.isUndefined($scope.maalgaadi_city_id)){
            return false;
        }
        cityId = $scope.maalgaadi_city_id;
        window.location = '/api/getTerminateReport?export=excel&city_id='+ cityId ;
    }

    $scope.getTerminationReport = function(pagenum = 1, searchBy) {
        if(angular.isUndefined($scope.maalgaadi_city_id)){
            return false;
        }

        $scope.onSubmitLoader = true;
        $scope.showTableFlag = false;
        var data = { type: $scope.type, page: pagenum, searchBy: searchBy, city_id: $scope.maalgaadi_city_id  };
        var dataResponse = CommonService.getDetails(data, 'getTerminateReport');
        dataResponse.then(function successCallback(response) {
            $scope.showTableFlag = true;
            $scope.onSubmitLoader = false;
            $scope.driverTermination = response.data;
            $scope.totalItems = response.pagination.total;
            $scope.currentPage = response.pagination.current_page;
            $scope.perPage = response.pagination.per_page;
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

    $scope.getDriverListAutocomplete = function() {
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
      $scope.searchRecordBookingList = function() {
            var $rows = $('#driver-list tbody tr');
            $('#search_record').keyup(function() {
                var val = $.trim($(this).val()).replace(/ +/g, ' ').toLowerCase();

                $rows.show().filter(function() {
                    var text = $(this).text().replace(/\s+/g, ' ').toLowerCase();
                    return !~text.indexOf(val);
                }).hide();
            });
        };

    $scope.searchDriver = function(serchBy,pagenum=1,requestType=1) {
        if(angular.isUndefined($scope.maalgaadi_city_id)){
            return false;
        }
        serchBy.city_id = $scope.maalgaadi_city_id;
        $scope.onSubmitLoader = true;
        $scope.onSubmitResult = false;
        var typeval = $scope.driver.type;
        var data = {page: pagenum,type:typeval,driver_name:serchBy.driver_name,driver_number:serchBy.driver_number,city_id:serchBy.city_id,driver_mgId:serchBy.driver_mgId };
        
        var dataResponse = DriverService.searchDriver(data);
        $scope.message = false;

       dataResponse.then(function successCallback(response) { 
            $scope.onSubmitLoader = false;
            $scope.onSubmitResult = true;
            if (response.data.success) 
            {

                $scope.totalItems = response.data.result.total;
                $scope.currentPage = response.data.result.current_page;
                $scope.perPage = response.data.result.per_page;
                $scope.AllDriverStatus = response.data.result.data;
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
            else if(response.data.length == 0)
            {
                $scope.AllDriverStatus = response.data.length;
                
                $scope.totalItems = 0;
                $scope.currentPage = 0;
                $scope.perPage = 0;
            }

            $scope.AllDriverStatusLength = response.data.length;
        }, function errorCallback(response) {});

    }

    $scope.exportDriver = function(serchBy) {
        if(angular.isUndefined($scope.maalgaadi_city_id)){
            return false;
        }
        var driverName = '';
        if(angular.isDefined(serchBy.driver_name)){
            driverName = serchBy.driver_name;
        }
        var driverNumber = '';
        if(angular.isDefined(serchBy.driver_number)){
            driverNumber = serchBy.driver_number;
        }
        
        var driverMgId = '';
        if(angular.isDefined(serchBy.driver_mgId)){
            driverMgId = serchBy.driver_mgId;
        }
        serchBy.city_id = $scope.maalgaadi_city_id;
        var data = serchBy;

        window.location = 'api/searchDriver?export=excel&driver_name=' + driverName + '&driver_number='+ driverNumber + '&city_id='+serchBy.city_id+'&driver_mgId='+driverMgId;


    }
    $scope.resetDriverSearch = function() {
        $scope.AllDriverStatus = [];
        $scope.driver = [];
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
    $scope.getDriverAppSetting = function() {

        var dataResponse = DriverService.getDriverAppSetting();
        dataResponse.then(function successCallback(response) {

            if (response.data.success.data.value == '1') {
                $scope.setting.allow_vehicle_category = 'yes';
            } else {
                $scope.setting.allow_vehicle_category = 'no';
            }

            if (response.data.success.time_data.value ) {
                $scope.setting.driver_booking_buffer_time = response.data.success.time_data.value
            } else {
                $scope.setting.driver_booking_buffer_time = 5;
            }
        });
    };

    $scope.updateDriverAppSetting = function(setting) {
        var data = { allow_vehicle_category: setting.allow_vehicle_category , driver_booking_buffer_time : setting.driver_booking_buffer_time };
        var dataResponse = DriverService.updateDriverAppSetting(data);
        dataResponse.then(function successCallback(response) {
            SweetAlert.swal({
                title: 'Sucesss',
                text: 'Setting Update Successfully.',
                type: "success",
                showCancelButton: false,
                closeOnConfirm: false
            }, function() {
                location.href = '/driver-app-setting';
            });


        });
    };

    $scope.converPrime = function(id,status) {
        var data = {id: id, status : status};
        SweetAlert.swal({
            title: "Are you sure?",
            text: "You want to convert it!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes",
            closeOnConfirm: false
        }, function(isConfirm) {
            if (isConfirm) {
                $http({
                    method: 'POST',
                    url: '/api/updateDriverPrime',
                    params : data
                }).then(function successCallback(response) {
                    swal({
                        title: "Success",
                        text: "Changed Successfully!",
                        type: "success",
                        showCancelButton: false,
                        closeOnConfirm: false
                     }, function() {
                        location.href = '/driver-list';
                    });
                }, function errorCallback(response) {});
            }
        });
    };

}]);
