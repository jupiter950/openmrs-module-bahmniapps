'use strict';

Bahmni.Clinical.ClinicalDashboardConfig = function (config) {

    var self = this;

    angular.extend(self, new Bahmni.Clinical.TabConfig(config, "translationKey"));

    this.getDiseaseTemplateSections = function () {
        return _.filter(_.values(this.currentTab.sections), function (section) {
            return section.name === "diseaseTemplate";
        });
    };

    this.getMaxRecentlyViewedPatients = function(){
        return self.currentTab.maxRecentlyViewedPatients || 10;
    }
};