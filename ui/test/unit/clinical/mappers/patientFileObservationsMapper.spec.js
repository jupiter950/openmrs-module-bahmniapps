'use strict';

describe("PatientFileObservationsMapper", function () {

    var observationConceptName = "Patient file";
    var obsDatetimeForDoc4 = "2014-05-03T00:00:00.000+0530";
    var obsDatetimeForDoc3 = "2014-03-04T12:13:06.000+0530";
    var encounters = [
            {
                "uuid": "9aeacab9-7285-4771-840d-07dbc785c0e9",
                "obs": [
                    {
                        "uuid": "a8a0442b-6e4d-4ec7-873e-25c9b0df552a",
                        "concept": {
                            "uuid": "12feb620-bfcb-11e3-8393-0800271c1b75",
                            "name": {
                                "uuid": "12fec54d-bfcb-11e3-8393-0800271c1b75",
                                "name": observationConceptName
                            }
                        },
                        "groupMembers": [
                            {
                                "id": 4,
                                "uuid": "ac5a972b-d3d1-4857-8c03-0da3f702ac36",
                                "obsDatetime": obsDatetimeForDoc4,
                                "value": "document-4.jpeg"
                            }
                        ]
                    }
                ]
            },
            {
                "uuid": "634dd30c-8074-451f-95e2-801a16a66a91",
                "obs": [
                    {
                        "uuid": "dd82a9b1-3f2b-4c50-821d-154bb241a9ef",
                        "concept": {
                            "uuid": "12feb620-bfcb-11e3-8393-0800271c1b75",
                            "name": {
                                "uuid": "12fec54d-bfcb-11e3-8393-0800271c1b75",
                                "name": observationConceptName
                            }
                        },
                        "groupMembers": [
                            {
                                "id": 3,
                                "uuid": "16c2c346-6330-43df-a9a9-1e28aba4dd66",
                                "obsDatetime": obsDatetimeForDoc3,
                                "value": "document-3.jpeg"
                            }
                        ]
                    }
                ]
            }
        ];

    it("should map", function () {
        var displayItems = new Bahmni.Clinical.PatientFileObservationsMapper().mapToDisplayItems(encounters);
        expect(displayItems.length).toBe(2);
        expect(displayItems[0].src).toBe("/document_images/document-3.jpeg");
        expect(displayItems[1].src).toBe("/document_images/document-4.jpeg");
        expect(displayItems[0].title).toBe(observationConceptName+", " + moment(obsDatetimeForDoc3).format(Bahmni.Common.Constants.dateDisplayFormat));
        expect(displayItems[1].title).toBe(observationConceptName+", " + moment(obsDatetimeForDoc4).format(Bahmni.Common.Constants.dateDisplayFormat));
    })
});
