/**
 * Created by Neeraj Wadhwa on 7/24/17.
 */

const chai = require('chai');
const _ = require('lodash');

const utilsForExport = require('../lib/utilsForExport');
const config = require('../config');
const options = require('../lib/options');
const urlBuilder = require('../lib/URLBuilders');
const utils = require('../lib/utils');



let expect = chai.expect;



describe('Testing utilsForExport', function () {

    describe('Testing getListOfEntities(entityType)', function () {

        this.timeout(10000);

        it('should return a list of one entity type', async function () {

            let list;

            try {
                list = JSON.parse(await utilsForExport.getListOfEntities('proxy'));

                expect(list).to.be.an('array');
                expect(list[0]).to.be.a('string');
            }
            catch (e){
                throw new Error('JSON parse failed:', e);
            }

        });

        it('should return undefined if wrong entity type is provided', async function () {

            let list = await utilsForExport.getListOfEntities('devapps');

            expect(list).to.be.undefined;
        });
    });

    describe('Testing getListOfEnvironments()', function () {

        this.timeout(10000);

        it('should return a list of environments in source org', async function () {

            let envList;
            try {
                envList = JSON.parse(await utilsForExport.getListOfEnvironments());

                expect(envList).to.be.an('array');
                expect(envList[0]).to.be.a('string');
                expect(envList).to.have.property('length');
            }
            catch (e){
                throw new Error('JSON parsing failed: ', e);
            }
        });
    });

    describe('Testing getListOfCaches(envName)', function () {

        this.timeout(10000);

        let envName = 'prod';

        it('should return a list of caches for a specified environment', async function () {

            let cacheList = JSON.parse(await utilsForExport.getListOfCaches(envName));
            expect(cacheList).to.be.an('array');
            expect(cacheList).to.have.property('length');
            if(cacheList.length > 0){
                expect(cacheList[0]).to.be.a('string');
            }
        });
    });

    describe('Testing getCacheDefinition(env, cacheName)', function () {

        this.timeout(10000);

        let envName = 'test';
        let cacheName = 'testCacheMocha2';
        
        before(function (done) {

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
                "name" : cacheName,
                "overflowToDisk" : false,
                "persistent" : false
            };

            let url = urlBuilder.getCachePath(config.from.org, envName);

            let requestObject = _.clone(utilsForExport.requestForExport);
            requestObject.url = utilsForExport.requestForExport.baseurl + url;
            requestObject.method = 'POST';
            requestObject.body = cacheBody;
            requestObject.json = true;

            utils.makePostRequest(requestObject, config.from.userid, config.from.passwd, function (err, res) {
                if(err || res.statusCode >= 400){
                    done(err);
                }
                done();
            });
        });

        after(function (done) {

            let url = urlBuilder.getCacheUrl(config.from.org, envName, cacheName);
            let requestObject = _.clone(utilsForExport.requestForExport);
            requestObject.url = utilsForExport.requestForExport.baseurl + url;
            requestObject.method = 'DELETE';

            utils.makePostRequest(requestObject, config.from.userid, config.from.passwd, function(err, res){

                if(err){
                    done(err);
                }
                done();
            });
        });
        
        it('should fetch the cache definition', async function () {

            let definition = JSON.parse(await utilsForExport.getCacheDefinition(envName, cacheName));

            expect(definition).to.be.an('object');
            expect(definition).to.have.property('name');
            expect(definition).to.have.property('expirySettings');
        });

    });
});