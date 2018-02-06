(function() {
    "use strict";

    app.controller('EditBookingController', ['$scope', '$http', '$stateParams', '$rootScope', 'SweetAlert', '$timeout', '$window', '$interval', function($scope, $http, $stateParams, $rootScope, SweetAlert, $timeout, $window, $interval) {

        $scope.freezeAll = false;
        $scope.booking = {};
        $scope.booking.customer = {};
        $scope.booking.pick = {};
        $scope.mapData = {};
        $scope.booking.drop = {};
        $scope.booking.billing = {};
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
        $scope.booking.billing.fixedamount = 0;
        $scope.booking.billing.approximatelyHours = 0;
        $scope.booking.billing.buffer_estimated_distance = 0;
        $scope.booking.billing.lower_trip_charge = 0;
        $scope.booking.billing.booking_type = 'normal';
        $scope.booking_type_fixed = false;
        $scope.booking_type_normal = true;
        $scope.booking_type_fixed = false;
        $scope.reverse = '';
        $scope.bookingfixedAmount = false;
        $scope.booking.billing.hourly_fare = 0;
        $scope.booking.billing.normal_fare = 0;
        $scope.booking.billing.payment_type = '';
        $scope.booking.billing.totalSurgeAmount = 0;
        $scope.booking.billing.totalSurgePercentage = 0;
        $scope.booking.info.isOtherGood='';
        $scope.booking.billing.tick_loading = 0;
        $scope.booking.billing.tick_unloading = 0;
        $scope.defaultGoodValue = function(type) {
           if(type==20) {
                $scope.defaultdiv = true;  
           } else {
                $scope.defaultdiv = false;
           }
        };
        $scope.booking.billing.book_later = false;
        $scope.changeOrg = function() {
             alert($scope.booking.customer.customer_id);
        }
 
        $scope.options = {
            componentRestrictions: { country: 'IN' }
        };

        $scope.currentTime = new Date();
        var date = new Date();


        $scope.currentStatusDetials = [];
        $scope.getCustomerCreditLimitedit = function(org) {
            var customer_id = $("#omschrijving_id").val();
            var org = $("#omschrijving").val();
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

        $scope.checkStatusTime = function(status, startTime, updateTime) {
            $scope.currentStatusDetials.status = status;
            $scope.currentStatusDetials.time = startTime;
            $scope.currentStatusDetials.update = updateTime
            $scope.clock = { time: startTime, interval: 1000 };
            $interval(function() {
                $scope.clock.time = (Date.now() - $scope.currentStatusDetials.time);
            }, $scope.clock.interval);
        };

        $scope.beforeRender = function($view, $dates) {
            var minDate = moment().startOf($view).valueOf(); // Now
            angular.forEach($dates, function(date) {
                var localDateValue = date.localDateValue();
                date.selectable = localDateValue >= minDate;
            });
        };

        $scope.getVechicleCategory = function(city_id) {
            var data = {city_id : city_id};
            $http({
                method: 'GET',
                url: '/api/vehicle',
                params: data
            }).then(function successCallback(response) {
                $scope.vehicleCategoryDetialsByCity = response.data.result;
            }, function errorCallback(response) {});
        };
        

        // Get Type of Goods
        $scope.getTypeOfGoods = function(vehicleId,ischanged) {
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
               if(ischanged !=''){ 
                    $scope.booking.info.type_of_goods=response.data.good_id
                    if(response.data.goods_name=='Others'){
                        $scope.booking.info.other_good =response.data.other_good;
                        $scope.booking.info.isOtherGood='Others';
                        // alert($scope.booking.info.isOtherGood);
                        $scope.defaultdiv = true;  
                    }else{
                        $scope.defaultdiv = false;  
                    }
                } 


            }, function errorCallback(response) {});
        };
        //$scope.getTypeOfGoods(0);

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
                $scope.getCustomerCreditLimitedit(org);
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
            $scope.getTypeOfGoods($scope.booking.vehicle.id,'changed');
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

        $scope.setCustomer = function(customerDetials) {
            var mobile = $("#mobile").val();
            if ($scope.checkPhoneArray.indexOf(mobile) !== -1 || mobile == '') {
                $scope.booking.customer = customerDetials;
                $scope.booking.customer.wallet = customerDetials.final_balance;
                $scope.booking.customer.mobile = customerDetials.cust_number;
                $scope.freezeAll = true;
                $("#mobile").val($scope.booking.customer.cust_number);
                $("#cust_organization").val($scope.booking.customer.cust_organization);
                $("#cust_email").val($scope.booking.customer.cust_email);
                $scope.$apply();
            }
        };

        var mobile = {
            url: "/api/getOrganizationBookingName",

            getValue: "cust_number",

            template: {
                type: "description",
                fields: {
                    description: 'cust_organization',
                }
            },

            list: {
                onChooseEvent: function() {
                    var selectedItemValue = $("#mobile").getSelectedItemData();
                    $scope.setCustomer(selectedItemValue);
                },
                match: {
                    enabled: true
                }
            },
        };
        $("#mobile").easyAutocomplete(mobile);

        var organization = {
            url: "/api/getOrganizationBookingName",

            getValue: "cust_organization",

            template: {
                type: "description",
                fields: {
                    description: 'cust_number',
                }
            },

            list: {
                onChooseEvent: function() {
                    var selectedItemValue = $("#cust_organization").getSelectedItemData();
                    $scope.setCustomer(selectedItemValue);
                },
                match: {
                    enabled: true
                }
            },
        };
        $("#cust_organization").easyAutocomplete(organization);

        var email = {
            url: "/api/getOrganizationBookingName",

            getValue: "cust_email",

            template: {
                type: "description",
                fields: {
                    description: 'cust_organization',
                }
            },

            list: {
                onChooseEvent: function() {
                    var selectedItemValue = $("#cust_email").getSelectedItemData();
                    $scope.setCustomer(selectedItemValue);
                },
                match: {
                    enabled: true
                }
            },
        };
        $("#cust_email").easyAutocomplete(email);

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
                    //$scope.organizationupdate.push(value['cust_organization']);
                    $scope.booking_customer_nameupdate.push(value['cust_name']);
                    $scope.booking_customer_numberupdate.push(value['cust_number']);
                    $scope.customer_cust_emailupdate.push(value['cust_email']);
                    $scope.customer_cust_addressupdate.push(value['cust_address']);
                    $scope.customer_credit_limitupdate.push(value['credit_limit']);
                    $scope.customer_final_balanceupdate.push(value['final_balance']);
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

        $scope.getOrganizationListUpdate = function(category) {
            // setTimeout(function(){ 
                var phoneNumber = "";
                var cust_organization = "";
                var cust_email = "";
                var cust_name = "";
                var customer_id = $("#omschrijving_id").val();
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

            var data = { phone: phoneNumber, organization: cust_organization, email: cust_email, name: cust_name ,customer_id: customer_id};

            $http({
                method: 'GET',
                url: '/api/getCustomerBookingUpdateDetials',
                params: data
            }).then(function successCallback(response) {
                $scope.booking.customer = response.data.customer_details;
                $scope.booking.customer.mobile = response.data.customer_details.cust_number;
                $scope.drop = response.data.customer_details.drop;
                $scope.pick = response.data.customer_details.pick;
                $scope.getVechicleCategory(response.data.customer_details.city_id);
                $scope.getCustomerLandmarks(response.data.customer_details.id);
            }, function errorCallback(response) {

            });


            var compareCustomerUpdateName = $scope.booking.customer.cust_name;
            var compareCustomerUpdateOrg = $scope.booking.customer.cust_organization;
            var compareCustomerUpdateNumber = $scope.booking.customer.mobile;
            var compareCustomerUpdateEmail = $scope.booking.customer.cust_email;
            var compareCustomerUpdateAddress = $scope.booking.customer.cust_address;

            $scope.customeupdatedetails = [];

            angular.forEach($scope.organizationUpdateData, function(value, key) {
                if (compareCustomerUpdateName == value['cust_name'] && category == 'name') {
                    $scope.booking.customer.cust_organization = '';
                    $scope.booking.customer.mobile = '';
                    $scope.booking.customer.cust_discount_percent = '';
                    $scope.booking.customer.cust_email = '';
                    $scope.booking.customer.cust_address = '';

                    $scope.booking.customer.cust_organization = value['cust_organization'];
                    $scope.booking.customer.mobile = value['cust_number'];
                    $scope.booking.customer.cust_email = value['cust_email'];
                    $scope.booking.customer.cust_address = value['cust_address'];

                    if (value['cust_discount_percent'] != "") {
                        $scope.booking.customer.cust_discount_percent = value['cust_discount_percent'];
                    } else {
                        $scope.booking.customer.cust_discount_percent = 0;
                    }
                    if (value['credit_limit'] != "") {
                        $scope.booking.customer.credit_limit = value['credit_limit'];
                    } else {
                        $scope.booking.customer.credit_limit = 0;
                    }
                    if (value['final_balance'] != "") {
                        $scope.booking.customer.wallet = value['final_balance'];
                    } else {
                        $scope.booking.customer.wallet = 0;
                    }
                    $scope.freezeAll = true
                }

                if (compareCustomerUpdateOrg == value['cust_organization'] && category == 'org') {
                    $scope.booking.customer.cust_name = '';
                    $scope.booking.customer.mobile = '';
                    $scope.booking.customer.cust_discount_percent = '';
                    $scope.booking.customer.cust_email = '';
                    $scope.booking.customer.cust_address = '';

                    $scope.booking.customer.cust_name = value['cust_name'];
                    $scope.booking.customer.mobile = value['cust_number'];
                    $scope.booking.customer.cust_email = value['cust_email'];
                    $scope.booking.customer.cust_address = value['cust_address'];

                    if (value['cust_discount_percent'] != null) {
                        $scope.booking.customer.cust_discount_percent = value['cust_discount_percent'];
                    } else {
                        $scope.booking.customer.cust_discount_percent = 0;
                    }
                    if (value['credit_limit'] != null) {
                        $scope.booking.customer.credit_limit = value['credit_limit'];
                    } else {
                        $scope.booking.customer.credit_limit = 0;
                    }
                    if (value['final_balance'] != null) {
                        $scope.booking.customer.wallet = value['final_balance'];
                    } else {
                        $scope.booking.customer.wallet = 0;
                    }
                    $scope.freezeAll = true
                }

                if (compareCustomerUpdateNumber == value['cust_number'] && category == 'number') {


                    $scope.booking.customer.cust_name = '';
                    $scope.booking.customer.cust_organization = ''
                    $scope.booking.customer.cust_discount_percent = ''
                    $scope.booking.customer.cust_email = '';
                    $scope.booking.customer.cust_address = '';

                    $scope.booking.customer.cust_name = value['cust_name'];
                    $scope.booking.customer.cust_organization = value['cust_organization'];
                    $scope.booking.customer.cust_email = value['cust_email'];
                    $scope.booking.customer.cust_address = value['cust_address'];

                    if (value['cust_discount_percent'] != null) {
                        $scope.booking.customer.cust_discount_percent = value['cust_discount_percent'];
                    } else {
                        $scope.booking.customer.cust_discount_percent = 0;
                    }

                    if (value['credit_limit'] != null) {
                        $scope.booking.customer.credit_limit = value['credit_limit'];
                    } else {
                        $scope.booking.customer.credit_limit = 0;
                    }

                    if (value['final_balance'] != null) {
                        $scope.booking.customer.wallet = value['final_balance'];
                    } else {
                        $scope.booking.customer.wallet = 0;
                    }

                    $scope.freezeAll = true
                }

                if (compareCustomerUpdateEmail == value['cust_email'] && category == 'email') {
                    $scope.booking.customer.cust_name = '';
                    $scope.booking.customer.cust_organization = ''
                    $scope.booking.customer.cust_discount_percent = ''
                    $scope.booking.customer.mobile = '';
                    $scope.booking.customer.cust_address = '';

                    $scope.booking.customer.cust_name = value['cust_name'];
                    $scope.booking.customer.cust_organization = value['cust_organization'];
                    $scope.booking.customer.mobile = value['cust_number'];
                    $scope.booking.customer.cust_address = value['cust_address'];

                    if (value['cust_discount_percent'] != null) {
                        $scope.booking.customer.cust_discount_percent = value['cust_discount_percent'];
                    } else {
                        $scope.booking.customer.cust_discount_percent = 0;
                    }

                    if (value['credit_limit'] != null) {
                        $scope.booking.customer.credit_limit = value['credit_limit'];
                    } else {
                        $scope.booking.customer.credit_limit = 0;
                    }

                    if (value['final_balance'] != null) {
                        $scope.booking.customer.wallet = value['final_balance'];
                    } else {
                        $scope.booking.customer.wallet = 0;
                    }
                    $scope.freezeAll = true
                }
            });
          // }, 6000);

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
            $scope.booking.pick.pickup_location = pickDetials[2];
            $scope.booking.pick.pickup_landmark = pickDetials[3];
            $scope.booking.pick.lat = pickDetials[5];
            $scope.booking.pick.lng = pickDetials[6];
            $scope.fetchNearestDriver($scope.booking.pick.lat, $scope.booking.pick.lng);
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
                $scope.booking.multipleDrop.latitute[counter] = locDetials.lat;
                $scope.booking.multipleDrop.longitude[counter] = locDetials.lan;
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

        $scope.showSubmitBtn = function()
        {
            $("#submitData").show();
        }

        $scope.hideSubmitBtn = function()
        {
            $("#submitData").hide();
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
        
        $scope.setbookingData = function() {

            $http({
                method: 'GET',
                url: '/api/booking/' + $stateParams.bookingId
            }).then(function successCallback(response) {
                console.log(response);
                $scope.getVechicleCategory(response.data.city_id);
                $scope.booking.customer.customer_id = response.data.customer_detials.id;
                $scope.booking.bookingEstimate_id = response.data.bookingEstimate.id;
                $scope.booking.billing.fixedamount = response.data.bookingEstimate.trip_charge;
                $scope.booking.billing.approximatelyHours = response.data.bookingEstimate.approximately_hours;

                $scope.booking.customer.mobile = response.data.customer_detials.cust_number;
                $scope.booking.customer.cust_organization = response.data.customer_detials.cust_organization;
                $scope.booking.customer.cust_email = response.data.customer_detials.cust_email;
                $scope.booking.customer.cust_name = response.data.customer_detials.cust_name;

                $scope.booking.customer.cust_address = response.data.customer_detials.cust_address;
                $scope.booking.customer.cust_discount_percent = response.data.bookingEstimate.discount_per;
                $scope.booking.customer.wallet = response.data.customer_wallet;
                $scope.booking.customer.credit_limit = response.data.customer_limit;
                $scope.booking.billing.booking_type = response.data.bookingEstimate.type;
                $scope.booking.billing.totalSurgeAmount = response.data.bookingEstimate.surge_amount;
                $scope.booking.billing.totalSurgePercentage = response.data.bookingEstimate.surge_percentage;
                $scope.booking.info.booking_schedule_time = response.data.book_schedule_time;
                $scope.booking.customer.id = response.data.customer_id;
                $("#omschrijving_id").val(response.data.customer_id);
                $scope.booking.billing.discount = response.data.bookingEstimate.discount_per;
                $scope.booking.billing.discount_amount = response.data.bookingEstimate.discount_amount;
                $scope.booking.billing.discount_code_id = response.data.discount_code_id;
                $scope.booking.info.discount_code = response.data.discount_code;
                
                if (response.data.bookingEstimate.type == 'Normal') 
                {
                    $scope.booking.billing.booking_type = 'normal';
                }
                if (response.data.bookingEstimate.type == 'Hourly') 
                {
                    $scope.booking.billing.booking_type = 'hourly';
                }
                if (response.data.bookingEstimate.type == 'Fixed') 
                {
                    $scope.booking.billing.booking_type = 'fixed';
                }

                if ($scope.booking.customer.credit_limit > 0) {

                    $scope.limit = true;
                } else {
                    $scope.limit = false;
                }
                if(response.data.customer_pricing_id == 1)
                {
                    $scope.booking.billing.booking_type = 'normal';
                }
                if(response.data.customer_pricing_id == 2)
                {
                    $scope.booking.billing.booking_type = 'hourly';
                }
                if(response.data.customer_pricing_id == 3)
                {
                    $scope.booking.billing.booking_type = 'fixed';
                }

                if (response.data.bookingEstimate.payment_option != '') {
                    $scope.booking.billing.payment_type = response.data.bookingEstimate.payment_option;
                } else {
                    $scope.booking.billing.payment_type = 'post';
                }

                //check booking alloted driver
                $scope.booking.alloted_booking_driver = response.data.alloted_booking_driver;
                if ($scope.booking.alloted_booking_driver != 0) 
                {
                    $('.disable-detail').css({'cursor': 'not-allowed'});
                }

                //if pament option post and booking status before billing status
                $scope.booking.allow_only_unloading   = response.data.allow_only_unloading;
                if ($scope.booking.allow_only_unloading == 'yes') 
                {
                    $('.disable-more-detail').css({'cursor': 'not-allowed'});
                }

                //if driver alloted check driver login details
                $scope.allotDriverCoveredStatus = response.data.driver_login_covered_status;
                $scope.allotDriverLoadingStatus = response.data.driver_login_loading_unloading_status;

                $scope.booking.billing.estimated_trip_time_text = (response.data.bookingEstimate.trip_time) + " mins";

                $scope.booking.billing.estimated_distance = response.data.bookingEstimate.trip_distance;
                $scope.booking.billing.loading_charge = response.data.bookingEstimate.loading_charge;
                $scope.booking.billing.unloading_charge = response.data.bookingEstimate.unloading_charge;
                $scope.booking.billing.drop_point_charge = response.data.bookingEstimate.drop_points;
                $scope.booking.billing.discount = response.data.bookingEstimate.discount_per;
                $scope.booking.billing.discount_amount = response.data.bookingEstimate.discount_amount;

                $scope.booking.billing.buffer_estimated_distance = response.data.bookingEstimate.lower_trip_distance;
                $scope.booking.billing.lower_trip_charge = response.data.bookingEstimate.lower_trip_charge;
                $scope.booking.billing.pod_charge = response.data.bookingEstimate.pod_charge;

                if (response.data.bookingEstimate.type == "fixed") {
                    $scope.booking.billing.fixedamount = Number(response.data.bookingEstimate.trip_charge);
                } else {
                    $scope.booking.billing.trip_charge = response.data.bookingEstimate.trip_charge;
                }

                $scope.booking.billing.tick_loading = response.data.bookingEstimate.loading;
                $scope.booking.billing.tick_unloading = response.data.bookingEstimate.unloading;
                if (response.data.book_later == 1) {
                    $scope.booking.billing.book_later = true;
                }


                $scope.booking.vehicle = response.data.vehicle_detials;
                //alert($scope.booking.vehicle.id);
                console.log(response);
                $scope.getTypeOfGoods($scope.booking.vehicle.id,'');
                $scope.booking.vehicle.vehicle_category_id = response.data.bookingEstimate.vehicle_cat_id;
                $scope.booking.info.type_of_goods = response.data.goods_id;


                if (response.data.favorite_location_detials != null) {
                    $scope.booking.favorite_location_detials = {};
                    $scope.booking.favorite_location_detials = {};
                    $scope.booking.pick.fav_location_id = response.data.favorite_location_detials.id;
                    $scope.getOrganizationListUpdate('number');
                    // $scope.inputFixedAmount();
                    //pickup
                    $scope.booking.pick.pickup_location = response.data.favorite_location_detials.pickup_location;
                    $scope.booking.pick.pickup_landmark = response.data.favorite_location_detials.pickup_landmark;
                    $scope.booking.pick.pickup_number = response.data.favorite_location_detials.pickup_number;
                    $scope.booking.pick.lat = response.data.favorite_location_detials.pickup_lat;
                    $scope.booking.pick.lng = response.data.favorite_location_detials.pickup_lng;
                    $scope.setLatLong();

                    $scope.booking.drop.drop_location = response.data.favorite_location_detials.drop_location;
                    $scope.booking.drop.drop_landmark = response.data.favorite_location_detials.drop_landmark;
                    $scope.booking.drop.drop_number = response.data.favorite_location_detials.drop_number;
                    $scope.booking.drop.lat = response.data.favorite_location_detials.drop_lat;
                    $scope.booking.drop.lng = response.data.favorite_location_detials.drop_lng;
                } else {
                    $scope.booking.pick = {};
                    $scope.booking.pick.fav_location_id = 0;
                }

                if (response.data.bookingEstimate.covered_status == '1') {
                    $scope.booking.billing.covered_status = "yes";
                } else {
                    $scope.booking.billing.covered_status = "no";
                }
                if (response.data.bookingEstimate.pod == 1) {
                    $scope.booking.billing.pod = true;
                }
                if (response.data.bookingEstimate.e_pod == 1) {
                    $scope.booking.billing.e_pod = true;
                }

                $scope.booking.info.type_of_goods = Number(response.data.goods_id);
               // alert( $scope.booking.info.type_of_goods);


                $scope.booking.info.other_good = response.data.other_good_text;

                if($scope.booking.info.type_of_goods==20) {
                     $scope.defaultdiv=true;
                }else{
                    $scope.defaultdiv=false;  
                }


                $scope.booking.info.notes = response.data.notes;
                $scope.booking.info.no_of_drop_points = Number(response.data.drop_points);
                var currentTime = new Date().getTime() + 15*60*1000/1000;
                //var currentTime = seconds/1000;
                //currentTime = parseInt(currentTime, 10);

                if (response.data.alloted_driver_schedule_time != "") 
                {
                    var requirementTime = response.data.alloted_driver_schedule_time;
                    var splitDateTime   = requirementTime.split(' ');
                    var fullDate        = splitDateTime[0];
                    var fullTime        = splitDateTime[1];
                    var dateNew         = new Date(fullDate);

                    var mnth = dateNew.getMonth()+1;
                    if (mnth <= 9) 
                    {
                        var month = "0"+ mnth;
                    }
                    else
                    {
                        var month = mnth;
                    }

                    var day  = dateNew.getDate();
                    if (day <= 9) 
                    {
                        var newDay = "0"+ day;
                    }
                    else
                    {
                        var newDay = day;
                    }

                    $scope.booking.info.booking_schedule_time = date.getFullYear()+'-'+month+'-'+newDay+' '+fullTime;
                }
                else
                {
                    if (currentTime < (((60) + parseInt(response.data.bookingEstimate.booking_schedule_time)) * 1000)) {
                        //$scope.booking.info.booking_schedule_time = (((5 * 3600 + 1800) + parseInt(response.data.bookingEstimate.booking_schedule_time)) * 1000);
                        $scope.booking.info.booking_schedule_time = (((60) + parseInt(response.data.bookingEstimate.booking_schedule_time)) * 1000);
                        var dateNew = new Date($scope.booking.info.booking_schedule_time);
                        var mnth = ("0" + (dateNew.getMonth()+1)).slice(-2);
                        var day  = ("0" + dateNew.getDate()).slice(-2);
                        var hoursStr  = ("0" + dateNew.getHours()).slice(-2);
                        var minutes = ("0" + dateNew.getMinutes()).slice(-2);
                        var second = ("0" + dateNew.getSeconds()).slice(-2);
                        $scope.booking.info.booking_schedule_time = date.getFullYear()+'-'+mnth+'-'+day+' '+hoursStr+':'+minutes+':'+second;
                        //console.log($scope.booking.info.booking_schedule_time);
                    } else {
                        var dateNew = new Date(currentTime);
                        var mnth = ("0" + (dateNew.getMonth()+1)).slice(-2);
                        var day  = ("0" + dateNew.getDate()).slice(-2);
                        var hoursStr  = ("0" + dateNew.getHours()).slice(-2);
                        var minutes = ("0" + dateNew.getMinutes()).slice(-2);
                        var second = ("0" + dateNew.getSeconds()).slice(-2);
                        $scope.booking.info.booking_schedule_time = date.getFullYear()+'-'+mnth+'-'+day+' '+hoursStr+':'+minutes+':'+second;
                        //$scope.booking.info.booking_schedule_time = currentTime;
                    }
                }

                if (response.data.allotment_type == '1') {
                    $scope.booking.info.allotment_type = "yes";
                } else {
                    $scope.booking.info.allotment_type = "no";
                }
                $scope.bookingVechicleForm.$valid = false;
                $scope.bookingForm.$valid = false;
                $scope.bookingPickupForm.$valid = false;
                $scope.bookingDropForm.$valid = false;
                $scope.bookingDropForm.$valid = false;

                $scope.allowDropPoints = 5;
                var bookingWayPoints = response.data.multiple_drop_points;
                
               // bookingWayPoints = JSON.parse(bookingWayPoints);
                var totalDropPoint = response.data.drop_points;
                console.log(totalDropPoint);
                var wayPoints = totalDropPoint - 1;

                var index = 1;
                for (var i = 0; i < wayPoints; i++) 
                {
                    if(bookingWayPoints[i].drop_lat != undefined)
                    {
                        $scope.dropPoints.push({ 'id': 'multipleDrop' + i });
                        $scope.booking.multipleDrop.longitude[i] = bookingWayPoints[i].drop_lng;
                        $scope.booking.multipleDrop.latitute[i] = bookingWayPoints[i].drop_lat;
                        $scope.booking.multipleDrop.landmark[i] = bookingWayPoints[i].drop_landmark;
                        index++;
                    }
                }
                setTimeout(function() {
                    $('.add-booking-drop-location-cross').css('display', 'none');
                    $('.add-booking-drop-location-cross:last').css('display', 'block');

                }, 900);
            },
            function errorCallback(response) {});
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
                        $scope.booking.payment = $scope.booking.billing.payment_type;
                        var date = new Date($scope.booking.info.booking_schedule_time);
                        var mnth = ("0" + (date.getMonth()+1)).slice(-2);
                        var day  = ("0" + date.getDate()).slice(-2);
                        var hoursStr  = ("0" + date.getHours()).slice(-2);
                        var minutes = ("0" + date.getMinutes()).slice(-2);
                        var second = ("0" + date.getSeconds()).slice(-2);
                        $scope.booking.info.booking_schedule_time = date.getFullYear()+'-'+mnth+'-'+day+' '+hoursStr+':'+minutes+':'+second;
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
            var customer_id = $("#omschrijving_id").val();
            var Surgedata = { customerId : customer_id , tripAmount: $scope.booking.billing.final_amount , vehicle_id : $scope.booking.vehicle.id ,bookingType : $scope.booking.billing.booking_type};
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
            if ($scope.booking.billing.tick_loading != undefined) {
                var pre_trip_loading = $scope.booking.billing.tick_loading;
            }
            if ($scope.booking.billing.tick_unloading != undefined) {
                var pre_trip_unloading = $scope.booking.billing.tick_unloading;
            }
            
            var temp = $scope.booking.billing.booking_type;
            var hourlyDiscountPercentage = 0;
            var hourlyDiscountAmount = 0;
            if (temp == 'hourly') {
                $scope.booking.billing.discount = 0;
                $scope.booking.billing.discount_amount = 0;
                if ($scope.booking.billing.approximatelyHours) {
                    var approximatelyHours = $scope.booking.billing.approximatelyHours;
                } else {
                    var approximatelyHours = 0;
                }
                var customer_id = $("#omschrijving_id").val();
                var data = {
                    vehicle: $scope.booking.vehicle,
                    approximatelyHours: approximatelyHours,
                    customerId : customer_id,
                    bookingType : $scope.booking.billing.booking_type,
                    normal_fare : $scope.booking.billing.normal_fare,
                    booking_schedule_time : $scope.booking.info.booking_schedule_time

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
                    hourlyTripCharge =  response.data.trip_charge;
                }, function errorCallback(response) {});

            }
            $scope.booking.customer.id = $scope.booking.customer.customer_id;
            var data = { pick: $scope.booking.pick, drop: $scope.booking.drop, customer: $scope.booking.customer, vehicle: $scope.booking.vehicle, info: $scope.booking.info, billing: $scope.booking.billing, multipleDrop : $scope.booking.multipleDrop };
            $http({
                method: 'GET',
                url: '/api/calculateEsitmated',
                params: data
            }).then(function successCallback(response) {
                $scope.getPromoCode();
                $scope.booking.billing.estimated_distance = response.data.estimated_distance;
                $scope.booking.billing.buffer_estimated_distance = response.data.buffer_estimated_distance;
                $scope.booking.billing.estimated_trip_time_text = response.data.estimated_trip_time_text;
                $scope.booking.billing.estimated_trip_time = response.data.estimated_trip_time;
                $scope.booking.billing.loading_charge = response.data.loading_charge;
                $scope.booking.billing.unloading_charge = response.data.unloading_charge;
                $scope.booking.billing.drop_point_charge = response.data.drop_point_charge;
                $scope.booking.billing.pod_charge = response.data.pod_charge;
                $scope.booking.billing.discount = response.data.discount;
                $scope.booking.info.no_of_drop_points = response.data.no_of_drop_points;

                if (response.data.differentSurgesDetails != "") 
                {
                    $scope.booking.billing.usageSurgeAmount = response.data.differentSurgesDetails.usageSurgeAmount
                    $scope.booking.billing.usageSurgePercentage = response.data.differentSurgesDetails.usageSurgePercentage
                    $scope.booking.billing.daySurgeAmount = response.data.differentSurgesDetails.daySurgeAmount
                    $scope.booking.billing.daySurgePercentage = response.data.differentSurgesDetails.daySurgePercentage
                    $scope.booking.billing.dateSurgeAmount = response.data.differentSurgesDetails.dateSurgeAmount
                    $scope.booking.billing.dateSurgePercentage = response.data.differentSurgesDetails.dateSurgePercentage
                    $scope.booking.billing.areaSurgeAmount = response.data.differentSurgesDetails.areaSurgeAmount;
                    $scope.booking.billing.areaSurgePercentage = response.data.differentSurgesDetails.areaSurgePercentage
                    $scope.booking.billing.callCenterSurgeAmount = response.data.differentSurgesDetails.callCenterSurgeAmount
                    $scope.booking.billing.callCenterSurgePercentage = response.data.differentSurgesDetails.callCenterSurgePercentage
                    $scope.booking.billing.extraSurgeAmount = response.data.differentSurgesDetails.extraSurgeAmount
                    $scope.booking.billing.extraSurgePercentage = response.data.differentSurgesDetails.extraSurgePercentage
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
                    //$scope.booking.billing = response.data;
                    $scope.booking.billing.trip_charge = response.data.trip_charge;
                    $scope.booking.billing.fixedamount = 0;
                    if (temp == 'hourly' && $scope.booking.billing.hourly_fare > response.data.final_amount) {
                        $scope.booking.billing.discount = hourlyDiscountPercentage;
                        $scope.booking.billing.trip_charge  = hourlyTripCharge;
                        $scope.booking.billing.totalSurgeAmount = horlyTotalSurgeAmount;
                        $scope.booking.billing.totalSurgePercentage = horlyTotalSurgePercentage;

                    } else {
                        $scope.booking.billing.discount = response.data.discount;
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

                if(temp == 'fixed') {
                    $scope.calculatefixedamount();
                }
                $timeout($scope.drawRouteMap(), 5000);
            }, function errorCallback(response) {});

        };

        $scope.promo_codes = [];
        $scope.getPromoCode = function() {
            var customer_id = $("#omschrijving_id").val();
            var data = { customer_id : customer_id};
            $http({
                method: 'POST',
                url: 'api/customerMobile/promoCodeList',
                params: data
            }).then(function successCallback(response) {
                $scope.codeList = response.data.data;
                angular.forEach(response.data.data, function(value, key) {
                    $scope.promo_codes.push(value['discount_code']);
                });
                console.log($scope.promo_codes);
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

            console.log(final_amount_temp);
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
                url: 'api/customerMobile/checkPromoCode',
                params: data
            }).then(function successCallback(response) {
                $("#promoMessage").removeClass('successMsg');
                $("#promoMessage").removeClass('errorMsg');
                
                if(response.data.success == true)
                {
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
                }
                $('#selectPromoCode').modal('hide');

            }, function errorCallback(response) {

            });
        };

        $scope.fetchNearestDriver = function(lat, lng) {
            $scope.calculateEsitmated();
            $scope.nearestDriver = [];
            var data = { lat: lat, lng: lng };
           
        }

        $scope.getLoginDriversDetials = function() {
            $http({
                method: 'GET',
                url: '/api/getFreeDriversDetials',
            }).then(function successCallback(response) {
                $scope.driverDetials = response.data;
            }, function errorCallback(response) {});
        };
        $scope.getLoginDriversDetials();

        $scope.viewBookingDetail = function() {
            var bookingId = $stateParams.bookingId;
            $http({
                method: 'GET',
                url: '/api/booking/' + bookingId
            }).then(function successCallback(response) {
                $scope.fetchNearestDriver(response.data.favorite_location_detials.pickup_lat, response.data.favorite_location_detials.pickup_lng);
                $scope.allotBookingDetials = response.data;
            }, function errorCallback(response) {});

        }

        $scope.showTableFlag = false;
        $scope.upcoming = {};
        $scope.getCustomerDetialKnow = function(phone) {
            $scope.upcoming.mobile = phone.caller_id;
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
                    imageUrl: "images/opps.jpg",
                    showCancelButton: true,
                    confirmButtonColor: "#DD6B55",
                }, function(isConfirm) {
                    // location.reload();
                });
            } else {
                SweetAlert.swal({
                    title: "Are you sure?",
                    text: "You want to allot this booking!",
                    type: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: "Yes, Allot it!",
                    closeOnConfirm: false
                }, function(isConfirm) {
                    if (isConfirm) {
                        var data = { booking_id: bookingId, driver_id: driverId };
                        $http({
                            method: 'GET',
                            url: '/api/notification',
                            params: data
                        }).then(function successCallback(response) {
                                swal({
                                    title: "Allot!",
                                    text: "Your Booking alloted successfully!",
                                    type: "success",
                                    showCancelButton: false,
                                    closeOnConfirm: false
                                }, function() {
                                    location.href = '/booking-list';
                                });
                            },
                            function errorCallback(response) {});
                    }
                });
            }
        };

        $scope.loadimage = function(imageurl, bookingId, email) {
            $scope.url = imageurl.replace('/public/', '');
            $scope.sendPodbooking = bookingId;
            $scope.sendPodEmail = email;
        }

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
                        type: "success",
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


        $scope.setLatLong = function() {

            $scope.fetchNearestDriver($scope.booking.pick.lat, $scope.booking.pick.lng);
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

        $scope.addedPickUp = {};
        $scope.getCustomerLandmarks = function(customerId) {
            var data = { customer_id: customerId };
            $http({
                method: 'POST',
                url: '/api/getCustomerLandmarks',
                params: data
            }).then(function successCallback(response) {
                $scope.addedPickUp = response.data;
                $('#selectFavLocationIN').modal('show');
            }, function errorCallback(response) {

            });
        };

        $scope.hideLandmark = function(bookingId) {
            var data = { booking_id: bookingId };
            $http({
                method: 'POST',
                url: '/api/hideLandmark',
                params: data
            }).then(function successCallback(response) {}, function errorCallback(response) {

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
                    if ($scope.loginDriverDetials) {
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
            }
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
