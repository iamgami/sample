app.controller('ReferralController', ['$scope', '$http', '$q', 'referralServices', 'SweetAlert', function($scope, $http, $q, referralServices, SweetAlert) {
    $scope.referral = {};
    $scope.addReferralDetail = function(referral) {
        referralServices.addReferralDetail(referral);
    }

    $scope.getReferralDetails = function() {
        var data = referralServices.getReferralDetail();
        data.then(function(response) {
            if (response.length > 0) {
                $scope.referral.referral_amount = response[0].referral_amount;
                $scope.referral.referral_trip = response[0].referral_trip;
                $scope.referral.new_user_amount = response[0].new_user_amount;
                $scope.referral.new_user_trip = response[0].new_user_trip;
            }
        }, function(reason) {
            alert("Something went wrong");
        });
    }

    $scope.setReferralDataTable = function() {
        // $scope.referralData = [];
        // setTimeout(function() {
        // $('#referral-bonus-report').DataTable();
        // },500);
    }

    $scope.getReferralReport = function(report, pagenum, requestType = 1) {
        var data = { page: pagenum, startDate: report.startDate, endDate: report.endDate, type: report.type };
        var referralReportResult = referralServices.getReferralReportDetail(data);
        referralReportResult.then(function(response) {
            $scope.referralData = response.data;
            $scope.totalItems = response.pagination.total;
            $scope.currentPage = response.pagination.current_page;
            $scope.perPage = response.pagination.per_page;
            if (requestType == 1) {
                setTimeout(function() {
                    $scope.currentPage = 1;
                    var previousActive = $('dir-pagination-controls ul li.active').find('a').text();
                    if (Number(previousActive) > 1) {
                        $('dir-pagination-controls ul li:nth-child(2)').find('a').click();
                    }
                }, 400);

            }
            if (response.data.length == 0) {
                $scope.showMessage = true;
            } else {
                $scope.showMessage = false;
            }

        }, function(reason) {
            swal("Something went wrong");
        });
    };

    $scope.exportgetReferralReport = function(report) {
        window.location = '/api/getReferralReport?startDate=' + report.startDate + '&endDate=' + report.endDate + '&export=excel';
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
