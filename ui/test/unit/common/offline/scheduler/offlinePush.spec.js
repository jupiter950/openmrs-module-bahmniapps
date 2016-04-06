'use strict';

describe('offlinePush', function () {
    var offlinePush, offlineServiceMock, eventQueueMock, httpBackend, offlineDbServiceMock, androidDbService, $q=Q, eventQueue, errorQueue, event, eventQueueMock;


    beforeEach(function () {
        module('bahmni.common.offline');
        module(function ($provide) {
            var offlineServiceMock = jasmine.createSpyObj('offlineService', ['isOfflineApp','isAndroidApp']);
            eventQueueMock = jasmine.createSpyObj('eventQueue', ['consumeFromErrorQueue','consumeFromEventQueue','removeFromQueue','addToErrorQueue','releaseFromQueue']);
            var offlineDbServiceMock = jasmine.createSpyObj('offlineDbService', ['getPatientByUuid']);
            // var httpMock = jasmine.createSpyObj('$http', ['post','catch']);

            offlineServiceMock.isOfflineApp.and.returnValue(true);
            offlineServiceMock.isAndroidApp.and.returnValue(false);
            event = {
                "data": {
                    url: "someUrl",
                    patientUuid: "someUuid"
                },
                tube: "event_queue"
            };

            eventQueue = [event];
            errorQueue = [event];
            eventQueueMock.consumeFromEventQueue.and.returnValue(specUtil.respondWith(undefined));
            eventQueueMock.consumeFromErrorQueue.and.returnValue(specUtil.respondWith(undefined));
            eventQueueMock.removeFromQueue.and.returnValue(specUtil.respondWith(undefined));
            eventQueueMock.addToErrorQueue.and.returnValue(specUtil.respondWith(undefined));
            eventQueueMock.releaseFromQueue.and.returnValue(specUtil.respondWith(undefined));

            eventQueueMock.consumeFromErrorQueue.and.callFake(function(){
                return $q.when(errorQueue.shift());
            });

            eventQueueMock.removeFromQueue = jasmine.createSpy('removeFromQueue').and.returnValue($q.when({}));
            var patient = {};
            offlineDbServiceMock.getPatientByUuid.and.returnValue(specUtil.respondWith(patient));
            $provide.value('offlineService', offlineServiceMock);
            $provide.value('eventQueue', eventQueueMock);
            $provide.value('offlineDbService', offlineDbServiceMock);
            $provide.value('androidDbService', androidDbService);

        });
    });

    beforeEach(inject(['offlinePush', '$httpBackend',function (_offlinePush_, _$httpBackend_) {
        offlinePush = _offlinePush_;
        httpBackend = _$httpBackend_;
    }]));

    it("should push data from event queue", function(done) {
        httpBackend.expectPOST("someUrl").respond(200, {});
        offlinePush.processEvent(event).then(function(){
            expect(eventQueueMock.removeFromQueue).toHaveBeenCalled();
            expect(eventQueueMock.consumeFromEventQueue).toHaveBeenCalled();
            done();
        });
        setTimeout(function(){
            httpBackend.flush();
        }, 1000);
    });


    it("should push data from error queue", function(done) {
        httpBackend.expectPOST("someUrl").respond(200, {});
        event.tube = "error_queue";
        offlinePush.processEvent(event).then(function(){
            expect(eventQueueMock.removeFromQueue).toHaveBeenCalled();
            expect(eventQueueMock.consumeFromErrorQueue).toHaveBeenCalled();
            done();
        });
        setTimeout(function(){
            httpBackend.flush();
        }, 1000);
    });

    it("should add to error queue if push response is 500", function(done) {
        httpBackend.expectPOST("someUrl").respond(500, {});
        offlinePush.processEvent(event).then(function(){
            expect(eventQueueMock.removeFromQueue).toHaveBeenCalled();
            expect(eventQueueMock.addToErrorQueue).toHaveBeenCalled();
            expect(eventQueueMock.consumeFromEventQueue).toHaveBeenCalled();
            done();
        });
        setTimeout(function(){
            httpBackend.flush();
        }, 1000);
    });

    it("should halt queue processing if push response is 400", function(done) {
        httpBackend.expectPOST("someUrl").respond(400, {});
        offlinePush.processEvent(event).then(function(){
            expect(eventQueueMock.removeFromQueue).not.toHaveBeenCalled();
            expect(eventQueueMock.addToErrorQueue).not.toHaveBeenCalled();
            expect(eventQueueMock.consumeFromEventQueue).not.toHaveBeenCalled();
            expect(eventQueueMock.releaseFromQueue).toHaveBeenCalled();
            done();
        });
        setTimeout(function(){
            httpBackend.flush();
        }, 1000);
    });

});