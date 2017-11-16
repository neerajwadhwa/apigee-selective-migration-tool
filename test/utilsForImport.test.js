/**
 * Created by Neeraj Wadhwa on 7/24/17.
 */


const chai = require('chai');

const utilsForImport = require('../lib/utilsForImport');
const config = require('../config');
const options = require('../lib/options');



let expect = chai.expect;



describe('Testing utilsForImport', function () {

    describe('Testing getListOfEntities(entityType)', function () {

        this.timeout(5000);

        it('should return a list of one entity type', async function () {

            let list;

            try {
                list = JSON.parse(await utilsForImport.getListOfEntities('proxy'));

                expect(list).to.be.an('array');
                expect(list[0]).to.be.a('string');
            }
            catch (e){
                throw new Error('JSON parse failed:', e);
            }

        });

        it('should return undefined if wrong entity type is provided', async function () {

            let list = await utilsForImport.getListOfEntities('devapps');

            expect(list).to.be.undefined;
        });
    });

    describe('Testing getListOfEnvironments()', function () {

        this.timeout(5000);

        it('should return a list of environments in target org', async function () {

            let envList;
            try {
                envList = JSON.parse(await utilsForImport.getListOfEnvironments());

                expect(envList).to.be.an('array');
                expect(envList[0]).to.be.a('string');
                expect(envList).to.have.property('length');
            }
            catch (e){
                throw new Error('JSON parsing failed: ', e);
            }
        });
    });

    describe('Testing getListOfCaches(envName)', function () {

        this.timeout(5000);

        let envName = 'prod';

        it('should return a list of caches for a specified environment', async function () {

            let cacheList = JSON.parse(await utilsForImport.getListOfCaches(envName));
            expect(cacheList).to.be.an('array');
            expect(cacheList).to.have.property('length');
            if(cacheList.length > 0){
                expect(cacheList[0]).to.be.a('string');
            }
        });
    });

});