app.controller('LogsController', ['$scope', '$http', '$rootScope', 'SweetAlert', '$location', '$stateParams', 'PromiseUtils','CommonService', function($scope, $http, $rootScope, SweetAlert, $location, $stateParams, PromiseUtils, CommonService) {
	//console.log('hi');

	$scope.category = {};

    $scope.itemsPerPage = 10;
    $scope.currentPage = 0;
    $scope.showTableFlag = false;
    $scope.surge = {};
    $scope.date = {};
    $scope.days = {};
    $scope.waitingRange = {};

    $scope.setting = {};
    $scope.vehicleGoods = {};
    $scope.vehicleGoods.types ={};
    $scope.all=false;
    

	$scope.checkAll = function() {
        var data={ischeck:$scope.all}
         $http({
            method: 'GET',
            url: '/api/goodListing',
            params:data
        }).then(function successCallback(response) {
            $scope.goods  = response.data;
            var ln= $scope.goods.length;
            for(var i=0; i<ln;i++){
                var j=$scope.goods[i].id;
                var selected=$scope.goods[i].selected;
                var ret=false;
                if(selected==1){
                    ret = true;
                }
                $scope.vehicleGoods.types[j]=ret;
            }
        }, function errorCallback(response) {});

    };
    


    $scope.previous_data ={};

    $scope.preLogs = function(logs) {
        
        var data = {
            item_name: $scope.logs.item_name,
            date : $scope.logs.date
        };

        var logs = CommonService.test(data, 'viewlogs');

        logs.then(function successCallback(response) {
            console.log(response,"data");
            $scope.previous_data = response.data.previous_data;
            $scope.select_option = response.data.select_option;
            $scope.data_count = response.data.data_count;
          
        }, function errorCallback(response) {});
    }

}]);