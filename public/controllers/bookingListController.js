(function() {
    'use strict';
    app.controller('BookingListController', ['$scope', '$http', '$stateParams', '$rootScope', '$timeout', 'SweetAlert', '$interval', 'PromiseUtils','CommonService','$localStorage', function($scope, $http, $stateParams, $rootScope, $timeout, SweetAlert, $interval, PromiseUtils, CommonService, $localStorage) {

        //booking list controller
        $scope.showTableFlag = false;
        $scope.booking_status = 'pending';
        $scope.report = {};
        //  paging  variable
        $scope.data = [];
        $scope.libraryTemp = {};
        $scope.totalItemsTemp = {};
        $scope.totalItems = 0;
        //  paging  variable end
        $scope.organization = [];
        $scope.customer_name = [];
        $scope.type = '10'

        $rootScope.changeMaalgaadiCity = function(){
            $scope.maalgaadi_city_id = $rootScope.default_city_id;
            $localStorage.defaultCityId = $rootScope.default_city_id;
            $scope.getCallCenterExecutive($localStorage.defaultCityId);
        } 
        $scope.getOrganization();
        $scope.getCustomerCashRecieveDetials = function(cust_org) {
            if (cust_org != '') {
                var customer_id = $('#organization_id').val();
                var data = { cust_organization: cust_org ,customer_id : customer_id};

                $http({
                    method: 'GET',
                    url: '/api/getCustomerCashRecieveDetials',
                    params: data
                }).then(function successCallback(response) {

                    $scope.CashRecieveDetials = response.data;
                    $scope.report.customer_name = $scope.CashRecieveDetials.cust_name;
                }, function errorCallback(response) {});

            } else {
                $scope.report.customer_name = '';

            }

        };

        $scope.pageChanged = function(newPage) {
            getResultsPage(newPage);
        };
        
        $scope.bookingListRecords = function(){
           setTimeout(function(){
             getResultsPage(1);

           },1000);
        }

        function getResultsPage(pageNumber) {
            $scope.report.search_record = '';
            if(angular.isUndefined($scope.maalgaadi_city_id)){
                $scope.report.city_id =  $localStorage.defaultCityId;
            }
            else{
                $scope.report.city_id = $scope.maalgaadi_city_id;
            }
            var customer_name = '';
            var customer_org = '';
            var booking_id = '';
            var booking_status = $scope.booking_status;
            
            var employee_id = '';
            

            if (angular.isDefined($scope.report)) {
                if (angular.isDefined($scope.report.customer_name)) {
                    customer_name = $scope.report.customer_name;
                }
                if (angular.isDefined($scope.report.customer_name)) {
                    customer_org = $scope.report.customer_org;
                }
                if (angular.isDefined($scope.report.booking_id)) {
                    booking_id = $scope.report.booking_id;
                }
                if (angular.isDefined($scope.report.booking_status)) {
                    booking_status = $scope.report.booking_status;
                }

                if(angular.isDefined($scope.report.employee)){
                    employee_id = $scope.report.employee.id;
                }
            }

            // var data = { page: pageNumber, status: $scope.booking_status };

            var data = { type: $scope.type, page: pageNumber, booking_id: booking_id, customer_name: customer_name, customer_org: customer_org, status: booking_status,city_id : $scope.report.city_id , employee_id: employee_id};


            $http({
                method: 'GET',
                url: '/api/allBookingSearch',
                params: data
            }).then(function successCallback(response) {
                // console.log(response, 'testing');

                $scope.bookingDetialsList = response.data.data;
                //console.log($scope.bookingDetialsList, 'testing');
                $scope.totalItems = response.data.pagination.total;
                $scope.currentPage = response.data.pagination.current_page;
                $scope.perPage = response.data.pagination.per_page;
                // console.log($response.data.pagination, 'testing1');
                // console.log($scope.currentPage, 'testing2');
                // console.log($scope.perPage, 'testing3');

            }, function errorCallback(response) {});

        }

        $scope.getCallCenterExecutive = function(maalgaadi_city_id) {
            if(angular.isUndefined(maalgaadi_city_id)){
                maalgaadi_city_id = $localStorage.defaultCityId;
            }
            // console.log(maalgaadi_city_id)
            var data = { city_id: maalgaadi_city_id}
            var getData = CommonService.getDetails(data,'getCallCenterExecutive');
            getData.then(function successCallback(response) {
                console.log(response);
                $scope.ceUsers = response;
            },
            function(reason) {});
        };

        $scope.getAllBooking = function(booking) {
            if (angular.isUndefined(booking)) {
                var booking_id = '';
                var customer_name = '';
                var customer_org = '';
                var city_id = $localStorage.defaultCityId;

            } else {
                booking_id = booking.booking_id;
                customer_name = booking.customer_name;
                customer_org = booking.customer_org;
                city_id = $scope.maalgaadi_city_id;
            }
            var employee_id = '';
            if(angular.isDefined(booking.employee)){
                employee_id = booking.employee.id;
            }
            var customer_id = $("#organization_id").val();
            var data = { type: $scope.type, booking_id: booking_id, customer_name: customer_name, customer_org: customer_org, status: $scope.booking_status, page: 1 , customer_id : customer_id , employee_id:employee_id,city_id : city_id};
            $http({
                method: 'GET',
                url: '/api/allBookingSearch',
                params: data
            }).then(function successCallback(response) {
                console.log(response, 'testing');
                $scope.bookingDetialsList = response.data.data;
                $scope.totalItems = response.data.pagination.total;
                $scope.currentPage = response.data.pagination.current_page;
                $scope.perPage = response.data.pagination.per_page;
                $scope.mypage = response.data.pagination.current_page;

                if ($scope.mypage == 0) {
                    $scope.perpg = response.data.pagination.total;
                } else {
                    $scope.perpg = response.data.pagination.per_page;
                }
                setTimeout(function() {
                    var previousActive = $('dir-pagination-controls ul li.active').find('a').text();
                    if (Number(previousActive) > 1) {
                        $('dir-pagination-controls ul li:nth-child(2)').find('a').click();
                    }
                }, 400);
            }, function errorCallback(response) {});
        }


        $scope.getBookings = function() {
            console.log($scope.booking_status);
            PromiseUtils.getPromiseHttpResult($http.get('/api/bookingList/' + $scope.booking_status))
                .then(function(res) {
                    $scope.bookingDetialsList = res.result;
                    $scope.showTableFlag = true;
                    setTimeout(function() {
                        $(document).ready(function() {
                            $('#booking-list-table').DataTable({
                                "order": [
                                    [0, "desc"]
                                ],
                                "lengthMenu": [
                                    [10, 25, 50, -1],
                                    [10, 25, 50, "All"]
                                ]
                            });

                        });

                        /* $('#column0_search').on('keyup', function() {
                             $('#booking-list-table').DataTable()
                                 .columns(0)
                                 .search(this.value)
                                 .draw();
                         });

                         $('#column1_search').on('keyup', function() {
                             $('#booking-list-table').DataTable()
                                 .columns(1)
                                 .search(this.value)
                                 .draw();
                         });

                         $('#column2_search').on('keyup', function() {
                             $('#booking-list-table').DataTable()
                                 .columns(2)
                                 .search(this.value)
                                 .draw();
                         });*/
                    }, 1000);

                });
        };

        // $scope.getBookings();

        //cancel booking detials
        $scope.getCancelDetials = function(cancelDetials) {
            $scope.cancelDetials = cancelDetials;
        };

        $scope.startTimerWithTimeout = function() {
            $scope.timerWithTimeout = 10;

            if ($scope.myTimeout) {
                $timeout.cancel($scope.myTimeout);
            }
            $scope.onTimeout = function() {
                $scope.timerWithTimeout++;
                $scope.myTimeout = $timeout($scope.onTimeout, 1000);
            }
            $scope.myTimeout = $timeout($scope.onTimeout, 1000);
        };
        $scope.startTimerWithTimeout();

        $scope.sendPOD = function() {
            var data = { booking_id: $scope.sendPodbooking, email: $scope.sendPodEmail };
            $http({
                method: 'POST',
                url: '/api/sendPODInMail',
                params: data
            }).then(function successCallback(response) {

            }, function errorCallback(response) {});
        };

        $scope.currentStatusDetials = {};
        $scope.checkStatusTime = function(status, startTime, updateTime) {
            $scope.currentStatusDetials.time = startTime;
            $scope.currentStatusDetials.update = updateTime
            $scope.currentStatusDetials.status = status;
            $scope.clock = { time: startTime, interval: 1000 };
            $interval(function() {
                $scope.clock.time = (Date.now() - $scope.currentStatusDetials.time);
            }, $scope.clock.interval);
        };
        $scope.searchRecordBookingList = function() {
            var $rows = $('#driver-attendance-single tbody tr');
            $('#search_record').keyup(function() {
                var val = $.trim($(this).val()).replace(/ +/g, ' ').toLowerCase();

                $rows.show().filter(function() {
                    var text = $(this).text().replace(/\s+/g, ' ').toLowerCase();
                    return !~text.indexOf(val);
                }).hide();
            });
        };

        $scope.getDriverTrack = function(driverId) {
            var data = { driver_id: driverId };
            $http({
                method: 'POST',
                url: '/api/getDriverTrack',
                params: data
            }).then(function successCallback(response) {
                var location = response.data.success.data;
                console.log(location);

                function initMap() {
                    var myLatLng = { lat: parseFloat(location.lat), lng: parseFloat(location.lng) };

                    var map = new google.maps.Map(document.getElementById('driverTrack'), {
                        zoom: 15,
                        center: myLatLng
                    });

                    var marker = new google.maps.Marker({
                        position: myLatLng,
                        map: map,
                        title: 'Current Location'
                    });
                }
                initMap();
            }, function errorCallback(response) {});
        };

        $scope.addFeedback = function(driver_id, booking_id) {
            var remark = { key: booking_id };
            var data = { booking_id: booking_id };
            $scope.remark = remark;
            $http({
                method: 'POST',
                url: '/api/getBookingRemark',
                params: data
            }).then(function successCallback(response) {
                $scope.allRemarks = response.data.success.data;

            }, function errorCallback(response) {});

        };
        $scope.submitRemark = function(remark) {

            var data = { booking_id: remark.key, remark_text: remark.value, remarkId: remark.id };
            if (remark.key) {
                $(".b-" + remark.key).addClass('remarkYes');
            }
            $http({
                method: 'POST',
                url: '/api/addBookingRemark',
                params: data
            }).then(function successCallback(response) {
                $scope.remark.value = '';
                SweetAlert.swal({
                    title: "Success",
                    text: "Successfully done.",
                    type: "success",
                    imageUrl: "assets/images/ic_launcher.png",
                    showCancelButton: false,
                    closeOnConfirm: true
                });
                $("#remarkbtn").text('Add');
                $scope.remark.id = '';
                $scope.allRemarks = response.data.success.data;
            }, function errorCallback(response) {});

        };
        $scope.deleteRemark = function(id) {

            var data = { remarkId: id };
            SweetAlert.swal({
                title: "Confirm",
                text: "Do you want to remove this remark!",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                imageUrl: "assets/images/ic_launcher.png"
            }, function(isConfirm) {
                if (isConfirm) {
                    $http({
                        method: 'POST',
                        url: '/api/deleteRemark',
                        params: data
                    }).then(function successCallback(response) {
                        $scope.allRemarks = response.data.success.data;

                    }, function errorCallback(response) {});
                }
            });
        };

        $scope.editRemark = function(remark) {

            $scope.remark = remark;
            $("#remarkbtn").text('Update');

        };

        $scope.cancelEditRemark = function(remark) {
            var remark = { value: '', id: '' };
            $scope.remark = remark;
            $("#remarkbtn").text('Add');
            $("#feedbackForm").modal('hide')
        };

        $scope.selectAll = function() {
            if ($scope.report.booking_id != "" || $scope.report.customer_org != "" || $scope.report.cust_organization != "") {
                $scope.booking_status = 'all';
                $scope.type = 50;
            } else {
                $scope.booking_status = 'pending';
            }
        };

        $scope.driverStatus = [];
        $scope.getDriverStatusInfo = function() {
            $http({
                method: 'POST',
                url: '/api/getDriverStatusInfo',
            }).then(function successCallback(response) {
                $scope.driverStatus = response.data;
            }, function errorCallback(response) {});
        };

        $scope.removeAndReBook = function(id , flag) {
            var data = { booking_id : id, flag : flag};
            SweetAlert.swal({
                title: "Confirm",
                text: "Are you sure?",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                imageUrl: "assets/images/ic_launcher.png"
            }, function(isConfirm) {
                if (isConfirm) {
                    $http({
                        method: 'POST',
                        url: '/api/removeAndReBook',
                        params: data
                    }).then(function successCallback(response) {
                        window.location.href = '/booking-list';
                    }, function errorCallback(response) {});
                }
            });
        };

        $scope.checkBookingExpired = function(bookingSheduleTime,id,URL)
        {
            var currentTime = new Date().getTime();
            currentTime = currentTime/1000;
            
            if(currentTime > bookingSheduleTime)
            {
                swal({
                title: 'What do you want to do?',
                text: "Booking "+id+ " has not been allotted yet. What do you want to do?",
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Remove',
                cancelButtonText: 'Re-Book',
                confirmButtonClass: 'btn btn-success',
                cancelButtonClass: 'btn btn-danger',
                buttonsStyling: false
                }, function (isConfirm) {
                    if (isConfirm) {
                        var data = { booking_id : id, flag : 0};
                        $http({
                            method: 'POST',
                            url: '/api/removeAndReBook',
                            params: data
                        }).then(function successCallback(response) {
                            window.location.href = '/booking-list';
                        }, function errorCallback(response) {});
                    } else {
                        var data = { booking_id : id, flag : 1};
                        $http({
                            method: 'POST',
                            url: '/api/removeAndReBook',
                            params: data
                        }).then(function successCallback(response) {
                            window.location.href = '/booking-list';
                        }, function errorCallback(response) {});
                    }
                });
                $(".sweet-alert p").html("Booking <a href='/booking-invoice/"+id+"' target='_blank'>"+id+ "</a> has not been allotted yet. What do you want to do?");
                return false;
            }
            else
            {

                window.location.href = URL;
                return true;
            }

            
        }

    }]);
})();
