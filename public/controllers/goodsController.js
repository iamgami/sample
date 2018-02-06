app.controller('GoodsController', ['$scope', '$http', 'SweetAlert', '$stateParams', function($scope, $http, SweetAlert, $stateParams) {
    
    $scope.getGoodsInformation = function(newPage, search) {
        getGoods(newPage, search);
    };

    function getGoods(pageNum, search = '') {
        $scope.goodListDetails = false;
        $scope.onSubmitGoodList = true;
        
        var data = {
            page: pageNum,
            type : $scope.type
        }
        $http({
            method: 'GET',
            url: '/api/goods',
            params:data
        }).then(function successCallback(response) {
            $scope.goodListDetails = true;
            $scope.onSubmitGoodList = false;
            $scope.goods = response.data.data;
            $scope.totalItems = response.data.total;
            $scope.currentPage = response.data.current_page;
            $scope.perPage = response.data.per_page;
            if (pageNum == 1) {
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

    $scope.exportGoodsDetails = function(search){
       
        window.location ='/api/goods?export=excel';
       
    }

    $scope.addGoods = function(goods) {
        var data = goods;
        $http({
            method: 'GET',
            url: '/api/addGoods',
            params: data
        }).then(function successCallback(response) {
            if (response.data.success) {
                swal({
                    title: 'Goods',
                    text: response.data.success.message,
                    showCancelButton: false,
                    closeOnConfirm: false,
                    imageUrl: "assets/images/ic_launcher.png"
                }, function() {
                    location.href = '/goods-list';
                });
            } else {
                swal({
                    title: 'Goods',
                    text: response.data.error.message,
                    showCancelButton: false,
                    closeOnConfirm: false,
                    imageUrl: "assets/images/ic_launcher.png"
                }, function() {
                    location.href = '/goods-list';
                });
            }
        }, function errorCallback(response) {});

    };

    $scope.editGoods = function(goods) {
        var data = goods;
        $http({
            method: 'GET',
            url: '/api/editGoods/' + $stateParams.goodsId,
            params: data
        }).then(function successCallback(response) {
            if (response.data.success) {
                swal({
                    title: 'Goods',
                    text: response.data.success.message,
                    showCancelButton: false,
                    closeOnConfirm: false,
                    imageUrl: "assets/images/ic_launcher.png"
                }, function() {
                    location.href = '/goods-list';
                });
            } else {
                swal({
                    title: 'Goods',
                    text: response.data.error.message,
                    showCancelButton: false,
                    closeOnConfirm: false,
                    imageUrl: "assets/images/ic_launcher.png"
                }, function() {
                    location.href = '/goods-list';
                });
            }
        }, function errorCallback(response) {});
    };

    $scope.getGoodsDetails = function() {
        $http({
            method: 'GET',
            url: '/api/getGoodsDetails/' + $stateParams.goodsId,
        }).then(function successCallback(response) {
            $scope.goods = response.data;
        }, function errorCallback(response) {});
    };

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
}]);
