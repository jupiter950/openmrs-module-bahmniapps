'use strict';

angular.module('bahmni.common.domain')
    .service('orderSetService', ['$http', '$q', function ($http, $q) {
        this.getAllOrderSets = function() {
            return $http.get(Bahmni.Common.Constants.orderSetUrl, {
                params: {v:"full"}
            });
        };

        this.getOrderSet = function(uuid) {
            return $http.get(Bahmni.Common.Constants.orderSetUrl + "/" + uuid, {
                params: {v:"full"}
            });
        };

        this.getOrderSetMemberAttributeType = function(name) {
            return $http.get(Bahmni.Common.Constants.orderSetMemberAttributeTypeUrl, {
                params: {name : name}
            });
        };


        this.saveOrderSet = function(orderSet){
            var url = Bahmni.Common.Constants.orderSetUrl;
            return $http.post(url, orderSet, {
                withCredentials: true,
                headers: {"Accept": "application/json", "Content-Type": "application/json"}
            });
        };

        this.getOrderSetWithAttributeNameAndValue = function(conceptUuid, attributeName, attributeValue) {
            var url = Bahmni.Common.Constants.orderSetUrl;
            return $http.get(url, {
                params:{drugConceptUuid: conceptUuid, attributeType: attributeName,attributeValue: attributeValue, v:"custom:(name,uuid,orderSetMembers)"},
                withCredentials: true,
                headers: {"Accept": "application/json", "Content-Type": "application/json"}
            });
        };


        this.getUniqueOrderSetMembersWithoutPrimaryConcept = function(conceptUuid, attributeName, attributeValue){
            return this.getOrderSetWithAttributeNameAndValue(conceptUuid, attributeName, attributeValue).then(function(data){
                return filterOrderSetMembers(conceptUuid, data.data.results);
            })
        };

        var filterOrderSetMembers = function(primaryConceptUuid, orderSets){
            var orderSetMembers = {};
            _.forEach(orderSets, function(orderSet){
                _.forEach(orderSet.orderSetMembers, function(orderSetMember){
                    if(primaryConceptUuid !== orderSetMember.concept.uuid) {
                        orderSetMembers[orderSetMember.concept.uuid] = orderSetMember;
                    }
                })
            });
            return _.values(orderSetMembers);
        };

         this.getDrugConfig = function () {
            return $http.get(Bahmni.Common.Constants.drugOrderConfigurationUrl, {
                withCredentials: true
            }).then(function(result){
                var config = result.data;
                config.durationUnits = [
                    {name: "Day(s)", factor: 1},
                    {name: "Week(s)", factor: 7},
                    {name: "Month(s)", factor: 30}
                ];
                Array.prototype.push.apply(config.doseUnits, Bahmni.Common.Constants.orderSetSpecialUnits,"name");
                return  config;
            });
        };

        var hasSpecialDoseUnit = function (doseUnits) {
            return _.some(Bahmni.Common.Constants.orderSetSpecialUnits,{name:doseUnits});
        };

        var getRuleForUnits = function (doseUnits) {
            return (_.find(Bahmni.Common.Constants.orderSetSpecialUnits,{name:doseUnits})).rule;
        };

        this.getCalculatedDose = function (patientUuid, baseDose, doseUnits) {
            if (hasSpecialDoseUnit(doseUnits)) {
                var rule = getRuleForUnits(doseUnits);
                return $http.get(Bahmni.Common.Constants.calculateDose, {
                    params: {
                        patientUuid: patientUuid,
                        baseDose: baseDose,
                        rule:rule
                    },
                    withCredentials: true,
                    headers: {"Accept": "application/json", "Content-Type": "application/json"}
                }).then(function (response) {
                    return response.data;
                });
            }
            var deferred = $q.defer();
            deferred.resolve(baseDose);
            return deferred.promise;

        };
    }]);
