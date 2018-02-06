app.controller('CityController', ['$scope', '$http', '$rootScope', 'SweetAlert', 'CityService','$localStorage', function($scope, $http, $rootScope, SweetAlert, CityService, $localStorage) {
    $scope.city = {};

    $rootScope.changeMaalgaadiCity = function(){
        $scope.maalgaadi_city_id = $rootScope.default_city_id;
        $localStorage.defaultCityId = $rootScope.default_city_id;
    }

    $scope.getAllCity = function() {
        $http({
            method: 'GET',
            url: '/api/getAllCity'
        }).then(function successCallback(response) {
            $scope.cities = response.data;
        }, function errorCallback(response) {});
    }
    $scope.addCity = function(city) {
        var addCity = CityService.addCity(city);
        addCity.then(function successCallback(response) {
            if(response.data.success){
                SweetAlert.swal({
                    title: "Success",
                    text: "New City Add Successfully",
                    type: "success",
                    showCancelButton: false,
                    closeOnConfirm: true
                 }, function() {
                    window.location.href = '/cities';
                });
            } else {
                swal(response.data.error.message);
            }
        }, function errorCallback(response) {});
    };

    $scope.editCity = function(city) {
        var editCity = CityService.editCity(city);
        editCity.then(function successCallback(response) {
            if(response.data.success){
                SweetAlert.swal({
                    title: "Success",
                    text: "City Details Successfully Updated",
                    type: "success",
                    showCancelButton: false,
                    closeOnConfirm: true
                 }, function() {
                    window.location.href = '/cities';
                });
            } else {
                swal(response.data.error.message);
            }
        }, function errorCallback(response) {});
    };

    $scope.editable = function(city) {
        $scope.city = city;
        $scope.city.id = city.id;
        $scope.city.city_name = city.city+','+ city.state ;
        
    };

    $scope.deleteCity = function(id) {

        CityService.deleteCity(id);
    };

    $scope.options = {
        types: '(cities)',
        country: 'in'
        };
    $scope.singleCity = {};
    $scope.loadMap = function(cityId){
        if(angular.isUndefined(cityId)){
            cityId = $localStorage.defaultCityId;
        }
        var cityData = {id : cityId};
        $http({
            method: 'GET',
            url: '/api/getSingleCity',
            params: cityData
        }).then(function successCallback(response) {
            $scope.singleCity = response.data;
            
            setTimeout(function(){
                $http({
                method: 'GET',
                url: '/api/getCluster',
                params: cityData
                }).then(function successCallback(response) {
                    var clusterData = response.data;
                    
                    var mapOptions = {
                        zoom: 5,
                        center: new google.maps.LatLng(parseFloat($scope.singleCity.lat),parseFloat($scope.singleCity.lng)),
                        mapTypeId: google.maps.MapTypeId.ROADMAP
                    };
                    
                    var map = new google.maps.Map(document.getElementById('surgeMap'),  mapOptions);
                    var arr = new Array();
                    var polygons = [];
                    var bounds = new google.maps.LatLngBounds();
                        
                    for (var i = 0; i < clusterData.length; i++) {
                        arr = [];
                        
                        var coordinates = JSON.parse(clusterData[i].latlng);
                        for (var j=0; j < coordinates.length; j++) {
                          arr.push( new google.maps.LatLng(
                                parseFloat(coordinates[j].lat),
                                parseFloat(coordinates[j].lng)
                          ));
                            
                          bounds.extend(arr[arr.length-1])
                        }
                        var clusterNum = clusterData[i].cluster_number;
                        var clusterId = clusterData[i].id;
                        var contentString = '<div id="content">'+
                                                '<div id="siteNotice">'+
                                                '</div>'+
                                                '<h1 id="firstHeading" class="firstHeading">Cluster : '+clusterNum+'</h1>'+
                                                '<div id="bodyContent">'+
                                                '<button class"btn btn-danger removeCluster" onclick="removeCluster('+clusterId+')" type="button" clusterId="'+clusterId+'">Remove</button>'+
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

        }, function errorCallback(response) {});
    };


    $scope.addCluster = function(cluster) {
        var addCluster = CityService.addCluster(cluster);
        addCluster.then(function successCallback(response) {
            if(response.data.success){
                SweetAlert.swal({
                    title: "Success",
                    text: "New Cluster Add Successfully",
                    type: "success",
                    showCancelButton: false,
                    closeOnConfirm: true
                 }, function() {
                    window.location.href = '/add-cluster';
                });
            } else {
                swal(response.data.error.message);
            }
        }, function errorCallback(response) {});
    };

    $scope.getCluster = function() {
        $http({
            method: 'GET',
            url: '/api/getCluster'
        }).then(function successCallback(response) {
            $scope.cluster = response.data;
        }, function errorCallback(response) {});
    };

    $scope.removeCluster = function() {
        $http({
            method: 'GET',
            url: '/api/getCluster'
        }).then(function successCallback(response) {
            $scope.cluster = response.data;
        }, function errorCallback(response) {});
    }
  
}]);
