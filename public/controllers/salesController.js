app.controller('SalesController', ['$scope', '$http', '$stateParams', 'SweetAlert','CommonService', function($scope, $http, $stateParams, SweetAlert, CommonService) {
    
    var firstPoint = '';
    var lastPoint = '';
    var tripRoute = 'test';
    initMap();
    $scope.getSales = function(){
        var getSalesExecutive = CommonService.getDetails('', 'getSalesExecutiveDetails');
        getSalesExecutive.then(function successCallback(response) {
            $scope.salesDetails = response;
            // var tripRoute = response.success.data;
            // console.log(response,'route');
            
            // initMap(tripRoute);
        }, function errorCallback(response) {});
    }

    $scope.getSalesExecutiveRoutes = function(data){

        // var data = {sales_employee_id: 1, date: '2017-10-13'}
        var getSalesExecutive = CommonService.getDetails(data, 'getSalesExecutiveRoutes');
        getSalesExecutive.then(function successCallback(response) {
            var tripRoute = response.success.data.trip_route;
            $scope.routeData = response.success.rootDetails;
            $scope.searchBy.root_id = response.success.root_id;
            // console.log(response,'route');
            $scope.tripRouteDistance = 0;
            if(angular.isDefined(response.success.data.distance)){
                $scope.tripRouteDistance = response.success.data.distance/1000;
            }
            initMap(tripRoute);
        }, function errorCallback(response) {});
    }

    $scope.changeEmployeeDetails = function(){
        $scope.routeData = '';
        $scope.searchBy.root_id = '';
    }

    function initMap(tripRoute) {

            var directionsService = new google.maps.DirectionsService;
            var directionsDisplay = new google.maps.DirectionsRenderer;
            if (tripRoute) {
                wayPointRoot = tripRoute;//[{"driver_status":"on-trip","booking_id":"102615","time":"1507970196246","lat":"22.7852641","lng":"75.9001462"},{"driver_status":"on-trip","booking_id":"102615","time":"1507970255666","lat":"22.785553","lng":"75.900367"},{"driver_status":"on-trip","booking_id":"102615","time":"1507970339526","lat":"22.78527","lng":"75.9005478"},{"driver_status":"on-trip","booking_id":"102615","time":"1507970401600","lat":"22.7849757","lng":"75.9013503"},{"driver_status":"on-trip","booking_id":"102615","time":"1507970469967","lat":"22.7843035","lng":"75.9030529"},{"driver_status":"on-trip","booking_id":"102615","time":"1507970540054","lat":"22.7843574","lng":"75.9051114"},{"driver_status":"on-trip","booking_id":"102615","time":"1507970612562","lat":"22.7814407","lng":"75.9047426"},{"driver_status":"on-trip","booking_id":"102615","time":"1507970682580","lat":"22.7777643","lng":"75.903533"},{"driver_status":"on-trip","booking_id":"102615","time":"1507970753057","lat":"22.774617","lng":"75.9026949"},{"driver_status":"on-trip","booking_id":"102615","time":"1507970822796","lat":"22.7715699","lng":"75.9021042"},{"driver_status":"on-trip","booking_id":"102615","time":"1507970890243","lat":"22.7709437","lng":"75.9052715"},{"driver_status":"on-trip","booking_id":"102615","time":"1507970956084","lat":"22.7718742","lng":"75.9057799"},{"driver_status":"on-trip","booking_id":"102615","time":"1507971042784","lat":"22.7725541","lng":"75.9057483"},{"driver_status":"on-trip","booking_id":"102615","time":"1507971090389","lat":"22.7731965","lng":"75.9057102"},{"driver_status":"on-trip","booking_id":"102615","time":"1507971090389","lat":"22.7731965","lng":"75.9057102"}];//tripRoute.routes;
                    if (wayPointRoot.length > 0) { 
                        
                        var map = new google.maps.Map(document.getElementById('map'), {
                            zoom: 6,
                            center: { lat: parseFloat(wayPointRoot[0]['lat']), lng: parseFloat(wayPointRoot[0]['lng']) }
                        });
                        
                        directionsDisplay.setMap(map);
                        calculateAndDisplayRoute(directionsService, directionsDisplay, wayPointRoot);
                    } else {
                       showgoogleMap();
                    }
            } else {
               showgoogleMap();
            }
        }

        function showgoogleMap() {
            var directionsService = new google.maps.DirectionsService;
            var directionsDisplay = new google.maps.DirectionsRenderer;
            var map = new google.maps.Map(document.getElementById('map'), {
                zoom: 10,
                center: { lat: 22.7219, lng: 75.8778 }
            });
            directionsDisplay.setMap(map);
        }

        function calculateAndDisplayRoute(directionsService, directionsDisplay, wayPointRoot) {
            var waypts = [];
            var checkboxArray = [];
            // var j = 0;
            for (var i = 0; i < wayPointRoot.length; i++) {
                if(wayPointRoot.length < 23){
                    waypts.push({
                        location: new google.maps.LatLng(wayPointRoot[i].lat, wayPointRoot[i].lng),
                        stopover: false
                    });
                }
                else
                {
                    if(i%3 != 0){
                        // console.log(wayPointRoot[i].lat, wayPointRoot[i].lng,'count');
                        waypts.push({
                            location: new google.maps.LatLng(wayPointRoot[i].lat, wayPointRoot[i].lng),
                            stopover: false
                        });
                    }
                   
                }
            }

            if (wayPointRoot.length > 0) {
                firstPoint = new google.maps.LatLng(wayPointRoot[0].lat, wayPointRoot[0].lng);
            }
            if (wayPointRoot.length > 1) {
                var lastLen = wayPointRoot.length - 1;
                lastPoint = new google.maps.LatLng(parseFloat(wayPointRoot[lastLen].lat), parseFloat(wayPointRoot[lastLen].lng));
            }
            directionsService.route({
                origin: firstPoint,
                destination: lastPoint,
                waypoints: waypts,
                optimizeWaypoints: true,
                travelMode: 'DRIVING'
            }, function(response, status) {
                if (status === 'OK') {
                    directionsDisplay.setDirections(response);
                    var route = response.routes[0];
                    var summaryPanel = document.getElementById('directions-panel');
                }
            });
        }
}]);
