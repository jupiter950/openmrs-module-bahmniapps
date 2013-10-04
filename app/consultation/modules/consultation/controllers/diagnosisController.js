'use strict';

angular.module('opd.consultation.controllers')
    .controller('DiagnosisController', ['$scope', '$rootScope', 'DiagnosisService', function ($scope, $rootScope, diagnosisService) {

    $scope.placeholder = "Add Diagnosis";
    $scope.hasAnswers = false;
    $scope.orderOptions = ['PRIMARY', 'SECONDARY'];
    $scope.certaintyOptions = ['CONFIRMED', 'PRESUMED'];

    $scope.getDiagnosis = function (searchTerm) {
        return diagnosisService.getAllFor(searchTerm);
    }

    var _canAdd = function (diagnosis) {
        var canAdd = true;
        $scope.diagnosisList.forEach(function (observation) {
            if (observation.concept.conceptName === diagnosis.concept.conceptName) {
                canAdd = false;
            }
        });
        return canAdd;
    }

    var addDiagnosis = function (concept, index) {
        var diagnosisBeingEdited = $scope.diagnosisList[index]
        if(diagnosisBeingEdited){
            var diagnosis = new Bahmni.Opd.Consultation.Diagnosis(concept, diagnosisBeingEdited.order,
                diagnosisBeingEdited.certainty, diagnosisBeingEdited.existingObsUuid)
        }
        else {
            var diagnosis = new Bahmni.Opd.Consultation.Diagnosis(concept);
        }
        if (_canAdd(diagnosis)) {
            $scope.diagnosisList.splice(index, 1, diagnosis);
        }
    };

    var addPlaceHolderDiagnosis = function () {
        var diagnosis = new Bahmni.Opd.Consultation.Diagnosis('');
        $scope.diagnosisList.push(diagnosis);
    }

    var init = function () {
        if ($rootScope.consultation.diagnoses === undefined || $rootScope.consultation.diagnoses.length === 0) {
            $scope.diagnosisList = [];

        }
        else {
            $scope.diagnosisList = $rootScope.consultation.diagnoses;
        }
        $rootScope.beforeContextChange = allowContextChange;
        addPlaceHolderDiagnosis();
    }

    var allowContextChange = function() {
        var invalidDrugs = $scope.diagnosisList.filter(function(diagnosis){
            return !diagnosis.isValid();
        });
        return invalidDrugs.length === 0;
    }

    var isNotEmptyDiagnosis = function (diagnosis) {
        return diagnosis.concept !== undefined && diagnosis.displayName !== undefined && diagnosis.displayName.length !== 0;
    }

    $scope.selectItem = function (item, index) {
        addDiagnosis(item.concept, index);
    }

    $scope.removeObservation = function (index) {
        if (index >= 0) {
            $scope.diagnosisList.splice(index, 1)
        }
    }

    $scope.$on('$destroy', function () {
        $rootScope.consultation.diagnoses = $scope.diagnosisList.filter(function (diagnosis) {
            return diagnosis.concept.conceptName !== undefined;
        });
    });

    $scope.processDiagnoses = function (data) {
        data.map(
            function (concept) {
                if (concept.conceptName === concept.matchedName) {
                    return {
                        'value':concept.matchedName,
                        'concept':concept
                    }
                }
                return {
                    'value':concept.matchedName + "=>" + concept.conceptName,
                    'concept':concept
                }
            }
        );
    }

    $scope.clearEmptyRows = function (index) {
        var iter;
        for(iter=0; iter<$scope.diagnosisList.length; iter++){
            if(!isNotEmptyDiagnosis($scope.diagnosisList[iter]) && iter !== index){
                $scope.diagnosisList.splice(iter, 1)
            }
        }
        var emptyRows = $scope.diagnosisList.filter(function (diagnosis) {
                return !isNotEmptyDiagnosis(diagnosis);
            }
        )
        if(emptyRows.length == 0){
            addPlaceHolderDiagnosis();
        }
    }

    $scope.isValid = function(diagnosis){
        var isValid = diagnosis.isValid();
        return isValid;
    }

    init();

}])
    .directive('uiAutocomplete', function () {
        return function (scope, element, attrs) {
            element.autocomplete({
                autofocus:true,
                minLength:2,
                source:function (request, response) {
                    scope.getDiagnosis(request.term).success(function (data) {
                        response(data.map(
                            function (concept) {
                                if (concept.conceptName === concept.matchedName) {
                                    return {
                                        'value':concept.matchedName,
                                        'concept':concept
                                    }
                                }
                                return {
                                    'value':concept.matchedName + "=>" + concept.conceptName,
                                    'concept':concept
                                }
                            }
                        ));
                    });
                },
                search:function (event) {
                    var searchTerm = $.trim(element.val());
                    if (searchTerm.length < 2) {
                        event.preventDefault();
                    }
                },
                select:function (event, ui) {
                    scope.selectItem(ui.item, scope.$index);
                    return true;
                }
            });
        }
    })
    .directive('buttonsRadio', function () {
        return {
            restrict:'E',
            scope:{ model:'=', options:'='},
            controller:function ($scope) {
                $scope.activate = function (option) {
                    $scope.model = option;
                };
            },
            template:"<button type='button' class='btn' " +
                "ng-class='{active: option == model}'" +
                "ng-repeat='option in options' " +
                "ng-click='activate(option)'>{{option}} " +
                "</button>"
        };
    });
