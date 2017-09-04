'use strict';

angular.module('bahmni.appointments')
    .directive('patientSearch', ['patientService', 'appointmentsService', 'spinner', '$state', function (patientService, appointmentsService, spinner, $state) {
        return {
            restrict: "E",
            scope: {
                onSearch: "="
            },
            templateUrl: "../appointments/views/manage/patientSearch.html",
            link: {
                pre: function ($scope) {
                    $scope.search = function () {
                        return spinner.forPromise(patientService.search($scope.patient).then(function (response) {
                            return response.data.pageOfResults;
                        }));
                    };

                    $scope.responseMap = function (data) {
                        return _.map(data, function (patientInfo) {
                            patientInfo.label = patientInfo.givenName + " " + patientInfo.familyName + " " + "(" + patientInfo.identifier + ")";
                            return patientInfo;
                        });
                    };

                    $scope.onSelectPatient = function (data) {
                        $scope.patientUuid = data.uuid;
                        spinner.forPromise(appointmentsService.search({patientUuid: data.uuid}).then(function (oldAppointments) {
                            $scope.onSearch(oldAppointments.data);
                        }));
                    };
                    $scope.$watch(function () {
                        return $state.params.isSearchEnabled;
                    }, function (isSearchEnabled) {
                        if (isSearchEnabled == false) {
                            $scope.patient = null;
                        }
                    }, true);
                }
            }
        };
    }]);
