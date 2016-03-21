'use strict';

angular.module('bahmni.common.patient')
    .service('patientService', ['$http','$q', function ($http, $q) {

        this.getPatient = function (uuid) {
            return $q.when({});
        };

        this.getRelationships = function (patientUuid) {
            return $q.when({});
        };

        this.findPatients = function (params) {
            return $q.when({});
        };

        this.search = function (query, offset, identifier) {
            var params ={
                q: query,
                identifier:identifier,
                startIndex: offset || 0,
                addressFieldName: Bahmni.Common.Offline.AddressFields.CITY_VILLAGE
            };
            return $q.when(JSON.parse(AndroidOfflineService.search(JSON.stringify(params))));
        };

        this.getPatientContext = function (patientUuid, programUuid, personAttributes, programAttributes) {
            return $q.when({});
        };
    }]);
