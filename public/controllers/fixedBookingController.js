(function() {
    "use strict";

    app.controller('FixedBookingController', ['$scope', '$http', '$stateParams', '$rootScope', 'SweetAlert', '$timeout', '$window', '$interval', function($scope, $http, $stateParams, $rootScope, SweetAlert, $timeout, $window, $interval) {
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
        $scope.booking.billing = {};
        $scope.booking.info.driver_bill = 0;
        $scope.booking.info.customer_bill = 0;
        $scope.booking.info.allotment_type = 'no';
        $scope.booking.info.payment_type = 'post';
        $scope.defaultdiv = false;
        $scope.booking.info.isOtherGood='';
        $scope.booking.info.calculate_normal = false;
        $scope.options = {
            componentRestrictions: { country: 'IN' }
        };
        $scope.currentStatusDetials = [];
        $scope.booking.billing.billing_type = false;  
        $scope.booking.info.tick_loading = 0;
        $scope.booking.info.tick_unloading = 0;
        $scope.booking.info.fav_driver = 'no';
        $scope.allowDropPoints = 5; 
        $scope.defaultGoodValue = function(type) 
        { 
           if(type=='20')
           {
                $scope.defaultdiv = true; 
                $scope.booking.info.isOtherGood = 'Others';
           }
           else
           {
                $scope.defaultdiv = false;
           }
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
        $scope.getTypeOfGoods = function(vehicleId = '',customer = '') {
            if(customer == '')
            {
                var customer = $("#omschrijving_id").val();
            }
            if(vehicleId == '')
            {
                var vehicleId = $scope.booking.customer.vehicle_id;
            }
            var customer_mobile = $scope.booking.customer.mobile;
            var data = { customerId : customer , vehicleId : vehicleId, customer_mobile: customer_mobile};
            $http({
                method: 'GET',
                url: '/api/getVehicleGoods',
                params: data
            }).then(function successCallback(response) {
                $scope.goodDetials = '';
                $scope.goodDetials = response.data.data;
                $scope.booking.info.type_of_goods = response.data.good_id;
                if(response.data.goods_name=='Others')
                {
                    $scope.booking.info.other_good =response.data.other_good;
                    $scope.booking.info.isOtherGood='Others';
                    $scope.defaultdiv = true;  
                }
                else
                {
                    $scope.defaultdiv = false;  
                }
                if(response.data.isOtherGoodInVehicle==0)
                {
                    $scope.defaultdiv = false;
                }
            }, function errorCallback(response) {});   
        };

        

        $scope.setPaymentDetials = function() {
            $scope.booking.vehicle = $scope.booking.vehicle;
            $scope.getTypeOfGoods($scope.booking.vehicle.id);
        };

        $scope.loadingIsDone = true;

        $scope.emailAlready = false;
       
        $scope.phoneAlready = false;
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

        $scope.getOrganizationListUpdate = function(category) {
            setTimeout(function() {
                var phoneNumber = "";
                var cust_organization = "";
                var cust_email = "";
                var cust_name = "";
                var phoneNumber = "";
                var customer_id = "";
                if($scope.booking.customer != undefined)
                {
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
                }
                var customer_id = $("#omschrijving_id").val();
                if(customer_id == '' && cust_email == '' && cust_name == '' && phoneNumber == '' && cust_organization == '')
                {
                    return false;
                }
                var data = { phone: phoneNumber, organization: cust_organization, email: cust_email, name: cust_name, customer_id: customer_id };
                var mobileNo = $stateParams.mobileNo;
                if (mobileNo && category == 'org' && angular.isDefined(cust_organization) && cust_organization == '') {
                    return false;
                }
                
                $http({
                    method: 'GET',
                    url: '/api/getCustomerBookingUpdateDetials',
                    params: data
                }).then(function successCallback(response) {
                    if(response)
                    {
                        $scope.booking.customer = response.data.customer_details;
                        if(response.data.customer_details.cust_number != undefined)
                        {
                            $scope.booking.customer.mobile = response.data.customer_details.cust_number;
                        }
                        $scope.drop = response.data.customer_details.drop;
                        $scope.pick = response.data.customer_details.pick;
                        $scope.allowDropPoints = response.data.allowed_drop_point;

                        $scope.booking.info.type_of_goods=response.data.customer_details.goods_id;
                        if(response.data.customer_details.goods_name=='Others'){
                            $scope.booking.info.other_good =response.data.customer_details.other_goods;
                            $scope.booking.info.isOtherGood='Others';
                            $scope.defaultdiv = true;  
                        }
                        else
                        {
                            $scope.defaultdiv = false;  
                        }
                        $scope.getVechicleCategory(response.data.customer_details.city_id);
                        $scope.getCustomerLandmarks(response.data.customer_details.id);
                    }
                }, function errorCallback(response) {
                });
                var compareCustomerUpdateName = $scope.booking.customer.cust_name;
                var compareCustomerUpdateOrg = $scope.booking.customer.cust_organization;
                var compareCustomerUpdateNumber = $scope.booking.customer.mobile;
                var compareCustomerUpdateEmail = $scope.booking.customer.cust_email;
                var compareCustomerUpdateAddress = $scope.booking.customer.cust_address;
                $scope.customeupdatedetails = [];
            }, 400);
        };

        $scope.setDropPoint = function(dropDetials) {
            $scope.booking.drop.drop_name = dropDetials[0];
            $scope.booking.drop.drop_organization = dropDetials[4];
            $scope.booking.drop.drop_landmark = dropDetials[3];
            $scope.booking.drop.lat = dropDetials[5];
            $scope.booking.drop.lng = dropDetials[6];
           
        };

        $scope.setPickPoint = function(pickDetials) {
            $scope.booking.pick.pickup_name = pickDetials[0];
            $scope.booking.pick.pickup_number = pickDetials[1];
            $scope.booking.pick.pickup_organization = pickDetials[4];
            $scope.booking.pick.pickup_landmark = pickDetials[3];
            $scope.booking.pick.lat = pickDetials[5];
            $scope.booking.pick.lng = pickDetials[6];
            
        };

        $scope.setDropPoint1 = function(dropDetials) {
            $scope.booking.drop.drop_name = "NA";
            $scope.booking.drop.drop_organization = "NA";
            $scope.booking.drop.drop_landmark = dropDetials.landmark;
            $scope.booking.drop.lat = dropDetials.lat;
            $scope.booking.drop.lng = dropDetials.lan;
            $scope.booking.info.flagCustomer = true;
        };

        $scope.setPickPoint1 = function(pickDetials) {
            $scope.booking.pick.pickup_name = "NA";
            $scope.booking.pick.pickup_number = pickDetials.number;
            $scope.booking.pick.pickup_organization = "NA";
            $scope.booking.pick.pickup_landmark = pickDetials.landmark;
            $scope.booking.pick.lat = pickDetials.lat;
            $scope.booking.pick.lng = pickDetials.lan;
            $scope.booking.info.flagCustomer = true;
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
                $scope.booking.multipleDrop.landmark[counter] = locDetials.landmark;
                $scope.booking.multipleDrop.latitute[counter] = locDetials.lat;
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

        
        $scope.addFixedBooking = function() {
            if ($scope.booking.info.tick_loading == undefined) {
                alert("Please select loading Yes Or NO");
                return false;
            }

            if ($scope.booking.info.tick_unloading == undefined) {
                alert("Please select unloading Yes Or NO");
                return false;
            }
            if ($scope.booking.customer.vehicle_id == undefined) {
                alert("Please select vehicle");
                return false;
            }
            if ($scope.booking.billing.customer_bill == undefined) {
                alert("Please enter customer bill");
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
                    var data = { pick: $scope.booking.pick, drop: $scope.booking.drop, customer: $scope.booking.customer, info: $scope.booking.info, billing: $scope.booking.billing, multipleDrop : $scope.booking.multipleDrop};
                    $http({
                        method: 'POST',
                        url: '/api/addFixedBooking',
                        params: data
                    }).then(function successCallback(response) {
                        $window.location.href = '/fixed-booking-list';
                    }, function errorCallback(response) {
                    });
                }
            });
        };

        $scope.removeFixedBooking = function(id) {
            
            SweetAlert.swal({
                title: "Confirm",
                text: "Do you want to add this booking!",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                imageUrl: "assets/images/ic_launcher.png"
            }, function(isConfirm) {

                if (isConfirm) {
                    
                    var data = { id: id};
                    $http({
                        method: 'POST',
                        url: '/api/removeFixedBooking',
                        params: data
                    }).then(function successCallback(response) {
                        $window.location.href = '/fixed-booking-list';
                    }, function errorCallback(response) {
                    });
                }
            });
        };

        $scope.updateFixedBooking = function() {
            if ($scope.booking.info.tick_loading == undefined) {
                alert("Please select loading Yes Or NO");
                return false;
            }

            if ($scope.booking.info.tick_unloading == undefined) {
                alert("Please select unloading Yes Or NO");
                return false;
            }
            if ($scope.booking.customer.vehicle_id == undefined) {
                alert("Please select vehicle");
                return false;
            }
            var id = $stateParams.bookingId;
            SweetAlert.swal({
                title: "Confirm",
                text: "Do you want to add this booking!",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                imageUrl: "assets/images/ic_launcher.png"
            }, function(isConfirm) {
                if (isConfirm) {
                    var data = { id : id,pick: $scope.booking.pick, drop: $scope.booking.drop, customer: $scope.booking.customer, info: $scope.booking.info, billing: $scope.booking.billing, multipleDrop : $scope.booking.multipleDrop};
                    $http({
                        method: 'POST',
                        url: '/api/updateFixedBooking',
                        params: data
                    }).then(function successCallback(response) {
                        $window.location.href = '/fixed-booking-list';
                    }, function errorCallback(response) {
                    });
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

       $scope.calculateEsitmated = function() {
            if ($scope.booking.info.calculate_normal == undefined) {
                return false;
            }
            
            if ($scope.booking.drop.drop_landmark == "" && $scope.booking.pick.pickup_landmark == "") 
            {
                $scope.booking.info.calculate_normal = false;
                alert('Pick & Drop lat are not found');
            }

            if ($scope.booking.customer.vehicle_id == undefined) 
            {
                $scope.booking.info.calculate_normal = false;
                return false;
            }

            if ($scope.booking.info.tick_loading == undefined) 
            {
                $scope.booking.info.calculate_normal = false;
                //alert("Please select loading Yes Or No");
                return false;
            }

            if ($scope.booking.info.tick_unloading == undefined) 
            {
                $scope.booking.info.calculate_normal = false;
               // alert("Please select unloading Yes Or No");
                return false;
            }

            if ($scope.booking.info.calculate_normal != undefined) {
                var calculate_normal = $scope.booking.info.calculate_normal;
                if(calculate_normal == false)
                {
                    $scope.booking.billing.billing_type              = false;
                    $scope.booking.billing.estimated_distance        = 0;
                    $scope.booking.billing.estimated_distance        = 0;
                    $scope.booking.billing.estimated_trip_time_text  = 0;
                    $scope.booking.billing.loading_charge            = 0;
                    $scope.booking.billing.unloading_charge          = 0;
                    $scope.booking.billing.drop_point_charge         = 0;
                    $scope.booking.billing.buffer_estimated_distance = 0;
                    $scope.booking.billing.lower_trip_charge         = 0;
                    $scope.booking.billing.driver_bill               = 0;
                    $scope.booking.info.calculate_normal             = false;
                    $scope.booking.driver_booking_type               = false;
                    $scope.booking.billing.drop_point_charge         = 0;
                    $scope.booking.billing.drop_points               = 0;

                    return false;
                }
                else
                {
                    $scope.loaderYes = true;
                    $('#addFixedBooking').prop('disabled',true);
                }
                
            }
            var data = { pick: $scope.booking.pick, drop: $scope.booking.drop, vehicle_id: $scope.booking.customer.vehicle_id, info: $scope.booking.info, multipleDrop : $scope.booking.multipleDrop ,number_of_drop_points : 1};
            $http({
                method: 'POST',
                url: '/api/calculateEsitmatedForFixed',
                params: data
            }).then(function successCallback(response) {
                $scope.booking.billing.estimated_distance        = response.data.estimated_distance;
                $scope.booking.billing.estimated_distance        = response.data.estimated_distance;
                $scope.booking.billing.estimated_trip_time_text  = response.data.estimated_trip_time_text;
                $scope.booking.billing.loading_charge            = response.data.loading_charge;
                $scope.booking.billing.unloading_charge          = response.data.unloading_charge;
                $scope.booking.billing.drop_point_charge         = response.data.drop_points_charge;
                $scope.booking.billing.buffer_estimated_distance = response.data.buffer_estimated_distance;
                $scope.booking.billing.trip_charge               = response.data.trip_charge;
                $scope.booking.billing.lower_trip_charge         = response.data.lower_trip_charge;
                $scope.booking.billing.drop_points_charge        = response.data.drop_points_charge;
                $scope.booking.billing.drop_points               = response.data.number_of_drop_points;
                $scope.booking.billing.driver_bill               = response.data.driver_bill;
                $scope.booking.info.calculate_normal             = true;
                $scope.loaderYes                                 = false; 
                $scope.booking.billing.billing_type              = true;
                $scope.booking.driver_booking_type               = true;
                $('#addFixedBooking').prop('disabled',false);
            }, function errorCallback(response) {});

        };
        $scope.dropPoints = [];
       
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
            setTimeout(function() {
                $('.add-booking-drop-location-cross:last').css('display', 'block');
                $scope.calculateEsitmated();
            }, 300);
        }
        $scope.type = 10;
        $scope.getAllFixedBooking = function(booking,pagenum = 1) {
            
            var customer_id = $("#omschrijving_id").val();
            var data = { type: $scope.type, page: pagenum , customer_id : customer_id };
            $http({
                method: 'POST',
                url: '/api/fixedBookingList',
                params: data
            }).then(function successCallback(response) {
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
        }

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

        $scope.setbookingData = function() {

            $http({
                method: 'GET',
                url: '/api/fixedBooking/' + $stateParams.bookingId
            }).then(function successCallback(response) {
                $scope.booking.customer.customer_id              = response.data.customer_detials.customer_id;
                $scope.booking.customer.cust_organization        = response.data.customer_detials.cust_organization;
                $scope.booking.customer.mobile                   = response.data.customer_detials.cust_number;
                $scope.booking.customer.cust_address             = response.data.customer_detials.cust_address;
                $scope.booking.customer.cust_email               = response.data.customer_detials.cust_email;
                
                $scope.booking.info.e_pod                        = response.data.e_pod_required;
                $scope.booking.info.pod                          = response.data.phy_pod_required;
                $scope.booking.info.covered_status               = response.data.covered_required;
                $scope.booking.info.type_of_goods                = response.data.goods_id;
                $scope.booking.info.other_good                   = response.data.other_goods_text;
                $scope.booking.info.notes                        = response.data.notes;
                $scope.booking.info.allotment_type               = response.data.allotment_type;
                $scope.booking.info.fav_driver                   = response.data.favourite_driver_required;
                $scope.booking.info.payment_type                 = response.data.payment_option;
                setTimeout(function() {
                    $scope.getTypeOfGoods(response.data.vehicle_id,response.data.customer_id);
                    $scope.booking.customer.vehicle_id           = response.data.vehicle_id;
                    $scope.booking.info.type_of_goods            = response.data.goods_id;
                    $scope.getVechicleCategory(response.data.customer_details.city_id);
                }, 900);
                if(response.data.favourite_driver_required == 1)
                {
                    $scope.booking.info.fav_driver = 'yes';
                }
                else
                {
                    $scope.booking.info.favourite_driver_required = 'no';
                }

                if(response.data.allotment_type == 1)
                {
                    $scope.booking.info.allotment_type = 'yes';
                }
                else
                {
                    $scope.booking.info.allotment_type = 'no';
                }
                if(response.data.covered_required == 1)
                {
                    $scope.booking.info.covered_status = 'yes';
                }
                else
                {
                    $scope.booking.info.covered_status = 'no';
                }
                if(response.data.e_pod_required == 1)
                {
                    $scope.booking.info.e_pod = true;
                }
                else
                {
                    $scope.booking.info.e_pod = false;
                }
                if(response.data.phy_pod_required == 1)
                {
                    $scope.booking.info.pod = true;
                }
                else
                {
                    $scope.booking.info.pod = false;
                }
                $scope.booking.info.tick_loading = response.data.loading_required;
                $scope.booking.info.tick_unloading = response.data.unloading_required;
                
                $scope.booking.pick.pickup_number                = response.data.pickup_number;
                $scope.booking.pick.pickup_landmark              = response.data.pickup_landmark;
                $scope.booking.pick.lat                          = response.data.pickup_lat;
                $scope.booking.pick.lng                          = response.data.pickup_lng;
                
                $scope.booking.drop.drop_landmark                = response.data.drop_landmark;
                $scope.booking.drop.lat                          = response.data.drop_lat;
                $scope.booking.drop.lng                          = response.data.drop_lng;

                $scope.booking.billing.estimated_distance        = response.data.trip_distance;
                $scope.booking.billing.estimated_trip_time_text  = response.data.estimated_trip_time_text;
                $scope.booking.billing.loading_charge            = response.data.driver_loading_charge;
                $scope.booking.billing.unloading_charge          = response.data.driver_unloading_charge;
                $scope.booking.billing.drop_point_charge         = response.data.driver_drop_points_charge;
                $scope.booking.billing.buffer_estimated_distance = response.data.driver_lower_trip_charge;
                $scope.booking.billing.trip_charge               = response.data.driver_trip_charge;
                $scope.booking.billing.lower_trip_charge         = response.data.driver_lower_trip_charge;
                
                $scope.booking.billing.drop_points               = response.data.number_of_drop_points;
                $scope.booking.billing.driver_bill               = response.data.driver_bill;
                $scope.booking.billing.customer_bill             = response.data.customer_bill;
                if(response.data.driver_pricing_id == '1')
                {
                    $scope.booking.info.calculate_normal = true;
                    $scope.booking.billing.billing_type  = true;
                }
                else
                {
                    $scope.booking.info.calculate_normal = false;
                    $scope.booking.billing.billing_type  = false;
                }

                $scope.loaderYes                         = false; 
                
                var bookingWayPoints = response.data.multiple_drop_points;
                bookingWayPoints = JSON.parse(bookingWayPoints);
                var totalDropPoint = response.data.drop_points;
                var wayPoints = totalDropPoint - 1;

                var index = 1;
                for (var i = 0; i < wayPoints; i++) 
                {
                    if(bookingWayPoints[i].longitude != undefined)
                    {
                        $scope.dropPoints.push({ 'id': 'multipleDrop' + i });
                        $scope.booking.multipleDrop.longitude[i] = bookingWayPoints[i].longitude;
                        $scope.booking.multipleDrop.landmark[i] = bookingWayPoints[i].landmark;
                        $scope.booking.multipleDrop.latitute[i] = bookingWayPoints[i].latitute;
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
    }]);

})();
