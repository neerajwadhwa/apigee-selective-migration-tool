/**
 * Created by Neeraj Wadhwa on 7/26/17.
 */

const chai = require('chai');

const utils = require('../lib/utils');
const config = require('../config');
const options = require('../lib/options');

const importCache = require('../lib/commands/importCache');


let expect = chai.expect;



describe('Testing importCache', function () {

    describe('Testing extractNames(exportedCaches)', function () {

        this.timeout(10000);

        it('should extract cache names from the paths provided', async function () {

            let cacheNames = ['prod2', 'someCache', 'someCache2'];

            list = [ 'data/cache/prod/' + cacheNames[0] + '.json',
                     'data/cache/test/' + cacheNames[1] + '.json',
                     'data/cache/test/' + cacheNames[2] + '.json' ];

            let extractedNames = await importCache.extractNames(list);

            expect(extractedNames).to.be.an('array');
            expect(extractedNames).to.include(...cacheNames);
        });
    });

    describe('Testing performCorrection(withPath, withoutPath)', function () {

        this.timeout(10000);

        it('should provide a list of full paths for provided cache names', async function () {

            let list = ['data/cache/prod/prod2.json',
                        'data/cache/test/part.json',
                        'data/cache/test/someCache2.json'];

            let needPath = ['prod2', 'someCache2'];

            let withPath = await importCache.performCorrection(list, needPath);

            expect(withPath).to.be.an('array');
            expect(withPath[0]).to.include(...needPath);
        });
    });
});