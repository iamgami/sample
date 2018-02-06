var app = angular.module('maalgaadi', [
    'ui.router',
    'ngCookies',
    'vsGoogleAutocomplete',
    'ngAutocomplete',
    'ngMessages',
    'ngFileUpload',
    'oitozero.ngSweetAlert',
    'ui.bootstrap',
    'ui.bootstrap.datetimepicker',
    'mm.acl',
    'LocalStorageModule',
    'cfp.hotkeys',
    'ui.dateTimeInput',
    'ngMaterial',
    'ngMessages',
    'timer',
    'angularFileUpload',
    'textAngular',
    'angularUtils.directives.dirPagination',
    'ng-fusioncharts',
    'ngStorage'
]);

app.run(['$rootScope', '$window', 'AclService', function($rootScope, $window, AclService) {
    $rootScope.$on("$stateChangeError", function(event, toState, toParams, fromState, fromParams, error) {
        if (error && error === 'Unauthorized') {
            $window.location.href = '/dashboard';
        }
    });


}]);

//This will handle all of our routing
app.config(function($stateProvider, $urlRouterProvider, $locationProvider, $compileProvider, AclServiceProvider) {



    var myConfig = {
        storage: 'localStorage',
        storageKey: 'AppAcl'
    };
    AclServiceProvider.config(myConfig);

    AclServiceProvider.resume();
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension):/);
    $urlRouterProvider.otherwise('/dashboard');
    var whichHouse = 'Ankur';
    $stateProvider
        .state('add-vehicle', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/add-vehicle',
            templateUrl: '/views/vehicle/add-vehicle.html',
            controller: 'VehicleController'
        })
        .state('add-loading-unloading-charge', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/add-loading-unloading-charge',
            templateUrl: '/views/vehicle/add-loading-unloading-charge.html',
            controller: 'VehicleController'
        })
        .state('vehicle-goods-charge-list', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/vehicle-goods-charge-list',
            templateUrl: '/views/vehicle/vehicle-goods-charge-list.html',
            controller: 'VehicleController'
        })
        .state('edit-loading-unloading-charge', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/edit-loading-unloading-charge/:id',
            templateUrl: '/views/vehicle/edit-loading-unloading-charge.html',
            controller: 'VehicleController'
        })
        .state('trip-earning', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('supply_manager') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/trip-earning',
            templateUrl: '/views/analytics/trip-earning.html',
            controller: 'AnalyticsController'
        })
        .state('view-booking-commission', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('account') == true || AclService.hasRole('city_head') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/view-booking-commission',
            templateUrl: '/views/adjustment/view-booking-commission.html',
            controller: 'AdjustmentController'
        })
        .state('driver-daily-attendance', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('callcenter_driver_manager') == true || AclService.hasRole('admin') == true || AclService.hasRole('supply_manager') == true || AclService.hasRole('billty_manager') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/driver-daily-attendance',
            templateUrl: '/views/report/driver-daily-attendance.html',
            controller: 'ReportController'
        })
        .state('customer-cluster', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('sales_manager') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/customer-cluster',
            templateUrl: '/views/customer/customer-cluster.html',
            controller: 'CustomerController'
        })
        .state('reassign-pod', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('billty_manager') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/reassign-pod/:bookingId',
            templateUrl: '/views/billty/reassign-pod.html',
            controller: 'BilltyController'
        })
        .state('list-billty-user', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('billty_manager') == true || AclService.hasRole('supply_manager') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/list-billty-user',
            templateUrl: '/views/billty/list-billty-user.html',
            controller: 'BilltyController'
        })
        .state('driver-hourly-attendance', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('callcenter_driver_manager') == true || AclService.hasRole('admin') == true || AclService.hasRole('supply_manager') == true || AclService.hasRole('billty_manager') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/driver-hourly-attendance',
            templateUrl: '/views/analytics/hourly-analytics.html',
            controller: 'ReportController'
        })
        .state('allotment-report', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/allotment-report',
            templateUrl: '/views/analytics/allotment-report.html',
            controller: 'ReportController'
        })
        .state('new-customer', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('sales_manager') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/new-customer',
            templateUrl: '/views/customer/newly-customer.html',
            controller: 'CustomerController'
        })
        .state('call-center-dtc-report', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/call-center-dtc-report',
            templateUrl: '/views/report/call-center-dtc-report.html',
            controller: 'ReportController'
        })
        .state('add-billty-user', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('billty_manager') == true || AclService.hasRole('supply_manager') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/add-billty-user',
            templateUrl: '/views/billty/add-billty.html',
            controller: 'BilltyController'
        })
        .state('billty', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('callcenter_driver_manager') == true || AclService.hasRole('admin') == true || AclService.hasRole('billty_manager') == true || AclService.hasRole('supply_manager') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/billty',
            templateUrl: '/views/billty/billty.html',
            controller: 'BilltyController'
        })
        .state('distance-analysis', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('employee') == true || AclService.hasRole('employee_manager') == true || AclService.hasRole('sales_manager') == true || AclService.hasRole('city_head') == true || AclService.hasRole('sales_executive') == true) {
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/distance-analysis',
            templateUrl: '/views/report/distance-analysis.html',
            controller: 'ReportController'
        })

        .state('driver-incentive', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('supply_manager') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/driver-incentive',
            templateUrl: '/views/report/driver-incentive.html',
            controller: 'ReportController'
        })
        .state('booking-graphs', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('supply_manager') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/booking-graphs',
            templateUrl: '/views/analytics/booking-graphs.html',
            controller: 'AnalyticsController'
        })

        // .state('driver-login-graph', {
        //     resolve: {
        //         'acl': ['$q', 'AclService', function($q, AclService) {
        //             if (AclService.hasRole('admin') == true || AclService.hasRole('supply_manager') == true) {
        //                 // Has proper permissions
        //                 return true;
        //             } else {
        //                 // Does not have permission
        //                 return $q.reject('Unauthorized');
        //             }
        //         }]
        //     },
        //     url: '/driver-login-graph',
        //     templateUrl: '/views/analytics/driver-login-graph.html',
        //     controller: 'AnalyticsController'
        // })

        // .state('login-hours-graph', {
        //     resolve: {
        //         'acl': ['$q', 'AclService', function($q, AclService) {
        //             if (AclService.hasRole('admin') == true || AclService.hasRole('supply_manager') == true) {
        //                 // Has proper permissions
        //                 return true;
        //             } else {
        //                 // Does not have permission
        //                 return $q.reject('Unauthorized');
        //             }
        //         }]
        //     },
        //     url: '/login-hours-graph',
        //     templateUrl: '/views/analytics/login-hours-graph.html',
        //     controller: 'AnalyticsController'
        // })

        // .state('revenue-analytics-graph', {
        //     resolve: {
        //         'acl': ['$q', 'AclService', function($q, AclService) {
        //             if (AclService.hasRole('admin') == true || AclService.hasRole('supply_manager') == true) {
        //                 // Has proper permissions
        //                 return true;
        //             } else {
        //                 // Does not have permission
        //                 return $q.reject('Unauthorized');
        //             }
        //         }]
        //     },
        //     url: '/revenue-analytics-graph',
        //     templateUrl: '/views/analytics/revenue-analytics-graph.html',
        //     controller: 'AnalyticsController'
        // })

        // .state('daily-customer-ghaph', {
        //         resolve: {
        //             'acl': ['$q', 'AclService', function($q, AclService) {
        //                 if (AclService.hasRole('admin') == true || AclService.hasRole('supply_manager') == true) {
        //                     // Has proper permissions
        //                     return true;
        //                 } else {
        //                     // Does not have permission
        //                     return $q.reject('Unauthorized');
        //                 }
        //             }]
        //         },
        //         url: '/daily-customer-ghaph',
        //         templateUrl: '/views/analytics/daily-customer-ghaph.html',
        //         controller: 'AnalyticsController'
        //     })
        // .state('daily-trip-ghaph', {
        //     resolve: {
        //         'acl': ['$q', 'AclService', function($q, AclService) {
        //             if (AclService.hasRole('admin') == true || AclService.hasRole('supply_manager') == true) {
        //                 // Has proper permissions
        //                 return true;
        //             } else {
        //                 // Does not have permission
        //                 return $q.reject('Unauthorized');
        //             }
        //         }]
        //     },
        //     url: '/daily-trip-ghaph',
        //     templateUrl: '/views/analytics/daily-trip-ghaph.html',
        //     controller: 'AnalyticsController'
        // })
        .state('customer-rating', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('supply_manager') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/customer-rating',
            templateUrl: '/views/report/customer-rating.html',
            controller: 'ReportController'
        })
        .state('customer-wallet-display', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('employee') == true || AclService.hasRole('account') == true || AclService.hasRole('sales_manager') == true || AclService.hasRole('city_head') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/customer-wallet-display/:customerId',
            templateUrl: '/views/report/customer-wallet-display.html',
            controller: 'ReportController'
        })
        .state('driver-wallet-quick-display', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('callcenter_driver_manager') == true || AclService.hasRole('admin') == true || AclService.hasRole('employee') == true || AclService.hasRole('account') == true || AclService.hasRole('sales_manager') == true || AclService.hasRole('city_head') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/driver-wallet-quick-display/:driverId',
            templateUrl: '/views/report/driver-wallet-quick-display.html',
            controller: 'ReportController'
        })
        .state('driver-wallet-quick-display1', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('employee') == true || AclService.hasRole('account') == true || AclService.hasRole('sales_manager') == true || AclService.hasRole('city_head') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/driver-wallet-quick-display1/:driverId',
            templateUrl: '/views/report/driver-wallet-quick-display1.html',
            controller: 'ReportController'
        })
        .state('forward-email', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/forward-email',
            templateUrl: '/views/other/forward-email.html',
            controller: 'SpecialController'
        })
        .state('driver-wallet-display', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/driver-wallet-display',
            templateUrl: '/views/wallet/driver-display-wallet.html',
            controller: 'WalletController'
        })
        .state('notify-driver', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('supply_manager') == true || AclService.hasRole('employee') == true || AclService.hasRole('billty_manager') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/notify-driver',
            templateUrl: '/views/other/notify-driver.html',
            controller: 'SpecialController'
        })
        .state('booking-status', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/booking-status',
            templateUrl: '/views/booking/booking-status.html',
            controller: 'BookingStatusController'
        })
        .state('customer-analytic', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/customer-analytic',
            templateUrl: '/views/analytics/customer-revenue.html',
            controller: 'AnalyticsController'
        })
        .state('forgot-password', {
            url: '/forgot-password',
            templateUrl: '/views/forgot-password.php',
            controller: 'VehicleController'
        })
        .state('edit-vehicle', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/edit-vehicle/:vehicleId',
            templateUrl: '/views/vehicle/edit-vehicle.html',
            controller: 'VehicleController'
        })
        .state('booking-details', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('account') == true || AclService.hasRole('sales_manager') == true || AclService.hasRole('city_head') == true || AclService.hasRole('sales_executive') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/booking-details',
            templateUrl: '/views/report/booking-detials.html',
            controller: 'ReportController'
        })
        .state('booking-from-app', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('super_admin') == true || AclService.hasRole('admin') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/booking-from-app',
            templateUrl: '/views/report/booking-from-app.html',
            controller: 'ReportController'
        })
        .state('customer-revenue', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('sales_manager') == true || AclService.hasRole('city_head') == true || AclService.hasRole('sales_executive') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/customer-revenue',
            templateUrl: '/views/report/customer-revenue.html',
            controller: 'ReportController'
        })
        .state('driver-attendance', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('employee_manager') == true || AclService.hasRole('city_head') == true || AclService.hasRole('supply_manager') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/driver-attendance',
            templateUrl: '/views/report/driver-attendance.html',
            controller: 'ReportController'
        })
        .state('credit', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('sales_manager') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/credit',
            templateUrl: '/views/credit/credit.html',
            controller: 'CreditController'
        })

        .state('credit-list', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('city_head') == true || AclService.hasRole('sales_manager') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/credit-list',
            templateUrl: '/views/credit/credit-list.html',
            controller: 'CreditController'
        })
        .state('nearest-driver', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('employee') == true || AclService.hasRole('employee_manager') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/nearest-driver',
            templateUrl: '/views/booking/nearest-driver.html',
            controller: 'NearestController'
        })
        .state('nearest-driver1', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('employee') == true || AclService.hasRole('employee_manager') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/nearest-driver1',
            templateUrl: '/views/booking/nearest-driver1.html',
            controller: 'NearestController'
        })
        .state('booking-edit', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('employee_manager') == true || AclService.hasRole('employee') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/booking-edit/:bookingId',
            templateUrl: '/views/booking/edit-booking.html',
            controller: 'EditBookingController',
            reloadOnSearch: false
        })
        .state('customer-wallet', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('employee') == true || AclService.hasRole('account') == true || AclService.hasRole('sales_manager') == true || AclService.hasRole('city_head') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/customer-wallet',
            templateUrl: '/views/report/customer-wallet.html',
            controller: 'ReportController'
        })
        .state('driver-wallet', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('employee') == true || AclService.hasRole('account') == true || AclService.hasRole('city_head') == true || AclService.hasRole('supply_manager') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/driver-wallet',
            templateUrl: '/views/report/driver-wallet.html',
            controller: 'ReportController'
        })
        .state('vehicle-list', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/vehicle-list',
            templateUrl: '/views/vehicle/vehicle-list.html',
            controller: 'VehicleController'
        })
        .state('surge-customer', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('super_admin') == true || AclService.hasRole('admin') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/surge-customer',
            templateUrl: '/views/vehicle/surge-customer.html',
            controller: 'VehicleController'
        })
        .state('add-booking', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('employee') == true || AclService.hasRole('employee_manager') == true || AclService.hasRole('sales_manager') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/add-booking',
            templateUrl: '/views/booking/add-booking.html',
            controller: 'AddBookingController'
        })
        .state('add-booking/mobileNo', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('employee') == true || AclService.hasRole('employee_manager') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/add-booking/:mobileNo',
            templateUrl: '/views/booking/add-booking.html',
            controller: 'AddBookingController'
        })
        .state('booking-list', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('callcenter_driver_manager') == true || AclService.hasRole('admin') == true || AclService.hasRole('employee') == true || AclService.hasRole('employee_manager') == true || AclService.hasRole('sales_manager') == true || AclService.hasRole('city_head') == true || AclService.hasRole('sales_executive') == true || AclService.hasRole('billty_manager') == true || AclService.hasRole('supply_manager') == true) {
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/booking-list',
            templateUrl: '/views/booking/booking-list.html',
            controller: 'BookingListController'
        })
        .state('cancel-bookings', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('employee_manager') == true || AclService.hasRole('sales_manager') == true || AclService.hasRole('sales_executive') == true || AclService.hasRole('city_head') == true || AclService.hasRole('billty_manager') == true || AclService.hasRole('supply_manager') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/cancel-bookings',
            templateUrl: '/views/report/cancel-booking.html',
            controller: 'ReportController'
        })
        .state('cancel-booking', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('employee_manager') == true || AclService.hasRole('employee') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/cancel-booking/:bookingId',
            templateUrl: '/views/booking/cancel-booking.html',
            controller: 'CancelBookingController'
        })
        .state('customer', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('employee_manager') == true || AclService.hasRole('sales_manager') == true || AclService.hasRole('city_head') == true || AclService.hasRole('employee') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/customer',
            templateUrl: '/views/customer/add_customer.html',
            controller: 'CustomerController'
        })
        .state('customer-list', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('employee_manager') == true || AclService.hasRole('sales_manager') == true || AclService.hasRole('city_head') == true || AclService.hasRole('employee') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/customer-list',
            templateUrl: '/views/customer/customer.html',
            controller: 'CustomerController'
        })
        .state('edit-customer', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('employee_manager') == true || AclService.hasRole('city_head') == true || AclService.hasRole('sales_manager') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/edit-customer/:bookingId',
            templateUrl: '/views/customer/edit_customer.html',
            controller: 'CustomerController'
        })
        .state('customer-setting', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/customer-setting/:customerId',
            templateUrl: '/views/customer/customer-setting.html',
            controller: 'CustomerController'
        })
        .state('employee-access', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/employee-access',
            templateUrl: '/views/employee/employee-access.html',
            controller: 'EmployeeController'
        })
        .state('employee', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/employee',
            templateUrl: '/views/employee/employee.html',
            controller: 'EmployeeController'
        })
        .state('report', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/report',
            templateUrl: '/views/report/report.html',
            controller: 'ReportController'
        })
        .state('booking-tat', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('driver_trainer') == true || AclService.hasRole('city_head') == true || AclService.hasRole('sales_manager') == true || AclService.hasRole('sales_executive') == true || AclService.hasRole('supply_manager') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/booking-tat',
            templateUrl: '/views/report/booking-tat.html',
            controller: 'ReportController'
        })
        .state('vehicle-services', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('account') == true || AclService.hasRole('city_head') == true || AclService.hasRole('driver_trainer') == true || AclService.hasRole('supply_manager') == true || AclService.hasRole('billty_manager') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/vehicle-services',
            templateUrl: '/views/report/vehicle-services.html',
            controller: 'ReportController'
        })
        .state('billty-report', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('sales_manager') == true || AclService.hasRole('city_head') == true || AclService.hasRole('employee') == true || AclService.hasRole('billty_manager') == true || AclService.hasRole('supply_manager') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/billty-report',
            templateUrl: '/views/report/billty-reports.html',
            controller: 'ReportController'
        })
        .state('account', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/account',
            templateUrl: '/views/account/account.html',
            controller: 'WalletController'
        })
        .state('discount', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('sales_manager') == true || AclService.hasRole('city_head') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/discount',
            templateUrl: '/views/discount/add-discount.html',
            controller: 'DiscountController'
        })
        .state('discount-coupon', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('sales_manager') == true || AclService.hasRole('city_head') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/discount-coupon',
            templateUrl: '/views/discount/discount-coupon.html',
            controller: 'DiscountController'
        })
        .state('add-discount-coupon', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/add-discount-coupon',
            templateUrl: '/views/discount/add-discount-coupon.html',
            controller: 'DiscountController'
        })
        .state('discount-coupon-list', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/discount-coupon-list',
            templateUrl: '/views/discount/discount-coupon-list.html',
            controller: 'DiscountController'
        })
        .state('edit-coupon', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('supply_manager') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/edit-coupon/:Id',
            templateUrl: '/views/discount/edit-coupon.html',
            controller: 'DiscountController'
        })
        .state('heat-map', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/heat-map',
            templateUrl: '/views/heat/heat-map.html',
        })
        .state('driver-daily-running-report', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/driver-daily-running-report',
            templateUrl: '/views/adjustment/adjustment.html',
            controller: 'MapController'
        })
        .state('driver-login-detials', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('supply_manager') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/driver-login-detials',
            templateUrl: '/views/driver/driver-login.html',
            controller: 'ReportController'
        })
        .state('login', {

            url: '/login',
            templateUrl: '/views/login.html',
        })
        .state('forgotPassword', {
            url: '/forgotPassword',
            templateUrl: '/views/forgot-password.html',
        })
        .state('dashboard', {
            url: '/dashboard',
            templateUrl: '/views/dashboard/dashboard.html',
            controller: 'DashboardController'
        })
        .state('dashboard1', {
            url: '/dashboard1',
            templateUrl: '/views/dashboard/dashboard-list.html',
            controller: 'DashboardController'
        })
        .state('add-users', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('hr_manager') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/add-users',
            templateUrl: '/views/user/add-user.html',
            controller: 'UserController'
        })
        .state('user-list', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('hr_manager') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/user-list',
            templateUrl: '/views/user/user-list.html',
            controller: 'UserController'
        })
        .state('update-profile', {
            url: '/update-profile',
            templateUrl: '/views/user/update-user-profile.html',
            controller: 'UserController'
        })
        .state('add-city', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/add-city',
            templateUrl: '/views/city/add-city.html',
            controller: 'CityController'
        })
        .state('cities', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/cities',
            templateUrl: '/views/city/city.html',
            controller: 'CityController'
        })

        .state('add-cluster', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/add-cluster',
            templateUrl: '/views/city/add-cluster.html',
            controller: 'CityController'
        })
        .state('cluster', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/cluster',
            templateUrl: '/views/city/cluster.html',
            controller: 'CityController'
        })
        .state('/booking-invoice', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('callcenter_driver_manager') == true || AclService.hasRole('admin') == true || AclService.hasRole('employee_manager') == true || AclService.hasRole('sales_executive') == true || AclService.hasRole('sales_manager') == true || AclService.hasRole('city_head') == true || AclService.hasRole('employee') == true || AclService.hasRole('supply_manager') == true || AclService.hasRole('billty_manager') == true || AclService.hasRole('account') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/booking-invoice/:bookingId',
            templateUrl: '/views/booking/booking-invoice.html',
            controller: 'InvoiceController',
            reloadOnSearch: false
        })
        .state('/booking-invoice1', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('employee_manager') == true || AclService.hasRole('sales_executive') == true || AclService.hasRole('sales_manager') == true || AclService.hasRole('city_head') == true || AclService.hasRole('employee') == true || AclService.hasRole('supply_manager') == true || AclService.hasRole('billty_manager') == true || AclService.hasRole('account') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/booking-invoice1/:bookingId',
            templateUrl: '/views/booking/booking-invoice1.html',
            controller: 'InvoiceController',
            reloadOnSearch: false
        })
        .state('active-driver', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('callcenter_driver_manager') == true || AclService.hasRole('admin') == true || AclService.hasRole('employee_manager') == true || AclService.hasRole('employee') == true || AclService.hasRole('city_head') == true || AclService.hasRole('supply_manager') == true || AclService.hasRole('billty_manager') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/active-driver',
            templateUrl: '/views/report/active-driver.html',
            controller: 'ReportController'
        })
        .state('active-driver-hours', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/active-driver-hours',
            templateUrl: '/views/report/active-driver-hours.html',
            controller: 'DriverController'
        })
        .state('driver-list', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('callcenter_driver_manager') == true || AclService.hasRole('admin') == true || AclService.hasRole('city_head') == true || AclService.hasRole('supply_manager') == true || AclService.hasRole('account') == true || AclService.hasRole('billty_manager') == true || AclService.hasRole('CCM') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/driver-list',
            templateUrl: '/views/driver/driver-list.html',
            controller: 'DriverController'
        })

        .state('edit-driver', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('callcenter_driver_manager') == true || AclService.hasRole('admin') == true || AclService.hasRole('supply_manager') == true || AclService.hasRole('billty_manager') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/edit-driver/:driverId',
            templateUrl: '/views/driver/edit-driver.html',
            controller: 'DriverController'
        })
        .state('show-adjustment', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('account') == true || AclService.hasRole('city_head') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/show-adjustment',
            templateUrl: '/views/adjustment/show_adjustment.html',
            controller: 'AdjustmentController'
        })
        //Gunjan Start
        .state('adjustment', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/adjustment',
            templateUrl: '/views/adjustment/adjustment-security-login.html',
            controller: 'AdjustmentController'
        })
        .state('change-amount-received', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('city_head') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/change-amount-received',
            templateUrl: '/views/adjustment/change_amount_received.html',
            controller: 'AdjustmentController'
        })
        .state('change-bill-amount', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('city_head') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/change-bill-amount',
            templateUrl: '/views/adjustment/change_bill_amount.html',
            controller: 'AdjustmentController'
        })
        .state('toll-charge', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('city_head') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/toll-charge',
            templateUrl: '/views/adjustment/toll_charge.html',
            controller: 'AdjustmentController'
        })
        .state('pay-cancellation', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/pay-cancellation',
            templateUrl: '/views/adjustment/pay_cancellation.html',
            controller: 'AdjustmentController'
        })
        .state('view-amount-received', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('account') == true || AclService.hasRole('city_head') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/view-amount-received',
            templateUrl: '/views/adjustment/view_amount_received.html',
            controller: 'AdjustmentController'
        })
        .state('view-customer-amount-received', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('account') == true || AclService.hasRole('city_head') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/view-customer-amount-received',
            templateUrl: '/views/adjustment/customer_amount_received.html',
            controller: 'AdjustmentController'
        })
        .state('view-customer-cash-receive', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('account') == true || AclService.hasRole('city_head') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/view-customer-cash-receive',
            templateUrl: '/views/adjustment/view_customer_cash_receive.html',
            controller: 'AdjustmentController'
        })
        .state('view-bill-amount', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('account') == true || AclService.hasRole('city_head') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/view-bill-amount',
            templateUrl: '/views/adjustment/view_bill_amount.html',
            controller: 'AdjustmentController'
        })
        .state('customer-bill-amount', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('account') == true || AclService.hasRole('city_head') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/customer-bill-amount',
            templateUrl: '/views/adjustment/customer_bill_amount.html',
            controller: 'AdjustmentController'
        })
        .state('view-toll-charge', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('account') == true || AclService.hasRole('city_head') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/view-toll-charge',
            templateUrl: '/views/adjustment/view_toll_charge.html',
            controller: 'AdjustmentController'
        })
        .state('view-customer-toll-charge', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('account') == true || AclService.hasRole('city_head') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/view-customer-toll-charge',
            templateUrl: '/views/adjustment/customer_toll_charge.html',
            controller: 'AdjustmentController'
        })
        .state('add-customer-cash-recieve', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('city_head') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/add-customer-cash-recieve',
            templateUrl: '/views/adjustment/add_customer_cash_recieve.html',
            controller: 'AdjustmentController'
        })
        .state('change-amount-recieved-data', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('city_head') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/change-amount-recieved-data',
            templateUrl: '/views/adjustment/change_amount_recieved_data.html',
            controller: 'AdjustmentController'
        })
        .state('add-discount-amount', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('city_head') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/add-discount-amount',
            templateUrl: '/views/adjustment/add_discount_amount.html',
            controller: 'AdjustmentController'
        })
        .state('view-discount-amount', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('account') == true || AclService.hasRole('city_head') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/view-discount-amount',
            templateUrl: '/views/adjustment/view_discount_amount.html',
            controller: 'AdjustmentController'
        })
        .state('revenue-report', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('account') == true || AclService.hasRole('city_head') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/revenue-report',
            templateUrl: '/views/adjustment/revenue_report.html',
            controller: 'AdjustmentController'
        })
        .state('driver-revenue', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('driver_trainer') == true || AclService.hasRole('supply_manager') == true || AclService.hasRole('employee') == true || AclService.hasRole('billty_manager') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/driver-revenue',
            templateUrl: '/views/report/driver-revenue.html',
            controller: 'ReportController'
        })
        .state('customer-wallet-report', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('employee') == true || AclService.hasRole('city_head') == true || AclService.hasRole('account') == true || AclService.hasRole('employee_manager') == true || AclService.hasRole('sales_manager') == true || AclService.hasRole('city_head') == true || AclService.hasRole('sales_executive') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/customer-wallet-report',
            templateUrl: '/views/adjustment/customer_balance_report_credit_debit.html',
            controller: 'AdjustmentController'
        })
        .state('customer-wallet-report/mobileNo', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('employee') == true || AclService.hasRole('city_head') == true || AclService.hasRole('account') == true || AclService.hasRole('employee_manager') == true || AclService.hasRole('sales_manager') == true || AclService.hasRole('city_head') == true || AclService.hasRole('sales_executive') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/customer-wallet-report/:mobileNo',
            templateUrl: '/views/adjustment/customer_balance_report_credit_debit.html',
            controller: 'AdjustmentController'
        })
        .state('random', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('city_head') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/random',
            templateUrl: '/views/adjustment/random_adjust.html',
            controller: 'AdjustmentController'
        })
        .state('view-driver-random', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('account') == true || AclService.hasRole('city_head') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/view-driver-random',
            templateUrl: '/views/adjustment/view_random.html',
            controller: 'AdjustmentController'
        })
        .state('add-driver-cash-paid', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('account') == true || AclService.hasRole('city_head') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/add-driver-cash-paid',
            templateUrl: '/views/adjustment/add_driver_cash_paid.html',
            controller: 'AdjustmentController'
        })
        .state('driver-cash-receive', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('city_head') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/driver-cash-receive',
            templateUrl: '/views/adjustment/add_driver_cash_receive.html',
            controller: 'AdjustmentController'
        })
        .state('view-driver-cash', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('account') == true || AclService.hasRole('city_head') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/view-driver-cash',
            templateUrl: '/views/adjustment/view_driver_cash.html',
            controller: 'AdjustmentController'
        })
        .state('driver-trip-report', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('account') == true || AclService.hasRole('city_head') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/driver-trip-report',
            templateUrl: '/views/adjustment/driver_trip_report.html',
            controller: 'AdjustmentController'
        })
        .state('cash-receive', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('account') == true || AclService.hasRole('city_head') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/cash-receive',
            templateUrl: '/views/adjustment/view_driver_cash_recieved.html',
            controller: 'AdjustmentController'
        })
        .state('commission', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('city_head') == true || AclService.hasRole('account') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/commission',
            templateUrl: '/views/adjustment/commission.html',
            controller: 'AdjustmentController'
        })
        .state('view-commission', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('account') == true || AclService.hasRole('city_head') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/view-commission',
            templateUrl: '/views/adjustment/view_commission.html',
            controller: 'AdjustmentController'
        })
        .state('driver-security-deposit', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('account') == true || AclService.hasRole('city_head') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/driver-security-deposit',
            templateUrl: '/views/adjustment/security_deposit.html',
            controller: 'AdjustmentController'
        })
        .state('view-security-deposit', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('account') == true || AclService.hasRole('city_head') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/view-security-deposit',
            templateUrl: '/views/adjustment/view_security_deposit.html',
            controller: 'AdjustmentController'
        })
        .state('driver-penalty', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('city_head') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/driver-penalty',
            templateUrl: '/views/adjustment/driver_penalty.html',
            controller: 'AdjustmentController'
        })
        .state('view-driver-penalty', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('account') == true || AclService.hasRole('city_head') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/view-driver-penalty',
            templateUrl: '/views/adjustment/view_driver_penalty.html',
            controller: 'AdjustmentController'
        })
        .state('driver-cancellation-charge', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('city_head') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/driver-cancellation-charge',
            templateUrl: '/views/adjustment/driver_cancellation_charge.html',
            controller: 'AdjustmentController'
        })
        .state('cancellation', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('city_head') == true || AclService.hasRole('city_head') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/cancellation',
            templateUrl: '/views/adjustment/cancellation.html',
            controller: 'AdjustmentController'
        })
        .state('view-driver-cancel', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('account') == true || AclService.hasRole('city_head') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/view-driver-cancel',
            templateUrl: '/views/adjustment/view_driver_cancel.html',
            controller: 'AdjustmentController'
        })
        .state('pay-waiting-charges', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('city_head') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/pay-waiting-charges',
            templateUrl: '/views/adjustment/pay_waiting_charges.html',
            controller: 'AdjustmentController'
        })
        .state('view-waiting-charges', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('account') == true || AclService.hasRole('city_head') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/view-waiting-charges',
            templateUrl: '/views/adjustment/view_waiting_charges.html',
            controller: 'AdjustmentController'
        })
        .state('distance-to-customer', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('city_head') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/distance-to-customer',
            templateUrl: '/views/adjustment/dist_to_cust.html',
            controller: 'AdjustmentController'
        })
        .state('view-distance-to-customer', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('account') == true || AclService.hasRole('city_head') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/view-distance-to-customer',
            templateUrl: '/views/adjustment/view_dist_to_cust.html',
            controller: 'AdjustmentController'
        })
        .state('pay-offline', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('city_head') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/pay-offline',
            templateUrl: '/views/adjustment/offline_trip.html',
            controller: 'AdjustmentController'
        })
        .state('view-offline-trip', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('account') == true || AclService.hasRole('city_head') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/view-offline-trip',
            templateUrl: '/views/adjustment/view_offline_trip.html',
            controller: 'AdjustmentController'
        })
        .state('unmatch-report', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('city_head') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/unmatch-report',
            templateUrl: '/views/adjustment/unmatch_report.html',
            controller: 'AdjustmentController'
        })
        .state('view-driver-wallet', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('callcenter_driver_manager') == true || AclService.hasRole('admin') == true || AclService.hasRole('city_head') == true || AclService.hasRole('employee') == true || AclService.hasRole('account') == true || AclService.hasRole('employee_manager') == true || AclService.hasRole('city_head') == true || AclService.hasRole('supply_manager') == true || AclService.hasRole('billty_manager') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/view-driver-wallet',
            templateUrl: '/views/adjustment/vehicle_servicesX.html',
            controller: 'AdjustmentController'
        })

        .state('view-driver-wallet-new', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('city_head') == true || AclService.hasRole('employee') == true || AclService.hasRole('account') == true || AclService.hasRole('employee_manager') == true || AclService.hasRole('city_head') == true || AclService.hasRole('supply_manager') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/view-driver-wallet-new',
            templateUrl: '/views/adjustment/vehicle_servicesX_new.html',
            controller: 'AdjustmentController'
        })
        .state('view-driver-wallet1', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('city_head') == true || AclService.hasRole('employee') == true || AclService.hasRole('account') == true || AclService.hasRole('employee_manager') == true || AclService.hasRole('city_head') == true || AclService.hasRole('supply_manager') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/view-driver-wallet1',
            templateUrl: '/views/adjustment/driver-wallet.html',
            controller: 'AdjustmentController'
        })
        .state('view-driver-wallet/mgCode', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('city_head') == true || AclService.hasRole('employee') == true || AclService.hasRole('account') == true || AclService.hasRole('employee_manager') == true || AclService.hasRole('city_head') == true || AclService.hasRole('supply_manager') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/view-driver-wallet/:mgCode',
            templateUrl: '/views/adjustment/vehicle_servicesX.html',
            controller: 'AdjustmentController'
        })
        .state('view-swap-charges', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('account') == true || AclService.hasRole('city_head') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/view-swap-charges',
            templateUrl: '/views/adjustment/view_swap_charges.html',
            controller: 'AdjustmentController'
        })
        .state('view-driver-cancellation', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('account') == true || AclService.hasRole('city_head') == true || AclService.hasRole('billty_manager') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/view-driver-cancellation',
            templateUrl: '/views/adjustment/view_driver_cancellation.html',
            controller: 'AdjustmentController'
        })
        .state('driver-rejections', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('account') == true || AclService.hasRole('city_head') == true || AclService.hasRole('supply_manager') == true || AclService.hasRole('billty_manager') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/driver-rejections',
            templateUrl: '/views/report/driver-cancellation.html',
            controller: 'ReportController'
        })
        .state('view-customer-cancellation', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('account') == true || AclService.hasRole('city_head') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/view-customer-cancellation',
            templateUrl: '/views/adjustment/view_customer_cancellation.html',
            controller: 'AdjustmentController'
        })
        //Gunjan Close
        .state('driver-list-status', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/driver-list-status',
            templateUrl: '/views/report/driver-status.html',
            controller: 'DriverController'
        })

        .state('/allot-trip', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('employee_manager') == true || AclService.hasRole('employee') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/allot-trip/:bookingId',
            templateUrl: '/views/booking/allot-trip.html',
            controller: 'AddBookingController',
            reloadOnSearch: false
        })
        .state('live-trip-status', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('employee_manager') == true || AclService.hasRole('employee') == true) {
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/live-trip-status',
            templateUrl: '/views/booking/running-trip.html',
            controller: 'RunningTripStatusController',
            // reloadOnSearch: false
        })
        .state('add-driver', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/add-driver',
            templateUrl: '/views/driver/add-driver.html',
            controller: 'DriverController',
        })
        .state('/individual-driver-wallet', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/individual-driver-wallet',
            templateUrl: '/views/wallet/individual-driver-wallet.html',
            controller: 'WalletController'
        })
        .state('driver-route', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/driver-route',
            templateUrl: '/views/analytics/driver-route.html',
            controller: 'AnalyticsController'
        })
        .state('/individual-customer-wallet', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/individual-customer-wallet',
            templateUrl: '/views/wallet/individual-customer-wallet.html',
            controller: 'WalletController'
        })
        .state('onboarding-driver-list', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('supply_manager') == true || AclService.hasRole('account') == true || AclService.hasRole('billty_manager') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/onboarding-driver-list',
            templateUrl: '/views/driverOnBoarding/driver-details-list.html',
            controller: 'DriverOnBoardingController'
        })
        .state('bank-list', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('supply_manager') == true || AclService.hasRole('account') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/bank-list',
            templateUrl: '/views/driverOnBoarding/bank-details-list.html',
            controller: 'DriverOnBoardingController'
        })
        .state('driver-details', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('supply_manager') == true || AclService.hasRole('account') == true || AclService.hasRole('billty_manager') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/driver-details',
            templateUrl: '/views/driverOnBoarding/view-driver-details.html',
            controller: 'DriverOnBoardingController'
        })
        .state('driver-details/mobileNo', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('supply_manager') == true || AclService.hasRole('account') == true || AclService.hasRole('billty_manager') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/driver-details/:mobileNo',
            templateUrl: '/views/driverOnBoarding/view-driver-details.html',
            controller: 'DriverOnBoardingController'
        })
        .state('driver-device-detials', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('supply_manager') == true || AclService.hasRole('account') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/driver-device-detials',
            templateUrl: '/views/developer/driver-details.html',
            controller: 'DeveloperController'
        })
        .state('customer-favorite-location', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('supply_manager') == true || AclService.hasRole('account') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/customer-favorite-location',
            templateUrl: '/views/favorite/favorite-location.html',
            controller: 'SpecialController'
        })
        .state('driver-termination', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('supply_manager') == true || AclService.hasRole('account') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/driver-termination',
            templateUrl: '/views/driver/driver-termination.html',
            controller: 'DriverController'
        })
        .state('termination-report', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('supply_manager') == true || AclService.hasRole('account') == true || AclService.hasRole('billty_manager') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/termination-report',
            templateUrl: '/views/driver/termination-report.html',
            controller: 'DriverController'
        })
        .state('referral', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('sales_manager') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/referral',
            templateUrl: '/views/referral/referral.html',
            controller: 'ReferralController'
        })
        .state('referral-report', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('sales_manager') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/referral-report',
            templateUrl: '/views/referral/referral-report.html',
            controller: 'ReferralController'
        })
        .state('add-issue', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('supply_manager')) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/add-issue',
            templateUrl: '/views/driverComplaint/add-complaint-type.html',
            controller: 'driverComplaintController'
        })
        .state('add-sub-issue', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('supply_manager')) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/add-sub-issue',
            templateUrl: '/views/driverComplaint/add-sub-complaint-type.html',
            controller: 'driverComplaintController'
        })
        .state('driverList-complaint-type', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('supply_manager') || AclService.hasRole('sales_executive')) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/driverList-complaint-type',
            templateUrl: '/views/driverComplaint/list-complaint-type.html',
            controller: 'driverComplaintController'
        })
        .state('view-complaint-type', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('supply_manager')) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/view-complaint-type',
            templateUrl: '/views/driverComplaint/list-sub-complain-type.html',
            controller: 'driverComplaintController'
        })
        .state('edit-issue', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('supply_manager')) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/edit-issue/:complaintTypeId',
            templateUrl: '/views/driverComplaint/edit-complaint-type.html',
            controller: 'driverComplaintController'
        })
        .state('edit-sub-issue', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('supply_manager')) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/edit-sub-issue/:subComplaintTypeId',
            templateUrl: '/views/driverComplaint/edit-sub-complaint-type.html',
            controller: 'driverComplaintController'
        })
        .state('driver-resolved-complaint', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('callcenter_driver_manager') == true || AclService.hasRole('admin') == true || AclService.hasRole('supply_manager')) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/driver-resolved-complaint',
            templateUrl: '/views/driverComplaint/resolved-complaint.html',
            controller: 'driverComplaintController'
        })
        .state('add-complaint-type', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/add-complaint-type',
            templateUrl: '/views/complaint/add-complaint-type.html',
            controller: 'complaintController'
        })
        .state('add-sub-complain-type', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/add-sub-complain-type',
            templateUrl: '/views/complaint/sub-complain.html',
            controller: 'complaintController'
        })
        .state('edit-sub-complaint', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('supply_manager')) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/edit-sub-complaint/:subComplaintTypeId',
            templateUrl: '/views/complaint/edit-sub-complaint-type.html',
            controller: 'complaintController'
        })

        .state('list-complaint-type', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('supply_manager')) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/list-complaint-type',
            templateUrl: '/views/complaint/list-complaint-type.html',
            controller: 'complaintController'
        })
        .state('pending-complaint', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('supply_manager') == true || AclService.hasRole('sales_manager') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/pending-complaint',
            templateUrl: '/views/complaint/pending-complaint.html',
            controller: 'complaintController'
        })
        .state('resolved-complaint', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('callcenter_driver_manager') == true || AclService.hasRole('admin') == true || AclService.hasRole('supply_manager') == true || AclService.hasRole('sales_manager') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/resolved-complaint',
            templateUrl: '/views/complaint/resolved-complaint.html',
            controller: 'complaintController'
        })
        .state('edit-complaint-type', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/edit-complaint-type/:complaintTypeId',
            templateUrl: '/views/complaint/edit-complaint-type.html',
            controller: 'complaintController'
        })
        .state('driver-complaint-report', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('supply_manager')) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/driver-complaint-report',
            templateUrl: '/views/driverComplaint/driver-complaint-report.html',
            controller: 'driverComplaintController'
        })
        .state('customer-complaint-report', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('supply_manager')) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/customer-complaint-report',
            templateUrl: '/views/complaint/customer-complaint-report.html',
            controller: 'complaintController'
        })
        .state('add-promotional-message', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('supply_manager') == true || AclService.hasRole('employee') == true || AclService.hasRole('billty_manager') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/add-promotional-message',
            templateUrl: '/views/promotion/add-promotional-message.html',
            controller: 'PromotionNotificationController'
        })
        .state('message-list', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/message-list',
            templateUrl: '/views/promotion/message-list.html',
            controller: 'PromotionNotificationController'
        })
        .state('add-notification-message', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('supply_manager') == true || AclService.hasRole('employee') == true || AclService.hasRole('billty_manager') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/add-notification-message',
            templateUrl: '/views/driverNotification/add-notification-message.html',
            controller: 'DriverNotificationController'
        })
        .state('notification-message-list', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('supply_manager') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/notification-message-list',
            templateUrl: '/views/driverNotification/notification-message-list.html',
            controller: 'DriverNotificationController'
        })
        .state('rejection-reason', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('sales_manager') == true || AclService.hasRole('city_head') == true || AclService.hasRole('sales_executive') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/rejection-reason',
            templateUrl: '/views/booking/rejection-reason.html',
            controller: 'RejectionController' //'ReportController'
        })
        .state('driver-history', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('driver_trainer') == true || AclService.hasRole('supply_manager') == true || AclService.hasRole('employee') == true || AclService.hasRole('billty_manager') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/driver-history',
            templateUrl: '/views/report/driver-history.html',
            controller: 'ReportController'
        })
        .state('driver-summary', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('driver_trainer') == true || AclService.hasRole('supply_manager') == true || AclService.hasRole('employee') == true || AclService.hasRole('billty_manager') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/driver-summary',
            templateUrl: '/views/report/driver-summary.html',
            controller: 'ReportController'
        })
        .state('driver-summary/mgCode', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('driver_trainer') == true || AclService.hasRole('supply_manager') == true || AclService.hasRole('employee') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/driver-summary/:mgCode',
            templateUrl: '/views/report/driver-summary.html',
            controller: 'ReportController'
        })
        .state('driver-app-info', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('driver_trainer') == true || AclService.hasRole('sales_manager') == true || AclService.hasRole('supply_manager') == true || AclService.hasRole('billty_manager') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/driver-app-info',
            templateUrl: '/views/report/driver-app-info.html',
            controller: 'ReportController'
        })
        .state('add-goods', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('supply_manager') == true || AclService.hasRole('account') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/add-goods',
            templateUrl: '/views/goods/add-goods.html',
            controller: 'GoodsController'
        })
        .state('edit-goods', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('supply_manager') == true || AclService.hasRole('account') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/edit-goods/:goodsId',
            templateUrl: '/views/goods/edit-goods.html',
            controller: 'GoodsController'
        })
        .state('goods-list', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('supply_manager') == true || AclService.hasRole('account') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/goods-list',
            templateUrl: '/views/goods/goods-list.html',
            controller: 'GoodsController'
        })
        .state('customer-ordering', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/customer-ordering',
            templateUrl: '/views/report/customer-ordering.html',
            controller: 'ReportController'
        })
        .state('trip-rating', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('supply_manager') == true || AclService.hasRole('billty_manager') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/trip-rating',
            templateUrl: '/views/report/trip-rating.html',
            controller: 'ReportController'
        })

        .state('driver-rejection', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('supply_manager') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/driver-rejection',
            templateUrl: '/views/report/driver-rejection.html',
            controller: 'ReportController'
        })
        .state('remarks-report', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('supply_manager')) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/remarks-report',
            templateUrl: '/views/complaint/remarks-report.html',
            controller: 'complaintController'
        })
        .state('add-booking-reason', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/add-booking-reason',
            templateUrl: '/views/booking-reason/add-booking-reason.html',
            controller: 'BookingReasonController'
        })
        .state('reasons-list', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/reasons-list',
            templateUrl: '/views/booking-reason/booking-reason-list.html',
            controller: 'BookingReasonController'
        })
        .state('edit-booking-reason', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('supply_manager') == true || AclService.hasRole('account') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/edit-booking-reason/:reasonId',
            templateUrl: '/views/booking-reason/edit-booking-reason.html',
            controller: 'BookingReasonController'
        })
        .state('earning-report', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('account') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/earning-report',
            templateUrl: '/views/report/earning-report.html',
            controller: 'ReportController'
        })
        .state('income-analysis', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('supply_manager') == true || AclService.hasRole('billty_manager') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/income-analysis',
            templateUrl: '/views/report/vehicle-driver.html',
            controller: 'ReportController'
        })
        .state('trip-rejection', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('supply_manager') == true || AclService.hasRole('billty_manager') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/trip-rejection',
            templateUrl: '/views/report/trip-rejection.html',
            controller: 'ReportController'
        })
        .state('driver-rating', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('supply_manager') == true || AclService.hasRole('account') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/driver-rating',
            templateUrl: '/views/report/driver-rating.html',
            controller: 'ReportController'
        })
        .state('driver-ratings', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('supply_manager') == true || AclService.hasRole('account') == true || AclService.hasRole('billty_manager') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/driver-ratings',
            templateUrl: '/views/report/driver-ratings.html',
            controller: 'ReportController'
        })
        .state('add-cancellation-reasons', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('supply_manager') == true || AclService.hasRole('employee') == true || AclService.hasRole('billty_manager') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/add-cancellation-reasons',
            templateUrl: '/views/cancelReason/add-cancellation-reasons.html',
            controller: 'CancellationReasonController'
        })
        .state('edit-cancellation-reasons', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('supply_manager') == true || AclService.hasRole('employee') == true || AclService.hasRole('billty_manager') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/edit-cancellation-reasons/:reasonId',
            templateUrl: '/views/cancelReason/edit-cancellation-reasons.html',
            controller: 'CancellationReasonController'
        })
        .state('cancellation-reasons-list', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/cancellation-reasons-list',
            templateUrl: '/views/cancelReason/cancellation-reasons-list.html',
            controller: 'CancellationReasonController'
        })
        .state('corporate-payments', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('account') == true || AclService.hasRole('supply_manager') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/corporate-payments',
            templateUrl: '/views/adjustment/corporate-payments.html',
            controller: 'AdjustmentController'
        })

        .state('allotment-setting', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('account') == true || AclService.hasRole('supply_manager') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/allotment-setting',
            templateUrl: '/views/settings/allotment-setting.html',
            controller: 'SettingController'
        })
        .state('area-surge-settings', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('city_head') == true || AclService.hasRole('account') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/area-surge-settings',
            templateUrl: '/views/settings/area-surge-settings.html',
            controller: 'SettingController'
        })
        .state('cash-back-settings', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('city_head') == true || AclService.hasRole('account') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/cash-back-settings',
            templateUrl: '/views/settings/cash-back-settings.html',
            controller: 'SettingController'
        })
        .state('automatic-setting', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true) {
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/automatic-setting',
            templateUrl: '/views/settings/automatic-setting.html',
            controller: 'SettingController'
        })

        .state('maalgaadi-settings', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('city_head') == true || AclService.hasRole('account') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/maalgaadi-settings',
            templateUrl: '/views/settings/maalgaadi-settings.html',
            controller: 'SettingController'
        })
        .state('prime-driver-settings', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('city_head') == true || AclService.hasRole('account') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/prime-driver-settings',
            templateUrl: '/views/settings/prime-driver-settings.html',
            controller: 'SettingController'
        })
        .state('driver-adjustment', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('super_admin') == true || AclService.hasRole('admin') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/driver-adjustment',
            templateUrl: '/views/adjustment/driver_adjustment.html',
            controller: 'AdjustmentController'
        })
        .state('cluster-booking', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('employee') == true || AclService.hasRole('city_head') == true || AclService.hasRole('account') == true || AclService.hasRole('employee_manager') == true || AclService.hasRole('sales_manager') == true || AclService.hasRole('city_head') == true || AclService.hasRole('sales_executive') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/cluster-booking',
            templateUrl: '/views/report/cluster_booking.html',
            controller: 'ReportController'
        })
        .state('customer-adjustment', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('employee') == true || AclService.hasRole('city_head') == true || AclService.hasRole('account') == true || AclService.hasRole('employee_manager') == true || AclService.hasRole('sales_manager') == true || AclService.hasRole('city_head') == true || AclService.hasRole('sales_executive') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/customer-adjustment',
            templateUrl: '/views/adjustment/customer-adjustment.html',
            controller: 'AdjustmentController'
        })
        .state('fixed-add-booking', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('employee_manager') == true || AclService.hasRole('employee') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/fixed-add-booking',
            templateUrl: '/views/booking/add-fixed-booking.html',
            controller: 'FixedBookingController'
        })
        .state('fixed-booking-list', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('employee_manager') == true || AclService.hasRole('employee') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/fixed-booking-list',
            templateUrl: '/views/booking/fixed-booking-list.html',
            controller: 'FixedBookingController'
        })
        .state('fixed-booking-edit', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('employee_manager') == true || AclService.hasRole('employee') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/fixed-booking-edit/:bookingId',
            templateUrl: '/views/booking/edit-fixed-booking.html',
            controller: 'FixedBookingController',
            reloadOnSearch: false
        })
        .state('customer-last-order', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('super_admin') == true || AclService.hasRole('admin') == true || AclService.hasRole('sales_manager') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/customer-last-order',
            templateUrl: '/views/report/customer-last-order.html',
            controller: 'ReportController'
        })
        .state('expired-booking', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('super_admin') == true || AclService.hasRole('admin') == true || AclService.hasRole('sales_manager') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/expired-booking',
            templateUrl: '/views/report/expired-booking.html',
            controller: 'ReportController'
        })
        .state('favourite-driver', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('super_admin') == true || AclService.hasRole('admin') == true || AclService.hasRole('sales_manager') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/favourite-driver',
            templateUrl: '/views/report/favourite-driver.html',
            controller: 'ReportController'
        })
        .state('average-rating', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('super_admin') == true || AclService.hasRole('admin') == true || AclService.hasRole('sales_manager') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/average-rating',
            templateUrl: '/views/report/average-rating.html',
            controller: 'ReportController'
        })
        .state('allotment-number', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true) {
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/allotment-number',
            templateUrl: '/views/report/allotment-number.html',
            controller: 'ReportController'
        })
        .state('sales-root', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('employee_manager') == true || AclService.hasRole('sales_manager') == true || AclService.hasRole('sales_executive') == true) {
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/sales-root',
            templateUrl: '/views/sales/sales-root.html',
            controller: 'SalesController'
        })
        .state('customer-driver-wallet', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('employee') == true || AclService.hasRole('account') == true || AclService.hasRole('sales_manager') == true || AclService.hasRole('city_head') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/customer-driver-wallet',
            templateUrl: '/views/report/customer-driver-wallet.html',
            controller: 'ReportController'
        })
        .state('logs', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/logs',
            templateUrl: '/views/account/logs.html',
            controller: 'LogsController'
        })
        .state('cancelled-booking', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/cancelled-booking',
            templateUrl: '/views/report/booking-cancelled.html',
            controller: 'ReportController'
        })
        .state('on-demand-cancelled-booking', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/on-demand-cancelled-booking',
            templateUrl: '/views/report/booking-cancelled.html',
            controller: 'ReportController'
        })
        .state('booking-cancellation', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/booking-cancellation',
            templateUrl: '/views/report/booking-cancellation.html',
            controller: 'ReportController'
        })
        .state('discount-coupon-details', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/discount-coupon-details',
            templateUrl: '/views/report/coupon-code.html',
            controller: 'ReportController'
        })
        .state('prime-driver', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('callcenter_driver_manager') == true || AclService.hasRole('admin') == true || AclService.hasRole('supply_manager') == true || AclService.hasRole('billty_manager') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/prime-driver',
            templateUrl: '/views/report/prime-driver.html',
            controller: 'ReportController'
        })
        .state('customer-driver-transaction', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/customer-driver-transaction',
            templateUrl: '/views/report/customer-driver-transaction.html',
            controller: 'ReportController'
        })
        .state('driver-login-on-booking', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('supply_manager') == true || AclService.hasRole('billty_manager') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/driver-login-on-booking',
            templateUrl: '/views/report/driver-login-on-booking.html',
            controller: 'ReportController'
        })
        .state('booking-cashback', {
            resolve: {
                'acl': ['$q', 'AclService', function($q, AclService) {
                    if (AclService.hasRole('admin') == true || AclService.hasRole('account') == true || AclService.hasRole('sales_manager') == true || AclService.hasRole('city_head') == true || AclService.hasRole('sales_executive') == true) {
                        // Has proper permissions
                        return true;
                    } else {
                        // Does not have permission
                        return $q.reject('Unauthorized');
                    }
                }]
            },
            url: '/booking-cashback',
            templateUrl: '/views/report/booking-cashback.html',
            controller: 'ReportController'
        })


    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
    });
});