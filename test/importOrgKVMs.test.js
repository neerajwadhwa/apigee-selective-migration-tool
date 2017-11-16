/**
 * Created by Neeraj Wadhwa on 7/26/17.
 */

const chai = require('chai');

const config = require('../config');
const options = require('../lib/options');
const utils = require('../lib/utils');

const importOrgKVMs = require('../lib/commands/importOrgKVMs');


let expect = chai.expect;



describe('Testing importOrgKVMs', function () {

    describe('Testing getOrgKvms', function () {

        this.timeout(5000);

        it('should return back with a list of organization KVMs', async function () {

            let kvmList = JSON.parse(await importOrgKVMs.getOrgKvms());

            expect(kvmList).to.be.an('array');
            expect(kvmList).to.have.property('length');
            expect(kvmList[0]).to.be.a('string');
        });
    });

    describe('Testing extractNames(exportedKvms)', function () {

        this.timeout(10000);

        it('should extract kvm names from the paths provided', async function () {

            let kvmNames = ['kvm1', 'some', 'test'];

            list = [ 'data/orgKvms/orgname/' + kvmNames[0] + '.json',
                'data/orgKvms/orgname/' + kvmNames[1] + '.json',
                'data/orgKvms/orgname/' + kvmNames[2] + '.json' ];

            let extractedNames = await importOrgKVMs.extractNames(list);

            expect(extractedNames).to.be.an('array');
            expect(extractedNames).to.include(...kvmNames);
        });
    });

    describe('Testing performCorrection(withPath, withoutPath)', function () {

        this.timeout(10000);

        it('should provide a list of full paths for provided kvm names', async function () {


            let list = ['data/orgKvms/orgname/kvm1.json',
                        'data/orgKvms/orgname/test.json',
                        'data/orgKvms/orgname/some.json'];

            let needPath = ['kvm1', 'test'];

            let withPath = await importOrgKVMs.performCorrection(list, needPath);

            expect(withPath).to.be.an('array');
            expect(withPath[0]).to.include(...needPath);
        });
    });
});