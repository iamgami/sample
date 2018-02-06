app.controller('MapController', ['$scope', '$http', function($scope, $http) {
    console.log('sadasd');
    $scope.mapFlag = false;
    $scope.drwaMap = function() {
        $http({
            method: 'GET',
            url: '/api/drwaMap',
        }).then(function successCallback(response) {
            $scope.mapData = response.data;
            $scope.mapFlag = true;
        }, function errorCallback(response) {});
    };

    $scope.getLoginDriversDetials = function() {
        $http({
            method: 'GET',
            url: '/api/driver',
        }).then(function successCallback(response) {
            $scope.driverDropDown = response.data;
        }, function errorCallback(response) {});
    };
    $scope.getLoginDriversDetials();

    $scope.getDriverMapData = function() {
        var data = { driver_id: $scope.angmap.driver_id };
        console.log(data)
        $http({
            method: 'GET',
            url: '/api/getMapData',
            params: data
        }).then(function successCallback(response) {
            $scope.driverMapData = response.data;
                            var locations = $scope.driverMapData;
                            var map = new google.maps.Map(document.getElementById('map'), {
                                zoom: 10,
                                center: new google.maps.LatLng(22.7196, 75.8577),
                                mapTypeId: google.maps.MapTypeId.ROADMAP
                            });
                            var directionsService = new google.maps.DirectionsService();
                            var infowindow = new google.maps.InfoWindow();
                            var marker, i;
                            var markers = new Array();
                            $scope.previousLat = '';
                            $scope.previousLng = '';
                            var lineSymbol = {
                                path: google.maps.SymbolPath.CIRCLE,
                                scale: 8,
                                strokeColor: '#393'
                            };
                            angular.forEach($scope.driverMapData, function(value, key) {

                                var color = '#5cb85c';
                if(value['status'] == 'free')
                {
                    color = '#FF0000';
                    marker = new google.maps.Marker({
                        position: new google.maps.LatLng(value['lat'], value['lng']),
                        map: map
                    });    
                }
                else
                {
                    color = "#5cb85c";
                    marker = new google.maps.Marker({
                        position: new google.maps.LatLng(value['lat'], value['lng']),
                        map: map,
                        icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
                    });    
                }

                if($scope.previousLat == '' && $scope.previousLng == '')
                {
                    var line = new google.maps.Polyline({
                        path: [new google.maps.LatLng(value['lat'], value['lng']), new google.maps.LatLng(value['lat'], value['lng'])],
                        strokeColor: color,
                        strokeOpacity: 1.0,
                        strokeWeight: 3,
                        geodesic: true,
                        map: map
                    });
                    $scope.previousLat = value['lat'];
                    $scope.previousLng = value['lng'];
                    // animateCircle(line);
                }
                else
                {
                    var line = new google.maps.Polyline({
                        path: [new google.maps.LatLng($scope.previousLat, $scope.previousLng), new google.maps.LatLng(value['lat'], value['lng'])],
                        strokeColor: color,
                        strokeOpacity: 1.0,
                        strokeWeight: 3,
                        geodesic: true,
                        map: map
                    });

                    // animateCircle(line);
                    $scope.previousLat = value['lat'];
                    $scope.previousLng = value['lng'];
                }
                // animateCircle(line); 
                // Use the DOM setInterval() function to change the offset of the symbol
                // at fixed intervals.
                function animateCircle(line) 
                {
                    var count = 0;
                    window.setInterval(function() 
                    {
                        count = (count + 1) % 200;
                        var icons = line.get('icons');
                        icons[0].offset = (count / 2) + '%';
                        line.set('icons', icons);
                    }, 20);
                }

                markers.push(marker);
                google.maps.event.addListener(marker, 'click', (function(marker, i) {
                    return function() {
                        infowindow.setContent(locations[i][0]);
                        infowindow.open(map, marker);
                    }
                })(marker, i));
            });

            function calcRoute(startLat, startLng, endLat, endLng) 
            {
                console.log("Here");
                var start = new google.maps.LatLng(startLat, startLng);
                var end = new google.maps.LatLng(endLat, endLng);
                var bounds = new google.maps.LatLngBounds();
                bounds.extend(start);
                bounds.extend(end);
                map.fitBounds(bounds);
                var request = {
                    origin: start,
                    destination: end,
                    travelMode: google.maps.TravelMode.DRIVING
                };
                directionsService.route(request, function (response, status) {
                    if (status == google.maps.DirectionsStatus.OK) {
                        directionsDisplay.setDirections(response);
                        directionsDisplay.setMap(map);
                    } else {
                        alert("Directions Request from " + start.toUrlValue(6) + " to " + end.toUrlValue(6) + " failed: " + status);
                    }
                });
            }
            
            function AutoCenter() {
                //  Create a new viewpoint bound
                var bounds = new google.maps.LatLngBounds();
                //  Go through each...
                $.each(markers, function(index, marker) {
                    bounds.extend(marker.position);
                });
                //  Fit these bounds to the map
                map.fitBounds(bounds);
            }
            AutoCenter();
        }, function errorCallback(response) {

        });
    };

    $scope.getDriver = function() {
        $http({
            method: 'GET',
            url: '/api/driver'
        }).then(function successCallback(response) {
            $scope.driverDetials = response.data;
            // console.log($scope.driverDetials);
        }, function errorCallback(response) {

        });
    };

    $scope.drawRoutes = function() {
        var data = { driver_id: $scope.angmap.driver_id };
        $http({
            method: 'GET',
            url: '/api/getMapData',
            params: data
        }).then(function successCallback(response) {
            var markers = response.data;

            var mapOptions = {
                center: new google.maps.LatLng(markers[0].lat, markers[0].lng),
                zoom: 10,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            };
            var map = new google.maps.Map(document.getElementById("map"), mapOptions);
            var infoWindow = new google.maps.InfoWindow();
            var lat_lng = new Array();
            var latlngbounds = new google.maps.LatLngBounds();
            for (i = 0; i < markers.length; i++) {
                var data = markers[i]
                var myLatlng = new google.maps.LatLng(data.lat, data.lng);
                lat_lng.push(myLatlng);
                var marker = new google.maps.Marker({
                    position: myLatlng,
                    map: map
                });
                latlngbounds.extend(marker.position);
                (function(marker, data) {
                    google.maps.event.addListener(marker, "click", function(e) {
                        infoWindow.setContent(data.description);
                        infoWindow.open(map, marker);
                    });
                })(marker, data);
            }
            map.setCenter(latlngbounds.getCenter());
            map.fitBounds(latlngbounds);

            //***********ROUTING****************//

            //Initialize the Path Array
            var path = new google.maps.MVCArray();

            //Initialize the Direction Service
            var service = new google.maps.DirectionsService();

            //Set the Path Stroke Color
            var poly = new google.maps.Polyline({ map: map, strokeColor: '#4986E7' });

            //Loop and Draw Path Route between the Points on MAP
            for (var i = 0; i < lat_lng.length; i++) {
                if ((i + 1) < lat_lng.length) {
                    var src = lat_lng[i];
                    var des = lat_lng[i + 1];
                    path.push(src);
                    poly.setPath(path);
                    service.route({
                        origin: src,
                        destination: des,
                        travelMode: google.maps.DirectionsTravelMode.DRIVING
                    }, function(result, status) {
                        if (status == google.maps.DirectionsStatus.OK) {
                            for (var i = 0, len = result.routes[0].overview_path.length; i < len; i++) {
                                path.push(result.routes[0].overview_path[i]);
                            }
                        }
                    });
                }
            }
            }, function errorCallback(response) {

        });
    };
    
}]);
