'use strict';

angular.module('bahmni.clinical').factory('initialization',
    ['$rootScope','authenticator', 'appService', 'spinner', 'configurations', 'orderTypeService', 'offlineService', 'offlineDbService', 'androidDbService','mergeService',
        function ($rootScope, authenticator, appService, spinner, configurations, orderTypeService, offlineService, offlineDbService, androidDbService, mergeService) {
            return function (config) {

            var loadConfigPromise = function () {
                return configurations.load([
                    'patientConfig',
                    'encounterConfig',
                    'consultationNoteConfig',
                    'labOrderNotesConfig',
                    'radiologyImpressionConfig',
                    'allTestsAndPanelsConcept',
                    'dosageFrequencyConfig',
                    'dosageInstructionConfig',
                    'stoppedOrderReasonConfig',
                    'genderMap',
                    'relationshipTypeMap',
                    'defaultEncounterType'
                ]).then(function () {
                    $rootScope.genderMap = configurations.genderMap();
                    $rootScope.relationshipTypeMap = configurations.relationshipTypeMap();
                });
            };

                var initApp = function () {
                    return appService.initApp('clinical', {
                        'app': true,
                        'extension': true
                    }, config, ["dashboard", "visit", "medication"]);
                };

                var mergeFormConditions = function () {
                    var formConditions = Bahmni.ConceptSet.FormConditions;
                    if(formConditions){
                            formConditions.rules = mergeService.merge(formConditions.rules, formConditions.rulesOverride);
                    }
                };

                return spinner.forPromise(authenticator.authenticateUser()
                    .then(initApp)
                    .then(loadConfigPromise)
                    .then(mergeFormConditions)
                    .then(orderTypeService.loadAll));
            };
        }
    ]
);
