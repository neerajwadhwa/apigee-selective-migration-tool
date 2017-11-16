/**
 * Created by Neeraj Wadhwa on 7/26/17.
 */

const chai = require('chai');

const exportUsers = require('../lib/commands/exportUsers');



let expect = chai.expect;



// describe('Testing exportUsers', function () {
//
//     describe('Testing getUsers()', function () {
//
//         this.timeout(5000);
//
//         it('should return back a list of users in the org', async function () {
//
//             let users = JSON.parse(await exportUsers.getUsers());
//
//             expect(users).to.be.an('array');
//             expect(users).to.have.property('length');
//             expect(users[0]).to.be.a('string');
//         });
//     });
//
//     describe('Testing getUserDefinition(user)', function () {
//
//
//
//         it('should return back the user details for the given user', async function () {
//
//             let users = JSON.parse(await exportUsers.getUsers());
//             let details = JSON.parse(await exportUsers.getUserDefinition(users[0]))
//
//             // run on OPDK
//         });
//     });
// });