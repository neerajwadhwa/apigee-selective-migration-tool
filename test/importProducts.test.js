/**
 * Created by Neeraj Wadhwa on 7/26/17.
 */

const chai = require('chai');

const config = require('../config');
const options = require('../lib/options');
const utils = require('../lib/utils');

const importProducts = require('../lib/commands/importProducts');


let expect = chai.expect;



describe('Testing importProducts', function () {

    describe('Testing getProductList(expand = false)', function () {

        this.timeout(10000);

        it('should return back with a list of products', async function () {

            let prodList = JSON.parse(await importProducts.getProductList());

            expect(prodList).to.be.an('array');
            expect(prodList).to.have.property('length');
        });

        it('should return back an object containing products with extra information', async function () {

            let prodList = JSON.parse(await importProducts.getProductList(true));

            expect(prodList).to.be.an('object');
            expect(prodList).to.have.property('apiProduct');
        });
    });

    describe('Testing extractNames(exportedApps)', function () {

        this.timeout(10000);

        it('should extract product names from the paths provided', async function () {

            let prodNames = ['helloworld', 'login-app-product', 'webserver-product.com'];

            list = ['data/apiProducts/helloworld.json',
                    'data/apiProducts/login-app-product.json',
                    'data/apiProducts/webserver-product.json' ];

            let extractedNames = await importProducts.extractNames(list);

            expect(extractedNames).to.be.an('array');
            expect(extractedNames).to.include(...prodNames);
        });
    });

    describe('Testing performCorrection(withPath, withoutPath)', function () {

        this.timeout(10000);

        it('should provide a list of full paths for provided product names', async function () {

            list = ['data/apiProducts/helloworld.json',
                    'data/apiProducts/login-app-product.json',
                    'data/apiProducts/webserver-product.json' ];

            let needPath = ['helloworld', 'login-app-product'];

            let withPath = await importProducts.performCorrection(list, needPath);

            expect(withPath).to.be.an('array');
            expect(withPath[0]).to.include(...needPath);
        });
    });
});