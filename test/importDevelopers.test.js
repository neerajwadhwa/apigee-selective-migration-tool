/**
 * Created by Neeraj Wadhwa on 7/26/17.
 */

const chai = require('chai');

const config = require('../config');
const options = require('../lib/options');

const importDevelopers = require('../lib/commands/importDevelopers');


let expect = chai.expect;



describe('Testing importDevelopers', function () {

    describe('Testing getListOfDevelopers(expand = false)', function () {

        this.timeout(10000);

        it('should return back with a list of developers', async function () {

            let devList = JSON.parse(await importDevelopers.getListOfDevelopers());

            expect(devList).to.be.an('array');
            expect(devList).to.have.property('length');
        });

        it('should return back an object containing developers with extra information', async function () {

            let devList = JSON.parse(await importDevelopers.getListOfDevelopers(true));

            expect(devList).to.be.an('object');
            expect(devList).to.have.property('developer');
        });
    });

    describe('Testing extractNames(exportedApps)', function () {

        this.timeout(10000);

        it('should extract developer names from the paths provided', async function () {

            let devNames = ['helloworld@apigee.com', 'loginappdev@example.com', 'joe@weathersample.com'];

            list = ['data/developers/helloworld@apigee.com.json',
                    'data/developers/loginappdev@example.com.json',
                    'data/developers/joe@weathersample.com.json' ];

            let extractedNames = await importDevelopers.extractNames(list);

            expect(extractedNames).to.be.an('array');
            expect(extractedNames).to.include(...devNames);
        });
    });

    describe('Testing performCorrection(withPath, withoutPath)', function () {

        this.timeout(10000);

        it('should provide a list of full paths for provided developer names', async function () {

            list = ['data/developers/helloworld@apigee.com.json',
                'data/developers/loginappdev@example.com.json',
                'data/developers/joe@weathersample.com.json' ];

            let needPath = ['helloworld@apigee.com', 'joe@weathersample.com'];

            let withPath = await importDevelopers.performCorrection(list, needPath);

            expect(withPath).to.be.an('array');
            expect(withPath[0]).to.include(...needPath);
        });
    });
});