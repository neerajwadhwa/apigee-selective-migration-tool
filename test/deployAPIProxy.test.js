/**
 * Created by Neeraj Wadhwa on 8/1/17.
 */

const chai = require('chai');


const config = require('../config');
const options = require('../lib/options');
const deployAPIProxy = require('../lib/commands/deployAPIProxies');


let expect = chai.expect;



describe('Testing deployAPIProxy', function () {

    describe('Testing makePromptCompatibleChoice', function () {

        this.timeout(5000);

        it('should return back the prompt-checkbox compatible object', async function () {

            let arrayToBeModified = [{"proxy1": ['1', '2']}, {"proxy2": ['3', '4']}];

            let promptObject = await deployAPIProxy.makePromptCompatibleChoice(arrayToBeModified);

            expect(promptObject).to.be.an('object');
            expect(promptObject).to.have.all.keys('proxy1', 'proxy2');
            expect(promptObject['proxy1']).to.be.an('array');
            expect(promptObject['proxy1'][0]).to.be.a('string');
            expect(promptObject['proxy1'][0]).to.equal('1');
            expect(promptObject['proxy2']).to.be.an('array');
            expect(promptObject['proxy2'][0]).to.be.a('string');
            expect(promptObject['proxy2'][0]).to.equal('3');
        });
    });
});