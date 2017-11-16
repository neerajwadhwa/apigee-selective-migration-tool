/**
 * Created by Neeraj Wadhwa on 7/26/17.
 */

const chai = require('chai');

const exportUserRoles = require('../lib/commands/exportUserRoles');



let expect = chai.expect;



describe('Testing exportUserRoles', function () {


    describe('Testing getUserRoles()', function () {

        this.timeout(10000);

        it('should return back with a list of user roles', async function () {

            let userRoles = JSON.parse(await exportUserRoles.getUserRoles());

            expect(userRoles).to.be.an('array');
            expect(userRoles).to.have.property('length');
        });
    });

    describe('Testing getResourcePermissionsForUserRole(userrole)', function () {

        this.timeout(10000);

        it('should return back with object containing resource permissions for that user role', async function () {

            let userRoles = JSON.parse(await exportUserRoles.getUserRoles());
            let resourcePermissions = JSON.parse(await exportUserRoles.getResourcePermissionsForUserRole(userRoles[0]));

            expect(resourcePermissions).to.be.an('object');
            expect(resourcePermissions).to.have.property('resourcePermission');
            expect(resourcePermissions['resourcePermission']).to.be.an('array');
        });
    });
});