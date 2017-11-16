/**
 * Created by Neeraj Wadhwa on 7/26/17.
 */

const chai = require('chai');

const config = require('../config');
const options = require('../lib/options');
const utils = require('../lib/utils');

const importEnvKVMs = require('../lib/commands/importEnvKVMs');


let expect = chai.expect;



describe('Testing importEnvKVMs', function () {

    describe('Testing getListOfKvms(env)', function () {

        this.timeout(5000);

        it('should return back with a list of KVMs for the specified environment', async function () {

            let envName = 'test';

            let kvms = JSON.parse(await importEnvKVMs.getListOfKvms(envName));

            expect(kvms).to.be.an('array');
            expect(kvms).to.have.property('length');
            // expect(kvms[0]).to.be.a('string');
        });
    });

    describe('Testing getKVMsForSpecificEnvs(envsToCheckFor)', function () {

        this.timeout(10000);

        it('should return back a list of kvms for specified list of environments', async function () {

            let envList = ['test', 'prod'];

            let kvms = await importEnvKVMs.getKVMsForSpecificEnvs(envList);

            expect(kvms).to.be.an('array');
            expect(kvms).to.have.property('length');
        });
    });

    describe('Testing extractNames(exportedKvms)', function () {

        this.timeout(10000);

        it('should extract kvm names from the paths provided', async function () {

            let kvmNames = ['kvm1', 'some', 'test'];

            list = [ 'data/envKvms/prod/' + kvmNames[0] + '.json',
                'data/envKvms/test/' + kvmNames[1] + '.json',
                'data/envKvms/test/' + kvmNames[2] + '.json' ];

            let extractedNames = await importEnvKVMs.extractNames(list);

            expect(extractedNames).to.be.an('array');
            expect(extractedNames).to.include(...kvmNames);
        });
    });

    describe('Testing performCorrection(withPath, withoutPath)', function () {

        this.timeout(10000);

        it('should provide a list of full paths for provided kvm names', async function () {


            let list = ['data/envKvms/prod/kvm1.json',
                        'data/envKvms/test/test.json',
                        'data/envKvms/test/some.json'];

            let needPath = ['kvm1', 'test'];

            let withPath = await importEnvKVMs.performCorrection(list, needPath);

            expect(withPath).to.be.an('array');
            expect(withPath[0]).to.include(...needPath);
        });
    });
});