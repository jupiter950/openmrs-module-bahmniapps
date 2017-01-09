'use strict';

angular.module('bahmni.common.offline')
    .factory('offlineDbInitialization', ['spinner', 'offlineService', 'initializeOfflineSchema', 'offlineDbService', 'androidDbService',
        function (spinner, offlineService, initializeOfflineSchema, offlineDbService, androidDbService) {
            return function () {
                if (offlineService.isOfflineApp()) {
                    if (offlineService.isAndroidApp()) {
                        offlineDbService = androidDbService;
                    }
                    var location = offlineService.getItem('LoginInformation') ? offlineService.getItem('LoginInformation').currentLocation.display : null;
                    return offlineDbService.initSchema(Bahmni.Common.Constants.bahmniConnectMetaDataDb).then(function (metaDataDb) {
                        offlineDbService.init(metaDataDb);
                        if (location === null) {
                            return metaDataDb;
                        }
                        var dbNames = offlineService.getItem("dbNames") || [];
                        dbNames.push(location);
                        offlineService.setItem("dbNames", _.uniq(dbNames));
                        return offlineDbService.initSchema(location).then(function (db) {
                            db = offlineService.isAndroidApp() ? location : db;
                            offlineDbService.init(db);
                            return db;
                        });
                    });
                }
            };
        }
    ]);
