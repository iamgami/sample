app.controller('UserController', ['$scope', '$http', 'SweetAlert', 'UserService','$rootScope', '$localStorage', function($scope, $http, SweetAlert, UserService, $rootScope, $localStorage) {
    $scope.user = {};
    $scope.itemsPerPage = 10;
    $scope.currentPage = 0;
    $scope.pagination = {};
    $scope.totalItems = 0;

    $rootScope.changeMaalgaadiCity = function(){
        $scope.maalgaadi_city_id = $rootScope.default_city_id;
        $localStorage.defaultCityId = $rootScope.default_city_id;
    }
    $scope.setNumberDetials = function() {
        $scope.itemsPerPage = $scope.number;
    };
    $scope.range = function() {
        var rangeSize = 5;
        var ret = [];
        var start;

        start = $scope.currentPage;
        if (start > $scope.pageCount() - rangeSize) {
            start = $scope.pageCount() - rangeSize + 1;
        }

        for (var i = start; i < start + rangeSize; i++) {
            ret.push(i);
        }
        return ret;
    };

    $scope.prevPage = function() {
        if ($scope.currentPage > 0) {
            $scope.currentPage--;
        }
    };

    $scope.prevPageDisabled = function() {
        return $scope.currentPage === 0 ? "disabled" : "";
    };

    $scope.pageCount = function() {
        return Math.ceil($scope.usersLength / $scope.itemsPerPage) - 1;
    };

    $scope.nextPage = function() {
        if ($scope.currentPage < $scope.pageCount()) {
            $scope.currentPage++;
        }
    };

    $scope.nextPageDisabled = function() {
        return $scope.currentPage === $scope.pageCount() ? "disabled" : "";
    };

    $scope.setPage = function(n) {
        $scope.currentPage = n;
    };

    $scope.isConfirm = false;

    $scope.compare = function(repass) {
        $scope.isconfirm = $scope.user.password == repass ? true : false;
    }

    $scope.getUserDetialsPageChange = function(newPage, search) {

        getUserDetials(newPage, search);
    }

    function getUserDetials(pageNumber, search = ''){ 
        if(angular.isUndefined($scope.maalgaadi_city_id)){
            return false;
        }
        if(search == ''){
            search = {}
        }
        search.city_id = $scope.maalgaadi_city_id;
        $scope.onSubmitLoader = true;
        $scope.onSubmitResult = false;
        var data = {city_id : search.city_id, page : pageNumber, entries : search.entries,email: search.email,phone: search.phone,name:search.name,username: search.username};
        var customerDetails = UserService.getUserDetials(data);
        customerDetails.then(function(response) {
            $scope.onSubmitLoader = false;
            $scope.onSubmitResult = true;
            $scope.users = response.data;
            $scope.totalItems = response.total;
            $scope.currentPage = response.current_page;
            $scope.perPage = response.per_page;
            $scope.mypage = response.current_page;
            if ($scope.mypage == 0) {
                $scope.perpg = response.total;
            } else {

                $scope.perpg = response.per_page;
            }
            if (pageNumber == 1) {
                setTimeout(function() {
                    $scope.currentPage = 1;
                    var previousActive = $('dir-pagination-controls ul li.active').find('a').text();
                    if (Number(previousActive) > 1) {
                        $('dir-pagination-controls ul li:nth-child(2)').find('a').click();
                    }
                }, 400);

            }
        });
    };


    $scope.addUser = function(user) {
        user.city_permission = user.city_permission.toString();       
        if (user.password != user.repassword) {
            alert("password and confirm Password is not match")
            return false;
        }
        UserService.addUser(user);
    };

    $scope.editUser = function(user) {
        user.city_permission = user.city_permission.toString();       
        var customerDetails = UserService.editUser(user);
        customerDetails.then(function(response) {
            $('#myModal').modal('hide');
        });
    };

    $scope.editable = function(user) {
        $scope.user = user;
        $scope.user.id = user.id;console.log(user.city_permission);
        var strings = user.city_permission.split(',');
        var arr = [];
        for (var i=0; i<strings.length; i++)
            arr.push( + strings[i] );
        $scope.user.city_permission = arr;
    };

    $scope.errorFlag = false;
    $scope.userVerification = function(otp) {
        var data = { phone: otp, name: $scope.name };
        UserService.userVerification(data);

    };

    $scope.optVerification = function(otp) {
        var data = { otp: otp };
        UserService.optVerification(data);
    };

    $scope.emailAlready = false;
    $scope.checkEmail = function() {
        var data = { email: $scope.user.email };
        var check = UserService.checkEmail(data);
        check.then(function(response) {
            if (response.data.success) {
                $scope.emailAlready = true;
            } else {
                $scope.emailAlready = false;
            }
        });
    };

    $scope.phoneAlready = false;
    $scope.checkPhone = function() {
        var data = { phone: $scope.user.phone };
        var check = UserService.checkPhone(data);
        check.then(function(response) {
            if (response.data.success) {
                $scope.phoneAlready = true;
            } else {
                $scope.phoneAlready = false;
            }
        });
    };

    $scope.deleteUser = function(id) {
        UserService.deleteUser(id);
    };

    $scope.updateUserProfile = function() {
        var profile = UserService.getUserProfile();
        profile.then(function(response) {
            $scope.user = response;
        });
    };

    $scope.updateMyProfile = function(user) {

        $scope.user.image = $scope.files[0];
        var fd = new FormData();
        fd.append('image', $scope.user.image);
        fd.append('name', user.name);
        fd.append('surname', user.surname);
        fd.append('phone', user.phone);
        fd.append('address', user.address);
        $http({
            method: 'POST',
            url: '/api/updateMyProfile',
            processData: false,
            transformRequest: angular.identity,
            data: fd,
            headers: {
                'Content-Type': undefined
            }
        }).success(function(data) {
            swal({
                title: "Success!",
                text: "Update Successfully!",
                type: "success",
                showCancelButton: false,
                closeOnConfirm: false
            }, function() {
                location.href = '/update-profile';
            });
        });

    };
    $scope.uploadedFile = function(element) {
        $scope.currentFile = element.files[0];
        var reader = new FileReader();

        reader.onload = function(event) {
            $scope.image_source = event.target.result
            $scope.$apply(function($scope) {
                $scope.files = element.files;
            });
        }
        reader.readAsDataURL(element.files[0]);
    };
    
    

}]);
