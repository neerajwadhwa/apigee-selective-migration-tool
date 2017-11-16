/**
 * Created by Neeraj Wadhwa on 7/26/17.
 */

const chai = require('chai');

const config = require('../config');
const options = require('../lib/options');

const importDeveloperApps = require('../lib/commands/importDeveloperApps');


let expect = chai.expect;




describe('Testing importDeveloperApps', function () {

    describe('Testing getListOfDevelopers(expand = false)', function () {

        this.timeout(10000);

        it('should return back with a list of developers', async function () {

            let devList = JSON.parse(await importDeveloperApps.getListOfDevelopers());

            expect(devList).to.be.an('array');
            expect(devList).to.have.property('length');
        });

        it('should return back an object containing developers with extra information', async function () {

            let devList = JSON.parse(await importDeveloperApps.getListOfDevelopers(true));

            expect(devList).to.be.an('object');
            expect(devList).to.have.property('developer');
        });
    });

    describe('Testing extractDevListFromExports(str)', function () {

        this.timeout(10000);

        it('should return back the developers list from provided path list', async function () {

            let devName = 'helloworld@apigee.com';

            let list = ['data/devApps/helloworld@apigee.com/helloApp.json',
                        'data/devApps/helloworld@apigee.com/someName.json',
                        'data/devApps/loginappdev@example.com/login-app.json',
                        'data/devApps/thomas@weathersample.com/thomas-app.json',
                        'data/devApps/joe@weathersample.com/joe-app.json',
                        'data/devApps/webdev@example.com/webserver-app.json',
                        'data/devApps/learn-edge-developer@example.com/learn-edge-app.json'];


            let devList = await importDeveloperApps.extractDevListFromExports('' + list + '');

            expect(devList).to.be.an('array');
            expect(devList[0]).to.be.a('string');
            expect(devList).to.include(devName);
        });

        it('should not return developer list if proper paths are not given', async function () {

            let list = ['sdffsdsf/sda/ccc', 'sfsfsdf/sda/fff', 'sdfss/sda/ttt'];

            let envList = await importDeveloperApps.extractDevListFromExports('' + list + '');

            expect(envList).to.be.an('array');
            expect(envList[0]).to.be.a('string');
        });
    });

    describe('Testing extractNames(exportedApps)', function () {

        this.timeout(10000);

        it('should extract app names from the paths provided', async function () {

            let devAppNames = ['helloApp', 'login', 'weather'];

            list = ['data/devApps/helloworld@apigee.com/' + devAppNames[0] + '.json',
                    'data/devApps/loginappdev@example.com/' + devAppNames[1] + '.json',
                    'data/devApps/joe@weathersample.com/' + devAppNames[2] + '.json' ];

            let extractedNames = await importDeveloperApps.extractNames(list);

            expect(extractedNames).to.be.an('array');
            expect(extractedNames).to.include(...devAppNames);
        });
    });

    describe('Testing performCorrection(withPath, withoutPath)', function () {

        this.timeout(10000);

        it('should provide a list of full paths for provided developer app names', async function () {

            let list = ['data/devApps/helloworld@apigee.com/helloApp.json',
                'data/devApps/helloworld@apigee.com/someName.json',
                'data/devApps/loginappdev@example.com/login-app.json',
                'data/devApps/thomas@weathersample.com/thomas-app.json',
                'data/devApps/joe@weathersample.com/joe-app.json',
                'data/devApps/webdev@example.com/webserver-app.json',
                'data/devApps/learn-edge-developer@example.com/learn-edge-app.json'];

            let needPath = ['helloApp', 'webserver-app'];

            let withPath = await importDeveloperApps.performCorrection(list, needPath);

            expect(withPath).to.be.an('array');
            expect(withPath[0]).to.include(...needPath);
        });
    });
});