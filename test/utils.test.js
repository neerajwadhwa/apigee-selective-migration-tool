/**
 * Created by Neeraj Wadhwa on 7/21/17.
 */

const chai = require('chai');
const _ = require('lodash');

const utilsForExport = require('../lib/utilsForExport');
const utils = require('../lib/utils');
const config = require('../config');
const urlBuilder = require('../lib/URLBuilders');
const options = require('../lib/options');



let expect = chai.expect;



describe('Testing Utils', function () {

    describe('Testing makeRequest(requestObject, userid, password)', function () {

        this.timeout(10000);

        let requestObject;
        let userid = config.from.userid;
        let passwd = config.from.passwd;

        before(function () {
            let url = urlBuilder.getProxyPath(config.from.org);
            requestObject = _.clone(utilsForExport.requestForExport);
            requestObject.url = utilsForExport.requestForExport.baseurl + url;
        });

        it('should get list of proxies as array', async function start() {

            let body;
            try {

                body = JSON.parse(await utils.makeRequest(requestObject, userid, passwd));

                expect(body).to.be.an('array');
                expect(body[0]).to.be.a('string');
            }
            catch (e){
                throw new Error('JSON parse failed:', e);
            }
        });
    });


    describe('Testing makePostRequest(requestObject, userId, passwd, cb)', function () {

        this.timeout(10000);

        let userid = config.from.userid;
        let passwd = config.from.passwd;
        let cacheBody = {
            "description" : "testCache",
            "diskSizeInMB" : 0,
            "distributed" : true,
            "expirySettings" : {
                "timeoutInSec" : {
                    "value" : "300"
                },
                "valuesNull" : false
            },
            "inMemorySizeInKB" : 0,
            "maxElementsInMemory" : 0,
            "maxElementsOnDisk" : 0,
            "name" : "testCacheMocha",
            "overflowToDisk" : false,
            "persistent" : false
        };


        it('should succeed with 201 Created', function (done) {

            let url = urlBuilder.getCachePath(config.from.org, 'test');
            let requestObject = _.clone(utilsForExport.requestForExport);
            requestObject.url = utilsForExport.requestForExport.baseurl + url;
            requestObject.method = 'POST';
            requestObject.body = cacheBody;
            requestObject.json = true;

            utils.makePostRequest(requestObject, userid, passwd, function(err, res){

                if(err){
                    done(err);
                }

                expect(res.statusCode).to.equal(201);
                expect(res).to.have.property('body');
                expect(res).to.have.property('statusMessage');

                done();
            });
        });

        it('should raise HTTP 409 Conflict Error', function (done) {

            let url = urlBuilder.getCachePath(config.from.org, 'test');
            let requestObject = _.clone(utilsForExport.requestForExport);
            requestObject.url = utilsForExport.requestForExport.baseurl + url;
            requestObject.method = 'POST';
            requestObject.body = cacheBody;
            requestObject.json = true;

            utils.makePostRequest(requestObject, userid, passwd, function(err, res){

                if(err){
                    done(err);
                }

                expect(res.statusCode).to.equal(409);

                done();
            });
        });

        it('should delete the created object', function (done) {

            let url = urlBuilder.getCacheUrl(config.from.org, 'test', "testCacheMocha");
            let requestObject = _.clone(utilsForExport.requestForExport);
            requestObject.url = utilsForExport.requestForExport.baseurl + url;
            requestObject.method = 'DELETE';

            utils.makePostRequest(requestObject, userid, passwd, function(err, res){

                if(err){
                    done(err);
                }

                expect(res.statusCode).to.equal(200);
                done();
            });
        });

    });


    describe('Testing getExportedEntities(dir)', function () {

        this.timeout(10000);

        let dir = options.dataDir.targetserverDir;

        it('should return nothing if dir does not exist', async function () {

            let list = await utils.getExportedEntities('somedir');

            expect(list).to.be.undefined;
        });
    });

});