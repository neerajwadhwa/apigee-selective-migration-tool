/**
 * Created by Neeraj Wadhwa on 7/26/17.
 */

const chai = require('chai');

const config = require('../config');
const options = require('../lib/options');
const utils = require('../lib/utils');

const importUserRoles = require('../lib/commands/importUserRoles');


let expect = chai.expect;



describe('Testing importUserRoles', function () {

    describe('Testing getUserRoles()', function () {

        this.timeout(5000);

        it('should return back the list of user roles', async function () {

            let roleList = JSON.parse(await importUserRoles.getUserRoles());

            let roleName = 'orgadmin';

            expect(roleList).to.be.an('array').that.includes(roleName);
            expect(roleList).to.have.property('length');
            expect(roleList[0]).to.be.a('string');
        });
    });
});