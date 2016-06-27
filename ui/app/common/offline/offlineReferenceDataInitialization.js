'use strict';

angular.module('bahmni.common.offline')
    .factory('offlineReferenceDataInitialization', ['offlineService','$http', 'offlineDbService', 'androidDbService', '$q','$rootScope',
                function (offlineService, $http, offlineDbService, androidDbService, $q, $rootScope) {
            return function (isAuthenticated) {
                if(offlineService.isOfflineApp()) {
                    if (offlineService.isAndroidApp()) {
                        offlineDbService = androidDbService;
                    }
                    var referenceDataMap;
                    referenceDataMap = isAuthenticated ?
                        angular.extend(Bahmni.Common.Constants.authenticatedReferenceDataMap,
                            Bahmni.Common.Constants.unAuthenticatedReferenceDataMap) :
                        Bahmni.Common.Constants.unAuthenticatedReferenceDataMap;

                    var requests = [];

                    for (var key in referenceDataMap) {
                        var request = [];
                        if (referenceDataMap.hasOwnProperty(key)) {
                            request.push(key);
                            request.push(referenceDataMap[key]);
                            requests.push(request);
                        }
                    }

                    var deferred = $q.defer();

                    var readReferenceData = function (requests, index) {
                        if(requests.length == index) {
                            deferred.resolve(1);
                            return deferred.promise;
                        }
                        var url = requests[index][0];
                        var referenceData = requests[index][1];
                        return offlineDbService.getReferenceData(referenceData).then(function (result) {
                            var requestUrl = Bahmni.Common.Constants.hostURL + url;
                            var req = {
                                method: 'GET',
                                url: requestUrl,
                                headers: {
                                    'If-None-Match': result ? result.etag : undefined
                                },
                                withCredentials: true
                            };
                            if (referenceData == 'LocaleList' || referenceData == 'DefaultEncounterType' || referenceData == "NonCodedDrugConcept") {
                                req.headers.Accept = 'text/plain';
                            }
                            return req;
                        }).then(function (req) {
                            return $http(req).then(function (response) {
                                if (response.status == 200) {
                                    var eTag = response.headers().etag;
                                    return offlineDbService.insertReferenceData(referenceData, response.data, eTag).then(function () {
                                        return readReferenceData(requests, ++index);
                                    });
                                }
                            }).catch(function (response) {
                                if (parseInt(response.status / 100) == 4) {
                                    offlineDbService.insertLog(response.config.url, response.status, response.data);
                                    $rootScope.$broadcast("schedulerStage", null, true);
                                    deferred.reject({});
                                } else if (parseInt(response.status / 100) == 5) {
                                    offlineDbService.insertLog(response.config.url, response.status, response.data);
                                    deferred.reject({"data": Bahmni.Common.Constants.offlineErrorMessages.openmrsServerError});
                                    $rootScope.$broadcast("schedulerStage", null, true);
                                }
                                else if (response.status == -1) {
                                    deferred.reject({"data": Bahmni.Common.Constants.offlineErrorMessages.networkError});
                                    $rootScope.$broadcast("schedulerStage", null, true);
                                }
                                else {
                                    return readReferenceData(requests, ++index);
                                }
                                return deferred.promise;
                            });
                        })
                    };

                    return readReferenceData(requests, 0);
                }
            };
        }
    ]);
