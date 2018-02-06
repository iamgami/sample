app.controller('SettingController', ['$http', '$scope', 'SweetAlert', 'DiscountService', '$window', 'UserService','$rootScope','$localStorage',  function($http, $scope, SweetAlert, DiscountService, $window,UserService, $rootScope, $localStorage) {
    //get all user with discount
    $scope.setting = {};
    $scope.surgeArea = {};

    $rootScope.changeMaalgaadiCity = function(){
        $scope.maalgaadi_city_id = $rootScope.default_city_id;
        $localStorage.defaultCityId = $rootScope.default_city_id;
    }

    $scope.getFavouriteDriverSetting = function(){
        $scope.setting ={}
        $scope.setting.customer_allowed_favourite_driver = 0;
        $scope.setting.driver_allowed_favourite_customer = 0;
        $http({
                method: 'GET',
                url: '/api/getFavouriteDriverSetting',
            }).then(function successCallback(response) {
                if(angular.isDefined(response.data.success.data)){
                    var responseData = response.data.success.data;
                    $scope.setting.customer_allowed_favourite_driver = responseData.customer_allowed_favourite_driver;
                    $scope.setting.driver_allowed_favourite_customer = responseData.driver_allowed_favourite_customer;
                }
            },
            function errorCallback(response) {});
    }

    $scope.updatefavouriteDriverSetting = function(setting){
        console.log(setting);
        var data = { customer_allowed_favourite_driver: setting.customer_allowed_favourite_driver, driver_allowed_favourite_customer: setting.driver_allowed_favourite_customer}
        $http({
            method: 'GET',
            url: '/api/updatefavouriteDriverSetting',
            params: data
        }).then(function successCallback(response) {
            if (response.data.success) {
                SweetAlert.swal({
                    title: 'Sucesss',
                    text: 'Setting Update Successfully.',
                    type: "success",
                    showCancelButton: false,
                    closeOnConfirm: true
                }, function() {
                    // location.href = '/customer-app-setting';
                });
            }
        }, function errorCallback(response) {

        });
    }

    $scope.getCommonSetting = function(){
        $scope.setting ={}
        $scope.setting.max_allow_distance = 80;
        $http({
                method: 'GET',
                url: '/api/getCommonSetting',
            }).then(function successCallback(response) {
                if(angular.isDefined(response.data.success.data)){
                    var responseData = response.data.success.data;
                    $scope.setting.max_allow_distance = responseData.max_allow_distance;
                }
            },
            function errorCallback(response) {});
    }

    $scope.updateCommonSetting = function(setting){
        var data = { max_allow_distance: setting.max_allow_distance}
        $http({
            method: 'GET',
            url: '/api/updateCommonSetting',
            params: data
        }).then(function successCallback(response) {
            console.log(response);
            if (response.data.success) {
                SweetAlert.swal({
                    title: 'Sucesss',
                    text: 'Setting Update Successfully.',
                    type: "success",
                    showCancelButton: false,
                    closeOnConfirm: true
                }, function() {
                    // location.href = '/customer-app-setting';
                });
            }
        }, function errorCallback(response) {

        });
    };

    $scope.getAllotmentSetting = function() {
        var allotmentDetails = UserService.getAllotmentSetting();
        allotmentDetails.then(function(response) {
            $scope.allotmentDetail = response;
            // $scope.usersLength = response.data.length;
        });
    };

    $scope.deleteFromSetting = function(base) {
        $scope.setting.employee  = base.employee_id;
    
        UserService.deleteFromSetting($scope.setting.employee);  
    };

   $scope.allotmentLogout = function(base) {
           
        if(base.login_status=='true'){ 
                var logoutSuceess = UserService.allotmentLogout(base.employee_id);  
                logoutSuceess.then(function(response) {
                $scope.allotmentDetail=response.data;
                    if(response.success){
                        SweetAlert.swal({
                            title: "Success",
                            text: "Logout Successfully",
                            type: "success",
                            showCancelButton: false,
                            closeOnConfirm: true
                         }, function() {
                            
                        });
                        $scope.btnText = 'Logout';
                    } else {
                        SweetAlert.swal({
                            showCancelButton: false,
                            closeOnConfirm: true
                        });
                    }
                });
        }
        else
        { 
        SweetAlert.swal({
                        title: "Already Logout",
                        text: " ",
                        type: "success",
                        showCancelButton: true,
                        showConfirmButton :false,
                        closeOnConfirm: true
                     }, function() {
                        
                    }); 
        }
    };
    $scope.editAllotment = function(base) {
        $scope.setting.employee  = base.employee_id;
        $scope.setting.name  = base.name;
        $scope.setting.max_limit  = base.max_limit;
        console.log('employee'+ $scope.setting.employee );        
    };
    $scope.updateAllotmentSetting = function(usage){     
        var data = {employee : usage.employee, limit : usage.max_limit};
 
        var allotments = UserService.updateAllotmentSetting(data);
        allotments.then(function(response) {
        $scope.allotmentDetail=response.data;

            if(response.success){
                SweetAlert.swal({
                    title: "Success",
                    text: "Added Successfully",
                    type: "success",
                    showCancelButton: false,
                    closeOnConfirm: true
                 }, function() {
                    $("#allotmentEdit").modal('hide');
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

    $scope.getAutomaticBookings = function(pageNumber = '') {

        var customer_org = '';
        var booking_id = '';
        var endDate = '';
        var startDate = '';
        var status = '';
        $scope.total = 0;
        $scope.message = false;
        if (angular.isDefined($scope.report)) {
            if (angular.isDefined($scope.report.booking_id)) {
                booking_id = $scope.report.booking_id;
            }
            if (angular.isDefined($scope.report.startDate)) {
                startDate = $scope.report.startDate;
            }
            if (angular.isDefined($scope.report.endDate)) {
                endDate = $scope.report.endDate;
            }
            if (angular.isDefined($scope.report.status)) {
                status = $scope.report.status;
            }
        }
        
        var data = { page: pageNumber, booking_id: booking_id, startDate: startDate, endDate: endDate, status: status };
        $http({
            method: 'GET',
            url: '/api/getAutomaticBookings',
            params: data
        }).then(function successCallback(response) {
            if (response.data.data.length) {
                $scope.automaticBookingDetialsList = response.data.data;
                $scope.message = false;
            } else {
                $scope.automaticBookingDetialsList = {};
                $scope.message = true;
            }

        }, function errorCallback(response) {});
    };

    $scope.automaticAllotmentChart = function() {
        $http({
            method: 'GET',
            url: '/api/getDailyAutomaticAllotment'
        }).then(function successCallback(response) {
            $window.automaticAllotmentResult = response.data;
            // console.log($window.driverLoginAnalytics);
            google.charts.load('current', {
                'packages': ['corechart']
            });
            google.charts.setOnLoadCallback(drawChart);

            function drawChart() {
                var data = new google.visualization.DataTable();
                data.addColumn('string', 'Date');
                
                data.addColumn('number', 'Driver Self Allotment');
                data.addColumn('number', 'Automatic Allotment');
                var dataArray = [];
                for (var i = 0; i < $window.automaticAllotmentResult.length; i++) {console.log($window.automaticAllotmentResult);
                    var temp = [$window.automaticAllotmentResult[i].date, $window.automaticAllotmentResult[i].app_allot, $window.automaticAllotmentResult[i].autometic_allot];
                    dataArray.push(temp);
                }
                console.log(dataArray);
                data.addRows(dataArray);
                var options = {
                                isStacked: true,title: 'Automatic Allotment Chart',
                                hAxis: {title: 'Date'},
                                vAxis: {title: 'Number'},
                                colors: ['#AB0D06', '#004565'],
                                seriesType: 'bars',
                              };
                var chart = new google.visualization.ComboChart(document.getElementById('automatic-allotment-chart'));
                chart.draw(data, options);
            }
        });
    };

    // Maalgaadi settings
    $scope.addMaalgaadiSettings = function(maalgaadiSetting) {
        $http({
            method: 'GET',
            url: '/api/addMaalgaadiSettings',
            params : maalgaadiSetting
        }).then(function successCallback(response) {
            if (response.data.success) {
                SweetAlert.swal({
                    title: 'Sucesss',
                    text: 'Setting Update Successfully.',
                    type: "success",
                    showCancelButton: false,
                    closeOnConfirm: false
                }, function() {
                    location.href = '/maalgaadi-settings';
                });
            }
        }, function errorCallback(response) {

        });
    }
    
    // Get Maalgaadi Settings
    $scope.getMaalgaadiSettings = function(city_id) {
        if(angular.isUndefined(city_id)){
            city_id = $localStorage.defaultCityId;
        }
        var data = {city_id : city_id };
        $http({
            method: 'GET',
            url: '/api/getMaalgaadiSettings',
            params : data
        }).then(function successCallback(response) {
            if (response.data.error) {
                SweetAlert.swal({
                    title: 'Error',
                    text: 'No reocrd found.',
                    type: "error",
                    showCancelButton: false,
                    closeOnConfirm: false
                }, function() {
                    location.href = '/maalgaadi-settings';
                });
            }
            else
            {
                $scope.maalgaadiSetting = response.data.data;
                $scope.maalgaadiSetting.app_allow_tab = response.data.data.app_allow_tab;
                $scope.maalgaadiSetting.allow_max_radiant = response.data.data.allow_max_radiant/1000;
                $scope.maalgaadiSetting.allow_min_route = response.data.data.allow_min_route/1000;
                $scope.maalgaadiSetting.allow_max_route = response.data.data.allow_max_route/1000;
                if(response.data.data.allow_vehicle_category == 1)
                {
                    $scope.maalgaadiSetting.allow_vehicle_category = 'yes';
                }
                else
                {
                    $scope.maalgaadiSetting.allow_vehicle_category = 'no';
                }
            }
        }, function errorCallback(response) {
            
        });
    };

    $scope.getSurgeArea = function(){
        $scope.surge ={}
        $http({
            method: 'GET',
            url: '/api/getSurgeArea',
        }).then(function successCallback(response) {
            $scope.getSurgeArea = response.data.data;
        },
        function errorCallback(response) {});
    }



    
    $scope.editdSurgeMap = function(id){
        var data = {id :id };
        $http({
            method: 'GET',
            url: '/api/getSingleSurgeArea',
            params : data
        }).then(function successCallback(response) {
            $scope.surgeArea = response.data.data;
            $scope.surgeArea.surge_time_from = new Date(response.data.data.surge_time_from);
            $scope.surgeArea.surge_time_to = new Date(response.data.data.surge_time_to); 
            setTimeout(function(){ 
                $scope.surgeArea.surge_area_latlng = response.data.data.surge_area_latlng;
                $scope.surgeArea.surge_date_from = parseInt(response.data.data.surge_date_from);
                $scope.surgeArea.surge_date_to = parseInt(response.data.data.surge_date_to); 
                var map = new google.maps.Map(document.getElementById('surgeMap'), {
                  center: {lat: 22.73549852921309, lng: 75.85424423217773},
                  zoom: 12
                });
                var obj = JSON.parse($scope.surgeArea.surge_area_latlng);
                var triangleCoords = obj;
                var myShap = new google.maps.Polygon({
                  paths: triangleCoords,
                  strokeColor: '#FF0000',
                  strokeOpacity: 0.8,
                  strokeWeight: 2,
                  fillColor: '#FF0000',
                  fillOpacity: 0.35
                });
                
                myShap.setMap(map);
                var drawingManager = new google.maps.drawing.DrawingManager({
                  drawingMode: google.maps.drawing.OverlayType.MARKER,

                  drawingControl: true,
                  drawingControlOptions: {
                    position: google.maps.ControlPosition.TOP_CENTER,
                    drawingModes: [  'polygon']
                  },
                  markerOptions: {icon: 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png'},
                  circleOptions: {
                    fillColor: '#ffff00',
                    fillOpacity: 1,
                    strokeWeight: 5,
                    clickable: false,
                    editable: true,
                    zIndex: 1
                  }
                });
                drawingManager.setMap(map);
                var dataL = [];
                google.maps.event.addListener(drawingManager, 'polygoncomplete', function (polygon) {
                    var coordinates = (polygon.getPath().getArray());
                    
                    for (var i = 0; i < coordinates.length; i++) {
                      lat = coordinates[i].lat();
                      lng = coordinates[i].lng();
                      dataL[i] = {lat: lat,lng : lng};
                    }
                    $scope.surgeArea.surge_area_latlng = JSON.stringify(dataL);
                    $("#surge_area_latlng").val(JSON.stringify(dataL));
                    console.log(dataL);
                });
            }, 3000);
        },
        function errorCallback(response) {});
    };

    $scope.newSurgeMap = function(){
        $scope.surgeArea  = {};
        setTimeout(function(){ 
            var map = new google.maps.Map(document.getElementById('surgeMap'), {
              center: {lat: 22.7196, lng: 75.8577},
              zoom: 12
            });

            var drawingManager = new google.maps.drawing.DrawingManager({
              drawingMode: google.maps.drawing.OverlayType.MARKER,
              drawingControl: true,
              drawingControlOptions: {
                position: google.maps.ControlPosition.TOP_CENTER,
                drawingModes: [ 'polygon']
              },
              markerOptions: {icon: 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png'},
              circleOptions: {
                fillColor: '#ffff00',
                fillOpacity: 1,
                strokeWeight: 5,
                clickable: false,
                editable: true,
                zIndex: 1
              }
            });
            drawingManager.setMap(map);
            var dataL = [];
                google.maps.event.addListener(drawingManager, 'polygoncomplete', function (polygon) {
                    var coordinates = (polygon.getPath().getArray());
                    for (var i = 0; i < coordinates.length; i++) {
                      lat = coordinates[i].lat();
                      lng = coordinates[i].lng();
                      dataL[i] = {lat: lat,lng : lng};
                    }
                    $scope.surgeArea.surge_area_latlng = JSON.stringify(dataL);
                    $("#surge_area_latlng").val(JSON.stringify(dataL));
                });
        }, 3000);

    };

    $scope.updateSurge = function(surge){
        $http({
            method: 'GET',
            url: '/api/updateSurgeArea',
            params : surge
        }).then(function successCallback(response) {
             swal({
                title: "Success",
                text: "Update Successfully!",
                type: "success",
                showCancelButton: false,
                closeOnConfirm: false
            }, function() {
                location.href = '/area-surge-settings';
            });
        },
        function errorCallback(response) {});
    };

    $scope.ddValue = [];
    $scope.getNumOfDays = function() {
        for (var i = 1; i < 32; i++) 
        {
            $scope.ddValue.push(i);
        }
    };

    $scope.deleteSurgeArea = function(id){
        var data = {id : id};
        SweetAlert.swal({
            title: "Are you sure?",
            text: "You want to delete this record.",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes",
            closeOnConfirm: false
        }, function(isConfirm) {
            if (isConfirm) {
                $http({
                    method: 'GET',
                    url: '/api/deleteSurgeArea',
                    params : data
                }).then(function successCallback(response) {
                    swal({
                        title: "Success",
                        text: "Remove Successfully!",
                        type: "success",
                        showCancelButton: false,
                        closeOnConfirm: false
                    }, function() {
                        location.href = '/area-surge-settings';
                    });
                }, function errorCallback(response) {});
            }
        });
    };

    $scope.getCashBack = function(){
        $scope.cashback ={}
        $http({
            method: 'GET',
            url: '/api/getCashBack',
        }).then(function successCallback(response) {
            $scope.getCashBack = response.data.success.data;
            console.log($scope.getCashBack);
        },
        function errorCallback(response) {});
    }

    $scope.addCashBack = function(){
        $scope.cashback = {};
    }
    $scope.updateCashBack = function(cashback){
        $http({
            method: 'GET',
            url: '/api/updateCashBack',
            params : cashback
        }).then(function successCallback(response) {
            console.log(response);
             if(response.data.success){
                SweetAlert.swal({
                    title: "Success",
                    text: "Added Successfully",
                    type: "success",
                    showCancelButton: false,
                    closeOnConfirm: true
                 }, function() {
                    $("#cashbackPopup").modal('hide');
                });
                location.href = '/cash-back-settings';
            } else {
                 SweetAlert.swal({
                    title: "Error",
                    text: response.data.error.message,
                    type: "error",
                    showCancelButton: false,
                    closeOnConfirm: true
                });
            }
        },
        function errorCallback(response) {});
    };
    $scope.cashback = {};
    $scope.editdCashback = function(cashback){
        $scope.cashback = cashback;
    };

    $scope.deleteCashback = function(id){
        var data = {id : id};
        SweetAlert.swal({
            title: "Are you sure?",
            text: "You want to delete this record.",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes",
            closeOnConfirm: false
        }, function(isConfirm) {
            if (isConfirm) {
                $http({
                    method: 'GET',
                    url: '/api/deleteCashback',
                    params : data
                }).then(function successCallback(response) {
                    swal({
                        title: "Success",
                        text: "Remove Successfully!",
                        type: "success",
                        showCancelButton: false,
                        closeOnConfirm: false
                    }, function() {
                        location.href = '/cash-back-settings';
                    });
                }, function errorCallback(response) {});
            }
        });
    };
    
    // Maalgaadi settings
    $scope.addMaalgaadiPrimeSettings = function(maalgaadiSetting) {
        $http({
            method: 'GET',
            url: '/api/addMaalgaadiPrimeSettings',
            params : maalgaadiSetting
        }).then(function successCallback(response) {
            if (response.data.success) {
                SweetAlert.swal({
                    title: 'Sucesss',
                    text: 'Setting Update Successfully.',
                    type: "success",
                    showCancelButton: false,
                    closeOnConfirm: false
                }, function() {
                    location.href = '/prime-driver-settings';
                });
            }
        }, function errorCallback(response) {

        });
    }
    
    // Get Maalgaadi Settings
    $scope.getPrimeDriverSettings = function(city_id) {
        if(angular.isUndefined(city_id)){
            city_id = $localStorage.defaultCityId;
        }
        var data = {city_id : city_id };
        $http({
            method: 'GET',
            url: '/api/getPrimeDriverSettings',
            params : data
        }).then(function successCallback(response) {
            if (response.data.error) {
                SweetAlert.swal({
                    title: 'Error',
                    text: 'No reocrd found.',
                    type: "error",
                    showCancelButton: false,
                    closeOnConfirm: false
                }, function() {
                    location.href = '/prime-driver-settings';
                });
            }
            else
            {
                $scope.maalgaadiSetting = response.data.data;
            }
        }, function errorCallback(response) {
            
        });
    };

}]);
