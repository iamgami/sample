app.controller('complaintController', ['$scope', '$http', 'SweetAlert', 'ComplaintService','CommonService','$rootScope','$localStorage', function($scope, $http, SweetAlert, ComplaintService, CommonService, $rootScope, $localStorage) {
    $scope.showLoader = false;
    $scope.showTableFlag = false;
    $scope.message = false;
    $scope.complaintType = {};
    $scope.allRemarks = {};
    $scope.pagination = {};
    $scope.totalItems = 0;

    $rootScope.changeMaalgaadiCity = function(){
        $scope.maalgaadi_city_id = $rootScope.default_city_id;
        $localStorage.defaultCityId = $rootScope.default_city_id;
    }

    $scope.addFeedback = function(driver_id, booking_id) {
        var remark = { key: booking_id };
        var data = { booking_id: booking_id };
        $scope.remark = remark;
        $http({
            method: 'POST',
            url: '/api/getBookingRemark',
            params: data
        }).then(function successCallback(response) {
            console.log(response.data);
            $scope.allRemarks = response.data.success.data;

        }, function errorCallback(response) {});

    };
    $scope.addcomplaintType = function(complaint) {
        var details = CommonService.saveAndUpdateDetails(complaint,'addcomplaintType');
        details.then(function(response) {
            if(angular.isDefined(response.success)){
                SweetAlert.swal({
                    title: "Success",
                    text: "Complaint Type Added Successfully",
                    type: "success",
                    imageUrl: "assets/images/ic_launcher.png",
                    showCancelButton: false,
                    closeOnConfirm: false
                }, function() {
                    location.href = '/list-complaint-type';
                });
            }
        });
        
    };
    $scope.addSubComplaintType = function(complaint) {
        var details = CommonService.saveAndUpdateDetails(complaint,'addSubComplaintType');
        details.then(function(response) {
            if(angular.isDefined(response.success)){
                SweetAlert.swal({
                    title: "Success",
                    text: "Complaint Type Added Successfully",
                    type: "success",
                    imageUrl: "assets/images/ic_launcher.png",
                    showCancelButton: false,
                    closeOnConfirm: false
                }, function() {
                    location.href = '/list-complaint-type';
                });
            }
        });
    };
    $scope.getNumberLength = function(num) {
        return new Array(num);
    }
    $scope.mainIssueSelected = function(complainId, priority) {
        setTimeout(function() {
            if (priority == 0) {
                priority = '';
            }
            $('select[name=mainIssuesOrder' + complainId + ']').val(priority);
        }, 200);
    }
    $scope.driverMainIssuesSelect = function(data) {
        var selectName = 'mainIssuesOrder' + data;
        var selectVal = $('select[name=' + selectName + ']').val();
        var length = 0;
        if (selectVal) {
            length = $('.mainIssues option[value=' + selectVal + ']:selected').length;
        }
        if (length > 1) {
            alert('This order is already selected');
            $('select[name=' + selectName + ']').val('');
        }
    }

    $scope.subIssueSelected = function(complainId, priority) {
        console.log('calling');
        setTimeout(function() {
            if (priority == 0) {
                priority = '';
            }
            $('select[name=subIssuesOrder__' + complainId + ']').val(priority);
        }, 200);
    }


    $scope.driverSubIssuesSelected = function(obj) {
        var complaintId = $(obj).attr('complaintId');
        var subIssuesId = $(obj).attr('subIssueId');
        var selectName = 'subIssuesOrder__' + subIssuesId;
        var selectVal = $('select[name=' + selectName + ']').val();
        var length = 0;
        if (selectVal) {
            length = $('.subIssues_' + complaintId + ' option[value=' + selectVal + ']:selected').length;
        }
        if (length > 1) {
            //alert('This order is already selected');
            $('select[name=' + selectName + ']').val('');
        }
    };

    $scope.complainOrderSet = function(data) {
        var mainIssues = '';
        var subIssues = '';
        angular.forEach(data, function(value, key) {
            issueId = value.id;
            var value = $('select[name=mainIssuesOrder' + issueId + ']').val();
            if (mainIssues != '') {
                mainIssues = mainIssues + '---';
            }
            mainIssues = mainIssues + issueId + '__' + value;
        });

        $('select[name^=subIssuesOrder__]').each(function() {
            var subIsseusName = $(this).attr('name');
            var subIsseusVal = $(this).val();
            subIsseusName = subIsseusName.split('__');
            if (subIssues != '') {
                subIssues = subIssues + '---';
            }
            subIssues = subIssues + subIsseusName[1] + '__' + subIsseusVal;
        });
        var issues = { 'mainIssues': mainIssues, 'subIssues': subIssues };
        var searchComplaintsDetails = ComplaintService.mainIssuesOrderSetting(issues);
        var searchComplaintsDetails = ComplaintService.mainIssuesOrderSetting(issues);
        searchComplaintsDetails.then(function(response) {
            swal('Order Successfully Save');
            //location.href = '/list-complaint-type';

        }, function(reason) {
            alert("Something went wrong");
        });
    }
    $scope.getcomplaintType = function() {
        mainIssuesSelectBoxDisable();
        var getcomplaintTypeDetails = CommonService.getDetails('','getCustomerComplaint');
        getcomplaintTypeDetails.then(function(response) {
            console.log(response);
            if(angular.isDefined(response.success)){
                $scope.complaintType = response.success.data;
            }
        });

    };

    function mainIssuesSelectBoxDisable() {
        setTimeout(function() {
            $('select[name*="mainIssuesOrder"]').change(function() {
                $('select[name*="mainIssuesOrder"] option').attr('disabled', false).css('font-weight', 'bold');
                $('select[name*="mainIssuesOrder"]').each(function() {
                    var $this = $(this);
                    $('select[name*="mainIssuesOrder"]').not($this).find('option').each(function() {
                        if ($(this).attr('value') == $this.val() && $this.val())
                            $(this).attr('disabled', true).css('font-weight', '100');
                    });
                });
            });
        }, 1000);

        setTimeout(function() {
            $('select[name*="mainIssuesOrder"] option').attr('disabled', false).css('font-weight', 'bold');
            $('select[name*="mainIssuesOrder"]').each(function() {
                var $this = $(this);
                $('select[name*="mainIssuesOrder"]').not($this).find('option').each(function() {
                    if ($(this).attr('value') == $this.val() && $this.val())
                        $(this).attr('disabled', true).css('font-weight', '100');
                });
            });
        }, 1000);
    }
    $scope.removeComplaintType = function(complaintTypeId, priority) {
        SweetAlert.swal({
            title: "Confirm",
            text: "Do you want to remove this complaintt type!",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            imageUrl: "assets/images/ic_launcher.png"
        }, function(isConfirm) {
            if (isConfirm) {
                ComplaintService.removeComplaintType(complaintTypeId, priority);
            }
        });
    };

    $scope.editcomplaintType = function() {
        var complaintDetails = ComplaintService.editcomplaintType();
        complaintDetails.then(function(response) {
            $scope.complaint = response;
        });

    };

    $scope.updateComplaintType = function(complaint) {
        ComplaintService.updateComplaintType(complaint);
    };

    $scope.getcomplaintsPageChange = function(newPage, search) {
        getcomplaints(newPage, 1);
    }

    function getcomplaints (pageNumber, search = '') {
        $scope.message = false;
        $scope.showLoader = true;
        if(search == ''){
            search = {}
        }
        if(angular.isUndefined($scope.maalgaadi_city_id)){
            return false;
        }
        // search.city_id = $scope.maalgaadi_city_id;
        var data = {city_id : $scope.maalgaadi_city_id, page : pageNumber, entries : search.entries};
        var getcomplaintsDetails = ComplaintService.getcomplaints(data);console.log(data)
        getcomplaintsDetails.then(function(response) {

            $scope.showLoader = false;
            $scope.message = '';
            $scope.complaints = response;
            $scope.totalItems = response.total;
            $scope.currentPage = response.current_page;
            $scope.perPage = response.per_page;
            $scope.mypage = response.current_page;
            $scope.viewdrivercashnewpaid = response.data;
            // var table = $('#booking-list-table').DataTable();
            // table.destroy();
            $('#booking-list-table').DataTable().clear();
            $('#booking-list-table').DataTable().destroy();
            setTimeout(function() {
                $('#booking-list-table').DataTable( {
                    "scrollX": true
                });
            }, 200);
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

    $scope.getcomplaints = function(status, searchBy = '', pagenum = '1', requestType = '') {
        $scope.message = false;
        $scope.showLoader = true;
        var data = {city_id : search.city_id, searchBy : searchBy, requestType : requestType};
        var getcomplaintsDetails = ComplaintService.getcomplaints(data);
        getcomplaintsDetails.then(function(response) {
            $scope.showLoader = false;
            $scope.message = '';
            if (response && response.length) {
                $scope.showTableFlag = true;
                $scope.complaints = response;
                $('#booking-list-table').DataTable().destroy();
                setTimeout(function() {
                    $(document).ready(function() {
                        $('#booking-list-table').DataTable({
                            "lengthMenu": [
                                [10, 25, 50, 100, -1],
                                [10, 25, 50, 100, "All"]
                            ],
                            destroy: true,
                            "scrollX": true
                        });
                    });
                });
            } else {
                $scope.complaints = {};
                $scope.showLoader = false;
                $scope.message = true;
            }
        });
    };


    $scope.getComplaintById = function(id) {
        var getComplaintByIdDetails = ComplaintService.getComplaintById(id);
        getComplaintByIdDetails.then(function(response) {
            $scope.feedback = response;
        });
    };

    $scope.updateFeedback = function(feedback) {
        $scope.showLoader = true;
        var updateResponse = ComplaintService.updateFeedback(feedback);
        updateResponse.then(function(response) {
            $scope.showLoader = false;
        });
    };

    $scope.getResolvedComplaintsPageChange = function(newPage, feedback, requestType) {
        getResolvedComplaints(newPage, feedback, requestType);
    }

    function getResolvedComplaints (pageNumber, feedback = '', requestType) {
        console.log(pageNumber,'sdsdsd' ,requestType)
        $scope.showLoader = true;
        $scope.message = false;
        if(angular.isUndefined($scope.maalgaadi_city_id)){
            return false;
        }
        feedback.city_id = $scope.maalgaadi_city_id;
        var data = {city_id : feedback.city_id, page : pageNumber, entries : feedback.entrie, filter_by : feedback.filter_by,from_date:feedback.from_date,to_date:feedback.to_date,trip_id:feedback.trip_id};
        var searchComplaintsDetails = CommonService.getDetails(data,'getResolvedComplaints');
        searchComplaintsDetails.then(function(response) 
        {
            console.log(response);
            $scope.showTableFlag = true;
            $scope.showLoader = false;
            $scope.complaints = response.data;
            $scope.totalItems = response.paginate.total;
            $scope.currentPage = response.paginate.current_page;
            $scope.perPage = response.paginate.per_page;
            $scope.mypage = response.paginate.current_page;
            if ($scope.mypage == 0) {
                $scope.perpg = response.paginate.total;
            } else {

                $scope.perpg = response.paginate.per_page;
            }
            if (requestType == 1) {
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

    $scope.resetSearch = function() {
        $scope.feedback = {};
        $scope.searchBy = '';
    };

    $scope.resetPendingSearch = function() {
        // $scope.getcomplaints(0);
        $scope.searchBy = '';
    };





    // edit content listing
    $scope.editSubComplaintType = function() {
        var complaintDetails = ComplaintService.editSubComplaintType();
        complaintDetails.then(function(response) {
            $scope.complaint = response;
        });

    };
    $scope.singleComplaintType = function(complaintTypeId) {
        location.href = '/edit-complaint-type/' + complaintTypeId;
    };
    $scope.updateSubComplaintType = function(complaint) {
        ComplaintService.updateSubComplaintType(complaint);

    };

    $scope.removeSubComplaintType = function(complaintTypeId) {
        SweetAlert.swal({
            title: "Confirm",
            text: "Do you want to remove this sub Complaint type!",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            imageUrl: "assets/images/ic_launcher.png"
        }, function(isConfirm) {
            if (isConfirm) {
                ComplaintService.removeSubComplaintType(complaintTypeId);
            }
        });
    };



    $scope.subIssueSelectedDisabled = function(complainId) {
        setTimeout(function() {
            $('.subIssues_' + complainId + '  select option').css('font-weight', 'bold').attr('disabled', false);
            $('.subIssues_' + complainId).each(function() {
                var $this = $(this);
                $('.subIssues_' + complainId).not($this).find('option').each(function() {
                    if ($(this).attr('value') == $this.val() && $this.val())
                        $(this).attr('disabled', true).css('font-weight', '100');
                });
            });
        }, 1000);

        setTimeout(function() {
            $('.subIssues_' + complainId).change(function() {
                $('.subIssues_' + complainId + ' option').css('font-weight', 'bold').attr('disabled', false);
                $('.subIssues_' + complainId).each(function() {
                    var $this = $(this);
                    $('.subIssues_' + complainId).not($this).find('option').each(function() {
                        if ($(this).attr('value') == $this.val() && $this.val())
                            $(this).attr('disabled', true).css('font-weight', '100');
                    });
                });
            });
        }, 1000);
    };

    $scope.searchRemarks = function(remarks, pagenum = '1', requestType = '') {
        $scope.showLoader = true;
        $scope.message = false;
        var searchRemarks = ComplaintService.searchRemarks(remarks, pagenum, requestType);
        searchRemarks.then(function(response) {
            if (response.data) {
                $scope.showLoader = false;
                $scope.allRemarks = response.data;
            } else {
                $scope.showLoader = false;
                $scope.message = true;
            }
        });
    };

    $scope.updateDriverFeedback = function(feedback) {
        $scope.showLoader = true;
        var updateResponse = ComplaintService.updateDriverFeedback(feedback);
        updateResponse.then(function(response) {
            $scope.showLoader = false;
        });
    };



    $scope.resolvedRemark = function(remarkId) {
        var data = { remarkId: remarkId };
        SweetAlert.swal({
            title: "Confirm",
            text: "Do you want to resolved this remark!",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            imageUrl: "assets/images/ic_launcher.png"
        }, function(isConfirm) {
            if (isConfirm) {
                $http({
                    method: 'POST',
                    url: '/api/resolvedRemark',
                    params: data
                }).then(function successCallback(response) {
                    //location.href = '/pending-complaint';
                }, function errorCallback(response) {});
            }
        });
    };

    $scope.getDriverComplaintById = function(id) {
        var getComplaintByIdDetails = ComplaintService.getDriverComplaintById(id);
        getComplaintByIdDetails.then(function(response) {
            $scope.driverFeedback = response;
        });
    }

    $scope.openComplain= function(type,id) {
        $('.child-content').hide();
        if(type==1){   
            $("#remark"+id).show(); 
        }else if(type==2){

             $("#driver"+id).show(); 
        }else{
            $("#"+id).show(); 
        }
       
    }


   $scope.HideComplain= function(type,id) {
        if(type==1){   
            $("#remark"+id).hide(); 
        }else if(type==2){

             $("#driver"+id).hide(); 
        }else{
            $("#"+id).hide(); 
        }
    }

    $scope.exportPendingComplain = function() {
        if(angular.isUndefined($scope.maalgaadi_city_id)){
            return false;
        }

        window.location = 'api/exportPendingComplain?city_id='+$scope.maalgaadi_city_id;
    };

    $scope.exportResolvedComplain = function(feedback, pagenum = '1', requestType = '') {
          
          //window.location = 'api/exportResolvedComplain?data'+feedback;
            var filter_by=$scope.feedback.filter_by;
            var feedback_date=$scope.feedback.feedback_date;
            var from_date=$scope.feedback.from_date;
            var to_date=$scope.feedback.to_date;
            var a ={};
            a.filter_by= 'created_at';a.from_date = "01-09-2017";a.to_date="05-09-2017"

            if (angular.isUndefined($scope.maalgaadi_city_id)) {
                return false;
            }
           window.location = 'api/getResolvedComplaints?filter_by='+filter_by+'&feedback_date='+feedback_date+'&from_date='+from_date+'&to_date='+to_date+'&city_id='+$scope.maalgaadi_city_id+'&export=excel';
         // window.location = 'api/getResolvedComplaints?export=excel'+'&city_id='+feedback.city_id+'&data='+a;
    };

    $scope.approvedOverloadingComplaint = function(complaintId){
        console.log(complaintId);

        $http({
                method: 'POST',
                url: '/api/getOverloadingCharges/' + complaintId
        }).then(function successCallback(response) {
            console.log(response)
            if (angular.isDefined(response.data.success)) 
            {
                SweetAlert.swal({
                    title: "Confirm",
                    text: "A amount of "+response.data.success.data.amount+" will be credited to the driver's wallet as overloading charges. Do you wish to proceed?",
                    showCancelButton: true,
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: "Yes",
                    cancelButtonText: "No",
                    imageUrl: "assets/images/ic_launcher.png"
                }, function(isConfirm) {
                    if (isConfirm) {
                        $http({
                            method: 'POST',
                            url: '/api/addOverloadCharges/' + complaintId
                        }).then(function successCallback(response) {
                            console.log(response)
                            if (angular.isDefined(response.data.success)) 
                            {
                                SweetAlert.swal({
                                    title: "Success",
                                    text: "Approved",
                                    type: "success",
                                    showCancelButton: false,
                                    closeOnConfirm: false
                                }, function() {
                                    window.location.href = '/pending-complaint';
                                });   
                            }
                            if (angular.isDefined(response.data.error)) 
                            {
                                SweetAlert.swal(response.data.error.message);   
                            }

                        }, function errorCallback(response) {});
                    }
                });   
            }

        }, function errorCallback(response) {});
        
    };

    $scope.multipleImages = function(multipleImagesUrl){
        console.log(multipleImagesUrl)
        $scope.images = multipleImagesUrl;
    };

    $scope.imageModel = function(imageUrl){
        $scope.complaint_image_url = imageUrl;
    };

    $scope.updateComplaintInformation = function(complaint){
        console.log(complaint,'info');
        var complaintResult = ComplaintService.updateDriverComplaintInformation(complaint);
        complaintResult.then(function(response) {
            console.log(response);
            if (response && angular.isDefined(response.success)) 
            {
                swal({
                    title: "Success",
                    text: response.success.message,
                    type: "success",
                    showCancelButton: false,
                    closeOnConfirm: true
                }, function() {
                    window.location.href = '/pending-complaint';
                });   
            }
        });
    }

}]);
