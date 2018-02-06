app.filter('offset', function() {
    return function(input, start) {
        if (!input || !input.length) {
            return;
        }
        start = parseInt(start, 10);
        return input.slice(start);
    }
});

app.directive('exportToCsv',function(){
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var el = element[0];
            element.bind('click', function(e){
                var table = e.target.nextElementSibling;
                var csvString = '';
                for(var i=0; i<table.rows.length;i++){
                    var rowData = table.rows[i].cells;
                    for(var j=0; j<rowData.length;j++){
                        csvString = csvString + rowData[j].innerHTML + ",";
                    }
                    csvString = csvString.substring(0,csvString.length - 1);
                    csvString = csvString + "\n";
                }
                csvString = csvString.substring(0, csvString.length - 1);
                var a = $('<a/>', {
                    style:'display:none',
                    href:'data:application/octet-stream;base64,'+btoa(unescape(encodeURIComponent(csvString))),
                    download:table.id+'.csv'
                }).appendTo('body')
                a[0].click()
                a.remove();
            });
        }
    }
});
app.run(function($window, $rootScope) {
      $rootScope.online = navigator.onLine;
      $window.addEventListener("offline", function() {
        $('.overlay-internet-connectivity').addClass('overlay-internet');
        $('.modal-internet-connectivity').addClass('overlay-popup');
        $('.modal-internet-connectivity').text('Internet Not Connected!!');
        $rootScope.$apply(function() {
          $rootScope.online = false;
        });
      }, false);

      $window.addEventListener("online", function() {
        $('.overlay-internet-connectivity').removeClass('overlay-internet');
        $('.modal-internet-connectivity').removeClass('overlay-popup');
        $rootScope.$apply(function() {
          $rootScope.online = true;
        });
      }, false);
});

