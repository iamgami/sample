(function() {
    "use strict";

    app.controller('AddBookingController', ['$scope', '$http', '$stateParams', '$rootScope', 'SweetAlert', '$timeout', '$window', '$interval', function($scope, $http, $stateParams, $rootScope, SweetAlert, $timeout, $window, $interval) {
        $scope.loginDriverDetials = [];
        $scope.disableField = false;
        $scope.booking = {};
        $scope.dropLandMark = {};
        $scope.pickLandMark = {};
        $scope.booking.customer = {};
        $scope.booking.pick = {};
        $scope.mapData = {};
        $scope.booking.info = {};
        $scope.booking.info.flagCustomer = false;
        $scope.booking.drop = {};
        $scope.booking.billing = {};
        $scope.liveTripList = {};
        $scope.booking.info = {};
        $scope.booking.billing.final_amount = 0;
        $scope.booking.billing.discount_amount = 0;
        $scope.booking.billing.discount = 0;
        $scope.booking.billing.drop_point_charge = 0;
        $scope.booking.billing.trip_charge = 0;
        $scope.booking.billing.unloading_charge = 0;
        $scope.booking.billing.loading_charge = 0;
        $scope.booking.billing.pod_charge = 0;
        $scope.booking.billing.estimated_distance = 0;
        $scope.booking.billing.buffer_estimated_distance = 0;
        $scope.booking.billing.lower_trip_charge = 0;
        $scope.booking.billing.fixedamount = 0;
        $scope.booking.billing.booking_type = 'normal';
        $scope.booking.info.allotment_type = 'no';
        $scope.booking_type_fixed = false;
        $scope.booking_type_normal = true;
        $scope.booking_type_fixed = false;
        $scope.reverse = '';
        $scope.bookingfixedAmount = false;
        $scope.booking.billing.hourly_fare = 0;
        $scope.booking.billing.normal_fare = 0;
        $scope.booking.billing.payment_type = 'post';
        $scope.limit = false;
        $scope.booktype=false;
        $scope.booking.billing.totalSurgeAmount = 0;
        $scope.booking.billing.totalSurgePercentage = 0;
        $scope.defaultdiv=false;
        $scope.booking.info.isOtherGood='';
        $scope.options = {
            componentRestrictions: { country: 'IN' }
        };
        $scope.booking.billing.tick_loading = 0;
        $scope.booking.billing.tick_unloading = 0;
        $scope.currentTime = new Date();
        $scope.booking.billing.book_later = false;
        var date = new Date();
        $scope.booking.billing.estimated_trip_time_text = '0 min';
        $scope.booking.info.booking_schedule_time = new Date(date.getTime() + 30 * 60000);

        $scope.currentStatusDetials = [];
         
        $scope.defaultGoodValue = function(type) { 
            
           if(type == '31'){
                $scope.defaultdiv = true; 
           }else{
                $scope.defaultdiv = false;
           }
        };

        $scope.getCustomerCreditLimit = function(org) {
            var customer_id = $("#omschrijving_id").val();
            var org = $("#omschrijving").val();

            //alert(customer_id);
            var data = { customer_id: customer_id };
            $http({
                method: 'GET',
                url: '/api/getCustomerCreditLimit',
                params: data
            }).then(function successCallback(response) {
                $scope.limit = response.data.limit;
                if ($scope.limit == true) {
                    $scope.booking.billing.payment_type = 'pre';
                } else {
                    $scope.booking.billing.payment_type = 'post';
                }

            }, function errorCallback(response) {});
        };

        $scope.beforeRender = function($view, $dates) {
            var minDate = moment().startOf($view).valueOf(); // Now
            angular.forEach($dates, function(date) {
                var localDateValue = date.localDateValue();
                date.selectable = localDateValue >= minDate;
            });
        };

        $scope.getVechicleCategory = function(city_id) {
            if(city_id != undefined)
            {
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
        

        // Get Type of Goods
        $scope.getTypeOfGoods = function(vehicleId) {
            //var customer=$scope.searchData.customerId;
            var customer = $("#omschrijving_id").val();
            var customer_mobile = $scope.booking.customer.mobile;
            var data = { vehicleId: vehicleId, customerId:customer , customer_mobile: customer_mobile};
            $http({
                method: 'GET',
                url: '/api/getVehicleGoods',
                params: data
            }).then(function successCallback(response) {
                $scope.goodDetials='';
                $scope.goodDetials = response.data.data;
                $scope.booking.info.type_of_goods=response.data.good_id

                if(response.data.goods_name == 'Others'){
                    $scope.booking.info.other_good =response.data.other_good;
                    $scope.booking.info.isOtherGood='Others';
                         // alert($scope.booking.info.isOtherGood);
                    $scope.defaultdiv = true;  
                }else{
                    $scope.defaultdiv = false;  
                }

                if(response.data.isOtherGoodInVehicle==0){
                    $scope.defaultdiv = false;

                }
                //console.log(response.data);
            }, function errorCallback(response) {});
        };

        $scope.getTypeOfGoods(0);


        $scope.getCancelDetials = function(cancelDetials) {
            $scope.cancelDetials = cancelDetials;
        };

        $scope.setFixedAmount = function(amountType) {
            $scope.booking.billing.discount = 0;
            $scope.booking.billing.discount_amount = 0;
            $scope.booking.info.discount_code = '';
            $("#promoMessage").text('');

            if (amountType == 'normal') {
                $scope.bookingfixedAmount = false;
            } else {
                $scope.booking.billing.fixedamount = 0;
                $scope.bookingfixedAmount = true;
            }
            
            if (amountType == 'hourly') {
               $scope.booktype=true;
               $scope.limit=false;
               $scope.booking.billing.payment_type = 'post';
            }else{
                var org = $("#omschrijving").val();
                $scope.getCustomerCreditLimit(org);
             }
        }

        $scope.inputFixedAmount = function() {
            if ($scope.booking.billing.fixedamount != '') {
                $scope.bookingfixedAmount = false;
            } else {
                $scope.bookingfixedAmount = true;
            }
            if ($scope.booking.billing.fixedamount == undefined) {
                $scope.bookingfixedAmount = true;
            }
        }

        $scope.inputPerHour = function() {
            if ($scope.booking.billing.approximatelyHours != '') {
                $scope.bookingfixedAmount = false;
            } else {
                $scope.bookingfixedAmount = true;
            }
            if ($scope.booking.billing.approximatelyHours == undefined) {
                $scope.bookingfixedAmount = true;
            }
        }


        $scope.cancelDriverBooking = function(bookingId) {
            var data = { booking_id: bookingId };

            $http({
                method: 'GET',
                url: '/api/cancelNotification',
                params: data
            }).then(function successCallback(response) {

            }, function errorCallback(response) {});
        };

        $scope.setPaymentDetials = function() {
            $scope.booking.vehicle = $scope.booking.vehicle;
            if($scope.booking.vehicle.id)
            {
                $scope.getTypeOfGoods($scope.booking.vehicle.id);
            }
            if($scope.booking.vehicle.allow_loading == 0)
            {
                $scope.booking.billing.tick_loading = 0;
        
            } 
            if($scope.booking.vehicle.allow_unloading == 0)
            {
                $scope.booking.billing.tick_unloading = 0;
            } 
            if($scope.booking.vehicle.allow_covered == 0)
            {
                $scope.booking.billing.covered_status = 'no';
            } 

        };

        $scope.loadingIsDone = true;

        $scope.emailAlready = false;
        $scope.checkEmail = function() {
            var data = { email: $scope.booking.customer.cust_email };

            $http({
                method: 'GET',
                url: '/api/checkemailBooking',
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
            var data = { phone: $scope.booking.customer.mobile };
            $http({
                method: 'GET',
                url: '/api/checkPhoneBooking',
                params: data
            }).then(function successCallback(response) {
                if (response.data.success) {
                    $scope.phoneAlready = true;
                } else {
                    $scope.phoneAlready = false;
                }
            }, function errorCallback(response) {});
        };

        $scope.organization = [];
        $scope.booking_customer_name = [];
        $scope.booking_customer_number = [];
        $scope.organizationFlag = false;
        $scope.organizationData = [];
        $scope.customedetails = [];
        $scope.customer_cust_email = [];
        $scope.customer_cust_address = [];
        $scope.customer_credit_limit = [];
        $scope.customer_final_balance = [];
        $scope.checkPhoneArray = [];
        $scope.organizationupdate = [];
        $scope.booking_customer_nameupdate = [];
        $scope.booking_customer_numberupdate = [];
        $scope.organizationUpdateFlag = false;
        $scope.organizationUpdateData = [];
        $scope.customeupdatedetails = [];
        $scope.customer_cust_emailupdate = [];
        $scope.customer_cust_addressupdate = [];
        $scope.customer_credit_limitupdate = [];
        $scope.customer_final_balanceupdate = [];

        $scope.getOrganizationUpdate = function() {
            $http({
                method: 'GET',
                url: '/api/getOrganizationBookingUpdateName',
            }).then(function successCallback(response) {
                $scope.organizationUpdateData = response.data;
                angular.forEach(response.data, function(value, key) {
                    $scope.organizationupdate.push({
                        label: value['cust_organization'],
                        value: value['id']
                    });
                   // $scope.organizationupdate.push(value['cust_organization']);
                    $scope.booking_customer_nameupdate.push(value['cust_name']);
                    $scope.booking_customer_numberupdate.push(value['cust_number']);
                });
                $("#omschrijving").autocomplete({
                    delay: 0,
                    source: $scope.organizationupdate,
                    
                    select: function(event, ui) {
                        $('#omschrijving').val(ui.item.label);
                        $('#omschrijving_id').val(ui.item.value);
                        return false;
                    },
                    focus: function(event, ui) {
                        $("#omschrijving").val(ui.item.label);
                        return false;
                    }

                });
                $scope.organizationUpdateFlag = true;
            }, function errorCallback(response) {});
        };

        /*$scope.getOrganizationUpdate();
         */
        

        $scope.getOrganizationListUpdate = function(category) {
            var phoneNumber = "";
            var cust_organization = "";
            var cust_email = "";
            var cust_name = "";
            if (category == 'number') {
                phoneNumber = $scope.booking.customer.mobile;
                cust_organization = '';
                cust_email = '';
                cust_name = '';
            } else if (category == 'org') {
                phoneNumber = '';
                cust_organization = $scope.booking.customer.cust_organization;
                cust_email = '';
                cust_name = '';
            } else if (category == 'email') {
                phoneNumber = '';
                cust_organization = '';
                cust_email = $scope.booking.customer.cust_email;
                cust_name = '';
            } else if (category == 'name') {
                phoneNumber = '';
                cust_organization = '';
                cust_email = '';
                cust_name = $scope.booking.customer.cust_name;
            }
            var customer_id = $("#omschrijving_id").val();
            var data = { phone: phoneNumber, organization: cust_organization, email: cust_email, name: cust_name ,customer_id: customer_id };
            var mobileNo = $stateParams.mobileNo;
            if (mobileNo && category == 'org' && angular.isDefined(cust_organization) && cust_organization == '') {
                return false;
            }
            $scope.getPromoCode();
            $http({
                method: 'GET',
                url: '/api/getCustomerBookingUpdateDetials',
                params: data
            }).then(function successCallback(response) {
                $scope.booking.customer = response.data.customer_details;
                $scope.booking.customer.mobile = response.data.customer_details.cust_number;
                $scope.drop = response.data.customer_details.drop;
                $scope.pick = response.data.customer_details.pick;
                $scope.allowDropPoints = response.data.allowed_drop_point;
            
                $scope.booking.info.type_of_goods=response.data.customer_details.goods_id
                if(response.data.customer_details.goods_name=='Others'){
                    $scope.booking.info.other_good =response.data.customer_details.other_goods;
                    $scope.booking.info.isOtherGood='Others';
                    $scope.defaultdiv = true;  
                }else{
                    $scope.defaultdiv = false;  
                }
                $scope.getVechicleCategory(response.data.customer_details.city_id);
                $scope.getCustomerLandmarks(response.data.customer_details.id);
                // $scope.disableField = true;
            }, function errorCallback(response) {

            });


            var compareCustomerUpdateName = $scope.booking.customer.cust_name;
            var compareCustomerUpdateOrg = $scope.booking.customer.cust_organization;
            var compareCustomerUpdateNumber = $scope.booking.customer.mobile;
            var compareCustomerUpdateEmail = $scope.booking.customer.cust_email;
            var compareCustomerUpdateAddress = $scope.booking.customer.cust_address;

            $scope.customeupdatedetails = [];
        };

        $scope.setDropPoint = function(dropDetials) {
            $scope.booking.drop.drop_name = dropDetials[0];
            $scope.booking.drop.drop_number = dropDetials[1];
            $scope.booking.drop.drop_organization = dropDetials[4];
            $scope.booking.drop.drop_location = dropDetials[2];
            $scope.booking.drop.drop_landmark = dropDetials[3];
            $scope.booking.drop.lat = dropDetials[5];
            $scope.booking.drop.lng = dropDetials[6];
            $scope.calculateEsitmated();
        };

        $scope.setPickPoint = function(pickDetials) {
            $scope.booking.pick.pickup_name = pickDetials[0];
            $scope.booking.pick.pickup_number = pickDetials[1];
            $scope.booking.pick.pickup_organization = pickDetials[4];
            $scope.booking.pick.pickup_landmark = pickDetials[3];
            $scope.booking.pick.lat = pickDetials[5];
            $scope.booking.pick.lng = pickDetials[6];
            $scope.calculateEsitmated();
        };

        $scope.setDropPoint1 = function(dropDetials) {
            $scope.booking.drop.drop_name = "NA";
            $scope.booking.drop.drop_number = dropDetials.number;
            $scope.booking.drop.drop_organization = "NA";
            $scope.booking.drop.drop_landmark = dropDetials.landmark;
            $scope.booking.drop.lat = dropDetials.lat;
            $scope.booking.drop.lng = dropDetials.lan;
            $scope.booking.info.flagCustomer = true;

            $scope.calculateEsitmated();
        };

        $scope.setPickPoint1 = function(pickDetials) {
            $scope.booking.pick.pickup_name = "NA";
            $scope.booking.pick.pickup_number = pickDetials.number;
            $scope.booking.pick.pickup_organization = "NA";
            $scope.booking.pick.pickup_landmark = pickDetials.landmark;
            $scope.booking.pick.lat = pickDetials.lat;
            $scope.booking.pick.lng = pickDetials.lan;
            $scope.booking.info.flagCustomer = true;
            $scope.calculateEsitmated();
        };

        $scope.setPoint = function(locDetials) {
            var focusArea = $(".targetAttr").attr('targetAttr');
            
            if(focusArea == 'pick')
            {
                $scope.booking.pick.pickup_name = "NA";
                $scope.booking.pick.pickup_number = locDetials.number;
                $scope.booking.pick.pickup_organization = "NA";
                $scope.booking.pick.pickup_landmark = locDetials.landmark;
                $scope.booking.pick.lat = locDetials.lat;
                $scope.booking.pick.lng = locDetials.lan;
                $scope.booking.info.flagCustomer = true;
            }
            else if(focusArea == 'drop')
            {
                $scope.booking.drop.drop_name = "NA";
                $scope.booking.drop.drop_number = locDetials.number;
                $scope.booking.drop.drop_organization = "NA";
                $scope.booking.drop.drop_landmark = locDetials.landmark;
                $scope.booking.drop.lat = locDetials.lat;
                $scope.booking.drop.lng = locDetials.lan;
                $scope.booking.info.flagCustomer = true;
            }
            else if(focusArea == 'multipleDrop')
            {
                var counter = $(".targetAttr").attr('targetAttrCounter');
                $scope.booking.multipleDrop.longitude[counter] = locDetials.lan;
                $scope.booking.multipleDrop.latitute[counter] = locDetials.lat;
                $scope.booking.multipleDrop.landmark[counter] = locDetials.landmark;
                $scope.booking.info.flagCustomer = true;
            }

            $('#selectFavLocation').modal('hide');
        };

        $scope.selectFav = function(focusArea , counter = 0) {
            $(".targetAttr").attr('targetAttr', focusArea);
            $(".targetAttr").attr('targetAttrCounter', counter);
            $scope.booking.info.calculate_normal = false;
            $scope.booking.billing.billing_type  = false;
        };

        $scope.dropPoints = [];
        $scope.allowDropPoints = 5; 
        $scope.booking.multipleDrop = {};
        $scope.booking.multipleDrop.longitude = {};
        $scope.booking.multipleDrop.address = {};
        $scope.booking.multipleDrop.landmark = {};
        $scope.booking.multipleDrop.latitute = {};
        var countId = 0;
        $scope.addMoreDropPoint = function() 
        {
            if($scope.allowDropPoints == undefined)
            {
                $scope.allowDropPoints = 5;
            }
            var newItemNo = $scope.dropPoints.length;
            var item = newItemNo;
            if (item < $scope.allowDropPoints) 
            {
                $('.add-booking-drop-location-cross').css('display', 'none');
                $scope.dropPoints.push({ 'id': 'multipleDrop' + newItemNo });
            } 
            else
            {
                swal("Maximum stop point limit reached");
            }
        }

        $scope.cancelDropLocation = function(booking, cancelId) {
            countId--;
            var index = cancelId.replace('multipleDrop', '');
            $scope.booking.multipleDrop.longitude[index] = '';
            $scope.booking.multipleDrop.latitute[index] = '';
            $scope.booking.multipleDrop.landmark[index] = '';
            $scope.dropPoints.pop({ 'id': 'multipleDrop1' });
            //$scope.calculateBookingEstimate(booking);
            setTimeout(function() {
                $('.add-booking-drop-location-cross:last').css('display', 'block');
                $scope.calculateEsitmated();
            }, 300);
        }

        $scope.calculateEstimatedAmount = function() {
            $scope.calculateEsitmated();

            function initMap() {
                var directionsService = new google.maps.DirectionsService;
                var directionsDisplay = new google.maps.DirectionsRenderer;
                var map = new google.maps.Map(document.getElementById('map'), {
                    zoom: 6,
                    center: { lat: 22.7196, lng: 75.8577 }
                });
                directionsDisplay.setMap(map);
                calculateAndDisplayRoute(directionsService, directionsDisplay);
            }

            function calculateAndDisplayRoute(directionsService, directionsDisplay) {
                directionsService.route({
                    origin: $scope.booking.pick.pickup_landmark,
                    destination: $scope.booking.drop.drop_landmark,
                    optimizeWaypoints: true,
                    travelMode: 'DRIVING'
                }, function(response, status) {

                });
            }
            initMap();
        }

        $scope.addBooking = function() {
            console.log($scope.booking, "addBooking")
            if ($scope.booking.billing.tick_loading == undefined) {
                alert("Please select loading Yes Or NO");
                return false;
            }

            if ($scope.booking.billing.tick_unloading == undefined) {
                alert("Please select unloading Yes Or NO");
                return false;
            }

            SweetAlert.swal({
                title: "Confirm",
                text: "Do you want to add this booking!",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                imageUrl: "assets/images/ic_launcher.png"
            }, function(isConfirm) {

                if (isConfirm) {
                    if ($scope.booking.billing.booking_type == "fixed" && $scope.booking.billing.fixedamount != 0) {
                        $scope.booking.billing.drop_point_charge = 0;
                        $scope.booking.billing.final_amount = 0;
                        $scope.booking.billing.loading_charge = 0;
                        $scope.booking.billing.pod_charge = 0;
                        $scope.booking.billing.trip_charge = 0;
                        $scope.booking.billing.unloading_charge = 0;
                        $scope.booking.type = 'fixed';
                    }
                    if ($scope.booking.billing.booking_type == "hourly" && $scope.booking.billing.approximatelyHours != 0) {
                        $scope.booking.billing.drop_point_charge = 0;
                        $scope.booking.billing.final_amount = 0;
                        $scope.booking.billing.loading_charge = 0;
                        $scope.booking.billing.pod_charge = 0;
                        $scope.booking.billing.unloading_charge = 0;
                        $scope.booking.type = 'hourly';
                    }
                    console.log($scope.booking.multipleDrop);
                    var data = { payment: $scope.booking.billing.payment_type, pick: $scope.booking.pick, drop: $scope.booking.drop, customer: $scope.booking.customer, vehicle: $scope.booking.vehicle, info: $scope.booking.info, billing: $scope.booking.billing, multipleDrop : $scope.booking.multipleDrop };

                    $http({
                        method: 'POST',
                        url: '/api/addBooking',
                        params: data
                    }).then(function successCallback(response) {
                        $window.location.href = '/booking-list';
                    }, function errorCallback(response) {

                    });
                }
            });


        };

        $scope.editBooking = function() {
            if ($scope.booking.info.no_of_drop_points != undefined) {
                SweetAlert.swal({
                    title: "Confirm",
                    text: "Do you want to update this booking!",
                    showCancelButton: true,
                    confirmButtonColor: "#DD6B55",
                }, function(isConfirm) {

                    if (isConfirm) {
                        if ($scope.booking.billing.booking_type == "fixed" && $scope.booking.billing.fixedamount != 0 && $scope.booking.info.no_of_drop_points != 0) {
                            $scope.booking.billing.drop_point_charge = 0;
                            $scope.booking.billing.final_amount = 0;
                            $scope.booking.billing.loading_charge = 0;
                            $scope.booking.billing.pod_charge = 0;
                            $scope.booking.billing.trip_charge = 0;
                            $scope.booking.billing.unloading_charge = 0;
                            $scope.booking.type = 'fixed';
                        }

                        $http({
                            method: 'GET',
                            url: '/api/editupdateBooking/' + $stateParams.bookingId,
                            params: $scope.booking
                        }).then(function successCallback(response) {
                            $window.location.href = '/booking-list';
                        }, function errorCallback(response) {});
                    }
                });

            }
        };
        $scope.calculatefixedamount = function() {

            $scope.booking.billing.totalSurgeAmount = 0;
            $scope.booking.billing.totalSurgePercentage = 0;
            $scope.booking.billing.discount = 0;
            $scope.booking.billing.discount_amount = 0;
            $scope.booking.info.discount_code = '';
            $("#promoMessage").text('');

            if ($scope.booking.billing.fixedamount == '') {
                $scope.booking.billing.final_amount = Number($scope.booking.billing.loading_charge) + Number($scope.booking.billing.unloading_charge) + Number($scope.booking.billing.drop_point_charge);
            } else {
                $scope.booking.billing.final_amount = Number($scope.booking.billing.loading_charge) + Number($scope.booking.billing.unloading_charge) + Number($scope.booking.billing.drop_point_charge) + Number($scope.booking.billing.fixedamount);
            }
            var Surgedata = { customerId : $scope.booking.customer.id , tripAmount: $scope.booking.billing.final_amount , vehicle_id : $scope.booking.vehicle.id ,bookingType : $scope.booking.billing.booking_type};
            $http({
                method: 'GET',
                url: '/api/getSurge',
                params: Surgedata
            }).then(function successCallback(response) {
                $scope.booking.billing.totalSurgeAmount = response.data.data.totalSurgeAmount;
                $scope.booking.billing.totalSurgePercentage = response.data.data.totalSurgePercentage;
                $scope.booking.billing.final_amount = $scope.booking.billing.final_amount + response.data.data.totalSurgeAmount;
            });
        }


        $scope.calculateEsitmated = function() {
            
            if ($scope.booking.drop.drop_landmark == "" && $scope.booking.pick.pickup_landmark == "") {
                alert('Pick & Drop lat are not found');
            }

            if ($scope.booking.billing.tick_loading != undefined) {
                var pre_trip_loading = $scope.booking.billing.tick_loading;
            }
            if ($scope.booking.billing.tick_unloading != undefined) {
                var pre_trip_unloading = $scope.booking.billing.tick_unloading;
            }

            var temp = $scope.booking.billing.booking_type;
            if (temp == 'hourly') {
                $scope.booking.billing.discount = 0;
                $scope.booking.billing.discount_amount = 0;
                if ($scope.booking.billing.approximatelyHours) {
                    var approximatelyHours = $scope.booking.billing.approximatelyHours;
                } else {
                    var approximatelyHours = 0;
                }

                var data = {
                    vehicle: $scope.booking.vehicle,
                    approximatelyHours: approximatelyHours,
                    customerId : $scope.booking.customer.id,
                    bookingType : $scope.booking.billing.booking_type,
                    normal_fare : $scope.booking.billing.normal_fare,
                    booking_schedule_time : $scope.booking.info.booking_schedule_time,
                    multipleDrop : $scope.booking.multipleDrop 
                };
                var hourlyDiscountPercentage = 0;
                var hourlyDiscountAmount = 0;
                var hourlyTripCharge = 0;
                var horlyTotalSurgeAmount = 0;
                var horlyTotalSurgePercentage = 0;

                $http({
                    method: 'POST',
                    url: '/api/calculateEsitmatedWithHourly',
                    params: data
                }).then(function successCallback(response) {
                    $scope.booking.billing.hourly_fare = response.data.totalTripHourlyCharge;
                    $scope.booking.billing.final_amount_hourly = response.data.totalTripHourlyCharge;
                    horlyTotalSurgeAmount = response.data.totalSurgeAmount;
                    horlyTotalSurgePercentage = response.data.totalSurgePercentage;
                    hourlyDiscountPercentage = response.data.discount;
                    hourlyDiscountAmount = response.data.discount_amount;
                    hourlyTripCharge =  response.data.trip_charge;

                }, function errorCallback(response) {});
            }
            $("#submitData").hide();
            var data = { pick: $scope.booking.pick, drop: $scope.booking.drop, customer: $scope.booking.customer, vehicle: $scope.booking.vehicle, info: $scope.booking.info, billing: $scope.booking.billing , multipleDrop : $scope.booking.multipleDrop };
            console.log(data);
            $http({
                method: 'POST',
                url: '/api/calculateEsitmated',
                params: data
            }).then(function successCallback(response) {
                $scope.booking.info.no_of_drop_points = response.data.no_of_drop_points
                $scope.booking.billing.estimated_distance = response.data.estimated_distance;
                $scope.booking.billing.buffer_estimated_distance = response.data.buffer_estimated_distance;
                $scope.booking.billing.estimated_trip_time_text = response.data.estimated_trip_time_text;
                $scope.booking.billing.estimated_trip_time = response.data.estimated_trip_time;
                $scope.booking.billing.loading_charge = response.data.loading_charge;
                $scope.booking.billing.unloading_charge = response.data.unloading_charge;
                $scope.booking.billing.drop_point_charge = response.data.drop_point_charge;
                
                $scope.booking.billing.lower_trip_charge = response.data.lower_trip_charge;
                $scope.booking.billing.discount = response.data.discount;
                $scope.booking.billing.discount_amount = response.data.discount_amount;
                $scope.booking.billing.pod_charge = response.data.pod_charge;

                if (response.data.differentSurgesDetails != "") 
                {
                    $scope.booking.billing.usageSurgeAmount = response.data.differentSurgesDetails.usageSurgeAmount;
                    $scope.booking.billing.usageSurgePercentage = response.data.differentSurgesDetails.usageSurgePercentage;
                    $scope.booking.billing.daySurgeAmount = response.data.differentSurgesDetails.daySurgeAmount;
                    $scope.booking.billing.daySurgePercentage = response.data.differentSurgesDetails.daySurgePercentage;
                    $scope.booking.billing.dateSurgeAmount = response.data.differentSurgesDetails.dateSurgeAmount;
                    $scope.booking.billing.dateSurgePercentage = response.data.differentSurgesDetails.dateSurgePercentage;
                    $scope.booking.billing.areaSurgeAmount = response.data.differentSurgesDetails.areaSurgeAmount;
                    $scope.booking.billing.areaSurgePercentage = response.data.differentSurgesDetails.areaSurgePercentage;
                    $scope.booking.billing.callCenterSurgeAmount = response.data.differentSurgesDetails.callCenterSurgeAmount;
                    $scope.booking.billing.callCenterSurgePercentage = response.data.differentSurgesDetails.callCenterSurgePercentage;
                    $scope.booking.billing.extraSurgeAmount = response.data.differentSurgesDetails.extraSurgeAmount;
                    $scope.booking.billing.extraSurgePercentage = response.data.differentSurgesDetails.extraSurgePercentage;
                }
                else
                {
                    $scope.booking.billing.usageSurgeAmount = 0;
                    $scope.booking.billing.usageSurgePercentage = 0;
                    $scope.booking.billing.daySurgeAmount = 0;
                    $scope.booking.billing.daySurgePercentage = 0;
                    $scope.booking.billing.dateSurgeAmount = 0;
                    $scope.booking.billing.dateSurgePercentage = 0;
                    $scope.booking.billing.areaSurgeAmount = 0;
                    $scope.booking.billing.areaSurgePercentage = 0;
                    $scope.booking.billing.callCenterSurgeAmount = 0;
                    $scope.booking.billing.callCenterSurgePercentage = 0;
                    $scope.booking.billing.extraSurgeAmount = 0;
                    $scope.booking.billing.extraSurgePercentage = 0;
                }

                if ($scope.booking.billing.booking_type == 'normal') {
                    $scope.booking.billing.totalSurgeAmount = response.data.totalSurgeAmount;
                    $scope.booking.billing.totalSurgePercentage = response.data.totalSurgePercentage;
                }
                if (temp != 'fixed') {
                    $scope.booking.billing.trip_charge = response.data.trip_charge;
                    if (temp == 'hourly' && $scope.booking.billing.hourly_fare > response.data.final_amount) {
                        $scope.booking.billing.discount = hourlyDiscountPercentage;
                        $scope.booking.billing.discount_amount = hourlyDiscountAmount;
                        $scope.booking.billing.trip_charge  = hourlyTripCharge;
                        $scope.booking.billing.totalSurgeAmount = horlyTotalSurgeAmount;
                        $scope.booking.billing.totalSurgePercentage = horlyTotalSurgePercentage;

                    } else {
                        $scope.booking.billing.discount = response.data.discount;
                        $scope.booking.billing.discount_amount = response.data.discount_amount;
                        $scope.booking.billing.lower_trip_charge = response.data.lower_trip_charge;
                        $scope.booking.billing.totalSurgeAmount = response.data.totalSurgeAmount;
                        $scope.booking.billing.totalSurgePercentage = response.data.totalSurgePercentage;
                    }
                    $scope.booking.billing.final_amount = response.data.final_amount;
                    $scope.booking.billing.final_amount_nornal = response.data.final_amount;
                    $scope.booking.billing.normal_fare = response.data.final_amount;
                } else {
                    $scope.booking.billing.final_amount = Number($scope.booking.billing.loading_charge) + Number($scope.booking.billing.unloading_charge) + Number($scope.booking.billing.drop_point_charge) + Number($scope.booking.billing.fixedamount);
                }

                $scope.booking.billing.tick_loading = pre_trip_loading;
                $scope.booking.billing.tick_unloading = pre_trip_unloading;
                $scope.mapData = response.data;
                $scope.booking.billing.booking_type = temp;
                if($scope.booking.billing.discount_amount == undefined){
                    $scope.booking.billing.discount_amount = 0;
                }
                $timeout($scope.drawRouteMap(), 5000);
            }, function errorCallback(response) {});

        };



        $scope.fetchNearestDriver = function(lat, lng, vehicle_category_id = '') {
            //$scope.calculateEsitmated();
            $scope.nearestDriver = [];
            var data = { lat: lat, lng: lng, vehicle_category_id: vehicle_category_id };
            $http({
                method: 'GET',
                url: '/api/getNearestDriver',
                params: data
            }).then(function successCallback(response) {
                $scope.nearestDriver = response.data;
                $('#datatable-buttons').DataTable().clear();
                $('#datatable-buttons').DataTable().destroy();
                setTimeout(function() {
                    $(document).ready(function() {
                        $('#datatable-buttons').DataTable({
                            "lengthMenu": [
                                [10, 25, 50, 100, -1],
                                [10, 25, 50, 100, "All"]
                            ],
                            destroy: true,
                        });

                    });


                }, 1000);

                if (!$scope.nearestDriver.error) {
                    if ($scope.nearestDriver.length != 0) {

                    }
                }

            }, function errorCallback(response) {

            });
        }

        $scope.getLoginDriversDetials = function() {
            /*$http({
                method: 'GET',
                url: '/api/getFreeDriversDetials',
            }).then(function successCallback(response) {
                $scope.driverDetials = response.data;
            }, function errorCallback(response) {});*/
        };
        $scope.getLoginDriversDetials();

        $scope.viewBookingDetail = function() {
            var bookingId = $stateParams.bookingId;
            $http({
                method: 'GET',
                url: '/api/booking/' + bookingId
            }).then(function successCallback(response) {
                $scope.allotBookingDetials = response.data;
                $scope.getVechicleCategory($scope.allotBookingDetials.city_id);
                $scope.fetchNearestDriver(response.data.favorite_location_detials.pickup_lat, response.data.favorite_location_detials.pickup_lng, response.data.vehicle_id);
            }, function errorCallback(response) {});

        }

        $scope.showTableFlag = false;
        $scope.upcoming = {};
        $scope.getCustomerDetialKnow = function(category) {
            if (category == 'number') {
                phoneNumber = $scope.booking.customer.mobile;
                cust_organization = '';
                cust_email = '';
                cust_name = '';
            } else if (category == 'org') {
                phoneNumber = '';
                cust_organization = $scope.booking.customer.cust_organization;
                cust_email = '';
                cust_name = '';
            } else if (category == 'email') {
                phoneNumber = '';
                cust_organization = '';
                cust_email = $scope.booking.customer.cust_email;
                cust_name = '';
            } else if (category == 'name') {
                phoneNumber = '';
                cust_organization = '';
                cust_email = '';
                cust_name = $scope.booking.customer.cust_name;
            }
            var data = { phone: phone.caller_id };
            $http({
                method: 'GET',
                url: '/api/getCustomerDetials',
                params: data
            }).then(function successCallback(response) {

            }, function errorCallback(response) {});
        };

        $scope.allotBooking = function() {
            $rootScope.allotBookingId = $stateParams.bookingId;
        };
        $scope.allotBooking();

        $scope.tripAllotment = function(driverId) {
            var bookingId = $stateParams.bookingId;
            if (angular.isUndefined(driverId)) {
                SweetAlert.swal({
                    title: "Opps?",
                    text: "No, Free Driver Availble!",
                    imageUrl: "assets/images/ic_launcher_red.png",
                    showCancelButton: true,
                    confirmButtonColor: "#DD6B55",
                }, function(isConfirm) {
                    // location.reload();
                });
            } else {
                var data = { booking_id: bookingId, driver_id: driverId };
                $http({
                    method: 'GET',
                    url: '/api/notification',
                    params: data
                }).then(function successCallback(response) {
                        var text = "Your Booking alloted successfully!";
                        var title = "Allot!";
                        if (response.data.error) {
                            text = "Trip is already assinged to another driver!!";
                            title = "Failed!";
                        }
                        swal({
                            title: title,
                            text: text,
                            showCancelButton: false,
                            closeOnConfirm: false,
                            imageUrl: "assets/images/ic_launcher.png"
                        }, function() {
                            location.href = '/booking-list';
                        });
                    },
                    function errorCallback(response) {});
            }
        };



        $scope.modalCancelBooking = function(bookingId) {
            $scope.resonebookingid = bookingId;
        }
        $scope.reasonCancelBooking = function() {
            if ($scope.reason.message != '') {
                var data = { booking_id: $scope.resonebookingid, reason: $scope.reason.message };
                $http({
                    method: 'POST',
                    url: '/api/cancelBooking',
                    params: data
                }).then(function successCallback(response) {

                    $scope.cancelDriverBooking($scope.resonebookingid);
                    swal({
                        title: "Cancelled!",
                        text: "You Booking cancelled successfully!",
                        imageUrl: "assets/images/ic_launcher_red.png",
                        showCancelButton: false,
                        closeOnConfirm: false
                    }, function() {
                        location.reload();
                    });
                }, function errorCallback(response) {

                });
            }
        }

        $scope.cancelBooking = function() {
            SweetAlert.swal({
                title: "Are you sure?",
                text: "You want to cancel this booking!",
                type: "input",
                showCancelButton: true,
                closeOnConfirm: false,
                animation: "slide-from-top",
                inputPlaceholder: "Give Reason"
            }, function(inputValue) {
                if (inputValue === false)
                    return false;
                if (inputValue === "") {
                    swal.showInputError("You need to give reason!");
                    return false
                }
                var data = { booking_id: bookingId, reason: inputValue };
                $http({
                    method: 'POST',
                    url: '/api/cancelBooking',
                    params: data
                }).then(function successCallback(response) {

                }, function errorCallback(response) {

                });
            });

        };
        $scope.promo_codes = [];
        $scope.getPromoCode = function() {
            var customer_id = $("#omschrijving_id").val();
            var data = { customer_id : customer_id};
            $http({
                method: 'POST',
                url: 'api/promoCodeList',
                params: data
            }).then(function successCallback(response) {
                $scope.codeList = response.data.data;
                angular.forEach(response.data.data, function(value, key) {
                    $scope.promo_codes.push(value['discount_code']);
                });
                
                $("#couponCode").autocomplete({
                    source: $scope.promo_codes
                });
            }, function errorCallback(response) {

            });
        }
        $scope.setPromoCode = function(discount_code) {
            
            $scope.booking.info.discount_code = discount_code;
            $scope.checkPromoCode(discount_code);
        };
        $scope.clearPromoCode = function() {
            var final_amount_temp = $scope.booking.billing.trip_charge + $scope.booking.billing.loading_charge +$scope.booking.billing.unloading_charge +
            $scope.booking.billing.drop_point_charge + $scope.booking.billing.totalSurgeAmount + $scope.booking.billing.pod_charge;
            $scope.booking.billing.final_amount = final_amount_temp;
            $scope.booking.billing.normal_fare = final_amount_temp;
            $scope.booking.billing.hourly_fare  = final_amount_temp;
            $scope.booking.billing.discount_amount = 0;
            $scope.booking.billing.discount_code_id = '';
            $("#promoMessage").text('');
            $("#couponCode").val('');
        };

        $scope.checkPromoCode = function(discount_code = '') {
            $("#promoMessage").text('');
            var discount_code = $scope.booking.info.discount_code;
            if(discount_code == '')
            {
                alert('Please enter promo code.');
            }
            var customer_id = $("#omschrijving_id").val();
           
            if($scope.booking.billing.booking_type == 'normal')
            {
               var trip_charge =  $scope.booking.billing.trip_charge;
                var final_amount_temp = parseInt(trip_charge) + parseInt($scope.booking.billing.loading_charge) + parseInt($scope.booking.billing.unloading_charge) +
             parseInt($scope.booking.billing.drop_point_charge) + parseInt($scope.booking.billing.totalSurgeAmount) + parseInt($scope.booking.billing.pod_charge);
            }
            else if($scope.booking.billing.booking_type == 'fixed')
            {
                var trip_charge =  $scope.booking.billing.fixedamount;
                var final_amount_temp = parseInt(trip_charge) + parseInt($scope.booking.billing.loading_charge) + parseInt($scope.booking.billing.unloading_charge) +
                parseInt($scope.booking.billing.drop_point_charge) + parseInt($scope.booking.billing.totalSurgeAmount) + parseInt($scope.booking.billing.pod_charge);
            }
            else if($scope.booking.billing.booking_type == 'hourly')
            {
                var trip_charge =  $scope.booking.billing.trip_charge;
                var final_amount_temp = parseInt(trip_charge) + parseInt($scope.booking.billing.loading_charge) + parseInt($scope.booking.billing.unloading_charge) +
                parseInt($scope.booking.billing.drop_point_charge) + parseInt($scope.booking.billing.totalSurgeAmount) + parseInt($scope.booking.billing.pod_charge);
            }

            var data = { customer_id : customer_id , 
                        discount_code : discount_code,  
                        billing_type : $scope.booking.billing.booking_type ,
                        vehicle_id : $scope.booking.vehicle.id ,
                        pickup_area_lat : $scope.booking.pick.lat, 
                        pickup_area_lng : $scope.booking.pick.lng, 
                        drop_area_lat : $scope.booking.drop.lat, 
                        drop_area_lng : $scope.booking.drop.lng, 
                        minimum_bill_amount : $scope.booking.billing.final_amount, 
                        trip_charge : trip_charge,
                        loading_charge : $scope.booking.billing.loading_charge, 
                        unloading_charge : $scope.booking.billing.unloading_charge, 
                        drop_point_charge : $scope.booking.billing.drop_point_charge, 
                        pod_charge : $scope.booking.billing.pod_charge,  
                        surge : $scope.booking.billing.totalSurgeAmount,
                        booking_schedule_time : $scope.booking.info.booking_schedule_time,
                        platform : 'callcentre'
                    };
            $http({
                method: 'POST',
                url: 'api/checkPromoCode',
                params: data
            }).then(function successCallback(response) {
                $("#promoMessage").removeClass('successMsg');
                $("#promoMessage").removeClass('errorMsg');

                if(response.data.success == true)
                {
                    console.log(response);
                    $scope.booking.billing.final_amount = response.data.data.final_bill;
                    $scope.booking.billing.normal_fare  = response.data.data.final_bill;
                    $scope.booking.billing.hourly_fare  = response.data.data.final_bill;
                    $scope.booking.billing.discount_amount = response.data.data.discount_amount;
                    $scope.booking.billing.discount_code_id = response.data.data.discount_code_id;
                    $("#promoMessage").text(response.data.message);
                    $("#promoMessage").addClass('successMsg');
                }
                else
                {
                    $("#promoMessage").addClass('errorMsg');
                    $("#promoMessage").text(response.data.message);
                    $scope.booking.billing.final_amount = final_amount_temp;
                    $scope.booking.billing.normal_fare = final_amount_temp;
                    $scope.booking.billing.hourly_fare  = final_amount_temp;
                    $scope.booking.billing.discount_amount = 0;
                    $scope.booking.billing.discount_code_id = '';
                    
                    $("#promoMessage").show();
                }
                $('#selectPromoCode').modal('hide');

            }, function errorCallback(response) {

            });
        };
        
        $scope.showSubmitBtn = function()
        {
            $("#submitData").show();
        }

        $scope.hideSubmitBtn = function()
        {
            $("#submitData").hide();
            $scope.booking.billing.final_amount = 0;
            $scope.booking.billing.normal_fare  = 0;
            $scope.booking.billing.hourly_fare  = 0;
            $scope.booking.billing.discount_amount = 0;
            $("#couponCode").val('');
            $("#promoMessage").hide();
        }

        $scope.convertInvoiceToPdf = function(custname) {

            html2canvas(document.getElementById('exportInvoice'), {
                onrendered: function(canvas) {
                    var data = canvas.toDataURL();
                    var docDefinition = {
                        content: [{
                            image: data,
                            width: 500,
                        }]
                    };
                    pdfMake.createPdf(docDefinition).download("Booking_Invoice.pdf");
                }
            });
        };


        $scope.drawRouteMap = function() {
            if ((!angular.isUndefined($scope.booking.pick.pickup_landmark)) && (!angular.isUndefined($scope.booking.drop.drop_landmark))) {
                var markers = new Array();
                var infowindow = new google.maps.InfoWindow();
                var bounds = new google.maps.LatLngBounds();
                var directionsService = new google.maps.DirectionsService;
                var directionsDisplay = new google.maps.DirectionsRenderer;

                function initMap() {
                    var directionsService = new google.maps.DirectionsService;
                    var directionsDisplay = new google.maps.DirectionsRenderer;
                    var map = new google.maps.Map(document.getElementById('route'), {
                        zoom: 6,
                        center: { lat: 22.7196, lng: 75.8577 }
                    });
                    directionsDisplay.setMap(map);
                    calculateAndDisplayRoute(directionsService, directionsDisplay);
                    setMarkers(map);
                }

                function calculateAndDisplayRoute(directionsService, directionsDisplay) {
                    if ($scope.booking.drop.drop_landmark != "" && $scope.booking.pick.pickup_landmark != "") {
                        var waypts = [];
                        var checkboxArray = $scope.booking.multipleDrop.landmark;
                        $.each(checkboxArray, function(key, value) {
                            waypts.push({
                              location: value,
                              stopover: true
                            });
                        });
                        directionsService.route({
                                origin: $scope.booking.pick.pickup_landmark,
                                destination: $scope.booking.drop.drop_landmark,
                                waypoints: waypts,
                                optimizeWaypoints: true,
                                travelMode: 'DRIVING'
                            },
                            function(response, status) {
                                if (status === 'OK') {
                                    directionsDisplay.setDirections(response);
                                    var route = response.routes[0];
                                } else {
                                    window.alert('Directions request failed due to ' + status);
                                }
                            });

                    }

                }
                initMap();

                function setMarkers(map) {
                    var image = {
                        url: 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png',
                        size: new google.maps.Size(20, 32),
                        origin: new google.maps.Point(0, 0),
                        anchor: new google.maps.Point(0, 32)
                    };
                    var shape = {
                        coords: [1, 1, 1, 20, 18, 20, 18, 1],
                        type: 'poly'
                    };
                    var address = [];
                    for (var i = 0; i < $scope.loginDriverDetials.length; i++) {
                        if ($scope.loginDriverDetials[i].current_status == 'inactive') {
                            var geocoder = geocoder = new google.maps.Geocoder();
                            var latlng = new google.maps.LatLng(parseFloat($scope.loginDriverDetials[i].lat), parseFloat($scope.loginDriverDetials[i].lng));
                            geocoder.geocode({ 'latLng': latlng }, function(results, status) {
                                address.push(results[1].formatted_address);
                            });

                            var marker = new google.maps.Marker({
                                position: {
                                    lat: parseFloat($scope.loginDriverDetials[i].lat),
                                    lng: parseFloat($scope.loginDriverDetials[i].lng)
                                },
                                map: map,
                                title: '<h4 style="color:black"><i class="fa fa-user" aria-hidden="true"></i> ' + $scope.loginDriverDetials[i].driver_name + '</h4><p style="color:black"><i class="fa fa-phone" aria-hidden="true"></i> ' + $scope.loginDriverDetials[i].driver_number + '<p style="color:black"><i class="fa fa-car" aria-hidden="true"></i> ' + $scope.loginDriverDetials[i].vehicle_reg_no + '<p style="color:black"><i class="fa fa-map-marker" aria-hidden="true"></i> ' + address[i]
                            });

                            google.maps.event.addListener(marker, 'click', function() {
                                infowindow.setContent(this.title);
                                infowindow.open(map, this);
                            });
                        } else if ($scope.loginDriverDetials[i].current_status == 'active') {
                            var geocoder = new google.maps.Geocoder();
                            var latlng = new google.maps.LatLng(parseFloat($scope.loginDriverDetials[i].lat), parseFloat($scope.loginDriverDetials[i].lng));
                            geocoder.geocode({ 'latLng': latlng }, function(results, status) {
                                address.push(results[1].formatted_address);
                            });
                            var marker = new google.maps.Marker({
                                position: {
                                    lat: parseFloat($scope.loginDriverDetials[i].lat),
                                    lng: parseFloat($scope.loginDriverDetials[i].lng)
                                },
                                map: map,
                                title: '<h4 style="color:black"><i class="fa fa-user" aria-hidden="true"></i> ' + $scope.loginDriverDetials[i].driver_name + '</h4><p style="color:black"><i class="fa fa-phone" aria-hidden="true"></i> ' + $scope.loginDriverDetials[i].driver_number + '<p style="color:black"><i class="fa fa-car" aria-hidden="true"></i> ' + $scope.loginDriverDetials[i].vehicle_reg_no + '<p style="color:black"><i class="fa fa-map-marker" aria-hidden="true"></i> ' + address[i]
                            });
                            google.maps.event.addListener(marker, 'click', function() {
                                infowindow.setContent(this.title);
                                infowindow.open(map, this);
                            });
                        }
                    }
                }
            }
        };

        $scope.addedPickUp = {};
        $scope.getCustomerLandmarks = function(customerId) {
            var data = { customer_id: customerId };
            $http({
                method: 'POST',
                url: '/api/getCustomerLandmarks',
                params: data
            }).then(function successCallback(response) {
                $scope.addedPickUp = response.data;
            }, function errorCallback(response) {

            });
        };

        $scope.hideLandmark = function(bookingId) {
            console.log(bookingId);
            var data = { booking_id: bookingId };
            $http({
                method: 'POST',
                url: '/api/hideLandmark',
                params: data
            }).then(function successCallback(response) {}, function errorCallback(response) {

            });
        };

        $scope.setPaymentOption = function() {
            if($scope.booking.customer.city_id == 2 && $scope.booking.billing.pod == true)
            {
                $("#pre_payment").attr("disabled", 'disabled');
                $("#pre_payment").attr('checked', false);
                $("#post_payment").attr('checked', true);
            }
            else
            {
                $("#pre_payment").attr("disabled", false);
            }
        };
        
    }]);
})();
