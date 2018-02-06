app.controller('AnalyticsController', ['$scope', '$http', '$window','CommonService','$localStorage','$rootScope', function($scope, $http, $window, CommonService, $localStorage, $rootScope) {
    $scope.loginDriverDetials = [{ lat: 28.6445141, lng: 77.4257319 }, { lat: 19.1283718, lng: 72.9252746 }, { lat: 27.6445141, lng: 75.4257319 }, { lat: 20.1283718, lng: 73.9252746 }];
    
    $rootScope.changeMaalgaadiCity = function(){
        $scope.maalgaadi_city_id = $rootScope.default_city_id;
        $localStorage.defaultCityId = $rootScope.default_city_id;
    } 

    $scope.drawRouteMap = function() {
        var geocoder;
        var map;

        function initialize() {
            var map = new google.maps.Map(
                document.getElementById("route"), {
                    center: new google.maps.LatLng(22.7196, 75.8577),
                    zoom: 13,
                    mapTypeId: google.maps.MapTypeId.ROADMAP
                });
            var lat_lng = [
                new google.maps.LatLng(22.7196, 75.5577),
                new google.maps.LatLng(22.8196, 75.6577),
                new google.maps.LatLng(22.9196, 75.7577),
                new google.maps.LatLng(22.545, 75.8577),
                new google.maps.LatLng(22.87667, 75.9577),
                new google.maps.LatLng(22.86776, 75.0577)

            ];
            for (var t = 0;
                (t + 1) < lat_lng.length; t++) {
                //Intialize the Direction Service
                var service = new google.maps.DirectionsService();
                var directionsDisplay = new google.maps.DirectionsRenderer();

                var bounds = new google.maps.LatLngBounds();
                if ((t + 1) < lat_lng.length) {
                    var src = lat_lng[t];
                    var des = lat_lng[t + 1];
                    service.route({
                        origin: src,
                        destination: des,
                        travelMode: google.maps.DirectionsTravelMode.DRIVING
                    }, function(result, status) {
                        if (status == google.maps.DirectionsStatus.OK) {
                            // new path for the next result
                            var path = new google.maps.MVCArray();
                            //Set the Path Stroke Color
                            // new polyline for the next result
                            var poly = new google.maps.Polyline({
                                map: map,
                                strokeColor: '#4986E7'
                            });
                            poly.setPath(path);
                            for (var k = 0, len = result.routes[0].overview_path.length; k < len; k++) {
                                path.push(result.routes[0].overview_path[k]);
                                bounds.extend(result.routes[0].overview_path[k]);
                                map.fitBounds(bounds);
                            }
                        } else alert("Directions Service failed:" + status);
                    });
                }
            }
        }
        google.maps.event.addDomListener(window, "load", initialize);
    };

    $scope.drawRouteMap();

    $scope.getCutomerRevenue = function() {
        $http({
            method: 'GET',
            url: '/api/getCutomerRevenue'
        }).then(function successCallback(response) {
            google.charts.load('current', { 'packages': ['corechart'] });
            google.charts.setOnLoadCallback(drawChart);

            function drawChart() {
                var data = google.visualization.arrayToDataTable([
                    ['Date', 'Trip', 'Revenue'],
                    ['2004', 1000, 400],
                    ['2005', 1170, 460],
                    ['2006', 660, 1120],
                    ['2007', 1030, 540],
                    ['2008', 1000, 400],
                    ['2009', 1170, 460],
                    ['2010', 660, 1120],
                    ['2011', 1030, 540]
                ]);

                var options = {
                    title: 'Customer Revenue',
                    curveType: 'function',
                    legend: { position: 'bottom' }
                };

                var chart = new google.visualization.LineChart(document.getElementById('curve_chart'));
                chart.draw(data, options);
            };
        }, function errorCallback(response) {

        });
    };

    $scope.bookingGraph = function(data) {
        var getData = CommonService.getDetails(data,'bookingCountAnalytics');
        getData.then(function successCallback(response) {console.log(response);
            $window.bookingCountAnalytics = response;
            google.charts.load('current', {
                'packages': ['corechart']
            });
            google.charts.setOnLoadCallback(drawChart);

            function drawChart() {
                var header = ['Start Date', 'Booking', 'Trip Charge', 'Loading Charge', 'Unloading Charge', 'Drop Charge', 'Waiting Charge', 'Discount'];
                var dataArray = [];
                dataArray.push(header);
                for (var i = 0; i < $window.bookingCountAnalytics.length; i++) {
                    var temp = [$window.bookingCountAnalytics[i].date, $window.bookingCountAnalytics[i].booking, $window.bookingCountAnalytics[i].trip_charge, $window.bookingCountAnalytics[i].loading_charge, $window.bookingCountAnalytics[i].unloading_charge, $window.bookingCountAnalytics[i].drop_charge, $window.bookingCountAnalytics[i].waiting_charge, $window.bookingCountAnalytics[i].discount];
                    dataArray.push(temp);
                }
                if($window.bookingCountAnalytics.length == 0)
                {
                    var temp = [0,0,0,0,0,0,0,0];
                    dataArray.push(temp);
                }
                console.log(dataArray)
                var data = new google.visualization.arrayToDataTable(dataArray);


                var options = {
                    isStacked: true,
                    title: 'MaalGaadi Revenue Analytics',
                    vAxis: { title: 'Revenue' },
                    hAxis: { title: 'Days' },
                    seriesType: 'bars',
                    series: { 6: { type: 'line' } }
                };
                var chart = new google.visualization.ComboChart(document.getElementById('booking_chart'));
                setTimeout(function() {
                    chart.draw(data, options);
                }, 1000);

            }
        });
    };

    $scope.driverLoginGraph = function(data) {
        var getData = CommonService.getDetails(data,'driverLoginAnalytics');
        getData.then(function successCallback(response) {
           $window.driverLoginAnalytics = response;
            google.charts.load('current', {
                'packages': ['corechart']
            });
            google.charts.setOnLoadCallback(drawChart);

            function drawChart() {

                var data = new google.visualization.DataTable();
                data.addColumn('string', 'Start Date');
                data.addColumn('number', 'Drivers');

                for (var i = 0; i < $window.driverLoginAnalytics.length; i++) {
                    var temp = [$window.driverLoginAnalytics[i].date, $window.driverLoginAnalytics[i].driver];
                    data.addRow(temp);
                }

                var options = {
                    isStacked: true,
                    title: 'Daily Driver Login',
                    vAxis: { title: 'Driver' },
                    hAxis: { title: 'Days' },
                    seriesType: 'bars',
                };

                var chart = new google.visualization.ComboChart(document.getElementById('driver_chart'));

                chart.draw(data, options);
            }
        });
    };

    $scope.customerBookingGraph = function(data) {
        var getData = CommonService.getDetails(data,'bookingCustomerAnalytics');
        getData.then(function successCallback(response) {
            $window.customerAnalytics = response;
            google.charts.load('current', {
                'packages': ['corechart']
            });
            google.charts.setOnLoadCallback(drawChart);

            function drawChart() {

                var data = new google.visualization.DataTable();
                data.addColumn('string', 'Start Date');
                data.addColumn('number', 'Customer');

                for (var i = 0; i < $window.customerAnalytics.length; i++) {
                    var temp = [$window.customerAnalytics[i].date, $window.customerAnalytics[i].customer];
                    data.addRow(temp);
                }

                var options = {
                    isStacked: true,
                    title: 'Daily Customer Engagement',
                    vAxis: { title: 'Customer' },
                    hAxis: { title: 'Days' },
                    seriesType: 'bars',
                };
                var chart = new google.visualization.ComboChart(document.getElementById('customer_chart'));
                chart.draw(data, options);
            }
        });
    };

    $scope.getLoginHours = function(data) {

        var getData = CommonService.getDetails(data,'getDriverLoginHoursnew');
        getData.then(function successCallback(response) {
            $window.driverHoursAnalytics = response;
            google.charts.load('current', {
                'packages': ['corechart']
            });
            google.charts.setOnLoadCallback(drawChart);

            function drawChart() {

                var data = new google.visualization.DataTable();
                data.addColumn('string', 'Start Date');
                data.addColumn('number', 'Hours');

                for (var i = 0; i < $window.driverHoursAnalytics.length; i++) {
                    var temp = [$window.driverHoursAnalytics[i].date, $window.driverHoursAnalytics[i].hours];
                    data.addRow(temp);
                }

                var options = {
                    isStacked: true,
                    title: 'Daily Login Hours',
                    vAxis: { title: 'Hour' },
                    hAxis: { title: 'Days' },
                    seriesType: 'bars',
                };
                var chart = new google.visualization.ComboChart(document.getElementById('hours_chart'));
                chart.draw(data, options);
            }
        });
    };

    $scope.dailyTripAnalytics = function(data) {

        var getData = CommonService.getDetails(data,'dailyTripAnalytics');
        getData.then(function successCallback(response) {
            $window.dailyTripAnalytics = response;
            google.charts.load('current', {
                'packages': ['corechart']
            });
            google.charts.setOnLoadCallback(drawChart);

            function drawChart() {

                var data = new google.visualization.DataTable();
                data.addColumn('string', 'Start Date');
                data.addColumn('number', 'Trip');

                for (var i = 0; i < $window.dailyTripAnalytics.length; i++) {
                    var temp = [$window.dailyTripAnalytics[i].date, $window.dailyTripAnalytics[i].trip];
                    data.addRow(temp);
                }

                var options = {
                    isStacked: true,
                    title: 'Daily Trip Count',
                    vAxis: { title: 'Hour' },
                    hAxis: { title: 'Days' },
                    seriesType: 'bars',
                };
                var chart = new google.visualization.ComboChart(document.getElementById('trip_chart'));
                chart.draw(data, options);
            }
        });
    };

    $scope.getAnalyticsBookingGraphDetails = function(city){
        $scope.bookingAnalyticsGraph = true;
        $scope.bookingGraph(city);$scope.driverLoginGraph(city);$scope.customerBookingGraph(city);$scope.getLoginHours(city);$scope.dailyTripAnalytics(city);
    }

    $scope.searchMapData = function(user) {
        $scope.myDataSource2=[];
        
        if(angular.isUndefined($scope.maalgaadi_city_id)){
            return false;
        }
        user.city_id = $scope.maalgaadi_city_id;

        var data = {  start: user.start, end: user.end,city_id :user.city_id };console.log(data)
        $http({
            method: 'GET',
            url: '/api/getAvgEarning',
            params: user
        }).then(function successCallback(response) {
            console.log(response.data);
            $scope.myDataSource2 = response.data;
        });
    };
    $scope.getTripData = function(user) {
        $scope.myDataSource2=[];
        $http({
            method: 'GET',
            url: '/api/getAvgEarning',
            params: user
        }).then(function successCallback(response) {
            console.log(response.data);
            $scope.myDataSource2 =response.data;
        });
    };

    $scope.getTripData();


}]);
