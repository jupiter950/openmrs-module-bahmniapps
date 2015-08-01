'use strict';

angular.module('bahmni.registration').factory('openmrsPatientMapper', ['patient', '$rootScope', 'age',
    function (patientModel, $rootScope, age) {
        var whereAttributeTypeExists = function (attribute) {
                return $rootScope.patientConfiguration.get(attribute.attributeType.uuid);
            },
            addAttributeToPatient = function (patient, attribute) {
                var attributeType = $rootScope.patientConfiguration.get(attribute.attributeType.uuid);
                if (attributeType) {
                    if (attributeType.format === "org.openmrs.Concept" && attribute.value) {
                        patient[attributeType.name] = attribute.value.uuid;
                    } else {
                        patient[attributeType.name] = attribute.value;
                    }
                }
            },
            mapAttributes = function (patient, attributes) {
                attributes.filter(whereAttributeTypeExists).forEach(function (attribute) {
                    addAttributeToPatient(patient, attribute);

                });
            },
            pad = function (number) {
                return number > 9 ? number.toString() : "0" + number.toString();
            },
            parseDate = function (dateStr) {
                return dateStr ? new Date(dateStr) : dateStr;
            },
            mapAddress = function (preferredAddress) {
                return preferredAddress || {};
            },
            mapRelationships = function(patient, relationships){
                patient.relationships = relationships;
                patient.newlyAddedRelationships = [{}];
            },
            map = function (openmrsPatient) {
                var relationships = openmrsPatient.relationships;
                var openmrsPatient = openmrsPatient.patient;
                var patient = patientModel.create(),
                    birthdate = parseDate(openmrsPatient.person.birthdate);
                patient.givenName = openmrsPatient.person.preferredName.givenName;
                patient.middleName = openmrsPatient.person.preferredName.middleName;
                patient.familyName = openmrsPatient.person.preferredName.familyName;
                patient.birthdate = openmrsPatient.person.birthdateEstimated || !birthdate ? null : birthdate;
                patient.age = birthdate ? age.fromBirthDate(openmrsPatient.person.birthdate) : null;
                patient.gender = openmrsPatient.person.gender;
                patient.address = mapAddress(openmrsPatient.person.preferredAddress);
                patient.identifier = openmrsPatient.identifiers[0].identifier;
                patient.image = Bahmni.Registration.Constants.patientImageURL + openmrsPatient.uuid + ".jpeg?q=" + new Date().toISOString();
                patient.registrationDate = parseDate(openmrsPatient.person.auditInfo.dateCreated);
                mapAttributes(patient, openmrsPatient.person.attributes);
                mapRelationships(patient, relationships);
                return patient;
            };

        return {
            map: map
        };
    }]);