app.run(['$rootScope', '$http', '$cookies', '$location', '$interval', '$window', 'AclService', 'hotkeys','$localStorage', function($rootScope, $http, $cookies, $location, $interval, $window, AclService, hotkeys, $localStorage) {
    // Set the ACL data. Normally, you'd fetch this from an API or something.
    var aclData = {
        admin: ['add-vehicle', 'booking-detials',
            'customer-revenue', 'credit', 'user-credit',
            'booking-new', 'nearest-driver', 'booking-edit',
            'customer-wallet', 'driver-wallet', 'vehicle',
            'add-booking', 'booking-list', 'cancel-bookings',
            'cancel-booking', 'customer', 'customer-list',
            'employee-access', 'employee', 'report', 'account',
            'discount', 'cash-receive', 'discount-coupon',
            'heat-map', 'driver-daily-running-report',
            'driver-login-detials', 'login', 'forgotPassword',
            'dashboard', 'add-users', 'user-list', 'add-city',
            'cities', 'booking-invoice', 'active-driver',
            'active-driver-hours', 'driver-list',
            'show-adjustment', 'adjustment',
            'change-amount-received', 'change-bill-amount',
            'toll-charge', 'pay-cancellation',
            'view-amount-received',
            'view-customer-amount-received', 'view-cash-receive',
            'view-bill-amount', 'customer-bill-amount',
            'view-toll-charge', 'view-customer-toll-charge',
            'add-customer-cash-recieve',
            'change-amount-recieved-data', 'add-discount-amount',
            'view-discount-amount', 'revenue-report',
            'driver-revenue-report', 'customer-wallet-report',
            'security-deposit', 'view-driver-random',
            'add-driver-cash-receive', 'driver-cash-receive',
            'view-driver-cash', 'driver-trip-report',
            'view-cash-paid', 'commission', 'view-commission',
            'driver-security-deposit', 'view-security-deposit',
            'driver-penalty', 'view-driver-penalty',
            'driver-cancellation-charge', 'view-driver-cancel',
            'pay-waiting-charges', 'view-waiting-charges',
            'distance-to-customer', 'view-distance-to-customer',
            'pay-offline', 'view-offline-trip', 'unmatch-report',
            'view-driver-wallet', 'view-swap-charges',
            'view-driver-cancellation',
            'view-customer-cancellation', 'driver-list-status',
            'allot-trip', 'add-driver', 'individual-driver-wallet',
            'individual-customer-wallet'
        ],
        employee: ['add-booking', 'nearest-driver', 'booking-list',
            'dashboard', 'driver-wallet', 'customer-wallet-report', 'view-driver-wallet', 'live-trip-status',
            'customer-wallet', 'booking-invoice', 'cancel-booking', 'allot-trip', 'booking-edit'
        ],
        callcenter_driver_manager: ['active-driver', 'driver-daily-attendance','driver-hourly-attendance', 'booking-list',
            'dashboard', 'driver-wallet', 'view-driver-wallet', 'booking-invoice','prime-driver','resolved-complaint'
        ],
        // sales: ['add-booking', 'nearest-driver', 'booking-list',
        //     'dashboard', 'booking-detials', 'cancel-bookings',
        //     'active-driver', 'customer-revenue',
        //     'driver-revenue-report', 'customer-wallet-report'
        // ],
        account: ['booking-detials', 'vehicle-services', 'booking-list',
            'dashboard', 'show-adjustment', 'add-driver-cash-receive',
            'driver-security-deposit', 'view-amount-received',
            'view-toll-charge', 'view-driver-cancellation',
            'view-bill-amount', 'view-customer-amount-received',
            'customer-bill-amount', 'view-customer-toll-charge',
            'view-customer-cancellation', 'view-cash-receive',
            'view-discount-amount', 'revenue-report',
            'customer-wallet-report', 'view-driver-random',
            'view-driver-cash', 'view-cash-paid',
            'view-commission', 'view-security-deposit',
            'view-driver-penalty', 'view-driver-cancel',
            'driver-trip-report', 'view-waiting-charges',
            'view-distance-to-customer', 'view-offline-trip',
            'view-swap-charges', 'view-driver-wallet', 'customer-wallet'
        ],
        employee_manager: ['add-booking', 'nearest-driver', 'booking-list',
            'dashboard', 'live-trip-status', 'booking-invoice',
            'allot-trip', 'customer',
            'customer-list', 'edit-customer',
            'cancel-bookings', 'active-driver',
            'driver-attendance', 'customer-wallet-report',
            'view-driver-wallet'
        ],
        hr_manager: ['add-users', 'user-list'],
        driver_trainer: ['driver-revenue', 'booking-tat', 'vehicle-services'],
        sales_manager: ['booking-list', 'customer', 'customer-list',
            'edit-customer', 'discount', 'discount-coupon',
            'booking-detials', 'cancel-bookings', 'customer-revenue',
            'booking-tat', 'billty-report', 'customer-wallet-report',
            'customer-wallet', 'credit', 'booking-invoice'
        ],
        city_head: ['credit-list', 'customer-wallet', 'driver-wallet',
            'customer-wallet-report', 'view-driver-wallet', 'show-adjustment',
            'change-amount-received', 'change-bill-amount', 'toll-charge',
            'cancellation', 'add-customer-cash-recieve', 'view-driver-view-driver-cancellation',
            'view-bill-amount', 'view-amount-received', 'view-toll-charge',
            'view-customer-amount-received', 'revenue-report', 'add-discount-amount',
            'security-deposit', 'add-driver-cash-receive', 'driver-cash-receive',
            'commission', 'driver-security-deposit', 'driver-penalty',
            'driver-cancellation-charge', 'pay-waiting-charges', 'distance-to-customer',
            'pay-offline', 'unmatch-report', 'customer-bill-amount',
            'view-customer-toll-charge', 'view-customer-cancellation', 'view-cash-receive',
            'view-discount-amount', 'view-driver-random', 'view-driver-cash',
            'view-cash-paid', 'view-commission', 'view-security-deposit',
            'view-driver-cancel', 'driver-trip-report', 'view-waiting-charges',
            'view-distance-to-customer', 'view-offline-trip', 'view-swap-charges',
            'booking-list', 'customer', 'customer-list', 'booking-invoice', 'edit-custome',
            'discount', 'discount-coupon', 'driver-list', 'booking-detials', 'cancel-bookings',
            'active-driver', 'customer-revenue', 'driver-attendance', 'booking-tat', 'vehicle-services', 'billty-report'

        ],
        sales_executive: ['booking-list', 'booking-detials', 'cancel-bookings', 'customer-revenue', 'booking-tat', 'customer-wallet-report', 'booking-invoice'],
        supply_manager: ['driver-list', 'active-driver', 'driver-revenue', 'booking-tat', 'booking-tat', 'vehicle-services', 'view-driver-wallet', 'notify-driver']
    };

    // Attempt to load from web storage
    if (!AclService.resume()) {
        // Web storage record did not exist, we'll have to build it from scratch

        // Get the user role, and add it to AclService
        // var userRole = fetchUserRoleFromSomewhere();


        // Get ACL data, and add it to AclService
        // var aclData = fetchAclFromSomewhere();
        AclService.setAbilities(aclData);

    }
    AclService.setAbilities(aclData);

    $rootScope.tab = "";
    $rootScope.$on('$locationChangeSuccess', function() {
        $rootScope.currentPage = $location.path().substr(1);
        var str = $rootScope.currentPage;
        $rootScope.title = str.replace(/-/g, " ");
    });
    $rootScope.setTab = function(tabId) {
        $rootScope.tab = tabId;
    };

    $rootScope.isSet = function(tabId) {
        var result = ($rootScope.tab === tabId);
        return result;
    };

    //check login authentication
    $rootScope.forgotpassword = function(login) {
        if (login != undefined) {
            var data = { email: login.email };
            $("#errorLogin").html("");
            $http({
                method: 'POST',
                url: '/api/forgot-password',
                params: data

            }).then(function successCallback(response) {
                return false;
                if (response.data.success) {

                    //window.location = '/dashboard';
                } else {

                    $("#errorLogin").html("Email is not valid");
                }
            }, function errorCallback(response) {});
        }
    };

    $rootScope.authentication = function(login) {
        var data = { email: login.email, password: login.password };

        $("#errorLogin").html("");
        $http({
            method: 'POST',
            url: '/api/authenticate',
            params: data

        }).then(function successCallback(response) {

            if (response.data.success) {
                window.location = '/dashboard';
            } else {
                $("#errorLogin").html("Email and Password is not valid");
                // $location.href = '/login';
            }
        }, function errorCallback(response) {});
    };

    $rootScope.loginFlag = true;
    $rootScope.getCurrentUrl = function() {
        var pId = $location.path().split(/[\s/]+/).pop();
        if (pId === 'login') {
            $rootScope.loginFlag = false;
        }
    };

    $rootScope.loggedInUser = function() {
        $http({
            method: 'GET',
            url: '/api/getLoggedInUser',
        }).then(function successCallback(response) {
            $rootScope.userDetials = response.data;
            $rootScope.auth = response.data;
            $rootScope.userRole = response.data.position;
            AclService.flushRoles();
            AclService.attachRole(response.data.position);
            var res = AclService.getRoles();
        }, function errorCallback(response) {});
    };

    hotkeys.add({
        combo: 'ctrl+l',
        description: 'Description goes here',
        callback: function() {
            $location.path('booking-list');
        }
    });
    hotkeys.add({
        combo: 'ctrl+b',
        description: 'Description goes here',
        callback: function() {
            $location.path('add-booking');
        }
    });

    hotkeys.add({
        combo: 'ctrl+alt+c',
        description: 'Description goes here',
        callback: function() {
            $location.path('cancel-bookings');
        }
    });

    hotkeys.add({
        combo: 'ctrl+alt+n',
        description: 'Description goes here',
        callback: function() {
            $location.path('nearest-driver');
        }
    });

    hotkeys.add({
        combo: 'ctrl+alt+d',
        description: 'Description goes here',
        callback: function() {
            $location.path('dashboard');
        }
    });

    $rootScope.logout = function() {
        $http({
            method: 'GET',
            url: '/api/userLogout',
        }).then(function successCallback(response) {

            if (response.data.success) {
                localStorage.clear();
                $location.href = '/login';
                location.reload();
            }
        }, function errorCallback(response) {});
    };

    $rootScope.userDetials = {};

    $rootScope.redirectToBooking = function(URL) {
        $window.location.href = '/' + URL;
    };


    $rootScope.dashboardFreeDriver = [];

    $rootScope.dashboardFreeDriverDetials = function() {
        $rootScope.near = [];
        var data = { near: $rootScope.near };
        $http({
            method: 'GET',
            url: '/api/getFreeDriversDashboard',
        }).then(function successCallback(response) {
            $rootScope.dashboardFreeDriver = response.data;
        }, function errorCallback(response) {});
    };

    $rootScope.dashboardFreeDriverDetials();

    $rootScope.searchBookingById = function(id) {
        if (!angular.isUndefined(id)) {
            $http({
                method: 'GET',
                url: '/api/isBookingExist/' + id,
            }).then(function successCallback(response) {
                if (response.data.success) {
                    $window.location.href = "/booking-invoice/" + id;
                } else if (response.data.error) {
                    $rootScope.showError = true;
                }

            }, function errorCallback(response) {});

        }
    };

    $rootScope.hidePopup = function() {
        //alert("hidePopup")
        if ($rootScope.showNotification == true) {
            $rootScope.showNotification = false
        } else {
            $rootScope.showNotification = true
        }
    }

    $rootScope.hideBookingPopup = function() {
        //alert("hidePopup")
        if ($rootScope.showbookingAlert == true) {
            $rootScope.showbookingAlert = false
        } else {
            $rootScope.showbookingAlert = true
        }
    }

    $rootScope.removeBookingAlert = function(id) {
        var data = { fieldId: id }
        $http({
            method: 'POST',
            url: '/api/removeBookingAlert',
            params: data
        }).then(function successCallback(response) {
            if (response.data.success) {
                $rootScope.bookingAlerts();
            } else {
                alert("something went wrong");
            }

        }, function errorCallback(response) {});
    };

    $rootScope.sendActiveNotification = function() {
        $http({
            method: 'POST',
            url: '/api/sendNotification'
        });
    };
   

    $rootScope.organization = [];
    $rootScope.customer_name = [];
    $rootScope.getOrganization = function() {
        $http({
             method: 'GET',
             url: '/api/getOrganizationName',
        }).then(function successCallback(response) {
         
            $rootScope.organizationData = response.data;
            
            angular.forEach(response.data, function(value, key) {
            // $rootScope.organization.push(value['cust_organization']);
            $rootScope.organization.push({
                label: value['cust_organization'],
                value: value['id']
            });
            $rootScope.customer_name.push(value['cust_name']);
             //$("#organization").autocomplete({ source: $rootScope.organization });
         });
         $("#column4_search").autocomplete({
            delay: 0,
            source: $rootScope.organization,
            select: function(event, ui) {
                $('#column4_search').val(ui.item.label);
                $('#organization_id').val(ui.item.value);
                return false;
            },
            focus: function(event, ui) {
                $("#column4_search").val(ui.item.label);
                return false;
            }

        });
         $("#customer_name_search").autocomplete({
            delay: 0,
            source: $rootScope.customer_name,
            select: function(event, ui) {
                $('#customer_name_search').val(ui.item.label);
                return false;
            }

        });
        }, function errorCallback(response) {});
    };
    
    function bookingAlerts() {
        if($rootScope.auth.id == '')
        {
            var data = {alloted_to : 27};
        }
        else
        {
            var data = {alloted_to : $rootScope.auth.id}
        }
        $http({
            method: 'GET',
            url: '/api/getBookingAlerts',
            params : data
        }).then(function successCallback(response) {
            $rootScope.bookingAlertsData = null;
            var bookingAlertsData = response.data;
            for (var i = 0; i < bookingAlertsData.length; i++) {
                var alertId = bookingAlertsData[i].alertId;
                var bookingId = bookingAlertsData[i].id;
                var titleText = 'Booking Alert';
                var bodyText = "Booking "+bookingId+ " has not been allotted yet. What do you want to do?";
                
                Notify(titleText, bodyText, alertId, bookingId);
            }
            
        }, function errorCallback(response) {});

        $http({
            method: 'GET',
            url: '/api/getEtaAlert',
            params : data
        }).then(function successCallback(response) {
            $rootScope.bookingAlertsData = null;
            var bookingAlertsData = response.data;
            for (var i = 0; i < bookingAlertsData.length; i++) {
                var bookingId = bookingAlertsData[i].id;
                var titleText = 'Booking Alert';
                var bodyText = "Booking "+bookingId+ " has not been allotted yet. What do you want to do?";
                var mgCode  = bookingAlertsData[i].mgCode;
                notifyMe(titleText, bodyText, mgCode, bookingId);
            }
            
        }, function errorCallback(response) {});
    };

    // Determine the correct object to use
    var notification = window.Notification || window.mozNotification || window.webkitNotification;

    // The user needs to allow this
    if ('undefined' === typeof notification)
        alert('Web notification not supported');
    else
        notification.requestPermission(function(permission) {});

    // A function handler
    function Notify(titleText, bodyText, alertId, bookingId) {
        if ('undefined' === typeof notification)
            return false; //Not supported....
        var noty = new notification(
            titleText, {
                body: bodyText,
                dir: 'auto',
                lang: 'EN', 
                icon: 'assets/images/ic_launcher.png',
                requireInteraction: true 
            }
        );
        noty.onclick = function() {
            window.focus();
            swal({
                title: 'What do you want to do?',
                text: "Booking "+bookingId+ " has not been allotted yet. What do you want to do?",
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, Wait!',
                cancelButtonText: 'No, Cancel!',
                confirmButtonClass: 'btn btn-success',
                cancelButtonClass: 'btn btn-danger',
                buttonsStyling: false
            }, function (isConfirm) {
                if (isConfirm) {
                    $rootScope.cancelAndReBook(alertId);
                    noty.close();
                } else {
                    $rootScope.cancelBooking(alertId);
                    noty.close();
                }
            });
            $(".sweet-alert p").html("Booking <a href='/booking-invoice/"+bookingId+"' target='_blank'>"+bookingId+ "</a> has not been allotted yet. What do you want to do?");
        };
        noty.onerror = function() {
            console.log('notification.Error');
        };
        noty.onshow = function() {
            //console.log('notification.Show');
        };
        noty.onclose = function() {
            //console.log(alertId);
        };
        setTimeout(function(){ 
           noty.close();
        }, 55000);
        return true;
    }

    function notifyMe(titleText, bodyText, mgCode, bookingId) 
    {
        if (!Notification) 
        {
            alert('Desktop notifications not available in your browser. Try Chromium.'); 
            return;
        }

        if (Notification.permission !== "granted")
        Notification.requestPermission();
        else {
        var notification = new Notification(mgCode+" has crossed the ETA limit on booking Id "+ bookingId, {
          icon: 'assets/images/favicon.ico'
        });

        notification.onclick = function () {
          window.open("http://dashboard.maalgaadi.net/booking-invoice/"+bookingId);      
        };

        }

    }

    $rootScope.cancelAndReBook = function(id) {
        var data = { booking_id : id, flag : 1}
        $http({
            method: 'POST',
            url: '/api/cancelAndReBook',
            params: data
        }).then(function successCallback(response) {
            console.log(response);
        }, function errorCallback(response) {});
    };

    $rootScope.cancelBooking = function(id) {
        var data = { booking_id : id , reason : 'Vehicle Unavailable', issues_type : 'Availability' , action : 'Rescheduled'  }
        $http({
            method: 'POST',
            url: '/api/cancelBooking',
            params: data
        }).then(function successCallback(response) {
            console.log(response);
        }, function errorCallback(response) {});
    };

    $rootScope.removeBookingAlert = function(id) {
        var data = { fieldId: id }
        $http({
            method: 'POST',
            url: '/api/removeBookingAlert',
            params: data
        }).then(function successCallback(response) {
            if (response.data.success) {
                $rootScope.bookingAlerts();
            } else {
                alert("something went wrong");
            }

        }, function errorCallback(response) {});
    };

     $rootScope.getCity = function() {
        $http({
            method: 'GET',
            url: '/api/city'
        }).then(function successCallback(response) {
            console.log(response);
            $rootScope.cities = response.data;
            
            if(angular.isDefined($rootScope.cities[0].id)){
                if(angular.isUndefined($rootScope.default_city_id)){
                    $rootScope.default_city_id = $rootScope.cities[0].id;
                    $rootScope.maalgaadi_city_id = $rootScope.cities[0].id;
                    if(angular.isUndefined($localStorage.defaultCityId)){

                        $localStorage.defaultCityId = $rootScope.default_city_id;
                    }
                }else{
                    $rootScope.maalgaadi_city_id = $rootScope.default_city_id;
                }
            }
            $rootScope.default_city_id = $localStorage.defaultCityId;
            $rootScope.maalgaadi_city_id = $rootScope.default_city_id;
           
        }, function errorCallback(response) {});
    };
    $rootScope.getAllCity = function() {
        $http({
            method: 'GET',
            url: '/api/getAllCity'
        }).then(function successCallback(response) {
            $rootScope.allcities = response.data;
            console.log($rootScope.allcities);
            if(angular.isDefined($rootScope.allcities[0].id)){
                $rootScope.city_id = $rootScope.allcities[0].id;
            }
        }, function errorCallback(response) {});
    };
    
   $rootScope.changeMaalgaadiCity = function(){
        $rootScope.maalgaadi_city_id = $rootScope.default_city_id;
        $localStorage.defaultCityId = $rootScope.default_city_id;
        $rootScope.vehicleCategoryDetialsByCity = {}
    }

    
    setInterval(function(){ 
        bookingAlerts();
    }, 300000);

}]);
