'use strict';

angular.module('bahmni.clinical').controller('ConsultationNavigationController',
    ['$scope', '$rootScope', '$state', '$location', '$window', 'appService', 'urlHelper', 'contextChangeHandler', 'spinner', 'encounterService', 'RegisterTabService', 'MessagingService',
        function ($scope, $rootScope, $state, $location, $window, appService, urlHelper, contextChangeHandler, spinner, encounterService, registerTabService, messagingService) {

            
            var boardTypes = {
                visit: 'visit',
                consultation: 'consultation'
            };
            $scope.availableBoards = [
                { name: 'Visit', url: '', type: boardTypes.visit}
            ];
            $scope.currentBoard = $scope.availableBoards[0];
            $scope.showBoard = function (name) {
                $rootScope.collapseControlPanel();
                var board = findBoardByname(name);
                return buttonClickAction(board);
            };

            $scope.gotoPatientDashboard = function() {
                $location.path("/patient/" + $rootScope.patient.uuid + "/dashboard");
            };

            var setCurrentBoardBasedOnPath = function() {
                var currentPath = $location.path();
                var board = findBoardByUrl(currentPath);
                $scope.currentBoard = board || $scope.availableBoards[0];
            };

            var stringContains = function (sourceString, pattern) {
                return (sourceString.search(pattern) >= 0);
            };

            var initialize = function () {
                $rootScope.$on('event:appExtensions-loaded', function () {
                    var appExtensions = appService.getAppDescriptor().getExtensions("org.bahmni.clinical.consultation.board", "link");
                    var addlBoards = [];
                    appExtensions.forEach(function (appExtn) {
                        addlBoards.push({ name: appExtn.label, url: appExtn.url, type: boardTypes.consultation });
                    });
                    $scope.availableBoards = $scope.availableBoards.concat(addlBoards);
                    setCurrentBoardBasedOnPath();
                });
            };

            $scope.$on('$stateChangeStart', function() { 
                setCurrentBoardBasedOnPath();
            });

            var findBoardByname = function (name) {
                var boards = $scope.availableBoards.filter(function (board) {
                    return board.name === name;
                });
                return boards.length > 0 ? boards[0] : null;
            };

            var findBoardByUrl = function (url) {
                var boards = $scope.availableBoards.filter(function (board) {
                    return stringContains(url, board.url);
                });
                return boards.length > 0 ? boards[1] : null;
            };

            var getUrl = function (board) {
                var urlPrefix = board.type === boardTypes.visit ? urlHelper.getVisitUrl($rootScope.consultation.visitUuid) : urlHelper.getPatientUrl();
                var url = board.url ? urlPrefix + "/" + board.url : urlPrefix ; 
                return $location.url(url);                    
            };

            var allowContextChange = function() {
                return contextChangeHandler.execute();
            };

            var buttonClickAction = function (board) {
                if ($scope.currentBoard === board) return;

                if (!allowContextChange()) return;
                contextChangeHandler.reset();
                $scope.currentBoard = board;
                return getUrl(board);
            };

            var addEditedDiagnoses = function (diagnosisList) {
                $rootScope.consultation.pastDiagnoses && $rootScope.consultation.pastDiagnoses.forEach(function (diagnosis) {
                    if (diagnosis.isDirty) {
                        diagnosis.setDiagnosisStatusConcept();
                        diagnosis.diagnosisDateTime = undefined;
                        diagnosisList.push(diagnosis);
                    }
                });
                $rootScope.consultation.savedDiagnosesFromCurrentEncounter && $rootScope.consultation.savedDiagnosesFromCurrentEncounter.forEach(function (diagnosis) {
                    if (diagnosis.isDirty) {
                        // TODO : shruthi : can avoid this using javascript property
                        diagnosis.setDiagnosisStatusConcept();
                        diagnosis.diagnosisDateTime = undefined;
                        diagnosisList.push(diagnosis);
                    }
                });
            };

            var clearRootScope = function(){
                $rootScope.consultation.newlyAddedDiagnoses = [];
            };

            $scope.save = function () {
                if (!allowContextChange()){
                    messagingService.showMessage('error', 'Please correct errors in the form. Information not saved');
                    return;
                }
                registerTabService.fire();
                var encounterData = {};
                encounterData.patientUuid = $scope.patient.uuid;
                encounterData.encounterTypeUuid = $rootScope.encounterConfig.getOpdConsultationEncounterTypeUuid();
                encounterData.encounterDateTime = $rootScope.consultation.encounterDateTime || new Date();

                if ($rootScope.consultation.newlyAddedDiagnoses && $rootScope.consultation.newlyAddedDiagnoses.length > 0) {
                    encounterData.bahmniDiagnoses = $rootScope.consultation.newlyAddedDiagnoses.map(function (diagnosis) {
                        return {
                            codedAnswer: { uuid: !diagnosis.isNonCodedAnswer ? diagnosis.codedAnswer.uuid : undefined},
                            freeTextAnswer: diagnosis.isNonCodedAnswer ? diagnosis.codedAnswer.name : undefined,
                            order: diagnosis.order,
                            certainty: diagnosis.certainty,
                            existingObs: null,
                            diagnosisDateTime: null,
                            diagnosisStatusConcept: diagnosis.getDiagnosisStatusConcept(),
                            voided: diagnosis.voided
                        }
                    });
                } else {
                    encounterData.bahmniDiagnoses = [];
                }
                addEditedDiagnoses(encounterData.bahmniDiagnoses);

                encounterData.testOrders = $rootScope.consultation.investigations.map(function (investigation) {
                    return { uuid: investigation.uuid, concept: {uuid: investigation.concept.uuid }, orderTypeUuid: investigation.orderTypeUuid, voided: investigation.voided || false};
                });

                var startDate = new Date();
                var allTreatmentDrugs = $rootScope.consultation.treatmentDrugs || [];
                var newlyAddedTreatmentDrugs = allTreatmentDrugs.filter(function (drug) {
                    return !drug.savedDrug;
                });

                if (newlyAddedTreatmentDrugs) {
                    encounterData.drugOrders = newlyAddedTreatmentDrugs.map(function (drug) {
                        return drug.requestFormat(startDate);
                    });
                }

                encounterData.disposition = $rootScope.consultation.disposition;

                var addObservationsToEncounter = function () {
                    encounterData.observations = encounterData.observations || [];

                    if ($scope.consultation.consultationNote) {
                        encounterData.observations.push($scope.consultation.consultationNote);
                    }
                    if ($scope.consultation.labOrderNote) {
                        encounterData.observations.push($scope.consultation.labOrderNote);
                    }
                    encounterData.observations = encounterData.observations.concat($rootScope.consultation.observations);
                };
                var observationFilter = new Bahmni.Common.Domain.ObservationFilter();
                $rootScope.consultation.observations = observationFilter.filter($rootScope.consultation.observations);
                $rootScope.consultation.consultationNote = observationFilter.filter([$rootScope.consultation.consultationNote])[0];
                $rootScope.consultation.labOrderNote = observationFilter.filter([$rootScope.consultation.labOrderNote])[0];
                addObservationsToEncounter();

                spinner.forPromise(encounterService.create(encounterData).success(function () {
                    clearRootScope();
                    $state.transitionTo($state.current, $state.params, {
                        reload: true,
                        inherit: false,
                        notify: true
                    }).then(function() {
                        messagingService.showMessage('info', 'Saved');
                    });
                 }).error(function (){
                    messagingService.showMessage('error', 'An error has occurred on the server. Information not saved.');
                }));
            };


            initialize();

        }]);
