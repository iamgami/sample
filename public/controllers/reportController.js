app.controller('ReportController', ['$scope', '$http', '$stateParams', 'bookingReportServices', '$q', 'reportServices', 'SweetAlert','CommonService','$rootScope','$localStorage','$state', function($scope, $http, $stateParams, bookingReportServices, $q, reportServices, SweetAlert, CommonService, $rootScope, $localStorage, $state) {
    //$scope.booking_status = 'pending';
    $scope.type = '10';
    $scope.itemsPerPage = 5;
    $scope.itemsPerPageDriverWallet = 10;
    $scope.itemsPerPageCustomerWallet = 10;
    $scope.itemsPerPageCustWallet = 10;
    $scope.itemsPerPageDriverLogin = 10;
    $scope.itemsPerPageCancelBooking = 10;
    $scope.currentPage = 0;
    $scope.currentPageCustWallet = 0;
    $scope.currentPageDriverWallet = 0;
    $scope.currentPageCustomerWallet = 0;
    $scope.currentPageDriverLogin = 0;
    $scope.currentPageCancelBooking = 0;
    $scope.bookingReportDataLength = 0;
    $scope.cancelBookinglistsLength = 0;
    $scope.message = '';
    $scope.issues_type = '';
    $scope.action = '';
    $scope.organization = [];
    $scope.customer_name = [];
    $scope.searchBookingReport = {};
    $scope.searchBooking = {};
    $scope.pagination = {};
    $scope.totalItems = 0;
    $scope.customer = {};

    $scope.searchdata = {};
    $scope.vehiclecat = {};
    $scope.report={};
    $scope.report.type="10";

    $scope.cluster1=0;
    $scope.cluster2=0;
    $scope.cluster3=0;
    $scope.cluster4=0;
    $scope.cluster5=0;
    $scope.cluster6=0;
    var map;
    var infowindow = new google.maps.InfoWindow();

   $rootScope.changeMaalgaadiCity = function(){
        $scope.maalgaadi_city_id = $rootScope.default_city_id;
        $localStorage.defaultCityId = $rootScope.default_city_id;
        $scope.getCallCenterExecutive();
        $scope.getVechicleCategory($localStorage.defaultCityId);
        $scope.getDiscountCouponCode($localStorage.defaultCityId);

    } 
    $scope.clusterBooking = function() {
        var data = { page:1,startDate:$scope.start,endDate:$scope.end};
        var map = new google.maps.Map(document.getElementById('map'), {
            zoom: 14,
            center: {
                lat: 22.7196,
                lng: 75.8577
            }
        });
            // Define the LatLng coordinates for the polygon.
        var triangleCoords1 = [
            {lat:  22.724355, lng: 75.883894}, //
            {lat:22.754507, lng: 75.903547},
            {lat:22.780008, lng:75.849777},
            {lat:22.728667,lng:75.829095}
        ];

        var triangleCoords2 = [
            { lat:  22.724355, lng: 75.883894},
            {lat:22.754507, lng: 75.903547},
            {lat: 22.750348, lng: 75.933654},
            {lat: 22.725066, lng: 75.930538}
        ];

        var triangleCoords3 = [
            { lat:  22.724355, lng: 75.883894},
            { lat:  22.72544464375026, lng:75.92973050211322},
            { lat:  22.695987, lng:75.935033}, //
            { lat: 22.698659, lng:75.881716}
        ];

        var triangleCoords4 = [
            { lat:22.730026, lng:75.831425},
            { lat: 22.724355, lng:75.883894},
            { lat:  22.698659, lng:75.881716}, //
            { lat:22.713562, lng:75.836691}
        ];

        var triangleCoords5 = [
            { lat:  22.719974, lng:75.786565},
            { lat: 22.730026, lng:75.831425},
            { lat: 22.715883, lng:75.834149}, //
            { lat: 22.702215, lng:75.799643}
        ];
        var triangleCoords6 = [
            { lat: 22.715883, lng: 75.834149},
            { lat:22.702215, lng:75.799643},
            { lat: 22.677503, lng:75.857027}, //
            { lat:22.698659, lng:75.881716}
        ]; 


        // Construct the polygon.
        var cluster1 = new google.maps.Polygon({
            map: map, // leter addd
            paths: triangleCoords1,
            strokeColor: '#FF0000',
            strokeOpacity: 0.8,
            strokeWeight: 3,
            fillColor: '#FF0000',
            fillOpacity: 0.35,
            label:"cluster1"
        });

      
        var cluster2 = new google.maps.Polygon({
            paths: triangleCoords2,
            strokeColor: '#0000FF',
            strokeOpacity: 0.8,
            strokeWeight: 3,
            fillColor: '#0000FF',
            fillOpacity: 0.35,
            label:"cluster2"
        });

        var cluster3 = new google.maps.Polygon({
          paths: triangleCoords3,  //yellow
          strokeColor: '#ffcd28',
          strokeOpacity: 0.8,
          strokeWeight: 3,
          fillColor: '#ffcd28',
          fillOpacity: 0.35,
           label:"cluster3"
        });

        var cluster4 = new google.maps.Polygon({
            paths: triangleCoords4,  //yellow
            strokeColor: '#A9D0F5',
            strokeOpacity: 0.8,
            strokeWeight: 3,
            fillColor: '#A9D0F5',
            fillOpacity: 0.35,
            label:"cluster4"
        });
        var cluster5 = new google.maps.Polygon({
            paths: triangleCoords5,  //yellow
            strokeColor: '#C8FE2E',
            strokeOpacity: 0.8,
            strokeWeight: 3,
            fillColor: '#C8FE2E',
            fillOpacity: 0.35,
            label:"cluster5"
        });

        var cluster6 = new google.maps.Polygon({
            paths: triangleCoords6,  //yellow
            strokeColor: '#045FB4',
            strokeOpacity: 0.8,
            strokeWeight: 3,
            fillColor: '#045FB4',
            fillOpacity: 0.35,
            label:"cluster6"
        });

        cluster1.setMap(map);
        cluster2.setMap(map);
        cluster3.setMap(map);
        cluster4.setMap(map);
        cluster5.setMap(map);
        cluster6.setMap(map);

        var count1=0;  var count2=0;  var count3=0; var count4=0;  var count5=0;  var count6=0;
 
         $http({
            method: 'GET',
            url: '/api/clusterBooking',
            params: data
        }).then(function successCallback(response) {
            //console.log(response.data);
             angular.forEach(response.data, function(value, key) {
                var coord = new google.maps.LatLng(value.pickup_lat,value.pickup_lng);
                var marker = new google.maps.Marker({
                    map: map,
                    position: coord
                });             
                var isWithinPolygon1 = google.maps.geometry.poly.containsLocation(coord, cluster1);           
                var isWithinPolygon2 = google.maps.geometry.poly.containsLocation(coord, cluster2);
                var isWithinPolygon3 = google.maps.geometry.poly.containsLocation(coord, cluster3);        
               
                var isWithinPolygon4 = google.maps.geometry.poly.containsLocation(coord, cluster4);           
                var isWithinPolygon5 = google.maps.geometry.poly.containsLocation(coord, cluster5);
                var isWithinPolygon6 = google.maps.geometry.poly.containsLocation(coord, cluster6);        
 
                 var title= "";
                if(isWithinPolygon1==true){
                    count1=count1+1;
                    title="cluster1";                  
                }
                if(isWithinPolygon2==true){
                    count2=count2+1;
                    title="cluster2";
                }
                if(isWithinPolygon3==true){
                    count3=count3+1;
                    title="cluster3";
                } 
                if(isWithinPolygon4==true){
                    count4=count4+1;
                    title="cluster4";
                }
                if(isWithinPolygon5==true){
                    count5=count5+1;
                    title="cluster5";
                }
                if(isWithinPolygon6==true){
                    count6=count6+1;
                    title="cluster6";
                } 
                marker.addListener('click', function() {
                    infowindow.setContent(title+' <br>'+value.pickup_lat+' '+value.pickup_lng);
                    infowindow.open(map, marker);
                });

            });
            $scope.cluster1=count1;
            $scope.cluster2=count2;
            $scope.cluster3=count3;
            $scope.cluster4=count4;
            $scope.cluster5=count5;
            $scope.cluster6=count6;         
        }, function errorCallback(response) {});
        //alert(count1+"  || "+count2+" || "+count3+" || "+count4+"  || "+count5+" || "+count6);
        cluster1.addListener('click', showArrays);
        cluster2.addListener('click', showArrays);
        cluster3.addListener('click', showArrays);
        cluster4.addListener('click', showArrays);
        cluster5.addListener('click', showArrays);
        cluster6.addListener('click', showArrays);
        //infoWindow = new google.maps.InfoWindow;    
    };
    /** @this {google.maps.Polygon} */
    function showArrays(event) {  
        alert(this.label);
    }

    $scope.getDriverRating = function(searchBy, pagenum = 1) {
        $scope.onsubmitReportDataShow = true;
        $scope.reportDataShow = false;
        var mg_id = '';

        var data = { page: pagenum, type: $scope.type };
        $http({
            method: 'GET',
            url: '/api/getDriverAvgRage',
            params: data

        }).then(function successCallback(response) {
            //console.log(response.data);

            $scope.onsubmitReportDataShow = false;
            $scope.reportDataShow = true;
            $scope.rating = response.data.data;
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
        }, function errorCallback(response) {});
    };

    $scope.exportDriverRating = function(mgId) {
        window.location = 'api/exportDriverRating?driverId=' + mgId;
    };

    $scope.exportgetDriverRatings = function(driver, pagenum = 1) {
        if(angular.isUndefined($scope.maalgaadi_city_id)){
            return false;
        }
        driver.city_id = $scope.maalgaadi_city_id;
        var driverId = '';
        var cityId = '';
        if(angular.isDefined(driver.mgId)){
            driverId = driver.mgId;
        }
        if(angular.isDefined(driver.city_id)){
            cityId = driver.city_id;
        }else{
            return false;
        }
        window.location = 'api/getDriverRating?export=excel&driverId=' + driverId + '&city_id=' + cityId;
    };

    $scope.getDriverRatings = function(driver, pagenum = 1) {
        var mg_id = '';
        var city_id = '';
        if(angular.isUndefined($scope.maalgaadi_city_id)){
            return false;
        }
        city_id = $scope.maalgaadi_city_id;
        if (angular.isDefined($scope.driver) && angular.isDefined($scope.driver.mgId)) {
            mg_id = $scope.driver.mgId;
        }
        var data = { page: pagenum, driverId: mg_id, type: $scope.type,city_id: city_id };
        
        var ratingDetails = CommonService.getDetails(data, 'getDriverRating');
        ratingDetails.then(function(response) {
            $scope.onsubmitReportDataShow = false;
            $scope.reportDataShow = true;
            $scope.rating = response.data;
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
        }, function(reason) {
            alert("Something went wrong");
        });
    };
    
    $scope.getOrganizationList = function(category) {

        var compareCustomerName = $scope.searchBooking.customer_name;
        var compareCustomerOrg = $scope.searchBooking.organization;

        $scope.customedetails = [];
        console.log($scope.organizationData);
        angular.forEach($scope.organizationData, function(value, key) {
            if (compareCustomerName == value['cust_name'] && category == 'name') {
                $scope.searchBooking.organization = '';
                $scope.searchBooking.organization = value['cust_organization'];
            }

            if (compareCustomerOrg == value['cust_organization'] && category == 'org') {
                $scope.searchBooking.customer_name = '';
                $scope.searchBooking.customer_name = value['cust_name'];
            }

        });
    }


    $scope.getBooking = function() {
        var data = $scope.bookingReport;
        console.log($scope.bookingReport);
        $http({
            method: 'GET',
            url: '/api/bookingReport',
            params: data
        }).then(function successCallback(response) {
            $scope.bookingReportDetials = response.data;
            $scope.bookingReportDetialsLength = response.data;
        }, function errorCallback(response) {});
    };

    $scope.getCustomerWallet = function() {
        var data = $scope.customerReport;
        $http({
            method: 'GET',
            url: '/api/bookingReport',
            params: data
        }).then(function successCallback(response) {
            $scope.bookingReportDetials = response.data;
            $scope.bookingReportDetialsLength = response.data.length;
        }, function errorCallback(response) {});
    };

    $scope.exportData = function(id) {
        var blob = new Blob([document.getElementById(id).innerHTML], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8"
        });
        saveAs(blob, "Report.xls");
    };

    $scope.getBookingDetials = function() {
        var data = $scope.customerReport;
        $http({
            method: 'GET',
            url: '/api/bookingReportData',
            params: data
        }).then(function successCallback(response) {
            console.log(response.data);
            $scope.bookingReportData = response.data;
            $scope.bookingReportDataLength = response.data.length;
        }, function errorCallback(response) {});
    };

    $scope.getDistanceToCustomerReport = function(report) {

        var data = { employee_id: report.employee.id, startDate: report.start, endDate: report.end,city_id: report.city_id };
        $http({
            method: 'GET',
            url: '/api/getDistanceToCustomerReportDetials',
            params: data
        }).then(function successCallback(response) {
            $scope.totalDistanceToCustomer = 0;
            $scope.bookingDetials = response.data;
            angular.forEach(response.data, function(value, key) {
                $scope.totalDistanceToCustomer += parseInt(value.distance_to_customer);
            });
        }, function errorCallback(response) {});
    };
    $scope.getAllotmentReportPageChange = function(report, newPage) {
        getAllotmentReport(report, newPage);
    };

    function getAllotmentReport(driver, pagenum) {
        if(angular.isUndefined($scope.maalgaadi_city_id)){
            return false;
        }
        driver.city_id = $scope.maalgaadi_city_id;
        if (angular.isUndefined(driver.startDate) || angular.isUndefined(driver.endDate) || angular.isUndefined(driver.city_id)) {
            return false;
        }
        $scope.onsubmitReportDataShow = true;
        $scope.reportDataShow = false;
        var data = { page: pagenum, startDate: driver.startDate, endDate: driver.endDate, type: driver.type ,city_id : driver.city_id };
        var allotmentReportResult = CommonService.getDetails(data, 'allotmentDetials');
        allotmentReportResult.then(function(response) {
            $scope.onsubmitReportDataShow = false;
            $scope.reportDataShow = true;
            $scope.allotmentData = response.data;
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
        }, function(reason) {
            alert("Something went wrong");
        });
    }

    $scope.getHourlyPageChange = function(driver, newPage) {
        getHourly(driver, newPage);
    };

    function getHourly(driver, pagenum) {
        if(angular.isUndefined($scope.maalgaadi_city_id)){
            return false;
        }
        driver.city_id = $scope,maalgaadi_city_id;
        $scope.onsubmitReportDataShow = true;
        $scope.reportDataShow = false;
        var data = { page: pagenum, mgId: driver.mgId, startDate: driver.startDate, endDate: driver.endDate,city_id:driver.city_id };
        var ReportResult = reportServices.getHourly(data);
        ReportResult.then(function successCallback(response) {
            $scope.onsubmitReportDataShow = false;
            $scope.reportDataShow = true;
            $scope.hourlyLogin = response.data.data;


        }, function(reason) {
            alert("Something went wrong");
        });
    };

    $scope.exportHourlyAttendance = function(driver) {
        var mgId = '';
        var cityId = '';
        if (angular.isDefined(driver.mgId)) {
            mgId = driver.mgId;
        }
        if (angular.isDefined(driver.city_id)) {
            cityId = driver.city_id;
        }
        window.location = 'api/getDriverLoginHoursReportDetials?startDate=' + driver.startDate + '&endDate=' + driver.endDate + '&mgId=' + mgId + '&export=excel' +'&city_id='+ cityId;;
    }

    $scope.hourlytReport = function() {
        $scope.data = [];
        $scope.totalItems = 0;
        $scope.pageChanged = function(newPage) {
            getResultsPage(newPage);
        };
        getResultsPage(1);

        function getResultsPage(pageNumber) {
            var startDate = '';
            var endDate = '';
            if (angular.isDefined($scope.report)) {
                if (angular.isDefined($scope.report.startDate)) {
                    startDate = $scope.report.startDate;
                }
                if (angular.isDefined($scope.report.endDate)) {
                    endDate = $scope.report.endDate;
                }
            }
            var data = { page: pageNumber, startDate: startDate, endDate: endDate };
            var allotmentReportResult = reportServices.getAllotmentDetail(data);
            allotmentReportResult.then(function(response) {
                $scope.allotmentData = response.data;
                $scope.totalItems = response.pagination.total;
                $scope.currentPage = response.pagination.current_page;
                $scope.perPage = response.pagination.per_page;
            }, function(reason) {
                alert("Something went wrong");
            });
        }
    }

    //END


    // booking-deatil report code  start here
    $scope.pageChanged = function(searchBooking, newPage, requestType) {
        getResultsPage(searchBooking, newPage, requestType);
    };

    function getResultsPage(searchBooking, pageNumber, requestType) {
        $scope.searchBookingReport.booking_id = '';
        $scope.searchBookingReport.customer_name = '';
        $scope.searchBookingReport.trip_charge = '';
        $scope.searchBookingReport.payment_recevied = '';
        $scope.searchBookingReport.booking_status = '';
        $scope.searchBookingReport.customer_org = '';
        $scope.bookingReportDataShow = false;
        $scope.onsubmitbookingReportDataShow = true;
        var customer_id = $("#organization_id").val();
        if(angular.isUndefined($scope.maalgaadi_city_id)){
            return false;
        }
        var data = { customer_id: customer_id, type: $scope.type, page: pageNumber, startDate: $scope.searchBooking.complete_time, endDate: $scope.searchBooking.accept_time, org: $scope.searchBookingReport.customerOrg, allotment_type: $scope.searchBooking.allotment_type, city_id: $scope.maalgaadi_city_id };
        var dataRes = bookingReportServices.bookinDetail(data);
        dataRes.then(function(response) {
            $scope.bookingDetialsList = response.data.data;
            $scope.totalItems = response.data.pagination.total;
            $scope.currentPage = response.data.pagination.current_page;
            $scope.perPage = response.data.pagination.per_page;


            if (requestType == 1) {
                setTimeout(function() {
                    $scope.currentPage = 1;
                    var previousActive = $('dir-pagination-controls ul li.active').find('a').text();
                    if (Number(previousActive) > 1) {
                        $('dir-pagination-controls ul li:nth-child(2)').find('a').click();
                    }
                }, 400);
            }
            $scope.onsubmitbookingReportDataShow = false;
            $scope.bookingReportDataShow = true;
            $scope.data = {};


        }, function(reason) {
            alert("Something went wrong");
        });

    }
    $scope.bookingReportDataShow = false;


    $scope.getHourlyPageChange = function(driver, newPage) {
        getHourly(driver, newPage);
    };

    function getHourly(driver, pagenum) {
        $scope.onsubmitReportDataShow = true;
        $scope.reportDataShow = false;
        var data = { page: pagenum, mgId: driver.mgId, startDate: driver.startDate, endDate: driver.endDate,city_id : driver.city_id };
        var ReportResult = CommonService.getDetails(data, 'getDriverLoginHoursReportDetials');
        ReportResult.then(function successCallback(response) {
            $scope.onsubmitReportDataShow = false;
            $scope.reportDataShow = true;
            $scope.hourlyLogin = response.data;


        }, function(reason) {
            alert("Something went wrong");
        });
    };

    $scope.hourlytReport = function() {
        $scope.data = [];
        $scope.totalItems = 0;
        $scope.pageChanged = function(newPage) {

            getResultsPage(newPage);
        };
        getResultsPage(1);

        function getResultsPage(pageNumber) {
            var startDate = '';
            var endDate = '';
            if (angular.isDefined($scope.report)) {
                if (angular.isDefined($scope.report.startDate)) {
                    startDate = $scope.report.startDate;
                }
                if (angular.isDefined($scope.report.endDate)) {
                    endDate = $scope.report.endDate;
                }
            }
            var data = { page: pageNumber, startDate: startDate, endDate: endDate };
            var allotmentReportResult = reportServices.getAllotmentDetail(data);
            allotmentReportResult.then(function(response) {
                $scope.allotmentData = response.data;
                $scope.totalItems = response.pagination.total;
                $scope.currentPage = response.pagination.current_page;
                $scope.perPage = response.pagination.per_page;
            }, function(reason) {
                alert("Something went wrong");
            });
        }
        // getResultsPage(1);
        // $scope.getAllotmentReport = getResultsPage(1);
    }


    $scope.getDriverSummary = function() {
        $scope.onsubmitDriverSummaryDataShow = true;
        $scope.driverSummaryDataShow = false;
        var data = { mg_id: $scope.vehicle_reg_no };
        var driverSummaryResult = CommonService.getDetails(data,'getDriverSummary');
        driverSummaryResult.then(function(response) {
            console.log(response, 'check');
            if (response.error) {
                swal(response.error);
                return false;
            }
            $scope.driverInformation = response.driver_information;
            $scope.completedBookingDetails = response.completed_booking_details;
            $scope.rejectedBookingDetails = response.rejected_booking_details;
            $scope.summaryTripRecord = response.summary_trip_record;
            $scope.loginLogoutActivity = response.login_logout_activity;
            $scope.onTripStatus = response.on_trip_status;
            $scope.driver_login_status = response.driver_login_status;
            $scope.driverSummaryDataShow = true;
            $scope.onsubmitDriverSummaryDataShow = false;
            var table = $('#session-activity-datatable').dataTable();
            table.fnDestroy();
            setTimeout(function() {
                $('#session-activity-datatable').dataTable({
                    searching: false,
                    "info": false,
                    "bLengthChange": false
                });
            }, 2000);
        }, function(reason) {
            swal("Something went wrong");
        });
    }

    //end rahul

    $scope.getDriverAttendance = function(driver) {
        var data = { mgId: driver.mgId, startDate: driver.startDate, endDate: driver.endDate };
        $http({
            method: 'GET',
            url: '/api/getDriverAttendance',
            params: data
        }).then(function successCallback(response) {
            $scope.driverAttendanceView = response.data.flag;

            if ($scope.driverAttendanceView == "single") {
                $scope.driverAttendanceHead = response.data.head;
                $scope.driverAttendanceData = response.data.data[0];
                setTimeout(function() {
                    $(document).ready(function() {
                        $('#driver-attendance-single').DataTable({
                            dom: 'lBfrtip',
                            destroy: true,
                            buttons: [
                                'csv', 'print', 'copy'
                            ],
                            "lengthMenu": [
                                [10, 25, 50, -1],
                                [10, 25, 50, "All"]
                            ]
                        });

                    });
                }, 2000);
            } else if ($scope.driverAttendanceView == "multiple") {
                $scope.driverAttendanceHead = response.data.head;
                $scope.driverAttendanceData = [];
                angular.forEach(response.data, function(value, key) {
                    if (value.data) {
                        $scope.driverAttendanceData.push(value.data[0]);
                    }

                });
                setTimeout(function() {
                    $(document).ready(function() {
                        $('#driver-attendance-multiple').DataTable({
                            dom: 'lBfrtip',
                            destroy: true,
                            buttons: [
                                'csv', 'print', 'copy'
                            ],
                            "lengthMenu": [
                                [10, 25, 50, -1],
                                [10, 25, 50, "All"]
                            ]
                        });

                    });
                }, 2000);
            }



        }, function errorCallback(response) {

        });
    }




    $scope.searchBookingDetails = function(searchBooking) {

        $scope.searchBookingReport.booking_id = '';
        $scope.searchBookingReport.customer_name = '';
        $scope.searchBookingReport.trip_charge = '';
        $scope.searchBookingReport.payment_recevied = '';
        $scope.searchBookingReport.booking_status = '';
        $scope.searchBookingReport.customer_org = '';
        $scope.bookingReportDataShow = false;
        $scope.onsubmitbookingReportDataShow = true;
        var data = { startDate: $scope.searchBooking.complete_time, endDate: $scope.searchBooking.accept_time, org: $scope.searchBookingReport.customerOrg };
        $http({
            method: 'GET',
            url: '/api/searchbookingReport',
            params: data
        }).then(function successCallback(response) {
            $scope.bookingDetialsList = response.data.result;
            var table = $('#datatable-buttons').DataTable({
                dom: 'lBfrtip',
                destroy: true,
                buttons: [
                    'csv', 'print', 'copy'
                ]
            });
            table.destroy();
            setTimeout(function() {

                $(document).ready(function() {
                    $('#datatable-buttons').DataTable({
                        dom: 'lBfrtip',
                        destroy: true,
                        buttons: [
                            'csv', 'print', 'copy'
                        ],
                        "lengthMenu": [
                            [10, 25, 50, -1],
                            [10, 25, 50, "All"]
                        ]
                    });

                });

                $('#column1_search').on('keyup', function() {
                    $('#datatable-buttons').DataTable()
                        .columns(0)
                        .search(this.value)
                        .draw();
                });

                $('#column2_search').on('keyup', function() {
                    $('#datatable-buttons').DataTable()
                        .columns(1)
                        .search(this.value)
                        .draw();
                });

                $('#columnPhoneSearch').on('keyup', function() {
                    $('#datatable-buttons').DataTable()
                        .columns(3)
                        .search(this.value)
                        .draw();
                });

            }, 1000);
            $scope.onsubmitbookingReportDataShow = false;
            $scope.bookingReportDataShow = true;
        }, function errorCallback(response) {});
    };

    $scope.searchCancelBookingDetails = function(searchCancelBooking, pagenum, requestType) {
        if(angular.isUndefined($scope.maalgaadi_city_id)){
            return false;
        }
        searchCancelBooking.city_id = $scope.maalgaadi_city_id;
        if(angular.isUndefined($scope.searchCancelBooking.complete_time) || angular.isUndefined($scope.searchCancelBooking.accept_time) || angular.isUndefined($scope.issues_type)  || angular.isUndefined($scope.searchCancelBooking.city_id) || angular.isUndefined($scope.message) || angular.isUndefined($scope.action)){
            return false;
        }
        searchCancelBookingReport(searchCancelBooking, pagenum, requestType)
    };

    function searchCancelBookingReport(searchCancelBooking, pagenum, requestType) {
        if(angular.isUndefined($scope.maalgaadi_city_id)){
            return false;
        }
        searchCancelBooking.city_id = $scope.maalgaadi_city_id;
        var data = { page: pagenum, startDate: $scope.searchCancelBooking.complete_time, endDate: $scope.searchCancelBooking.accept_time, message: $scope.message, issues_type: $scope.issues_type, action: $scope.action, allotment_type: $scope.searchCancelBooking.allotment_type, type: $scope.searchCancelBooking.type, city_id: $scope.searchCancelBooking.city_id };
        var cancelBookingData = CommonService.getDetails(data, 'searchCancelBookingReport');
        cancelBookingData.then(function(response) {
            $scope.cancelBookinglists = response.data;
            $scope.totalItems = response.pagination.total;
            $scope.currentPage = response.pagination.current_page;
            $scope.perPage = response.pagination.per_page;
            $scope.onsubmitbookingReportDataShow = false;
            $scope.bookingReportDataShow = true;

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
        }, function(reason) {
            alert("Something went wrong");
        });

    }

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
    $scope.getDriverReg();

    $scope.getDriverWalletDetials = function() {
        $scope.bookingReportDataShow = false;
        $scope.onsubmitbookingReportDataShow = true;
        if(angular.isUndefined($scope.maalgaadi_city_id)){
            return false;
        }
        var data = { date: $scope.date, city_id : $scope.maalgaadi_city_id };
        var url = 'getDriverWalletDetials';
        var getDriverWalletDetials = CommonService.getDetails(data, url);
        getDriverWalletDetials.then(function successCallback(response) {
            var table = $('#driver-wallet-datatable-buttons').DataTable();
            table.destroy();
            $scope.driverWalletDetials = response;
            $scope.driverWalletDetialsLength = response.length;
            $scope.viewcustomerWalletTotal = 0;

            angular.forEach(response, function(value, key) {
                if(value.balance){
                    $scope.viewcustomerWalletTotal += parseInt(value.balance);
                }
            });
            console.log($scope.viewcustomerWalletTotal)
            $scope.bookingReportDataShow = true;
            $scope.onsubmitbookingReportDataShow = false;
        }, function errorCallback(response) {});
    };

    $scope.exportDriverWalletDetials = function() {
        var date = '';
        var city_id = '';
        if (angular.isDefined($scope.date)) {
            date = $scope.date;
        }
        if (angular.isUndefined($scope.maalgaadi_city_id)) {
           return false;
        }
        window.location = "/api/getDriverWalletDetials?export=excel&date=" + date + '&city_id='+$scope.maalgaadi_city_id;
    }

    $scope.getCustomerWalletDetials = function() {
        $scope.bookingReportDataShow = false;
        $scope.onsubmitbookingReportDataShow = true;
        if(angular.isUndefined($scope.maalgaadi_city_id)){
            return false;
        }
        var data = { date: $scope.date, city_id : $scope.maalgaadi_city_id };
        var getCustomerWalletDetials = reportServices.getCustomerWalletDetials(data);
        console.log(data);
        getCustomerWalletDetials.then(function successCallback(response) {

            $scope.customerWalletDetials = response.data;

            $scope.viewcustomerWalletTotal = 0;

            angular.forEach(response.data, function(value, key) {
                $scope.viewcustomerWalletTotal += parseInt(value.final_balance);
            });

            $scope.customerWalletDetialsLength = response.data.length;

            $scope.bookingReportDataShow = true;
            $scope.onsubmitbookingReportDataShow = false;


        }, function errorCallback(response) {});
    };

    $scope.exportCustomerWalletDetials = function() {
        var date = '';
        if (angular.isDefined($scope.date)) {
            date = $scope.date;
        }
        if(angular.isUndefined($scope.maalgaadi_city_id)){
            return false;
        }
        window.location = "/api/getCustomerWalletDetials?export=excel&date=" + date+'&city_id='+$scope.maalgaadi_city_id;
    }

    $scope.loginDriverDetials = function() {
        $http({
            method: 'GET',
            url: '/api/getLoginDetials',
        }).then(function successCallback(response) {
            console.log(response.data)
            $scope.loginDrivers = response.data;
            $scope.loginDriversLength = response.data.length;
        }, function errorCallback(response) {});
    };

    $scope.getCustomerInformation = function(id) {
        var data = { customer_id: id };
        $http({
            method: 'GET',
            url: '/api/getCustomerInformation',
            params: data
        }).then(function successCallback(response) {
            $scope.customerInformation = response.data;
        }, function errorCallback(response) {});
    };

    $scope.getcancelBooking = function() {
        $http({
            method: 'GET',
            url: '/api/cancelBookinglist',
        }).then(function successCallback(response) {
            $scope.cancelBookinglists = response.data;
            $scope.cancelBookinglistsLength = response.data.length;
        }, function errorCallback(response) {});
    };

    $scope.exportActiveDriver = function() {
        window.location = 'api/exportActiveDriver';
    }

    $scope.getActiveDriver = function(pagenum = 1, requestType = 1, searchBy) {
        if(angular.isUndefined($scope.maalgaadi_city_id)){
            return false;
        }
        if(angular.isUndefined($scope.searchBy)){
            $scope.searchBy = {}
        }
        if (angular.isUndefined($scope.searchBy.type)) {
           $scope.searchBy.type = 10;
        }
        var vehicleId = '';console.log($scope.searchBy)
        if(angular.isDefined($scope.searchBy.vehicle_category) && $scope.searchBy.vehicle_category != null){
           vehicleId = $scope.searchBy.vehicle_category.id;
        }

        var data = { page: pagenum, type: $scope.searchBy.type, driver_name: $scope.searchBy.driver_name, driver_number: $scope.searchBy.driver_number, loading: $scope.searchBy.loading, loginStatus: $scope.searchBy.loginStatus, vehicle_category: vehicleId, mg_id: $scope.searchBy.mg_id,city_id:$scope.maalgaadi_city_id};
        var getData = CommonService.getDetails(data,'getActiveDriver');
        getData.then(function successCallback(response) {console.log(response);
            $scope.driverActiveDetials = response.result;
            $scope.cancelbookingReportDataShow = true;
            $scope.totalItems = response.pagination.total;
            $scope.currentPage = response.pagination.current_page;
            $scope.perPage = response.pagination.per_page;
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

    $scope.customerRevenue = {};
    $scope.bookingReportDataShow = false;

    $scope.customerRevenuePages = function(customer, pagenum, requestType) {
        customerRevenueDetails(customer, pagenum, requestType)
    }



    function customerRevenueDetails(customer, pagenum, requestType) {
        var customer_id = $("#organization_id").val();
        if(angular.isUndefined($scope.maalgaadi_city_id)){
            return false;
        }
        customer.city_id = $scope.maalgaadi_city_id;
        if(angular.isUndefined(customer.startTime) || angular.isUndefined(customer.endTime) || angular.isUndefined(customer.city_id)){
            return false;
        }
        var data = { page: pagenum, org: customer.customerOrg, start: customer.startTime, end: customer.endTime, type: customer.type,customer_id:customer_id, city_id:customer.city_id };
        $scope.grantTotalcustomerBooking = 0;
        $scope.grantTotalcustomerRevenue = 0;
        var customerRevenueData = CommonService.getDetails(data, 'customerRevenueDetails');
        customerRevenueData.then(function(response) {
            $scope.customerRevenue = response.data;
            $scope.totalItems = response.pagination.total;
            $scope.currentPage = response.pagination.current_page;
            $scope.perPage = response.pagination.per_page;

            if (requestType == 1) {
                setTimeout(function() {
                    $scope.currentPage = 1;
                    var previousActive = $('dir-pagination-controls ul li.active').find('a').text();
                    if (Number(previousActive) > 1) {
                        $('dir-pagination-controls ul li:nth-child(2)').find('a').click();
                    }
                }, 400);

            }
            $scope.onsubmitbookingReportDataShow = false;
            $scope.bookingReportDataShow = true;
            $scope.data = {};


        }, function(reason) {
            alert("Something went wrong");
        });
    };
    $scope.RejectionResion = {};
    $scope.rejectionReportDataShow = false;




    $scope.RejectionResion = {};
    $scope.rejectionReportDataShow = false;
    $scope.getRejectionResion = function() {
        $http({
            method: 'GET',
            url: '/api/rejectionResion',
        }).then(function successCallback(response) {

            $('#customer-revenue-datatable-buttons').DataTable().destroy();
            setTimeout(function() {
                $(document).ready(function() {
                    $('#customer-revenue-datatable-buttons').DataTable({
                        dom: 'lBfrtip',
                        destroy: true,
                        buttons: [
                            'csv', 'print', 'copy'
                        ],
                        "lengthMenu": [
                            [10, 25, 50, -1],
                            [10, 25, 50, "All"]
                        ],
                        destroy: true,
                    });

                });
            });
            $scope.rejectListData = response.data.result;
            $scope.rejectionReasonList = true;
        }, function errorCallback(response) {

        });
    };

    $scope.getrevenuereport = function(pagenum, requestType, driver) {
        if(angular.isUndefined($scope.maalgaadi_city_id)){
            return false;
        }
        driver.city_id = $scope.maalgaadi_city_id;

        $scope.onsubmitbookingReportDataShow = true;
        var data = { page: pagenum, start: driver.startdate, end: driver.enddate, mg_id: driver.vehicle_reg_no, type: driver.type,city_id: driver.city_id };
        $scope.totalTrip = 0;
        $scope.totalrevenue = 0;

        var getData = CommonService.getDetails(data,'getallrevenuereport');
        getData.then(function successCallback(response) {console.log(response);
            $scope.revenuereportlists = response.data;
            $scope.totalTrip = 0;
            $scope.totalrevenue = 0;
            angular.forEach($scope.revenuereportlists, function(value, key) {

                if(value.booking){
                    $scope.totalTrip +=  value.booking;
                }
                if(value.revenue){
                    $scope.totalrevenue += value.revenue;
                }
            });
            $scope.totalItems = response.pagination.total;
            $scope.currentPage = response.pagination.current_page;
            $scope.perPage = response.pagination.per_page;

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
            $scope.bookingReportDataShow = true;
            $scope.onsubmitbookingReportDataShow = false;
        },
        function(reason) {});
    };

    $scope.getDriverHistory = function() {
        $scope.driverHistoryDataShow = false;
        $scope.onsubmitbookingReportDataShow = true;
        var data = { startDate: $scope.startdate, endDate: $scope.enddate, mg_id: $scope.vehicle_reg_no };
        var driverHistoryResult = CommonService.getDetails(data, 'getDriverHistory');
        driverHistoryResult.then(function(response) {
            $scope.driverHistoryDataShow = true;
            $scope.driverHistoryReport = response;
            $scope.bookingReportDataShow = true;
            $scope.onsubmitbookingReportDataShow = false;
        }, function(reason) {
            alert("Something went wrong");
        });
    };

    $scope.getDriverAttendance = function(driver) {
        var data = { mgId: driver.mgId, startDate: driver.startDate, endDate: driver.endDate };
        $http({
            method: 'GET',
            url: '/api/getDriverAttendance',
            params: data
        }).then(function successCallback(response) {
            $scope.driverAttendanceView = response.data.flag;

            if ($scope.driverAttendanceView == "single") {
                $scope.driverAttendanceHead = response.data.head;
                $scope.driverAttendanceData = response.data.data[0];
                setTimeout(function() {
                    $(document).ready(function() {
                        $('#driver-attendance-single').DataTable({
                            dom: 'lBfrtip',
                            destroy: true,
                            buttons: [
                                'csv', 'print', 'copy'
                            ],
                            "lengthMenu": [
                                [10, 25, 50, -1],
                                [10, 25, 50, "All"]
                            ]
                        });

                    });
                }, 2000);
            } else if ($scope.driverAttendanceView == "multiple") {
                $scope.driverAttendanceHead = response.data.head;
                $scope.driverAttendanceData = [];
                angular.forEach(response.data, function(value, key) {
                    if (value.data) {
                        $scope.driverAttendanceData.push(value.data[0]);
                    }

                });
                setTimeout(function() {
                    $(document).ready(function() {
                        $('#driver-attendance-multiple').DataTable({
                            dom: 'lBfrtip',
                            destroy: true,
                            buttons: [
                                'csv', 'print', 'copy'
                            ],
                            "lengthMenu": [
                                [10, 25, 50, -1],
                                [10, 25, 50, "All"]
                            ]
                        });

                    });
                }, 2000);
            }



        }, function errorCallback(response) {

        });
    }

    $scope.getBookingTat = function(pagenum, requestType) {
        $scope.onsubmitBookingTatLoader = true;
        $scope.onsubmitBookingTatResult = false;
        getBookingTatResult(pagenum, requestType);
    };

    function getBookingTatResult(pagenum, requestType) {
        if(angular.isUndefined($scope.maalgaadi_city_id)){
            return false;
        }
        var data = { type: $scope.bookingtat.type, page: pagenum, startDate: $scope.bookingtat.startDate, endDate: $scope.bookingtat.endDate, cityId: $scope.maalgaadi_city_id};
        var customerRevenueData = CommonService.getDetails(data, 'getbookingtat');
        customerRevenueData.then(function(response) {
            $scope.onsubmitBookingTatLoader = false;
            $scope.onsubmitBookingTatResult = true;
            $scope.viewbookingtat = response.data;
            $scope.totalItems = response.pagination.total;
            $scope.currentPage = response.pagination.current_page;
            $scope.perPage = response.pagination.per_page;
            if (requestType == 1) {
                setTimeout(function() {
                    $scope.currentPage = 1;
                    var previousActive = $('dir-pagination-controls ul li.active').find('a').text();
                    if (Number(previousActive) > 1) {
                        $('dir-pagination-controls ul li:nth-child(2)').find('a').click();
                    }
                }, 400);

            }
            $scope.onsubmitbookingReportDataShow = false;
            $scope.bookingReportDataShow = true;
            $scope.data = {};
        }, function(reason) {
            alert("Something went wrong");
        });

    }

    $scope.getvehicleservicesPageChange = function(bookingtat, newPage) {
        if(angular.isUndefined(bookingtat.startDate) && angular.isUndefined(bookingtat.endDate)){
            return false;
        }
        getvehicleservices(bookingtat, newPage);
    };

    function getvehicleservices(bookingtat, pagenum) {
        $scope.totalTripCharge = 0;
        $scope.totalLoadingCharge = 0;
        $scope.totalUnLoadingCharge = 0;
        $scope.totalDropCharge = 0;
        $scope.totalCharge = 0;
        $scope.onsubmitReportDataShow = true;
        $scope.reportDataShow = false;
        data = { page: pagenum, startDate: bookingtat.startDate, endDate: bookingtat.endDate, mg_code: bookingtat.vehicle_reg_no, type: bookingtat.type };
        var resultData = CommonService.getDetails(data, 'getvehicleservice')
        resultData.then(function successCallback(response) {
            $scope.onsubmitReportDataShow = false;
            $scope.reportDataShow = true;
            $scope.viewvehicleservices = response.data;

            angular.forEach(response.data, function(value, key) {
                $scope.totalTripCharge += value.trip_charge;
                $scope.totalLoadingCharge += value.loading_charge;
                $scope.totalUnLoadingCharge += value.unloading_charge;
                $scope.totalDropCharge += value.drop_points;
                $scope.totalCharge += value.total_trip_charge;
            });

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
        }, function(reason) {
            alert("Something went wrong");
        });
    };

    $scope.getbilltyreportsPageChange = function(newPage) {
        getbilltyreports(newPage);
    };

    function getbilltyreports(pagenum) {
        $scope.onsubmitReportDataShow = true;
        $scope.reportDataShow = false;

        if(angular.isUndefined($scope.maalgaadi_city_id)){
            return false;   
        }

        data = { page: pagenum, startDate: $scope.startdate, endDate: $scope.enddate, city_id : $scope.maalgaadi_city_id };
        var getData = CommonService.getDetails(data, 'getbilltyreport');
        if (pagenum == 1) {
            setTimeout(function() {
                $scope.currentPage = 1;
                var previousActive = $('dir-pagination-controls ul li.active').find('a').text();
                if (Number(previousActive) > 1) {
                    $('dir-pagination-controls ul li:nth-child(2)').find('a').click();
                }
            }, 400);
        }
        getData.then(function successCallback(response) {
            $scope.billtyreport = response.data;
            $scope.onsubmitReportDataShow = false;
            $scope.reportDataShow = true;
            $scope.totalItems = response.pagination.total;
            $scope.currentPage = response.pagination.current_page;
            $scope.perPage = response.pagination.per_page;

        }, function(reason) {
            alert("Something went wrong");
        });
    };


    $scope.customerPageChanged = function(customer, newPage, requestType) {
        getCustomerRating(customer, newPage, requestType);
        //console.log('onsubmit alling');
    };

    function getCustomerRating(customer, pagenum, requestType) {
        if(angular.isUndefined($scope.maalgaadi_city_id)){
            return false;
        }
        customer.city_id = $scope.maalgaadi_city_id;
        var customer_id = $("#organization_id").val();

        if(angular.isUndefined(customer.start) || angular.isUndefined(customer.end) || angular.isUndefined(customer.city_id)){
            return false;
        }
        var datanew = { page: pagenum, cust_org: customer.customerOrg, start: customer.start, end: customer.end, type: customer.type , customer_id:customer_id, city_id: customer.city_id};
        var customerdata = CommonService.getDetails(datanew, 'getCustomerRating');
        customerdata.then(function(response) {
            $scope.customerDetials = response.data;
            $scope.totalItems = response.pagination.total;
            $scope.currentPage = response.pagination.current_page;
            $scope.perPage = response.pagination.per_page;
            if (requestType == 1) {
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


    $scope.getCustomerWalletDetials1 = function() {
        var data = { customer_id: $stateParams.customerId };
        $http({
            method: 'GET',
            url: '/api/getCustomerWalletDetials1',
            params: data
        }).then(function successCallback(response) {
            $scope.customerWalletDetials = response.data.data;
        }, function errorCallback(response) {});
    }

    $scope.getDriverWalletDetials1 = function() {
        var data = { driver_id: $stateParams.driverId };
        $http({
            method: 'GET',
            url: '/api/getDriverWalletDetials1',
            params: data
        }).then(function successCallback(response) {
            $scope.driverWalletDetials = response.data.data;
        }, function errorCallback(response) {});
    }

    $scope.getDriverWalletDetials2 = function() {
        var data = { driver_id: $stateParams.driverId };
        $http({
            method: 'GET',
            url: '/api/getDriverWalletDetials2',
            params: data
        }).then(function successCallback(response) {
            $scope.driverWalletDetials = response.data.data;
        }, function errorCallback(response) {});
    }

    $scope.getDriverIncentivePageChange = function(driver, newPage) {
        getDriverIncentive(driver, newPage);
    };

    $scope.driverAttendanceData = {};

    function getDriverIncentive(driver, pagenum) {
        $scope.onsubmitReportDataShow = true;
        $scope.reportDataShow = false;
        var data = { page: pagenum, vehicle: driver.vehicle.id, startDate: driver.startDate, endDate: driver.endDate };
        var resultData = reportServices.getDriverIncentive(data);
        resultData.then(function successCallback(response) {
            $scope.driverIncentiveData = response.data.data;
            $scope.onsubmitReportDataShow = false;
            $scope.reportDataShow = true;
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

    $scope.exportDriverIncentive = function(driverAttendance) {
        window.location = 'api/getDriverIncentive?startDate=' + $scope.driverAttendance.startDate + '&endDate=' + $scope.driverAttendance.endDate + '&vehicle=' + $scope.driverAttendance.vehicle.id + '&export=excel';
    }

    $scope.getVechicleCategory = function(city_id) {
        if(angular.isUndefined(city_id)){
            setTimeout(function(){
                var data = {city_id : $rootScope.default_city_id};
                $http({
                    method: 'GET',
                    url: '/api/vehicle',
                    params: data
                }).then(function successCallback(response) {
                    $scope.vehicleCategoryDetialsByCity = response.data.result;
                }, function errorCallback(response) {});
            },500)
        }else{
            var data = {city_id : city_id};
            $http({
                method: 'GET',
                url: '/api/vehicle',
                params: data
            }).then(function successCallback(response) {
                $scope.vehicleCategoryDetialsByCity = response.data.result;
            }, function errorCallback(response) {});
        }
       
    };
    $scope.getDriverCancellationPageChange = function(driver, newPage) {
        getDriverCancellation(driver, newPage);
    };

    function getDriverCancellation(driver, pagenum) {
        $scope.total = 0;
        //var data = { page: pagenum, mgId: driver.mgId, startDate: driver.startDate, endDate: driver.endDate };
        //var resultData = reportServices.getDriverCancellation(data);
        $scope.onsubmitReportDataShow = true;
        $scope.reportDataShow = false;
        var data = { page: pagenum, mgId: driver.mgId, startDate: driver.startDate, endDate: driver.endDate, type: driver.type };
        var resultData = CommonService.getDetails(data, 'getDriverCancellationDetials');
        resultData.then(function successCallback(response) {
            $scope.onsubmitReportDataShow = false;
            $scope.reportDataShow = true;
            $scope.multipe = response.success.flag;
            $scope.driverCancellation = response.success.data;
            angular.forEach($scope.driverCancellation, function(value, key) {
                $scope.total += value.revenue;
            });
            $scope.driverCancellationShow = false;
            $scope.totalItems = response.success.pagination.total;
            $scope.currentPage = response.success.pagination.current_page;
            $scope.perPage = response.success.pagination.per_page;
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

    $scope.getDistanceAnalysisPageChange = function(driver, newPage) {       
        if(angular.isUndefined(driver.startDate) || angular.isUndefined(driver.endDate) || angular.isUndefined($scope.maalgaadi_city_id)){
            return false;
        }
        driver.city_id = $scope.maalgaadi_city_id;
        getDistanceAnalysis(driver, newPage);
    };

    function getDistanceAnalysis(driver, pagenum) {
        
        driver.city_id = $scope.maalgaadi_city_id;
        $scope.onsubmitReportDataShow = true;
        $scope.reportDataShow = false;
        var data = { page: pagenum, startDate: driver.startDate, endDate: driver.endDate, type: driver.type, city_id: driver.city_id };
        var resultData = CommonService.getDetails(data, 'getDistanceAnalysis');
        resultData.then(function successCallback(response) {
            $scope.onsubmitReportDataShow = false;
            $scope.reportDataShow = true;
            $scope.driverDistance = response.data;
            $scope.usersLength = response.length;
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
        }, function(reason) {
            alert("Something went wrong");
        });
    };

    $scope.getCallCenterExecutive = function(details) {
        if(details == ''){
            details = {}
        }
        if(angular.isUndefined($scope.maalgaadi_city_id)){
            setTimeout(function(){
                // details.city_id = $rootScope.default_city_id;
                var data = { city_id: $rootScope.default_city_id}
                var getData = CommonService.getDetails(data,'getCallCenterExecutive');
                getData.then(function successCallback(response) {
                    console.log(response);
                    $scope.ceUsers = response;
                },
                function(reason) {
                    alert("Something went wrong");
                });
            },500);
        }else{
            // details.city_id = $scope.maalgaadi_city_id;
            var data = { city_id: $scope.maalgaadi_city_id}
            var getData = CommonService.getDetails(data,'getCallCenterExecutive');
            getData.then(function successCallback(response) {
                console.log(response);
                $scope.ceUsers = response;
            },
            function(reason) {
                alert("Something went wrong");
            });
        }
    };

    $scope.getDistanceToCustomerReportPageChange = function(report, newPage) {
        if(angular.isUndefined($scope.maalgaadi_city_id) || angular.isUndefined(report.employee) ||  angular.isUndefined(report.start) || angular.isUndefined(report.end)){
            return false;
        }
        report.city_id = $scope.maalgaadi_city_id;
        $scope.onsubmitReportDataShow = true;
        $scope.onsubmitReportData = false;
        getDistanceToCustomerReport(report, newPage);
    };

    function getDistanceToCustomerReport(report, pagenum) {
        $scope.onsubmitReportDataShow = true;
        $scope.reportDataShow = false;
        var data = { page: pagenum, employee_id: report.employee.id, startDate: report.start, endDate: report.end, type: report.type ,city_id:report.city_id};
        var getPostsData =  CommonService.getDetails(data, 'getDistanceToCustomerReport');
        getPostsData.then(function successCallback(response) {
                $scope.onsubmitReportDataShow = false;
                $scope.reportDataShow = true;
                if(angular.isDefined(response.success)){
                    $scope.totalDistanceToCustomer = response.pagination.totalDistanceToCustomer;
                    $scope.totalItems = response.pagination.total;
                    $scope.currentPage = response.pagination.current_page;
                    $scope.perPage = response.pagination.per_page;
                    $scope.bookingDetials = response.data;
                }else{
                    $scope.totalDistanceToCustomer = 0;
                     $scope.totalItems = 0;
                    $scope.currentPage = 0;
                    $scope.perPage = 0;
                    $scope.bookingDetials = '';
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
            },
            function(reason) {
                alert("Something went wrong");
            });
    };
    $scope.getDriverAttendanceDetialsPageChange = function(driver, newPage) {
        if(angular.isUndefined(driver.startDate) || angular.isUndefined(driver.endDate)){
            return false;
        }
        getDriverAttendanceDetials(driver, newPage);
    };

    function getDriverAttendanceDetials(driver, pagenum) {
        $scope.onsubmitReportDataShow = true;
        $scope.reportDataShow = false;
        var data = { page: pagenum, mgId: driver.mgId, startDate: driver.startDate, endDate: driver.endDate, type: driver.type };
        var getPostsData = CommonService.getDetails(data, 'getDriverAttendanceDetials');
        getPostsData.then(function successCallback(response) {
            $scope.onsubmitReportDataShow = false;
            $scope.reportDataShow = true;
            $scope.driverAttendanceView = response.data.flag;

            if ($scope.driverAttendanceView == "single") {
                $scope.driverAttendanceHead = response.data.head;
                $scope.driverAttendanceData = response.data.data[0];
                // console.log(response.data);
                $scope.totalItems = response.pagination.total;
                $scope.currentPage = response.pagination.current_page;
                $scope.perPage = response.pagination.per_page;

            } else if ($scope.driverAttendanceView == "multiple") {
                $scope.driverAttendanceHead = response.data.head;
                $scope.driverAttendanceData = [];
                angular.forEach(response.data, function(value, key) {
                    if (value.data) {
                        $scope.driverAttendanceData.push(value.data[0]);
                    }
                });
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
            }
        }, function(reason) {
            alert("Something went wrong");
        });
    };
    $scope.exportCustomerRating = function(customer) {
        var customer_id = $("#organization_id").val();
        if(angular.isUndefined($scope.maalgaadi_city_id)){
            return false;
        }
        window.location = 'api/getCustomerRating?export=export&start=' + customer.start + '&end=' + customer.end + '&cust_org=' + customer.customerOrg + '&customer_id='+customer_id + '&city_id=' + $scope.maalgaadi_city_id ;

    }

    $scope.exportCancelBooking = function(searchCancelBooking) {
        var data = 'startDate='+$scope.searchCancelBooking.complete_time+'&endDate='+$scope.searchCancelBooking.accept_time+'&message='+$scope.message+'&issues_type='+$scope.issues_type+'&action='+$scope.action+'&allotment_type='+$scope.searchCancelBooking.allotment_type+'&type='+$scope.searchCancelBooking.type+'&city_id='+$scope.searchCancelBooking.city_id+'&export=excel' 
        window.location = 'api/searchCancelBookingReport?'+data;
    };

    $scope.exportCustomerRevenue = function(customer) {
        var customer_id = $("#organization_id").val();
        window.location = 'api/customerRevenueDetails?start=' + customer.startTime + '&end=' + customer.endTime + '&org=' + customer.customerOrg + '&customer_id='+customer_id + '&city_id=' + customer.city_id + '&export=excel';
    };
    $scope.exportDriverRevenue = function(driver) {
        var mgId = '';
        if(angular.isUndefined($scope.maalgaadi_city_id)){
            return false;
        }
        driver.city_id = $scope.maalgaadi_city_id;
        if (angular.isDefined(driver.vehicle_reg_no)) {
            mgId = driver.vehicle_reg_no;
            window.location = 'api/getallrevenuereport?start=' + driver.startdate + '&end=' + driver.enddate + '&mg_id=' + mgId + '&export=excel&city_id='+driver.city_id;
        } else {
            window.location = 'api/getallrevenuereport?start=' + driver.startdate + '&end=' + driver.enddate + '&export=excel&city_id='+driver.city_id;
        }

        // window.location = 'api/exportDriverRevenue?start=' + $scope.startdate + '&end=' + $scope.enddate + '&mg_id=' + $scope.vehicle_reg_no;
    };

    $scope.exportBooking = function(searchBooking) {
        var organization = '';
        var allotmentType = '';

        if (angular.isDefined($scope.searchBookingReport.customerOrg)) {
            organization = $scope.searchBookingReport.customerOrg;
        }
        if (angular.isDefined($scope.searchBooking.allotment_type)) {
            allotmentType = $scope.searchBooking.allotment_type;
        }
        var customer_id = $("#organization_id").val();
        if(angular.isDefined($scope.maalgaadi_city_id)){
            var cityId = $scope.maalgaadi_city_id;
            window.location = 'api/searchbookingReport?startDate=' + $scope.searchBooking.complete_time + '&endDate=' + $scope.searchBooking.accept_time + '&org=' + organization + '&allotment_type=' + allotmentType + '&export=excel'  + '&customer_id='+customer_id+ '&city_id='+cityId ;
        }else{
           swal('Please select city.');
        }
        
    };

    $scope.exportBookingTat = function() {
        //var data = { page: pagenum, start: $scope.startdate, end: $scope.enddate, mg_id: $scope.vehicle_reg_no };
        if(angular.isUndefined($scope.maalgaadi_city_id)){
            return false;
        }
        window.location = '/api/getbookingtat?export=export&startDate=' + $scope.bookingtat.startDate + '&endDate=' + $scope.bookingtat.endDate+ '&cityId='+ $scope.maalgaadi_city_id;
    };
    $scope.exportVehicleServices = function(vehicle) {
        // window.location = '/api/exportVehicleservice?startDate=' + vehicle.startDate + '&endDate=' + vehicle.endDate + '&mg_code=' + vehicle.vehicle_reg_no;
        if (angular.isDefined(vehicle.vehicle_reg_no)) {
            window.location = '/api/getvehicleservice?startDate=' + vehicle.startDate + '&endDate=' + vehicle.endDate + '&mg_code=' + vehicle.vehicle_reg_no + '&export=excel';
        } else {
            window.location = '/api/getvehicleservice?startDate=' + vehicle.startDate + '&endDate=' + vehicle.endDate + '&export=excel';
        }
    };
    $scope.exportBilltyreport = function() {
        if(angular.isUndefined($scope.maalgaadi_city_id)){
            return false;
        }
         
        window.location = '/api/getbilltyreport?startDate=' + $scope.startdate + '&endDate=' + $scope.enddate + '&export=excel&city_id='+ $scope.maalgaadi_city_id;
    };
    $scope.exportDriverCancellation = function(attendance) {
        var mgId = '';
        if(angular.isDefined(attendance.mgId)){
            mgId = attendance.mgId;
        }
        window.location = '/api/getDriverCancellationDetials?export=excel&startDate=' + attendance.startDate + '&endDate=' + attendance.endDate + '&mgId=' + mgId;
    };
    $scope.exportDistanceAnalysis = function(analysis) {
        if(angular.isUndefined($scope.maalgaadi_city_id)){
            return false;
        }
        window.location = '/api/getDistanceAnalysis?startDate=' + analysis.startDate + '&endDate=' + analysis.endDate + '&export=excel&city_id='+$scope.maalgaadi_city_id;
    };
    $scope.exportDistanceToCustomer = function(dtc) {
        window.location = '/api/getDistanceToCustomerReport?startDate=' + dtc.start + '&endDate=' + dtc.end + '&employee_id=' + dtc.employee.id + '&export=excel&city_id='+dtc.city_id ;
        // window.location = '/api/ExportDistanceToCustomer?startDate=' + dtc.start + '&endDate=' + dtc.end + '&employee_id=' + dtc.employee.id;
    };
    $scope.exportDriverAttendance = function(attendance) {
        window.location = '/api/exportDriverAttendance?startDate=' + attendance.startDate + '&endDate=' + attendance.endDate + '&mgId=' + attendance.mgId;
    };
    $scope.exportAllotmentDetials = function(allotment) {
        if(angular.isUndefined($scope.maalgaadi_city_id)){
            return false;
        }
        window.location = '/api/allotmentDetials?export=export&startDate=' + allotment.startDate + '&endDate=' + allotment.endDate + '&city_id='+ $scope.maalgaadi_city_id;
    };
    $scope.getDriverSummaryMgcode = function() {
        var mgCode = $stateParams.mgCode;
        if (mgCode) {
            $scope.vehicle_reg_no = mgCode;
            setTimeout(function() {
                $scope.getDriverSummary();
            }, 200);
        }
    }



    $scope.exportTripRating = function(customer) {
        var ratingDate = '';
        var cityId = '';
        if(angular.isDefined(customer.city_id)){
            cityId = customer.city_id;
        }
        if(angular.isDefined(customer.rating_date)){
            ratingDate = customer.rating_date;
        }
        window.location = 'api/getTripRating?start=' + customer.start + '&end=' + customer.end + '&export=excel&rating_date='+ratingDate + '&city_id='+cityId;
    }



    $scope.tripPageChanged = function(customer, newPage, requestType) {
        $scope.getTripRating(customer, newPage, requestType);
    };

    $scope.getTripRating = function(customer, pagenum, requestType) {
        $scope.onsubmitTripRating = true;
        $scope.onsubmitTripRatingResult = false;

        if(angular.isUndefined($scope.maalgaadi_city_id)){
            return false;
        }
        customer.city_id = $scope.maalgaadi_city_id;

        var data = { page: pagenum, start: customer.start, end: customer.end, type: customer.type,rating_date: customer.rating_date, city_id: customer.city_id };
        var dataRes = CommonService.getDetails(data, 'getTripRating');
        dataRes.then(function(response) {
            
            $scope.onsubmitTripRating = false;
            $scope.onsubmitTripRatingResult = true;
            $scope.customerDetials = response.data;
            $scope.totalItems = response.pagination.total;
            $scope.currentPage = response.pagination.current_page;
            $scope.perPage = response.pagination.per_page;
            $scope.currentPage = response.pagination.current_page;
            $scope.mypage = response.pagination.current_page;
            if ($scope.mypage == 0) {
                $scope.perpg = response.pagination.total;
            } else {
                $scope.perpg = 10;
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
            
        }, function(reason) {});
    };



    $scope.getDriverRejection = function(customer) {
        var data = { start: customer.startDate, end: customer.endDate, mgId: customer.mgId };
        $http({
            method: 'GET',
            url: '/api/getDriverRejection',
            params: data
        }).then(function successCallback(response) {
            $scope.driverCancellation = response.data;
            console.log($scope.driverCancellation);
            setTimeout(function() {
                $(document).ready(function() {
                    $('#driver_rejection').DataTable({
                        dom: 'lBfrtip',
                        buttons: [
                            'csv', 'print', 'copy'
                        ],
                        "lengthMenu": [
                            [10, 25, 50, -1],
                            [10, 25, 50, "All"]
                        ]
                    });

                });
            }, 2000);
        }, function errorCallback(response) {});
    };
    $scope.exportGetDriverAppInfo = function(searchBy) {
        window.location = '/api/getDriverAppInfo?startDate=' + $scope.searchBy.startdate + '&endDate=' + $scope.searchBy.enddate + '&export=excel';
    }

    $scope.getDriverAppInfo = function(pagenum = 1, requestType = 1, searchBy) {

        $scope.onsubmitbookingReportDataShow = true;
        var data = { page: pagenum, startDate: $scope.searchBy.startdate, endDate: $scope.searchBy.enddate, type: $scope.searchBy.type };
        console.log(data);
        var driverAppResult = CommonService.getDetails(data, 'getDriverAppInfo');
        driverAppResult.then(function(response) {
            $scope.driverAppResult = response.data;
            $scope.bookingReportDataShow = true;
            $scope.onsubmitbookingReportDataShow = false;
            $scope.totalItems = response.total;
            $scope.currentPage = response.current_page;
            $scope.perPage = response.per_page;
            $scope.currentPage = response.current_page;
            $scope.mypage = response.current_page;
            if ($scope.mypage == 0) {
                $scope.perpg = response.total;
            } else {
                $scope.perpg = 10;
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
            alert("Something went wrong");
        });
    };



    $scope.editDriveAppInfo = function(driver) {
        console.log(driver);
        $scope.singleDriver = driver;
    };

    $scope.updateDriverAppInfo = function(singleDriver) {
        var data = { id: singleDriver.id, remark: singleDriver.remark };
        var driverAppResult = reportServices.updateDriverAppInfoDetail(data);
        driverAppResult.then(function(response) {
            $("#editDriveAppInfo").modal('hide');
            $(".unfollow-" + singleDriver.id).addClass('ng-hide');
            $(".follow-" + singleDriver.id).removeClass('ng-hide');
            $("#remark-" + singleDriver.id).text(singleDriver.remark);
        });
    };

    $scope.bookingReportDataShow = false;
    $scope.getEarningReport = function(customer) {
        if(angular.isUndefined($scope.maalgaadi_city_id)){
            return false;
        }
        var data = { start: customer.start, end: customer.end, city_id : $scope.maalgaadi_city_id ,booking_status: customer.booking_status};
        $http({
            method: 'GET',
            url: '/api/getEarningReport',
            params: data
        }).then(function successCallback(response) {
            $scope.earning = response.data;
            $scope.bookingReportDataShow = true;
            $scope.driverEarningTotalAmount = 0;
            $scope.driverEarningWaitingCharge = 0;
            $scope.driverEarningDiscount = 0;
            $scope.driverEarning = 0;
            $scope.driverEarningCommission = 0;
            $scope.driverEarningDtc = 0;
            $scope.driverEarningAmount = 0;
            $scope.driverSurgeAmount = 0;
            $scope.driverPodAmount = 0;
            $scope.driverGivenSurgeAmount = 0;
            $scope.driverGivenWaitingAmount = 0;
            $scope.driverCallcenterSurgeAmount = 0;
            $scope.driverCanceledPenaltyAmount = 0;
            angular.forEach(response.data, function(value, key) {
                $scope.driverEarningTotalAmount += parseInt(value.total_amount);
                $scope.driverEarningWaitingCharge += parseInt(value.waiting_charge);
                $scope.driverEarningDiscount += parseInt(value.discount);
                $scope.driverEarning += parseInt(value.driver_earning);
                $scope.driverEarningCommission += parseInt(value.commision);
                $scope.driverEarningDtc += parseInt(value.dtc);
                $scope.driverEarningAmount += parseInt(value.earning);
                $scope.driverSurgeAmount += parseInt(value.surge_amount);
                $scope.driverPodAmount += parseInt(value.pod_charge);
                $scope.driverGivenSurgeAmount += parseInt(value.driver_surge_charge);
                $scope.driverGivenWaitingAmount += parseInt(value.driver_waiting_charge);
                $scope.driverCallcenterSurgeAmount += parseInt(value.callcenter_surge);
                $scope.driverCanceledPenaltyAmount += parseInt(value.driver_canceled_penalty);
            });

        }, function errorCallback(response) {});
    };

    $scope.exportEarningReport = function(customer) {
        window.location = '/api/getEarningReport?start=' + customer.start + '&end=' + customer.end + '&export=excel&city_id=' + $scope.maalgaadi_city_id + '&booking_status='+customer.booking_status;
    }
    $scope.exportVehicleReport = function(searchBy) {
        window.location = '/api/getVehicleDriverAnalysis?startDate=' + searchBy.startdate + '&endDate=' + searchBy.enddate + '&vehicle_category_id=' + searchBy.vehicle_category_id.id +'&city_id='+searchBy.city_id +'&export=excel';
    }
    $scope.getVehicleDriver = function(searchBy, pagenum = 1) {
        if(angular.isUndefined(searchBy.startdate) || angular.isUndefined(searchBy.enddate) || angular.isUndefined(searchBy.vehicle_category_id.id) || angular.isUndefined($scope.maalgaadi_city_id)){
            return false;
        }
        
        searchBy.city_id = $scope.maalgaadi_city_id;

        $scope.onsubmitReportDataShow = true;
        $scope.reportDataShow = false;
        $scope.totalDriverEarnining = 0;
        var data = { page: pagenum, startDate: searchBy.startdate, endDate: searchBy.enddate, vehicle_category_id: searchBy.vehicle_category_id.id, type: searchBy.type,city_id:searchBy.city_id };

        var resultData = CommonService.getDetails(data, 'getVehicleDriverAnalysis');
        resultData.then(function successCallback(response) {
            $scope.onsubmitReportDataShow = false;
            $scope.reportDataShow = true;
            $scope.viewvehicleservices = response.data;
            $scope.usersLength = response.pagination.length;
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
        }, function(reason) {
            alert("Something went wrong");
        });
    };

    $scope.exportGetTripRejection = function(searchBy) {
        if (angular.isUndefined($scope.maalgaadi_city_id)) {
            return false;
        }

        window.location = '/api/getTripRejection?export=export&startDate=' + searchBy.startdate + '&endDate=' + searchBy.enddate + '&city_id=' + $scope.maalgaadi_city_id;
    };

    $scope.totalTripRejectCharge = 0;
    $scope.getTripRejection = function(searchBy, pagenum = 1) {
        if(angular.isUndefined($scope.maalgaadi_city_id)){
            return false;
        }
        searchBy.city_id = $scope.maalgaadi_city_id;
        
        if(angular.isUndefined(searchBy.startdate) || angular.isUndefined(searchBy.enddate) || angular.isUndefined(searchBy.city_id)){
            return false;
        }
        $scope.onsubmitReportDataShow = true;
        $scope.totalTripRejectCharge = 0;
        $scope.reportDataShow = false;
        var data = { page: pagenum, startDate: searchBy.startdate, endDate: searchBy.enddate, type: searchBy.type, city_id: searchBy.city_id };

        var resultData = CommonService.getDetails(data, 'getTripRejection');
        resultData.then(function successCallback(response) {
            $scope.onsubmitReportDataShow = false;console.log(response)
            $scope.reportDataShow = true;
            $scope.viewvehicleservices = response.data;
            $scope.usersLength = response.pagination.length;
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

    $scope.exportGetBookingFromApp = function(searchBooking) {
        var customer_id = $("#organization_id").val();
        var customerOrg = '';
        
        if(angular.isUndefined($scope.maalgaadi_city_id)){
            return false;
        }
        searchBooking.city_id = $scope.maalgaadi_city_id;

        if(angular.isDefined($scope.searchBookingReport.customerOrg)){
            customerOrg = $scope.searchBookingReport.customerOrg;
        }
        window.location = '/api/bookinDetailFromApp?export=excel&startDate=' + $scope.searchBooking.complete_time + '&endDate=' + $scope.searchBooking.accept_time + '&org=' + customerOrg + '&customer_id=' + customer_id + '&city_id='+ $scope.searchBooking.city_id;
    };
  
    $scope.getCustomerLastOrder = function(newPage, searchCustomer) {
        console.log(newPage,searchCustomer);
        customerLastOrder(newPage, searchCustomer);
    };

    function customerLastOrder(newPage, searchCustomer){console.log(searchCustomer.city_id)
        
        if(angular.isUndefined($scope.maalgaadi_city_id)){
            return false;
        }
        searchCustomer.city_id = $scope.maalgaadi_city_id;

        $scope.customerorderDetails = '';
        var data = {
            page: newPage,
            city_id: searchCustomer.city_id
        }
        console.log(data);
        var dataRes = CommonService.getDetails(data, 'customerLastOrder');
        dataRes.then(function(response) {
            
            $scope.customerorderDetails = response.data;
            $scope.totalItems = response.pagination.total;
            $scope.currentPage = response.pagination.current_page;
            $scope.perPage = response.pagination.per_page;
            
        }, function(reason) {
            alert("Something went wrong");
        });
    }

    $scope.exportCustomerLastOrder = function(customerDetails){
        if(angular.isUndefined($scope.maalgaadi_city_id)){
            return false;
        }
        window.location = '/api/customerLastOrder?export=excel&city_id='+$scope.maalgaadi_city_id;
    }
    
    $scope.getBookingFromApp = function(searchBooking, pageNumber, requestType) {
        
        $scope.searchBookingReport.customer_name = '';
        $scope.searchBookingReport.customer_org = '';
        $scope.bookingReportDataShow = false;
        $scope.onsubmitbookingReportDataShow = true;
        var customer_id = $("#organization_id").val();
        var organization = '';
        if(angular.isDefined($scope.searchBookingReport.customerOrg)){
            organization = $scope.searchBookingReport.customerOrg;
        }
        if(angular.isUndefined($scope.maalgaadi_city_id)){
           return false;
        }
        $scope.searchBooking.city_id = $scope.maalgaadi_city_id;
        var data = { startDate: $scope.searchBooking.complete_time, endDate: $scope.searchBooking.accept_time, org: organization, allotment_type: $scope.searchBooking.allotment_type,customer_id:customer_id,city_id: $scope.searchBooking.city_id };
        var dataRes = CommonService.getDetails(data, 'bookinDetailFromApp');
        dataRes.then(function(response) {
            $scope.bookingDetialsList = response.data;
            $scope.onsubmitbookingReportDataShow = false;
            $scope.bookingReportDataShow = true;
                   
        }, function(reason) {
            alert("Something went wrong");
        });

    }
     $scope.favouriteDriverDetails = function(){
        $scope.favouriteDriver = {};
        $scope.favouriteDriver.report_type = 'customer';
    }
    
    $scope.getFavouriteDriverDetails = function(data){
        var customer_org_id = $("#organization_id").val();
        data.customer_id = customer_org_id;
        console.log(data);

        $scope.onsubmitFavouriteDriverLoader = true;
        $scope.onsubmitFavouriteDriverResult = false;
        var dataRes = CommonService.getDetails(data, 'getFavouriteDriverDetails');
        dataRes.then(function(response) {
            $scope.favouriteDriverInfo = response;
            $scope.onsubmitFavouriteDriverLoader = false;
            $scope.onsubmitFavouriteDriverResult = true;
            $scope.errorMessage = '';
            if(angular.isDefined(response.error)){
                $scope.errorMessage = response.error.message;
            }
            // console.log(response.data);
        }, function(reason) {
            alert("Something went wrong");
        });
    }

    $scope.changeFavouriteDriverType = function(){
        $scope.favouriteDriverInfo = {};
        if($scope.favouriteDriver.report_type == 'customer'){
            $scope.getOrganization();
        }
    }
    

    $scope.getExpiredBooking = function(searchBooking, pageNumber, requestType) {
        if(angular.isUndefined($scope.searchBooking.complete_time) || angular.isUndefined($scope.searchBooking.accept_time) || angular.isUndefined($scope.maalgaadi_city_id)){
            return false;
        }
        
        searchBooking.city_id = $scope.maalgaadi_city_id;
        $scope.bookingReportDataShow = false;
        $scope.onsubmitbookingReportDataShow = true;
        var data = { type: $scope.type, page: pageNumber, startDate: $scope.searchBooking.complete_time, endDate: $scope.searchBooking.accept_time, cluster: $scope.searchBookingReport.cluster, action: $scope.searchBooking.action,city_id: $scope.searchBooking.city_id };
        var dataRes = CommonService.getDetails(data, 'getExpiredBooking');
        dataRes.then(function(response) {
            $scope.bookingDetialsList = response.data;
            $scope.totalItems = response.pagination.total;
            $scope.currentPage = response.pagination.current_page;
            $scope.perPage = response.pagination.per_page;
            if (requestType == 1) {
                setTimeout(function() {
                    $scope.currentPage = 1;
                    var previousActive = $('dir-pagination-controls ul li.active').find('a').text();
                    if (Number(previousActive) > 1) {
                        $('dir-pagination-controls ul li:nth-child(2)').find('a').click();
                    }
                }, 400);
            }
            $scope.onsubmitbookingReportDataShow = false;
            $scope.bookingReportDataShow = true;
            $scope.data = {};


        }, function(reason) {
            alert("Something went wrong");
        });

    };

    $scope.exportExpiredBooking = function() {
        var cluster = '';
        var action = '';
        if(angular.isDefined($scope.searchBookingReport.cluster)){
            cluster = $scope.searchBookingReport.cluster;
        }
        if(angular.isDefined($scope.searchBooking.action)){
            action = $scope.searchBooking.action;
        }
        if(angular.isUndefined($scope.maalgaadi_city_id)){
            return false;
        }
        $scope.searchBooking.city_id = $scope.maalgaadi_city_id;
        window.location = '/api/getExpiredBooking?export=excel&startDate=' + $scope.searchBooking.complete_time + '&endDate=' + $scope.searchBooking.accept_time + '&cluster=' + cluster + '&action=' + action +'&city_id='+$scope.maalgaadi_city_id;
    };
    
    $scope.getAverageRatingDetails = function(data, pagenum, requestType){
        var reportType = data.report_type;
        var customer_org_id = $("#organization_id").val();
        data.export = '';
        var paginate = 10;
        if(angular.isDefined(data.entries)){
            paginate = data.entries;
        }
        data.paginate = paginate;
        $scope.averageRatingInfo = {};
        data.customer_id = customer_org_id;
        data.page = pagenum;
        $scope.onsubmitAverageRatingLoader = true;
        $scope.onsubmitAverageRatingResult = false;
        if(angular.isUndefined($scope.maalgaadi_city_id)){
            return false;
        }
        data.city_id = $scope.maalgaadi_city_id;
        var dataRes = CommonService.getDetails(data,'getAverageRatingDetails');
        dataRes.then(function(response) {
            if(angular.isDefined(response.error)){
                $scope.averageRatingInfo = '';
                return false;
            }
            $scope.averageRatingInfo = response.data;

             $scope.totalItems = response.total;
            $scope.currentPage = response.current_page;
            $scope.perPage = response.per_page;
            $scope.onsubmitbookingReportDataShow = false;
            $scope.bookingReportDataShow = true;

            if (requestType == 1) {
                setTimeout(function() {
                    $scope.currentPage = 1;
                    var previousActive = $('dir-pagination-controls ul li.active').find('a').text();
                    if (Number(previousActive) > 1) {
                        $('dir-pagination-controls ul li:nth-child(2)').find('a').click();
                    }
                }, 400);

            }
            $scope.onsubmitAverageRatingLoader = false;
            $scope.onsubmitAverageRatingResult = true;
        }, function(reason) {
            alert("Something went wrong");
        });
    }

    $scope.exportAverageRatingDetails = function(data){
        data.export = 'excel';
         if(angular.isUndefined($scope.maalgaadi_city_id)){
            return false;
        }
        
        if(angular.isDefined(data.report_type) && data.report_type == 'customer'){
            var customerName = '';
            var customerId = '';
            var customerOrg = '';
            var customerPhone = '';
            if(angular.isDefined(data.customer_name)){
                customerName = data.customer_name;
            }
            if(angular.isDefined(data.customer_org)){
                customerOrg = data.customer_org;
            }
            if(angular.isDefined(data.phone)){
                customerPhone = data.phone;
            }
            if(angular.isDefined(data.customer_id)){
                customerId = data.customer_id;
            }
            window.location = '/api/getAverageRatingDetails?export=excel&customer_name='+customerName+'&customer_org='+customerOrg+'&phone='+customerPhone+'&customer_id'+customerId+'&report_type=customer&city_id='+$scope.maalgaadi_city_id;
        }
        if(angular.isDefined(data.report_type) && data.report_type == 'driver'){
            var vehicleRegNo = '';
            if(angular.isDefined(data.vehicle_reg_no)){
                vehicleRegNo = data.vehicle_reg_no;
            }
            window.location = '/api/getAverageRatingDetails?export=excel&vehicle_reg_no='+vehicleRegNo+'&report_type=driver&city_id='+$scope.maalgaadi_city_id;
        }
    }

    $scope.averageRatingDetails = function(){
        $scope.averageRating = {};
        $scope.averageRating.report_type = 'customer';
    }

    $scope.changeaverageRatingType = function(averageRating){
        
        $('#customer-average-rating-datatable').DataTable().clear();
        $('#customer-average-rating-datatable').DataTable().destroy();
        $('#driver-average-rating-datatable').DataTable().clear();
        $('#driver-average-rating-datatable').DataTable().destroy();
        $scope.averageRatingInfo = {};
        
        if($scope.averageRating.report_type == 'customer'){
            $scope.getOrganization();
        }
        $scope.onsubmitAverageRatingLoader = false;
        $scope.onsubmitAverageRatingResult = false;
    }

    $scope.allotedBookingDetails = function(allotmentBooking = ''){
        $scope.autometicAllot = 0;
        $scope.appBookingAllot = 0;
        $scope.customerAppBooking = 0;
        $scope.customerPanelBooking = 0;
        console.log(allotmentBooking);
        if(allotmentBooking){
            var dataRes = CommonService.getDetails(allotmentBooking,'getAllotBookingDetails');
            dataRes.then(function(response) {
                if(angular.isDefined(response.error)){
                    swal(response.error.message);
                }else{
                    $scope.autometicAllot = response.autometicAllot;
                    $scope.appBookingAllot = response.appBookingAllot;
                    $scope.customerAppBooking = response.customerAppBooking;
                    $scope.customerPanelBooking = response.customerPanelBooking;
                }
            }, function(reason) {});
            
        }
    }
    $scope.initialAllotmentBooking = function(){
        $scope.autometicAllot = 0;
        $scope.appBookingAllot = 0;
        $scope.customerAppBooking = 0;
        $scope.customerPanelBooking = 0;
    }

    $scope.customerDriverAmountInitilazion = function(){
        $scope.onsubmitCustomerDriverDataShow = false;
    }
    $scope.getCustomerDriverWalletDetials = function() {
        $scope.customerDriverDataShow = false;
        $scope.onsubmitCustomerDriverDataShow = true;
        var data = { start_date: $scope.start_date, end_date : $scope.end_date, city_id : $scope.city_id ,export:''};
        var result = CommonService.getDetails(data, 'getCustomerDriverWalletDetials');;
        // console.log(data);
        result.then(function successCallback(response) {
            // console.log(response);
            $scope.customerDriverDataShow = true;
            $scope.onsubmitCustomerDriverDataShow = false;
            $scope.customerDriverAmount = response;
        }, function errorCallback(response) {});
    };

    $scope.exportCustomerDriverWalletDetials = function() {
        var date = '';
        if (angular.isUndefined($scope.start_date) || angular.isUndefined($scope.end_date) || angular.isUndefined($scope.city_id)) {
            return false;
        }
        window.location = "/api/getCustomerDriverWalletDetials?export=excel&start_date=" + $scope.start_date + "&end_date=" + $scope.end_date +"&city_id="+$scope.city_id;
    }

    $scope.getCancelledBookingData = function(data, pagenum = 1){
        var currentState = $state.current.name;
        if(angular.isUndefined(data)){
            $scope.searchBookingCustomer = {}
            data = {}
            var cuurentDate = new Date();
            var month = cuurentDate.getMonth() + 1;
            var year = cuurentDate.getFullYear();
            var date = cuurentDate.getDate();
            if(date < 10){
                date = '0'+date;
            }
            if(month < 10){
                month = '0'+month;
            }
            $scope.searchBookingCustomer.date =  date + '-'+ month + '-' + year;
            data.date = $scope.searchBookingCustomer.date;
        }
        if(angular.isUndefined($scope.maalgaadi_city_id)){
            var cityId = $localStorage.defaultCityId;
        }else{
            var cityId = $scope.maalgaadi_city_id;
        }
        if(angular.isUndefined($scope.cancel_booking_type)){
            $scope.cancel_booking_type = 10;
        }
        $scope.onsubmitbookingReportDataShow = true;
        $scope.bookingReportDataShow = false;
        var cancelationType = '';
        if(currentState == 'cancelled-booking'){
            cancelationType = 'cancelled-data';
        }
        if(currentState == 'on-demand-cancelled-booking'){
            cancelationType = 'od-cancelled-data';
        }
        var data = {city_id:cityId, date:data.date, cancel_type: cancelationType,type: $scope.cancel_booking_type,page: pagenum}
        var ratingDetails = CommonService.getDetails(data, 'getCancelledBookingData');
        ratingDetails.then(function(response) {
            $scope.onsubmitbookingReportDataShow = false;
            $scope.bookingReportDataShow = true;
            console.log(response);
            if(angular.isDefined(response.success)){
                $scope.bookingCancellationData = response.success.data;
                $scope.totalItems = response.success.pagination.total;
                $scope.currentPage = response.success.pagination.current_page;
                $scope.perPage = response.success.pagination.per_page;
                if (pagenum == 1) {
                    setTimeout(function() {
                        $scope.currentPage = 1;
                        var previousActive = $('dir-pagination-controls ul li.active').find('a').text();
                        if (Number(previousActive) > 1) {
                            $('dir-pagination-controls ul li:nth-child(2)').find('a').click();
                        }
                    }, 400);
                }
            }else{
                $scope.bookingCancellationData = {};
                $scope.totalItems = 0;
                $scope.currentPage = 0;
                $scope.perPage = 0;
                swal("Something went wrong");
            }
        }, function(reason) {
            alert("Something went wrong");
        });
    }

    $scope.getBookingCancellation = function(bookingCancellation, pagenum, requestType){
        if(angular.isUndefined($scope.maalgaadi_city_id)){
            return false;
        }
        $scope.onsubmitBookingCancellationLoader = true;
        $scope.onsubmitBookingCancellationResult = false;
        var data = { type: $scope.bookingCancellation.type, page: pagenum, startDate: $scope.bookingCancellation.startDate, endDate: $scope.bookingCancellation.endDate, cityId: $scope.maalgaadi_city_id};
        var result = CommonService.getDetails(data, 'getBookingCancellationData');
        result.then(function(response) {
            $scope.onsubmitBookingCancellationLoader = false;
            $scope.onsubmitBookingCancellationResult = true;
            console.log(response)
            if(angular.isDefined(response.success)){
                var response = response.success;
                $scope.cancelBookingData = response.data;
                $scope.totalItems = response.paginate.total;
                $scope.currentPage = response.paginate.current_page;
                $scope.perPage = response.paginate.per_page;
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
            else
            {
                $scope.cancelBookingData = {}
                $scope.totalItems = '';
                 $scope.currentPage = '';

                 $scope.perPage = '';
            }
        }, function(reason) {
            alert("Something went wrong");
        });
    }

    $scope.exportBookingCancellation = function(){
        if (angular.isUndefined($scope.bookingCancellation.startDate) || angular.isUndefined($scope.bookingCancellation.endDate) || angular.isUndefined($scope.maalgaadi_city_id)) {
            return false;
        }
        window.location = "/api/getBookingCancellationData?export=excel&startDate=" + $scope.bookingCancellation.startDate + "&endDate=" + $scope.bookingCancellation.endDate +"&cityId="+$scope.maalgaadi_city_id;
    }

    $scope.getDiscountCoupon = function(couponDetails, pagenum, requestType){
        console.log(couponDetails);
        if(angular.isUndefined($scope.maalgaadi_city_id)){
            return false;
        }
        $scope.onsubmitDiscountCouponLoader = true;
        $scope.onsubmitDiscountCouponResult = false;
        var data = { type: couponDetails.type, page: pagenum,couponCode: couponDetails.discount_code, startDate: couponDetails.startDate, endDate: couponDetails.endDate, cityId: $scope.maalgaadi_city_id , couponType: couponDetails.selected};
        console.log(data);
        // return false;
        var result = CommonService.getDetails(data, 'getDiscountCouponData');
        result.then(function(response) {
            $scope.onsubmitDiscountCouponLoader = false;
            $scope.onsubmitDiscountCouponResult = true;
            console.log(response)
            if(angular.isDefined(response.success)){
                var response = response.success.data;
                $scope.dicountCouponCode = response.data;
                $scope.totalItems = response.total;
                $scope.currentPage = response.current_page;
                $scope.perPage = response.per_page;
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
            else if(angular.isDefined(response))
            {
                $scope.dicountCouponCode = response.data;
                $scope.totalItems = response.total;
                $scope.currentPage = response.current_page;
                $scope.perPage = response.per_page;
            }
            else
            {
                $scope.cancelBookingData = {}
                $scope.totalItems = '';
                 $scope.currentPage = '';

                 $scope.perPage = '';
            }
        }, function(reason) {
            alert("Something went wrong");
        });
    }

    $scope.exportDiscountCoupon = function(discountCoupon){
        
        window.location = "/api/getDiscountCouponData?export=excel&startDate=" + $scope.discountCoupon.startDate + "&endDate=" + $scope.discountCoupon.endDate +"&cityId="+$scope.maalgaadi_city_id + "&couponCode="+discountCoupon.discount_code + "&couponType="+ discountCoupon.selected;
    }

    $scope.getDiscountCouponCode = function(type,city_id) {
        console.log(city_id,type, "dcode");
        if(angular.isUndefined(city_id)){
            city_id = $localStorage.defaultCityId;
        }
            var data = {city_id : city_id, type: type};
            var result = CommonService.getDetails(data,"getDiscountCouponCode");
            result.then(function successCallback(response) {
                console.log(response);
                $scope.discountCodeDetails = response;
                console.log($scope.discountCodeDetails);
            },function errorCallback(response) {});
    };

    $scope.getPrimeDriverData = function(pagenum, requestType, driver){
        console.log(driver);
        if(angular.isUndefined($scope.maalgaadi_city_id)){
            return false;
        }
        $scope.onsubmitLoader = true;
        $scope.onsubmitResult = false;
        var data = { type: driver.type, page: pagenum, startDate: driver.startDate, endDate: driver.endDate, cityId: $scope.maalgaadi_city_id, mg_id: driver.mg_id};
        console.log(data);
        // return false;
        var result = CommonService.getDetails(data, 'getPrimeDriverData');
        result.then(function(response) {
            $scope.onsubmitLoader = false;
            $scope.onsubmitResult = true;
            console.log(response)
            if(angular.isDefined(response.success)){
                // var response = response.success.data;
                $scope.driverPrimeData = response.success.data;
                $scope.totalItems = response.success.paginate.total;
                $scope.currentPage = response.success.paginate.current_page;
                $scope.perPage = response.success.paginate.per_page;
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
            else
            {
                $scope.driverPrimeData = {};
                $scope.totalItems = '';
                 $scope.currentPage = '';
                 $scope.perPage = '';
            }
        }, function(reason) {
            alert("Something went wrong");
        });
    }
    
    $scope.exportPrimeDriverData = function(driver){
        var mgId = '';
        if(angular.isDefined(driver.mg_id)){
            mgId = driver.mg_id;
        }
        window.location = "/api/getPrimeDriverData?export=excel&startDate=" + $scope.driver.startDate + "&endDate=" + $scope.driver.endDate +"&cityId="+$scope.maalgaadi_city_id+'&mg_id='+mgId ;
   
    }

     $scope.setDefaultCustomer = function(){
        $scope.users = {};
        $scope.users.report_type = 'customer';
    }
   
    $scope.getCustomerDriverWalletDetails = function(users, requestType, pagenum){
        if(angular.isUndefined($scope.maalgaadi_city_id)){
            return false;
        }
        users.page = pagenum;
        users.city_id = $scope.maalgaadi_city_id;
        users.organization_id = $('#organization_id').val();
        console.log(users);
        $scope.onsubmitResult = false;
        $scope.onsubmitLoader = true;
         var dataRes = CommonService.getDetails(users, 'getCustomerDriverWalletDetails');
        dataRes.then(function(response) {
            $scope.onsubmitResult = true;
            $scope.onsubmitLoader = false;
            if(angular.isDefined(response.success)){
                var response = response.success.data;
                $scope.customerDriverInfo = response.data;
                $scope.totalItems = response.total;
                $scope.currentPage = response.current_page;
                $scope.perPage = response.per_page;
                if (requestType == 1) {
                    setTimeout(function() {
                        $scope.currentPage = 1;
                        var previousActive = $('dir-pagination-controls ul li.active').find('a').text();
                        if (Number(previousActive) > 1) {
                            $('dir-pagination-controls ul li:nth-child(2)').find('a').click();
                        }
                    }, 400);
                }
            }else{

            }
            console.log(response);
        }, function(reason) {
            alert("Something went wrong");
        });
    }
    $scope.changeCustomerDriverType = function(){
        $scope.users.remark = '';
        // $scope.favouriteDriverInfo = {};
        $scope.customerDriverInfo = {};
        $scope.totalItems = 0;
        $scope.currentPage = 0;
        $scope.perPage = 0;
        if($scope.users.report_type == 'customer'){
            $scope.getOrganization();
        }
    }

    $scope.exportCustomerDriverWalletDetails = function(users){
        var organizationId = $('#organization_id').val();
         window.location = "/api/getCustomerDriverWalletDetails?export=excel&startDate=" + $scope.users.startDate + "&endDate=" + $scope.users.endDate +"&city_id="+$scope.maalgaadi_city_id+'&mg_id='+$scope.users.mg_id+'&organization_id='+organizationId+'&report_type='+ $scope.users.report_type+'&remark='+$scope.users.remark ;
    }

    $scope.getDriverLoginDataOnBooking = function(pagenum, requestType, driver){
        console.log(driver);
        if(angular.isUndefined($scope.maalgaadi_city_id)){
            return false;
        }
        $scope.onSubmitLoader = true;
        $scope.onSubmitResult = false;
        var data = { type: driver.type, page: pagenum, startDate: driver.startDate, endDate: driver.endDate, cityId: $scope.maalgaadi_city_id, mg_id: driver.mg_id};
        var result = CommonService.getDetails(data, 'getDriverLoginDataOnBooking');
        result.then(function(response) {
            $scope.onSubmitLoader = false;
            $scope.onSubmitResult = true;
            console.log(response)
            if(angular.isDefined(response.success)){
                // var response = response.success.data;
                $scope.driverLoginData = response.success.data;
                // $scope.totalItems = response.success.paginate.total;
                // $scope.currentPage = response.success.paginate.current_page;
                // $scope.perPage = response.success.paginate.per_page;
                // if (requestType == 1) {
                //     setTimeout(function() {
                //         $scope.currentPage = 1;
                //         var previousActive = $('dir-pagination-controls ul li.active').find('a').text();
                //         if (Number(previousActive) > 1) {
                //             $('dir-pagination-controls ul li:nth-child(2)').find('a').click();
                //         }
                //     }, 400);

                // }
            }           
            else
            {
                $scope.driverPrimeData = {};
                $scope.totalItems = '';
                 $scope.currentPage = '';
                 $scope.perPage = '';
            }
        }, function(reason) {
            alert("Something went wrong");
        });
    }
    
    $scope.exportDriverLoginDataOnBooking = function(driver){
        var mgId = '';
        if(angular.isDefined(driver.mg_id)){
            mgId = driver.mg_id;
        }
        window.location = "/api/getDriverLoginDataOnBooking?export=excel&startDate=" + $scope.driver.startDate + "&endDate=" + $scope.driver.endDate +"&cityId="+$scope.maalgaadi_city_id+'&mg_id='+mgId ;
    }

    $scope.getCashbackView = function(pageNumber, search) {
        $scope.showTableFlag = false;
        search.city_id = $scope.maalgaadi_city_id;
        var data = { fromdate: search.fromdate, todate: search.todate, page : pageNumber, city_id : search.city_id};
        var CashbackResult = CommonService.getDetails(data,'getCashbackView');
        CashbackResult.then(function(response) {
            // console.log(response, "res");
            $scope.showTableFlag = true;
            $scope.viewCashback = response.data;
            $scope.totalItems = response.total;
            $scope.currentPage = response.current_page;
            $scope.perPage = response.per_page;
            $scope.mypage = response.current_page;
            if ($scope.mypage == 0) {
                $scope.perpg = response.total;
            } else {

               $scope.perpg = response.per_page;
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
}]);
