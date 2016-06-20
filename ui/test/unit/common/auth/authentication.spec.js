'use strict';

describe("Authentication", function () {
    var sessionService, userService, $bahmniCookieStore, $q, scope;

    beforeEach(module('authentication'));
    beforeEach(module(function ($provide) {
        var currentUserCookie = {};
        $bahmniCookieStore = jasmine.createSpyObj('$bahmniCookieStore', ['get', 'put', 'remove']);
        $q = jasmine.createSpyObj('$q', ['defer', 'when']);
        $bahmniCookieStore.get.and.callFake(function (cookieName) {
            if (cookieName == Bahmni.Common.Constants.currentUser) {
                return currentUserCookie;
            }
        });
        userService = jasmine.createSpyObj('userService', ['getUser', 'getProviderForUser']);

        var userResponse = {results: [{uuid: "36b6ea1f-3f5a-11e5-b380-0050568236ae"}]};
        var providers = {};

        var getUserPromise = specUtil.createServicePromise('getUser');
        getUserPromise.then = function (successFn) {
            successFn(userResponse);
            return getUserPromise;
        };

        var getProviderForUserPromise = specUtil.createServicePromise('getProviderForUser');
        getProviderForUserPromise.then = function (successFn) {
           successFn(providers);
           return getProviderForUserPromise;
        };

        userService.getUser.and.returnValue(getUserPromise);
        userService.getProviderForUser.and.returnValue(getProviderForUserPromise);

        var mockOfflineService = jasmine.createSpyObj('offlineService',['setPlatformCookie', 'getAppPlatform','isOfflineApp']);
        mockOfflineService.getAppPlatform.and.returnValue('chrome');
        mockOfflineService.isOfflineApp.and.returnValue(false);

        $provide.value('$bahmniCookieStore', $bahmniCookieStore);
        $provide.value('userService', userService);
        $provide.value('$q', $q);
        $provide.value('offlineService', mockOfflineService);
    }));


    describe("Should show error message ", function () {
        it("to the user when user doesn't select the location for the first time login", inject(['sessionService', '$rootScope', function (sessionService, $rootScope) {
            var deferrable = jasmine.createSpyObj('deferrable', ['reject']);
            $q.defer.and.returnValue(deferrable);
            spyOn(sessionService, 'destroy');

            sessionService.loadCredentials();

            expect(deferrable.reject).toHaveBeenCalledWith('You have not been setup as a Provider, please contact administrator.');
        }]));
    });


    describe("loginUser", function () {
        it("should createSession and authenticate the user then save currentUser and cookie in the $bahmniCookieStore", inject(['sessionService', '$rootScope', '$http', function (sessionService, $rootScope, $http) {
            var mockOfflineService = jasmine.createSpyObj('offlineService',['setPlatformCookie', 'getAppPlatform','isOfflineApp', 'getItem']);
            mockOfflineService.isOfflineApp.and.returnValue(true);
            var userInfoFromLocalStorage = undefined;
            mockOfflineService.getItem.and.returnValue(userInfoFromLocalStorage);

            var deferrable = jasmine.createSpyObj('deferrable', ['reject', 'resolve']);
            deferrable.promise = {
                then: function (callback) {
                    callback({authenticated: true})
                }
            };

            $q.defer.and.returnValue(deferrable);

            var fakeHttpPromise = {
                error: function(callback) {
                    callback("Error")
                },
                success: function(callback){
                    return {
                        error: function(callback) {
                            callback("Error")
                        },
                        success: function(callback){
                            callback("Sucess")
                        }
                    };
                }
            };
            spyOn($http, 'delete').and.returnValue(fakeHttpPromise);

            sessionService.loginUser("userName", "password", "location");
            expect($bahmniCookieStore.put).toHaveBeenCalled();
            expect($bahmniCookieStore.put.calls.count()).toBe(2);
            expect($bahmniCookieStore.remove).toHaveBeenCalledWith(Bahmni.Common.Constants.locationCookieName);
        }]));

    });


    describe("Should loadProviders ", function () {
            var mockOfflineService;

            beforeEach(module(function ($provide) {
                $q = jasmine.createSpyObj('$q', ['defer', 'when']);
                mockOfflineService = jasmine.createSpyObj('offlineService',['setPlatformCookie', 'getAppPlatform','isOfflineApp', 'getItem']);
                mockOfflineService.getAppPlatform.and.returnValue('chrome');
                mockOfflineService.isOfflineApp.and.returnValue(true);

                $provide.value('$q', $q);
                $provide.value('offlineService', mockOfflineService);
            }));
        it("and set the providers to currentProvider in rootScope", inject(['sessionService', '$rootScope', function (sessionService, $rootScope) {
            var provider = {results: [{uuid: "6a5d9c71-bb71-47ad-abed-bda86637f1b7", name: "93779 - Arman Vuiyan", links: []}]};

            mockOfflineService.isOfflineApp.and.returnValue(true);
            mockOfflineService.getItem.and.returnValue(provider);

            sessionService.loadProviders({uuid: "userInfoUuid"});
            expect($rootScope.currentProvider).toEqual({uuid: "6a5d9c71-bb71-47ad-abed-bda86637f1b7", name: "93779 - Arman Vuiyan", links: []});
        }]));
    });

});