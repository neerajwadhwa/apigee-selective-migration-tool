/**
 * Created by Neeraj Wadhwa on 7/25/17.
 */


const chai = require('chai');

const exportDeveloperApps = require('../lib/commands/exportDeveloperApps');



let expect = chai.expect;



describe('Testing exportDeveloperApps', function () {

    describe('Testing getListOfDevelopers(expand = false)', function () {

        this.timeout(10000);

        it('should return with a list of developers', async function () {

            let devList = JSON.parse(await exportDeveloperApps.getListOfDevelopers());

            expect(devList).to.be.an('array');
            expect(devList).to.have.property('length');
        });

        it('should return expanded body with a list of developers', async function () {

            let devList = JSON.parse(await exportDeveloperApps.getListOfDevelopers(true));

            expect(devList).to.be.an('object');
            expect(devList).to.have.property('developer');
            expect(devList['developer']).to.be.an('array');
        });
    });

    describe('Testing getAppsForDeveloper(developer)', function () {

        this.timeout(10000);

        it('should return an array that has objects with developers as keys and apps as values', async function () {

            let devList = JSON.parse(await exportDeveloperApps.getListOfDevelopers());
            let devName = devList[0];

            let appList = await exportDeveloperApps.getAppsForDeveloper(devName);

            expect(appList).to.be.an('object');
            expect(appList).to.have.keys(devName);
        });
    });

    describe('Testing getListOfApps(developer, expand = false)', function () {

        this.timeout(10000);

        it('should return with a list of apps for a specific developer', async function () {

            let devList = JSON.parse(await exportDeveloperApps.getListOfDevelopers());
            let devName = devList[0];

            let appList = JSON.parse(await exportDeveloperApps.getListOfApps(devName));

            expect(appList).to.be.an('array');
            expect(appList).to.have.property('length');
        });
    });

    describe('Testing makePromptCompatibleChoice(array)', function () {

        this.timeout(5000);

        it('should return a prompt-checkbox compatible object', async function () {

            let arrayToBeModified = [{"test": ['kvm1', 'kvm2']}, {"prod": ['kvm1', 'kvm2']}];

            let promptObject = await exportDeveloperApps.makePromptCompatibleChoice(arrayToBeModified);

            expect(promptObject).to.be.an('object');
            expect(promptObject).to.have.all.keys('test', 'prod');
            expect(promptObject['test']).to.be.an('array');
            expect(promptObject['test'][0]).to.be.a('string');
            expect(promptObject['prod']).to.be.an('array');
            expect(promptObject['prod'][0]).to.be.a('string');
        });
    });

    describe('Testing getDeveloperForAnswer(devName, promptChoices)', function () {

        this.timeout(5000);

        it('should return back the list of developers for an app', async function () {

            let promptObject = { 'dev1': [ 'app1', 'app2' ], 'dev2': [ 'app1', 'app2' ] };
            let devList = await exportDeveloperApps.getDeveloperForApp('app1', promptObject);

            expect(devList).to.be.an('array').that.includes('dev1', 'dev2');
        });
    });

    describe('Testing getAppDetails(dev, answer)', function () {

        this.timeout(10000);

        it('should return back the developer application details', async function () {

            let devList = JSON.parse(await exportDeveloperApps.getListOfDevelopers(true));
            devList = devList.developer;
            let appName = devList[0].apps[0];
            let devName = devList[0].email;

            let appDetails = JSON.parse(await exportDeveloperApps.getAppDetails(devName, appName));

            expect(appDetails).to.be.an('object');
            expect(appDetails).to.have.property('appId');
        });
    });
});
