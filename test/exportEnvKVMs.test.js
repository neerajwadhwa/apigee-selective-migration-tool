/**
 * Created by Neeraj Wadhwa on 7/24/17.
 */


const chai = require('chai');


const config = require('../config');
const options = require('../lib/options');
const exportEnvKVMs = require('../lib/commands/exportEnvKVMs');


let expect = chai.expect;




describe('Testing exportEnvKVMs', function () {

    describe('Testing processEnvironment(env)', function () {

        this.timeout(8000);

        it('should return an object with environment name as a key and KVM list as value', async function () {

            let envName = 'prod';
            let obj;

            try {
                obj = await exportEnvKVMs.processEnvironment(envName);

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

            let arrayToBeModified = [{"test": ['kvm1', 'kvm2']}, {"prod": ['kvm1', 'kvm2']}];

            let promptObject = await exportEnvKVMs.makePromptCompatibleChoice(arrayToBeModified);

            expect(promptObject).to.be.an('object');
            expect(promptObject).to.have.all.keys('test', 'prod');
            expect(promptObject['test']).to.be.an('array');
            expect(promptObject['test'][0]).to.be.a('string');
            expect(promptObject['prod']).to.be.an('array');
            expect(promptObject['prod'][0]).to.be.a('string');
        });
    });

    describe('Testing getEnvForAnswer(kvmName, promptChoices)', function () {

        this.timeout(5000);

        it('should return back the list of environment for a kvm', async function () {

            let arrayToBeModified = [{"test": ['kvm1', 'kvm2']}, {"prod": ['kvm1', 'kvm2']}];

            let promptObject = await exportEnvKVMs.makePromptCompatibleChoice(arrayToBeModified);

            let envList = await exportEnvKVMs.getEnvForAnswer('kvm1', promptObject);

            expect(envList).to.be.an('array').that.includes('test', 'prod');
        });
    });


    //this test says that the kvm already exists even if you delete the kvm and run this test again

    // describe('Testing getKvmDefinition(env, kvm)', function () {
    //
    //     this.timeout(5000);
    //
    //     let userid = config.from.userid;
    //     let passwd = config.from.passwd;
    //     let envName = 'test';
    //     let kvmName = 'testKVMMocha';
    //     let kvmBody = {
    //         "encrypted" : false,
    //         "entry" : [ {
    //             "name" : "key1",
    //             "value" : "value1"
    //         } ],
    //         "name" : kvmName
    //     };
    //
    //     before(function (done) {
    //
    //         let url = urlBuilder.getKvmEnvPath(config.from.org, envName);
    //         let requestObject = utilsForExport.requestForExport;
    //         requestObject.url = utilsForExport.requestForExport.baseurl + url;
    //         requestObject.method = 'POST';
    //         requestObject.body = kvmBody;
    //         requestObject.json = true;
    //
    //         utils.makePostRequest(requestObject, userid, passwd, function(err, res){
    //
    //             if(err){
    //                 done(err);
    //             }
    //             if(res.statusCode === 201){
    //                 done();
    //             }
    //         });
    //     });
    //
    //
    //     after(function () {
    //
    //         //delete the kvm
    //         let url = urlBuilder.getKvmEnvUrl(config.from.org, envName, kvmName);
    //         requestObject = utilsForExport.requestForExport;
    //         requestObject.url = utilsForExport.requestForExport.baseurl + url;
    //         requestObject.method = 'DELETE';
    //
    //         utils.makePostRequest(requestObject, userid, passwd, function(err, res){
    //
    //             if(err){
    //                 done(err);
    //             }
    //             done();
    //         });
    //
    //     });
    //
    //     it('should return KVM definition', async function () {
    //
    //         let kvmDefinition = JSON.parse(await exportEnvKVMs.getKvmDefinition(envName, kvmName));
    //
    //         expect(kvmDefinition).to.be.an('object');
    //         expect(kvmDefinition).to.have.property('name');
    //         expect(kvmDefinition).to.have.property('entry');
    //     });
    // });
});