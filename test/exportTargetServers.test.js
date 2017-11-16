/**
 * Created by Neeraj Wadhwa on 7/24/17.
 */


const chai = require('chai');

const config = require('../config');
const options = require('../lib/options');
const exportTargetServers = require('../lib/commands/exportTargetServers');



let expect = chai.expect;



describe('Testing exportTargetServers', function () {

    describe('Testing processEnvironment(env)', function () {

        this.timeout(8000);

        it('should return an object with environment name as a key and targetServer list as value', async function () {

            let envName = 'prod';
            let obj;

            try {
                obj = await exportTargetServers.processEnvironment(envName);

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

            let arrayToBeModified = [{"test": ['targetServer1', 'targetServer2']}, {"prod": ['targetServer1', 'targetServer2']}];

            let promptObject = await exportTargetServers.makePromptCompatibleChoice(arrayToBeModified);

            expect(promptObject).to.be.an('object');
            expect(promptObject).to.have.all.keys('test', 'prod');
            expect(promptObject['test']).to.be.an('array');
            expect(promptObject['test'][0]).to.be.a('string');
            expect(promptObject['prod']).to.be.an('array');
            expect(promptObject['prod'][0]).to.be.a('string');
        });
    });

    describe('Testing getEnvForAnswer(targetServer, promptChoices)', function () {

        it('should return back the list of environment for a targetServer', async function () {

            let arrayToBeModified = [{"test": ['targetServer1', 'targetServer2']}, {"prod": ['targetServer1', 'targetServer2']}];

            let promptObject = await exportTargetServers.makePromptCompatibleChoice(arrayToBeModified);

            let envList = await exportTargetServers.getEnvForAnswer('targetServer1', promptObject);

            expect(envList).to.be.an('array').that.includes('test', 'prod');
        });
    });

    //not testing this one as the path on which we save the files is different
    //and provided directly in the method, which cannot be tweaked


    // describe('Testing saveTargetServer(env, targetServer, definition)', function () {
    //
    //     this.timeout(5000);
    //
    //     let envName = 'test';
    //     let targetServerName = 'testTargetServerMocha2';
    //     let definition = {
    //         "host" : "http://mocktarget.apigee.net/",
    //         "isEnabled" : true,
    //         "name" : "testTargetServerMocha2",
    //         "port" : 8080
    //     };
    //     let dirToLookIn = options.dataDir.targetserverDir + envName + '/';
    //
    //     it('should save the file on file system', async function () {
    //
    //         exportTargetServers.saveTargetServer(envName, targetServerName, definition);
    //
    //         let files = await utils.getExportedEntities(dirToLookIn);
    //
    //         expect(files).to.be.an('array');
    //     });
    // });
});