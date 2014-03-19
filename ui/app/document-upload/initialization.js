'use strict';

angular.module('opd.documentupload').factory('initialization',
    ['$rootScope', '$q', '$window', '$location', 'configurationService', 'patientService', 'patientMapper', 'authenticator', 'appService',
        function ($rootScope, $q, $window, $location, configurationService, patientService, patientMapper, authenticator, appService) {

            var initializationPromise = $q.defer();
            var url = purl(decodeURIComponent($window.location));
            $rootScope.appConfig = url.param();


            var getConsultationConfigs = function () {
                var configNames = ['encounterConfig'];
                return configurationService.getConfigurations(configNames).then(function (configurations) {
                    $rootScope.encounterConfig = angular.extend(new EncounterConfig(), configurations.encounterConfig);
                });
            };

            var validate = function() {
                var promise = $q.defer();
                var throwValidationError = function(errorMessage) {
                    $rootScope.error = errorMessage;
                    initializationPromise.reject();
                    promise.reject();
                }

                if($rootScope.appConfig.encounterType == null) {
                    throwValidationError("encounterType should be configured in config")
                } else if($rootScope.encounterConfig.getEncounterTypeUuid($rootScope.appConfig.encounterType) == null) {
                    throwValidationError("Configured encounterType does not exist");
                }

                promise.resolve();
                return promise;
            }

            var initApp = function() {
                return appService.initApp('document-upload', {'app': false, 'extension' : false});
            };

            $rootScope.$on("$stateChangeError", function() {
                $location.path("/error");
            });

            authenticator.authenticateUser().then(initApp).then(getConsultationConfigs).then(validate).then(function () {
                initializationPromise.resolve();
            });


            return initializationPromise.promise;
        }] 
);
