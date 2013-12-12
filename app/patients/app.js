'use strict';

angular.module('patients', ['opd.patient', 'bahmni.common.patient','authentication','appFramework', 'bahmni.common.controllers']);
angular.module('patients').config(['$routeProvider', '$httpProvider', function ($routeProvider, $httpProvider) {
    $routeProvider.when("/:appContext", { templateUrl: 'modules/patient/views/activePatientsList.html', controller: 'ActivePatientsListController', resolve: {initialization: 'initialization'}});
    $httpProvider.defaults.headers.common['Disable-WWW-Authenticate'] = true;
}]);