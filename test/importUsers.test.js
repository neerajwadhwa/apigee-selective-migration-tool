/**
 * Created by Neeraj Wadhwa on 7/26/17.
 */

const chai = require('chai');

const utilsForExport = require('../lib/utilsForExport');
const utils = require('../lib/utils');
const config = require('../config');
const urlBuilder = require('../lib/URLBuilders');
const options = require('../lib/options');

const importUsers = require('../lib/commands/importUsers');


let expect = chai.expect;




describe('Testing importUsers', function () {

    describe('Testing extractNames(exportedUsers)', function () {

        this.timeout(10000);

        it('should extract user names from the paths provided', async function () {

            let users = ['someone@example.com', 'you@example.com', 'me@example.com'];

            list = [ 'data/users/orgname/' + users[0] + '.json',
                'data/users/orgname/' + users[1] + '.json',
                'data/users/orgname/' + users[2] + '.json' ];

            let extractedNames = await importUsers.extractNames(list);

            expect(extractedNames).to.be.an('array');
            expect(extractedNames).to.include(...users);
        });
    });

    describe('Testing performCorrection(withPath, withoutPath)', function () {

        this.timeout(10000);

        it('should provide a list of full paths for provided users', async function () {


            let list = ['data/users/orgname/someone@example.com.json',
                        'data/users/orgname/you@example.com.json',
                        'data/users/orgname/me@example.com.json'];

            let needPath = ['someone@example.com', 'me@example.com'];

            let withPath = await importUsers.performCorrection(list, needPath);

            expect(withPath).to.be.an('array');
            expect(withPath[0]).to.include(...needPath);
        });
    });
});