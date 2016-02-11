'use strict';

describe('consultationContextController', function () {
    var scope, controller, rootScope,visitTabConfig;
    var mockClinicalAppConfigService= jasmine.createSpyObj('clinicalAppConfigService', ['getConsultationBoardLink']);
    var mockLocation= jasmine.createSpyObj('$location', ['path']);
    var config = [
        {
            dashboardName: "visit",
            displayByDefault: false
        },
        {
            dashboardName: "disposition",
            displayByDefault: true
        },
        {
            dashboardName: "trends",
            displayByDefault: true,
            printing: {title: "Awesome"}
        }
    ];
    var contextChangeHandler = {
        execute: function () {
            return {allow: true}
        }, reset: function () {
        }
    };

    beforeEach(function () {
        module('bahmni.clinical');
        inject(function ($controller, $rootScope) {
            controller = $controller;
            scope = $rootScope.$new();
            rootScope = $rootScope;
        });
        spyOn(rootScope, '$broadcast');
    });

    beforeEach(function() {
        mockClinicalAppConfigService.getConsultationBoardLink.and.returnValue("/patient/patient_uuid/dashboard/consultation");
        visitTabConfig = new Bahmni.Clinical.TabConfig(config);
    });

    function createController() {
        return controller('VisitHeaderController', {
            $scope: scope,
            $state: null,
            $rootScope:rootScope,
            clinicalAppConfigService:mockClinicalAppConfigService,
            patientContext:{patient:{uuid:"patient_uuid"}},
            visitHistory:null,
            visitConfig:visitTabConfig,
            $stateParams:{configName:"default"},
            contextChangeHandler:contextChangeHandler,
            $location:mockLocation
        });
    }


    describe('switchTab', function () {
        it("should broadcast event:clearVisitBoard with the particular tab as param", function () {
            createController();
            scope.switchTab( config[1]);
            expect(rootScope.$broadcast).toHaveBeenCalledWith('event:clearVisitBoard', config[1]);
        });
    });

    describe('closeTab', function () {
        it("should broadcast event:clearVisitBoard with the particular tab as param", function () {
            createController();
            scope.closeTab(config[1]);
            expect(rootScope.$broadcast).toHaveBeenCalledWith('event:clearVisitBoard',  config[1]);
        });
    });

    describe('print', function () {
        it("should broadcastevent:printVisitTab with the current tab as param", function () {
            createController();
            scope.visitTabConfig.currentTab = config[0];
            scope.print();
            expect(rootScope.$broadcast).toHaveBeenCalledWith('event:printVisitTab',config[0]);
        });
    });

    describe('showPrint', function () {
        it("should return false if current tab doesnt have printing configured", function () {
            createController();
            scope.visitTabConfig.currentTab = config[0];
            expect(scope.showPrint()).toBeFalsy();
        });
        it("should return true if current tab have printing configured", function () {
            createController();
            scope.visitTabConfig.currentTab = config[0];
            scope.visitTabConfig.currentTab.printing = {"header":"Printing header"};
            expect(scope.showPrint()).toBeTruthy();
        });
    });

    describe('gotoPatientDashboard', function () {
        it("should call location path method", function () {
            createController();
            scope.gotoPatientDashboard();
            expect(mockLocation.path).toHaveBeenCalledWith("default/patient/patient_uuid/dashboard");
        });
    });

});