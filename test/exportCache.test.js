/**
 * Created by Neeraj Wadhwa on 7/24/17.
 */



const chai = require('chai');


const config = require('../config');
const options = require('../lib/options');
const exportCache = require('../lib/commands/exportCache');



let expect = chai.expect;



describe('Testing exportCache', function () {

    describe('Testing processEnvironment(env)', function () {

        this.timeout(8000);

        it('should return an object with environment name as a key and cache list as value', async function () {

            let envName = 'prod';
            let obj;

            try {
                obj = await exportCache.processEnvironment(envName);

                expect(obj).to.be.an('object');
                expect(obj).to.have.keys(envName);
                expect(obj[envName]).to.be.an('array');
                expect(obj[envName]).to.have.property('length');
            }
            catch(e){
                throw  new Error('Error occurred: ', e);
            }
        });
    });

    describe('Testing makePromptCompatibleChoice(array)', function () {

        this.timeout(5000);

        it('should return a prompt-checkbox compatible object', async function () {

           let arrayToBeModified = [{"test": ['cache1', 'cache2']}, {"prod": ['cache1', 'cache2']}];

           let promptObject = await exportCache.makePromptCompatibleChoice(arrayToBeModified);

           expect(promptObject).to.be.an('object');
           expect(promptObject).to.have.all.keys('test', 'prod');
           expect(promptObject['test']).to.be.an('array');
           expect(promptObject['test'][0]).to.be.a('string');
           expect(promptObject['prod']).to.be.an('array');
           expect(promptObject['prod'][0]).to.be.a('string');
        });
    });

    describe('Testing getEnvForAnswer(cacheName, promptChoices)', function () {

        this.timeout(5000);

        it('should return back the list of environment for a cache', async function () {

            let arrayToBeModified = [{"test": ['cache1', 'cache2']}, {"prod": ['cache1', 'cache2']}];

            let promptObject = await exportCache.makePromptCompatibleChoice(arrayToBeModified);

            let envList = await exportCache.getEnvForAnswer('cache1', promptObject);

            expect(envList).to.be.an('array').that.includes('test', 'prod');
        });
    });


    //not testing this one as the path on which we save the files is different
    //and provided directly in the method, which cannot be tweaked

    // describe('Testing saveCache(env, cache, definition)', function () {
    //
    //     this.timeout(5000);
    //
    //     let envName = 'test';
    //     let cacheName = 'testCacheMocha2';
    //     let definition = {
    //         "description" : "testCacheMocha2 desc",
    //         "diskSizeInMB" : 0,
    //         "distributed" : true,
    //         "expirySettings" : {
    //             "timeoutInSec" : {
    //                 "value" : "300"
    //             },
    //             "valuesNull" : false
    //         },
    //         "inMemorySizeInKB" : 0,
    //         "maxElementsInMemory" : 0,
    //         "maxElementsOnDisk" : 0,
    //         "name" : cacheName,
    //         "overflowToDisk" : false,
    //         "persistent" : false
    //     };
    //     let dirToLookIn = options.dataDir.cacheDir + envName + '/';
    //
    //     it('should save the file on file system', async function () {
    //
    //         exportCache.saveCache(envName, cacheName, definition);
    //
    //         let files = await utils.getExportedEntities(dirToLookIn);
    //
    //         expect(files).to.be.an('array');
    //     });
    // });
});