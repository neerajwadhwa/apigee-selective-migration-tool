/**
 * Created by Neeraj Wadhwa on 7/26/17.
 */

const chai = require('chai');

const utils = require('../lib/utils');
const config = require('../config');
const options = require('../lib/options');

const importTargetServers = require('../lib/commands/importTargetServers');


let expect = chai.expect;



describe('Testing importTargetServers', function () {

    describe('Testing extractNames(exportedTargetServers)', function () {

        this.timeout(10000);

        it('should extract target server names from the paths provided', async function () {

            let targerServerNames = ['prod2', 'test1', 'some'];

            list = [ 'data/targetservers/prod/' + targerServerNames[0] + '.json',
                'data/targetservers/test/' + targerServerNames[1] + '.json',
                'data/targetservers/test/' + targerServerNames[2] + '.json' ];

            let extractedNames = await importTargetServers.extractNames(list);

            expect(extractedNames).to.be.an('array');
            expect(extractedNames).to.include(...targerServerNames);
        });
    });

    describe('Testing performCorrection(withPath, withoutPath)', function () {

        this.timeout(10000);

        it('should provide a list of full paths for provided targetServer names', async function () {


            let list = ['data/targetservers/prod/prod2.json',
                'data/targetservers/test/test1.json',
                'data/targetservers/test/some.json'];

            let needPath = ['prod2', 'test2'];

            let withPath = await importTargetServers.performCorrection(list, needPath);

            expect(withPath).to.be.an('array');
            expect(withPath[0]).to.include(...needPath);
        });
    });
});
