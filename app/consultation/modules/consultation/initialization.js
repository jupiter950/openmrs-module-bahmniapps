'use strict';

angular.module('opd.consultation').factory('initialization', ['$rootScope', '$q', '$route', 'configurationService', 'visitService', 'patientService', 'patientMapper', 'dispositionService','BedService',
    function ($rootScope, $q, $route, configurationService, visitService, patientService, patientMapper, dispositionService, bedService) {
        var deferrable = $q.defer();
        var dispositionNoteConcept;

        if (!String.prototype.trim) {
            String.prototype.trim = function () {
                return this.replace(/^\s+|\s+$/g, '');
            };
        }

        var configurationsPromise = configurationService.getConfigurations(['bahmniConfiguration', 'encounterConfig', 'patientConfig', ,'dosageFrequencyConfig','dosageInstructionConfig'])
            .then(function (configurations) {
                $rootScope.bahmniConfiguration = configurations.bahmniConfiguration;
                $rootScope.encounterConfig = angular.extend(new EncounterConfig(), configurations.encounterConfig);
                $rootScope.patientConfig = configurations.patientConfig;
                $rootScope.dosageFrequencyConfig = configurations.dosageFrequencyConfig;
                $rootScope.dosageInstructionConfig = configurations.dosageInstructionConfig;


                return visitService.getVisit($route.current.params.visitUuid).success(function (visit) {
                    $rootScope.visit = visit;
                    $rootScope.consultation = new Bahmni.Opd.ConsultationMapper($rootScope.encounterConfig, $rootScope.dosageFrequencyConfig, $rootScope.dosageInstructionConfig).map(visit);

                    dispositionService.getDispositionNoteConcept().then(function (response) {
                        if (response.data && response.data.results.length > 0) {
                            $rootScope.dispositionNoteConceptUuid = response.data.results[0].uuid;
                        }
                    });

                    dispositionService.getDispositionActions().then(function (response) {
                        if (response.data && response.data.results) {
                            $rootScope.disposition = new Bahmni.Opd.DispositionMapper($rootScope.encounterConfig).map(visit);
                            $rootScope.disposition.currentActionIndex = 0;
                            if (!$rootScope.disposition) {
                                $rootScope.disposition = {};
                            }
                            if(response.data.results && response.data.results.length){
                                $rootScope.disposition.dispositionActionUuid = response.data.results[0].uuid;
                                $rootScope.disposition.dispositionActions = response.data.results.filter(function(concept){
                                    return concept.name.name === Bahmni.Opd.Constants.dispositionConcept
                                })[0].answers;
                            }

                        }

                    });

                    bedService.bedDetailsForPatient(visit.patient.uuid).success(function(response){
                        $rootScope.bedDetails= {};
                        $rootScope.bedDetails.wardName = response.results[0].physicalLocation.parentLocation.display;
                        $rootScope.bedDetails.physicalLocationName = response.results[0].physicalLocation.name;
                        $rootScope.bedDetails.bedNumber = response.results[0].bedNumber;
                        $rootScope.bedDetails.bedId = response.results[0].bedId;
                    })

                    return patientService.getPatient(visit.patient.uuid).success(function (openMRSPatient) {
                        $rootScope.patient = patientMapper.map(openMRSPatient);

                    });

                })
            });


        $q.all([configurationsPromise]).then(function () {
            deferrable.resolve();
        });

        return deferrable.promise;
    }]
);