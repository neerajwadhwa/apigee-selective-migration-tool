/**
 * Created by Neeraj Wadhwa on 7/26/17.
 */

const chai = require('chai');

const config = require('../config');
const options = require('../lib/options');
const utils = require('../lib/utils');

const importProxyKVMs = require('../lib/commands/importProxyKVMs');


let expect = chai.expect;


describe('Testing importProxyKVMs', function () {

    describe('Testing getKVMsForSpecificProxies(proxiesToCheckFor)', function () {

        this.timeout(10000);

        it('should return back a list of kvms for specified list of proxies', async function () {

            let proxyList = ['mochaProxy', 'test'];

            let kvms = await importProxyKVMs.getKVMsForSpecificProxies(proxyList);

            expect(kvms).to.be.an('array');
            expect(kvms).to.have.property('length');
        });
    });

    describe('Testing extractNames(exportedKvms)', function () {

        this.timeout(10000);

        it('should extract kvm names from the paths provided', async function () {

            let kvmNames = ['kvm1', 'some', 'test'];

            list = [ 'data/proxyKvms/mochaProxy/' + kvmNames[0] + '.json',
                'data/proxyKvms/test/' + kvmNames[1] + '.json',
                'data/proxyKvms/some/' + kvmNames[2] + '.json' ];

            let extractedNames = await importProxyKVMs.extractNames(list);

            expect(extractedNames).to.be.an('array');
            expect(extractedNames).to.include(...kvmNames);
        });
    });

    describe('Testing performCorrection(withPath, withoutPath)', function () {

        this.timeout(10000);

        it('should provide a list of full paths for provided kvm names', async function () {


            let list = ['data/proxyKvms/mochaProxy/kvm1.json',
                        'data/proxyKvms/test/some.json',
                        'data/proxyKvms/some/test.json'];

            let needPath = ['kvm1', 'test'];

            let withPath = await importProxyKVMs.performCorrection(list, needPath);

            expect(withPath).to.be.an('array');
            expect(withPath[0]).to.include(...needPath);
        });
    });
});