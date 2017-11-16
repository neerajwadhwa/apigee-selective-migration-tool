/**
 * Created by Neeraj Wadhwa on 7/25/17.
 */

const chai = require('chai');

const exportDevelopers = require('../lib/commands/exportDevelopers');



let expect = chai.expect;



describe('Testing exportDevelopers', function () {

    describe('Testing getListOfDevelopers(expand = false)', function () {

        this.timeout(10000);

        it('should return with a list of developers', async function () {

            let devList = JSON.parse(await exportDevelopers.getListOfDevelopers());

            expect(devList).to.be.an('array');
            expect(devList).to.have.property('length');
        });

        it('should return expanded body with a list of developers', async function () {

            let devList = JSON.parse(await exportDevelopers.getListOfDevelopers(true));

            expect(devList).to.be.an('object');
            expect(devList).to.have.property('developer');
            expect(devList['developer']).to.be.an('array');
        });
    });
});
