/**
 * Created by Neeraj Wadhwa on 7/25/17.
 */


const chai = require('chai');
const request = require('request');

const exportOrgKVMs = require('../lib/commands/exportOrgKVMs');


let expect = chai.expect;



describe('Testing exportOrgKVMs', function () {

    describe('Testing getOrgKvms()', function () {

        this.timeout(5000);

        it('should get the list of organization level KVMs', async function () {

            let orgKVMList = JSON.parse(await exportOrgKVMs.getOrgKvms());

            expect(orgKVMList).to.be.an('array');
            expect(orgKVMList).to.have.property('length')
        });
    });

    describe('Testing getKvmDefinition(kvmName)', function () {

        this.timeout(8000);

        it('should return the KVM definition', async function () {

            let orgKVMList = JSON.parse(await exportOrgKVMs.getOrgKvms());
            let kvmName = orgKVMList[0];

            let definition = JSON.parse(await exportOrgKVMs.getKvmDefinition(kvmName));
            expect(definition).to.be.an('object');
            expect(definition).to.have.property('name');
            expect(definition).to.have.property('entry');
        });
    })
});
