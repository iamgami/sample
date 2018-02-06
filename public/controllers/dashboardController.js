app.controller('DashboardController', ['$scope', '$http', '$window', 'DashboardService','$rootScope','$localStorage', function($scope, $http, $window, DashboardService, $rootScope, $localStorage) {
    $scope.showMap = false;
    $scope.statusCompleted = 0;
    $scope.statusRating = 0;
    $scope.statusBilling = 0;
    $scope.statusUnloading = 0;
    $scope.statusOntrip = 0;
    $scope.statusLoading = 0;
    $scope.statusToCustomer = 0;
    $scope.statusBooked = 0;
    $scope.statusUploadingPod = 0;
    $scope.statusFree = 0;
    $scope.statusInactive = 0;
    $scope.allemployee = {};
    $scope.statusActive = 0;

    $scope.getFreeDriversDetials = function() {
        var getFreeDriversDetials = DashboardService.getFreeDriversDetials();
        getFreeDriversDetials.then(function successCallback(response) {
            $scope.free_driver = response.data.length;
        }, function errorCallback(response) {});
    };
    $scope.getFreeDriversDetials();

    $scope.getemployeeDetials = function() {
        var getemployeeDetials = DashboardService.getemployeeDetials();
        getemployeeDetials.then(function successCallback(response) {
            $scope.allemployee = response.data;
        }, function errorCallback(response) {});
    };
    $scope.getemployeeDetials();

    $scope.getDriverStatus = function() {
        var getDriverStatus = DashboardService.getDriverStatus();
        getDriverStatus.then(function successCallback(response) {
            $scope.driver_status = response.data;
        }, function errorCallback(response) {});
    };
    $scope.getDriverStatus();

    $scope.getLoginDriversDetials = function() {
        $scope.maalgaadi_city_id = $rootScope.default_city_id;
        $localStorage.defaultCityId = $rootScope.default_city_id;
        var data = {city_id : $scope.maalgaadi_city_id};
        var getLoginDriversDetials = DashboardService.getLoginDriversDetials(data);
        getLoginDriversDetials.then(function successCallback(response) {
            $scope.loginDriverDetials = response.data;
        }, function errorCallback(response) {});
    };



    $scope.getLoginDriversMapDetials = function() {
        var getLoginDriversMapDetials = DashboardService.getLoginDriversMapDetials();
        getLoginDriversMapDetials.then(function successCallback(response) {
            $window.dashboardMapData = response.data.data;
            
            function initMap() {
                var citId  = $rootScope.default_city_id;
                var cityLat = 22.7196;
                var cityLng = 75.8577;
                if(citId == 2)
                {
                    var cityLat = 26.9124336;
                    var cityLng = 75.78727090000007;
                }
                var map = new google.maps.Map(document.getElementById('map'), {
                    zoom: 16,
                    center: {
                        lat: cityLat,
                        lng: cityLng
                    }
                });
                setMarkers(map);
            }
            setTimeout(initMap, 100);
            if (response.data.success === "true") {

                // initMap();
                var markers = new Array();
                var infowindow = new google.maps.InfoWindow();


                function setMarkers(map) {
                    var citId  = $rootScope.default_city_id;
                    var cityLat = 22.7196;
                    var cityLng = 75.8577;
                    if(citId == 2)
                    {
                        var cityLat = 26.9124336;
                        var cityLng = 75.78727090000007;
                    }
                    var image = {
                        size: new google.maps.Size(20, 32),
                        origin: new google.maps.Point(0, 0),
                        anchor: new google.maps.Point(0, 32)
                    };
                    var shape = {
                        coords: [1, 1, 1, 20, 18, 20, 18, 1],
                        type: 'poly'
                    };

                    var address = [];
                    var markers = new Array();
                    var bounds = new google.maps.LatLngBounds();
                    var map = new google.maps.Map(document.getElementById('map'), {
                        zoom: 14,
                        center: {
                            lat: cityLat,
                            lng: cityLng
                        }
                    });

                    var gm = google.maps;
                    var map = new gm.Map(document.getElementById('map'), {
                        center: new gm.LatLng(cityLat, cityLng),
                        zoom: 14
                    });

                    // var oms = new OverlappingMarkerSpiderfier(map);

                    var iw = new gm.InfoWindow();
                    // oms.addListener('click', function(marker, event) {});

                    for (var i = 0; i < window.dashboardMapData.length; i++) {

                        var datum = window.dashboardMapData[i];

                        var loc = new gm.LatLng(datum.lat, datum.lng);
                        var contentString = '<div id="content"><h4 style="color:black">Status : <span style="margin-left:30px; text-transform: capitalize;">' + window.dashboardMapData[i].status + '<span></h4><h4 style="color:black"><i class="fa fa-user" aria-hidden="true"></i> <span style="margin-left:10px; text-transform: capitalize;">' + window.dashboardMapData[i].driver_name + '</span></h4><p style="color:black"><i class="fa fa-phone" aria-hidden="true"></i> <span style="margin-left:10px; text-transform: capitalize;">' + window.dashboardMapData[i].driver_number + '</span><p style="color:black"><i class="fa fa-car" aria-hidden="true"></i> <span style="margin-left:10px; text-transform: capitalize;">' + window.dashboardMapData[i].vehicle + '<span><p style="color:black"><i class="fa fa-map-marker" aria-hidden="true"></i><span style="margin-left:10px; text-transform: capitalize;">' + window.dashboardMapData[i].mg + '</div>';
                        var infowindow = new google.maps.InfoWindow({
                            content: contentString
                        });
                        var marker = new google.maps.Marker({
                            position: {
                                lat: parseFloat(window.dashboardMapData[i].lat),
                                lng: parseFloat(window.dashboardMapData[i].lng)
                            },
                            map: map,
                            icon: window.dashboardMapData[i].image_url,
                            title: contentString
                        });
                        // oms.addMarker(marker);
                        google.maps.event.addListener(marker, 'click', function() {
                            infowindow.setContent(this.title);
                            infowindow.open(map, this);

                        });
                        bounds.extend(loc);
                    }

                    map.fitBounds(bounds);
                }
            };
        }, function errorCallback(response) {});
    };


    $scope.getLoginDriversMapDetials();
    $scope.getLoginDriversDetials();
    $scope.getLoginDriversMapDetials1 = function() {
        var getLoginDriversMapDetials1 = DashboardService.getLoginDriversMapDetials1();

        getLoginDriversMapDetials1.then(function successCallback(response) {
            $window.dashboardData = response.data;
            console.log(response.data);

            function initMap() {
                var map = new google.maps.Map(document.getElementById('map1'), {
                    zoom: 14,
                    center: {
                        lat: 22.7196,
                        lng: 75.8577
                    }
                });
                setMarkers(map);
            }
            setTimeout(initMap, 100);
            var markers = new Array();
            var infowindow = new google.maps.InfoWindow();

            function setMarkers(map) {
                var image = {
                    size: new google.maps.Size(20, 32),
                    origin: new google.maps.Point(0, 0),
                    anchor: new google.maps.Point(0, 32)
                };
                var shape = {
                    coords: [1, 1, 1, 20, 18, 20, 18, 1],
                    type: 'poly'
                };

                var address = [];
                var markers = new Array();
                var bounds = new google.maps.LatLngBounds();
                var map = new google.maps.Map(document.getElementById('map1'), {
                    zoom: 14,
                    center: {
                        lat: 22.7196,
                        lng: 75.8577
                    }
                });



                var gm = google.maps;
                var map = new gm.Map(document.getElementById('map1'), {
                    center: new gm.LatLng(22.7196, 75.8577),
                    zoom: 14
                });


                var oms = new OverlappingMarkerSpiderfier(map);

                var iw = new gm.InfoWindow();
                var loc = [];
                oms.addListener('click', function(marker, event) {});
                heatmapData = [];
                for (var i = 0; i < window.dashboardData.length; i++) {
                    var datum = window.dashboardData[i];
                    loc.push(new gm.LatLng(datum.lat, datum.lng));
                    var heatMapLocation = {}
                    heatMapLocation.location = new gm.LatLng(datum.lat, datum.lng);
                    heatMapLocation.weight = datum.driver_count;
                    heatmapData.push(heatMapLocation);
                }

                var heatmap = new google.maps.visualization.HeatmapLayer({
                    data: heatmapData,
                    maxIntensity: 10,
                    radius: 30,
                    opacity: 0.4,
                    map: map
                });
                heatmap.setMap(map);

                var map1 = new gm.Map(document.getElementById('map2'), {
                    center: new gm.LatLng(22.7196, 75.8577),
                    zoom: 14
                });

                var oms = new OverlappingMarkerSpiderfier(map1);

                var iw = new gm.InfoWindow();

                for (var i = 0; i < window.dashboardData.length; i++) {
                    var datum = window.dashboardData[i];
                    var loc = new gm.LatLng(datum.lat, datum.lng);
                    var marker = new google.maps.Marker({
                        position: {
                            lat: parseFloat(window.dashboardData[i].lat),
                            lng: parseFloat(window.dashboardData[i].lng)
                        },
                        map: map1,
                        title: "Station : <span style='font-weight:bold'>" + window.dashboardData[i].station_name + "</span><br>Driver Count : <span style='font-weight:bold'>" + window.dashboardData[i].driver_count + "</span> <br>Address : <span style='font-weight:bold'>" + window.dashboardData[i].address + "</span>"
                    });
                    oms.addMarker(marker);

                    google.maps.event.addListener(marker, 'click', function() {
                        infowindow.setContent(this.title);
                        infowindow.open(map1, this);
                    });
                    bounds.extend(loc);

                }
                map.fitBounds(bounds);

            }
        }, function errorCallback(response) {});
    };

    $scope.loadMap = function(cityId){

        var cityData = {id : cityId};
        $http({
            method: 'GET',
            url: '/api/getSingleCity',
            params: cityData
        }).then(function successCallback(response) {
            $scope.singleCity = response.data;
            console.log($scope.singleCity);
        }, function errorCallback(response) {});
        
        setTimeout(function(){
            $http({
            method: 'GET',
            url: '/api/getClusterData',
            params: cityData
            }).then(function successCallback(response) {
                var clusterData = response.data;
                
                var mapOptions = {
                    zoom: 5,
                    center: new google.maps.LatLng(parseFloat($scope.singleCity.lat),parseFloat($scope.singleCity.lng)),
                    mapTypeId: google.maps.MapTypeId.ROADMAP
                };

                var map = new google.maps.Map(document.getElementById('map'),  mapOptions);
                var arr = new Array();
                var polygons = [];
                var bounds = new google.maps.LatLngBounds();
                    
                for (var i = 0; i < clusterData.length; i++) {
                    arr = [];
                    
                    var coordinates = JSON.parse(clusterData[i].latlng);
                    for (var j=0; j < coordinates.length; j++) {
                        console.log(coordinates[i].lat);
                      arr.push( new google.maps.LatLng(
                            parseFloat(coordinates[j].lat),
                            parseFloat(coordinates[j].lng)
                      ));
                        
                      bounds.extend(arr[arr.length-1])
                    }
                    var clusterNum = clusterData[i].cluster_number;
                    var clusterId = clusterData[i].id;
                    var bookingCount = clusterData[i].id;
                    var contentString = '<div id="content">'+
                                            '<div id="siteNotice">'+
                                            '</div>'+
                                            '<h1 id="firstHeading" class="firstHeading">Cluster : '+clusterNum+'</h1>'+
                                            '<div id="bodyContent">'+
                                            '<p>Pending Booking : '+bookingCount+'</p>'+
                                            '</div>'+
                                            '</div>';
                    polygons.push(new google.maps.Polygon({
                        paths: arr,
                        strokeColor: '#FF0000',
                        strokeOpacity: 0.8,
                        strokeWeight: 2,
                        fillColor: '#FF0000',
                        fillOpacity: 0.35,
                        content: contentString
                    }));
                    
                    polygons[polygons.length-1].setMap(map);
                    polygons[polygons.length-1].addListener('click', showArrays);
                }
              
              var drawingManager = new google.maps.drawing.DrawingManager({
              drawingControl: true,
              drawingControlOptions: {
                position: google.maps.ControlPosition.TOP_CENTER,
                drawingModes: [ 'polygon']
              },
              circleOptions: {
                fillColor: '#ffff00',
                fillOpacity: 1,
                strokeWeight: 5,
                clickable: true,
                editable: true,
                zIndex: 1
              }
            });
            drawingManager.setMap(map);
            
            infoWindow = new google.maps.InfoWindow;

            function showArrays(event) {
                var vertices = this.getPath();
                infoWindow.setContent(this.content);
                infoWindow.setPosition(event.latLng);
                infoWindow.open(map);
            }
                var dataL = [];
                google.maps.event.addListener(drawingManager, 'polygoncomplete', function (polygon) {
                    var coordinates = (polygon.getPath().getArray());
                    for (var i = 0; i < coordinates.length; i++) {
                      lat = coordinates[i].lat();
                      lng = coordinates[i].lng();
                      dataL[i] = {lat: lat,lng : lng};
                    }
                    $scope.cluster.latlng = JSON.stringify(dataL);
                });
              map.fitBounds(bounds);
            }, function errorCallback(response) {}); 
        }, 300);
    };

    $scope.changeMaalgaadiCity = function() {
        alert();
        var data = {city_id : $scope.default_city_id};

        
    };

    $rootScope.changeMaalgaadiCity = function(){
        $scope.maalgaadi_city_id = $rootScope.default_city_id;
        $localStorage.defaultCityId = $rootScope.default_city_id;
        var data = {city_id : $scope.maalgaadi_city_id};
        $scope.getLoginDriversMapDetials();
        var getLoginDriversDetials = DashboardService.getLoginDriversDetials(data);
        getLoginDriversDetials.then(function successCallback(response) {
            $scope.loginDriverDetials = response.data;
        }, function errorCallback(response) {});
    } 
}]);
