/**
 * Created by Neeraj Wadhwa on 7/26/17.
 */

const chai = require('chai');

const exportProducts = require('../lib/commands/exportProducts');


let expect = chai.expect;



describe('Testing exportProducts', function () {

    describe('Testing getProductList(expand = false)', function () {

        this.timeout(10000);

        it('should return with a list of products', async function () {

            let productList = JSON.parse(await exportProducts.getProductList());

            expect(productList).to.be.an('array');
            expect(productList).to.have.property('length');
        });

        it('should return with all products and their details', async function () {

            let productList = JSON.parse(await exportProducts.getProductList(true));

            expect(productList).to.be.an('object');
            expect(productList).to.have.property('apiProduct');
            expect(productList['apiProduct']).to.be.an('array');
            expect(productList['apiProduct'][0]).to.have.property('name');
        });
    });

    // describe('log', function () {
    //     it('should log', function () {
    //         exportProducts.justLog();
    //     });
    //
    // });
});