/**
 * Created by Neeraj Wadhwa on 7/25/17.
 */


const chai = require('chai');


const config = require('../config');
const utilsForExport = require('../lib/utilsForExport');
const options = require('../lib/options');
const exportProxyKVMs = require('../lib/commands/exportProxyKVMs');


let expect = chai.expect;



describe('Testing exportProxyKVMs', function () {

    describe('Testing processProxy(proxy)', function () {

        this.timeout(10000);

        it('should return undefined when the proxy does not contain any KVMs', async function () {

            listOfProxies = JSON.parse(await utilsForExport.getListOfEntities("proxy"));

            let proxyName = listOfProxies[0];
            let obj = await exportProxyKVMs.processProxy(proxyName);

            expect(obj).to.be.undefined;
        });
    });

    describe('Testing correctUndefinedEntries(array)', function () {

        this.timeout(10000);

        it('should remove the undefined entries from the array', async function () {


            let array = [{'key': 'value'}, undefined, {'key2': 'value2'}];
            let corrected = await exportProxyKVMs.correctUndefinedEntries(array);

            expect(corrected).to.be.an('array');
            expect(corrected).to.not.have.all.keys(undefined);
        });
    });

    describe('Testing makePromptCompatibleChoice(array)', function () {

        this.timeout(5000);

        it('should return a prompt-checkbox compatible object', async function () {


            let arrayToBeModified = [{"proxy1": ['kvm1', 'kvm2']}, {"proxy2": ['kvm1', 'kvm2']}];

            let promptObject = await exportProxyKVMs.makePromptCompatibleChoice(arrayToBeModified);
            expect(promptObject).to.be.an('object');
            expect(promptObject).to.have.all.keys('proxy1', 'proxy2');
            expect(promptObject['proxy1']).to.be.an('array');
            expect(promptObject['proxy1'][0]).to.be.a('string');
            expect(promptObject['proxy2']).to.be.an('array');
            expect(promptObject['proxy2'][0]).to.be.a('string');
        });
    });

    describe('Testing getProxyNameForKVM(kvmName, promptChoices)', function () {

        this.timeout(5000);

        it('should return the proxy name for the kvm', async function () {

            let arrayToBeModified = [{"proxy1": ['kvm1', 'kvm2']}, {"proxy2": ['kvm1', 'kvm2']}];

            let promptObject = await exportProxyKVMs.makePromptCompatibleChoice(arrayToBeModified);
            let proxyList = await exportProxyKVMs.getProxyNameForKVM('kvm1', promptObject);

            expect(proxyList).to.be.an('array');
            expect(proxyList[0]).to.be.a('string');
            expect(proxyList).to.include('proxy1', 'proxy2');
        });
    });
});