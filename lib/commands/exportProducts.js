/**
 * Created by Neeraj Wadhwa on 7/15/17.
 */


const promptCheckbox = require('prompt-checkbox');
const fs = require('fs');
const mkdirp = require('mkdirp');

const utilsForExport = require('../utilsForExport');
const utils = require('../utils');
const options = require('../options');
const config = require('../../config');
const urlBuilder = require('../URLBuilders');




async function start() {


    let productList;

    try {
        productList = JSON.parse(await getProductList(true));
    }
    catch (e) {
        return console.log("Error: ", e);
    }

    productList = productList.apiProduct;

    let productName = [];

    productList.forEach((product) => {
        productName.push(product.name);
    });

    promptUser(productName, productList);
}

// start();
module.exports.start = start;



async function getProductList(expand = false) {

    let url  =urlBuilder.getApiProductPath(config.from.org);
    let request = utilsForExport.requestForExport;
    request.url = utilsForExport.requestForExport.baseurl + url;
    request.qs = {
        expand: expand
    };
    try{
        return await utils.makeRequest(request, config.from.userid, config.from.passwd);
    }
    catch (e){
        return console.log(e);
    }
}

module.exports.getProductList = getProductList;




function saveDeveloper(product) {

    let dirToSave = options.dataDir.productDir;

    mkdirp.sync(dirToSave);
    fs.writeFile(dirToSave + product.name + ".json", JSON.stringify(product), function (err) {
        if (err) {
            console.log(err);
        }
        console.log('Developer "' + product.name + '" was saved successfully');
    });
}




function promptUser(promptChoices, productsData) {

    let promptObject = {
        name: "products",
        message: "Choose all the api products that are to be exported",
        radio: true,
        choices: promptChoices
    };

    let prompt = new promptCheckbox(promptObject);

    prompt.run().then(function (answers) {

        processAnswers(answers, productsData);

    }).catch(function (e) {
        console.log("Error in prompt: ", e);
    });
}



function processAnswers(answers, productsData) {
    answers.forEach((answer)=>{
        productsData.forEach((product)=>{
            if(answer === product.name){
                saveDeveloper(product);
            }
        })
    });
}

//
// function justLog() {
//     console.log("should log");
// }
//
// module.exports.justLog  =justLog;