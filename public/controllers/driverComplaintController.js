app.controller('driverComplaintController', ['$scope', '$http', 'SweetAlert', 'DriverComplaintService','CommonService', function($scope, $http, SweetAlert, DriverComplaintService, CommonService) {
    $scope.pagination = {};
    $scope.currentPage = 0;
    $scope.totalItems = 0;
    $scope.showLoader = false;
    $scope.complaintType = {};
    $scope.complaint = {};
    $scope.complaint.image_required = 'no';
    

    $scope.addcomplaintType = function(complaint) {
        var details = CommonService.saveAndUpdateDetails(complaint,'addDrivercomplaintType');
         details.then(function(response) {
            if(angular.isDefined(response.success)){
                SweetAlert.swal({
                    title: "Success",
                    text: "Issue Type Added Successfully",
                    type: "success",
                    imageUrl: "assets/images/ic_launcher.png",
                    showCancelButton: false,
                    closeOnConfirm: false
                }, function() {
                        location.href = '/add-sub-issue';
                });     
            }
        });     
    };

    $scope.addSubComplaintType = function(complaint) {
        var details = CommonService.saveAndUpdateDetails(complaint,'addDriverSubcomplaintType');
         details.then(function(response) {
            if(angular.isDefined(response.success)){
                SweetAlert.swal({
                    title: "Success",
                    text: "Sub Issue Added Successfully",
                    type: "success",
                    imageUrl: "assets/images/ic_launcher.png",
                    showCancelButton: false,
                    closeOnConfirm: false
                }, function() {
                    location.href = '/view-complaint-type';
                });    
            }
        }); 
    };
    $scope.getcomplaintType = function() {
        var getcomplaintTypeDetails = CommonService.getDetails('', 'getDrivercomplaintType');
        getcomplaintTypeDetails.then(function(response) {
            if(response.success){
                $scope.complaintType = response.success.data;
            }
        });

    };
    $scope.getSubComplaintType = function() {
        mainIssuesSelectBoxDisable();
        var getcomplaintTypeDetails = CommonService.getDetails('','getDriverSubComplaintType');
        getcomplaintTypeDetails.then(function(response) {
            if(response.success){
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
    $scope.removeComplaintType = function(complaintTypeId) {
        console.log(complaintTypeId);
        SweetAlert.swal({
            title: "Confirm",
            text: "Do you want to remove this issue type!",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            imageUrl: "assets/images/ic_launcher.png"
        }, function(isConfirm) {
            if (isConfirm) {
                DriverComplaintService.removeComplaintType(complaintTypeId);
            }
        });
    };
    $scope.singleComplaintType = function(complaintTypeId) {
        location.href = '/edit-issue/' + complaintTypeId;
    };

    $scope.removeSubComplaintType = function(complaintTypeId) {
        SweetAlert.swal({
            title: "Confirm",
            text: "Do you want to remove this sub issue type!",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            imageUrl: "assets/images/ic_launcher.png"
        }, function(isConfirm) {
            if (isConfirm) {
                DriverComplaintService.removeSubComplaintType(complaintTypeId);
            }
        });
    };
    $scope.editcomplaintType = function() {
        var complaintDetails = DriverComplaintService.editcomplaintType();
        complaintDetails.then(function(response) {
            $scope.complaint = response;
            if (response.image_required == 1) {
                $scope.complaint.image_required = 'yes';
            } else {
                $scope.complaint.image_required = 'no';
            }
        });

    };
    $scope.editSubComplaintType = function() {
        var complaintDetails = DriverComplaintService.editSubComplaintType();
        complaintDetails.then(function(response) {
            $scope.complaint = response;
            if (response.image_required == 1) {
                $scope.complaint.image_required = 'yes';
            } else {
                $scope.complaint.image_required = 'no';
            }
        });

    };
    $scope.updateComplaintType = function(complaint) {
        DriverComplaintService.updateComplaintType(complaint);
    };
    $scope.updateSubComplaintType = function(complaint) {
        DriverComplaintService.updateSubComplaintType(complaint);
    };
    $scope.getcomplaintsPageChange = function(newPage, status) {
        getcomplaints(newPage, status);
    };

    function getcomplaints(newPage, status) {
        var tripId = '';
        var mgId = '';
        var city_id = '';
        if(angular.isDefined($scope.driver_trip_id)){
            tripId = $scope.driver_trip_id;
        }
        if(angular.isDefined($scope.vehicle_reg_no)){
            mgId = $scope.vehicle_reg_no;
        }
        if(angular.isDefined($scope.city_id)){
            city_id = $scope.city_id;
        }
        var data = { page: newPage, status: status, mgId : mgId, tripId : tripId, city_id : city_id };
        console.log(data);
        var getcomplaintsDetails = DriverComplaintService.getcomplaints(data);
        getcomplaintsDetails.then(function(response) {

            $scope.complaints = response.data.data;
            console.log(response.pagination.total);
            $scope.totalItems = response.pagination.total;
            $scope.currentPage = response.pagination.current_page;
            $scope.perPage = response.pagination.per_page;
            if (newPage == 1) {
                setTimeout(function() {
                    $scope.currentPage = 1;
                    var previousActive = $('dir-pagination-controls ul li.active').find('a').text();
                    if (Number(previousActive) > 1) {
                        $('dir-pagination-controls ul li:nth-child(2)').find('a').click();
                    }
                }, 400);

            }
        }, function(reason) {
            alert("Something went wrong");
        });
    };
    $scope.exportPendingComplaint = function(){
        var tripId = '';
        var mgId = '';
        if(angular.isDefined($scope.driver_trip_id)){
            tripId = $scope.driver_trip_id;
        }
        if(angular.isDefined($scope.vehicle_reg_no)){
            mgId = $scope.vehicle_reg_no;
        }
        window.location = "api/customerMobile/getDriverComplaints?export=excel&tripId="+ tripId + '&mgId=' + mgId ;
    }
    $scope.getComplaintById = function(id) {
        var getComplaintByIdDetails = DriverComplaintService.getComplaintById(id);
        getComplaintByIdDetails.then(function(response) {
            $scope.feedback = response;
        });
    };

    $scope.updateFeedback = function(feedback) {
        $scope.showLoader = true;
        var updateResponse = DriverComplaintService.updateFeedback(feedback);
        updateResponse.then(function(response) {
            $scope.showLoader = false;
        });
    };

    $scope.searchComplaintsPageCgange = function(newPage, feedback) {
        searchComplaints(newPage, feedback);
    };

    function searchComplaints(pagenum, feedback) {
        $scope.showLoader = true;
        $scope.result = false;
       //var datanew = { page: pagenum, data: feedback };
       var datanew = { page: pagenum, 'tripId':feedback.trip_id, 'fromDate' : feedback.from_date,'toDate':feedback.to_date,'filter_by':feedback.filter_by };

        var searchComplaintsDetails = DriverComplaintService.searchComplaints(datanew);
        searchComplaintsDetails.then(function(response) {
            console.log(response);
            $scope.complaints = response.data;
            $scope.result = true;
            $scope.showLoader = false;
            $scope.message = '';
            $scope.totalItems = response.total;
            $scope.currentPage = response.current_page;
            $scope.perPage = response.per_page;
            if (pagenum == 1) {
                setTimeout(function() {
                    $scope.currentPage = 1;
                    var previousActive = $('dir-pagination-controls ul li.active').find('a').text();
                    if (Number(previousActive) > 1) {
                        $('dir-pagination-controls ul li:nth-child(2)').find('a').click();
                    }
                }, 400);

            }
        }, function(reason) {
            alert("Something went wrong");
        });
    };

    $scope.exportDriverResolveComplain = function(feedback){
        var fromDate = '';
        var toDate = '';
        var filterBy = '';
        if(angular.isDefined(feedback.from_date) && angular.isDefined(feedback.to_date) && angular.isDefined(feedback.filter_by))
        {
            fromDate = feedback.from_date;
            toDate = feedback.to_date;
            filterBy = feedback.filter_by;
        }
        window.location = '/api/customerMobile/searchDriverComplaints?tripId='+feedback.trip_id+'&fromDate='+fromDate+'&toDate='+toDate+'&filter_by='+filterBy+'&export=excel';
    }

    $scope.resetSearch = function() {
        $scope.feedback = {};
        $scope.searchBy = '';
    }

    $scope.resetPendingSearch = function() {
        $scope.getcomplaints(0);
        $scope.searchBy = '';
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
            $scope.allRemarks = response.data.success.data;

        }, function errorCallback(response) {});

    };
    $scope.submitRemark = function(remark) {

        var data = { booking_id: remark.key, remark_text: remark.value, remarkId: remark.id };
        $http({
            method: 'POST',
            url: '/api/addBookingRemark',
            params: data
        }).then(function successCallback(response) {
            $scope.remark.value = '';
            SweetAlert.swal({
                title: "Success",
                text: "Successfully done.",
                type: "success",
                imageUrl: "assets/images/ic_launcher.png",
                showCancelButton: false,
                closeOnConfirm: true
            });
            $("#remarkbtn").text('Add');
            $scope.remark.id = '';
            $scope.allRemarks = response.data.success.data;
        }, function errorCallback(response) {});

    };
    $scope.deleteRemark = function(id) {

        var data = { remarkId: id };
        SweetAlert.swal({
            title: "Confirm",
            text: "Do you want to remove this remark!",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            imageUrl: "assets/images/ic_launcher.png"
        }, function(isConfirm) {
            if (isConfirm) {
                $http({
                    method: 'POST',
                    url: '/api/deleteRemark',
                    params: data
                }).then(function successCallback(response) {
                    $scope.allRemarks = response.data.success.data;

                }, function errorCallback(response) {});
            }
        });
    };

    $scope.editRemark = function(remark) {

        $scope.remark = remark;
        $("#remarkbtn").text('Update');

    };

    $scope.cancelEditRemark = function(remark) {
        var remark = { value: '', id: '' };
        $scope.remark = remark;
        $("#remarkbtn").text('Add');
        $("#feedbackForm").modal('hide')
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
        var searchComplaintsDetails = DriverComplaintService.mainIssuesOrderSetting(issues);
        searchComplaintsDetails.then(function(response) {
            swal('Complaint Sorted Successfully');
        }, function(reason) {
            alert("Something went wrong");
        });
    }

    $scope.getNumberLength = function(num) {
        return new Array(num);
    }

    // $scope.driverMainIssuesSelect = function(data){
    //         var selectName = 'mainIssuesOrder'+data;
    //         var selectVal = $('select[name='+selectName+']').val();
    //         var length = 0;
    //         if(selectVal){
    //             length = $('.mainIssues option[value='+selectVal+']:selected').length;
    //         }
    //         if(length > 1){
    //             alert('This order is already selected');
    //             $('select[name='+selectName+']').val('');
    //         }
    // }

    // $scope.driverSubIssuesSelected = function(data,complainId){
    //     var selectName = 'subIssuesOrder__'+data;
    //     var selectVal = $('select[name='+selectName+']').val();console.log(selectVal,selectName,complainId);
    //     var length = 0;
    //     if(selectVal){
    //         length = $('.subIssues_'+complainId+' option[value='+selectVal+']:selected').length;
    //     }
    //     if(length > 1){
    //         alert('This order is already selected');
    //        $('select[name='+selectName+']').val('');
    //     }
    // }
    $scope.mainIssueSelected = function(complainId, priority) {
        setTimeout(function() {
            if (priority == 0) {
                priority = '';
            }
            $('select[name=mainIssuesOrder' + complainId + ']').val(priority);
        }, 200);
    }
    $scope.subIssueSelected = function(complainId, priority) {
        setTimeout(function() {
            if (priority == 0) {
                priority = '';
            }
            $('select[name=subIssuesOrder__' + complainId + ']').val(priority);
        }, 200);
    }

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
    $scope.getDriverReg = function() {
        $http({
            method: 'GET',
            url: '/api/getDriverReg',
        }).then(function successCallback(response) {
            $scope.vehicle = response.data;
            $("#mg_id").autocomplete({ source: $scope.vehicle });
            $scope.loadingIsDones = true;
        }, function errorCallback(response) {});
    };

    $scope.getDriverComplaintReport = function(searchBy, pagenum = 1) {

        $scope.onsubmitReportDataShow = true;
        $scope.reportDataShow = false;
        var data = { page: pagenum, startDate: searchBy.startdate, endDate: searchBy.enddate, mg_id: searchBy.mg_id };

        var resultData = DriverComplaintService.getDriverComplaintReport(data);
        resultData.then(function successCallback(response) {
            $scope.onsubmitReportDataShow = false;
            $scope.reportDataShow = true;
            $scope.reprtData = response.data.data;
            $scope.usersLength = response.data.length;
            $scope.totalItems = response.data.total;
            $scope.currentPage = response.data.current_page;
            $scope.perPage = response.data.per_page;
            if (pagenum == 1) {
                setTimeout(function() {
                    $scope.currentPage = 1;
                    var previousActive = $('dir-pagination-controls ul li.active').find('a').text();
                    if (Number(previousActive) > 1) {
                        $('dir-pagination-controls ul li:nth-child(2)').find('a').click();
                    }
                }, 400);

            }
        }, function(reason) {
            alert("Something went wrong");
        });
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
                                    window.location.href = '/driver-pending-complaint';
                                });   
                            }

                        }, function errorCallback(response) {});
                    }
                });   
            }

        }, function errorCallback(response) {});
        
    };
    $scope.imageModel = function(imageUrl){
       $scope.complaint_image_url = imageUrl;
    };
}]);

function driverMainIssuesSelect(obj) {
    var complaintId = $(obj).attr('complaintId');
    var selectName = 'mainIssuesOrder' + complaintId;
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

function driverSubIssuesSelected(obj) {
    var complaintId = $(obj).attr('complaintId');
    var subIssuesId = $(obj).attr('subIssueId');
    var selectName = 'subIssuesOrder__' + subIssuesId;
    var selectVal = $('select[name=' + selectName + ']').val();
    var length = 0;
    if (selectVal) {
        length = $('.subIssues_' + complaintId + ' option[value=' + selectVal + ']:selected').length;
    }
    if (length > 1) {
        alert('This order is already selected');
        $('select[name=' + selectName + ']').val('');
    }
}
