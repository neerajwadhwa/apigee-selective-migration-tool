/**
 * Created by Neeraj Wadhwa on 7/15/17.
 */



const _ = require('lodash');
const fs = require('fs');
const intersect = require('intersect');
const promptCheckbox = require('prompt-checkbox');

const utilsForImport = require('../utilsForImport');
const urlBuilder = require('../URLBuilders');
const config = require('../../config');
const options = require('../options');
const utils = require('../utils');




async function start() {

    let pathProducts = options.dataDir.productDir;

    utils.getExportedEntities(pathProducts).then(async (list)=>{

        if(list){
            let toBeImported = await checkForExistence(list);
        }
        else {
            console.log('No exported products were found for "' + config.from.org + '"');
        }
    });
}

module.exports.start = start;
// start(pathProducts);




async function checkForExistence(list) {

    let alreadyOnTarget;
    try {
        alreadyOnTarget = JSON.parse(await getProductList());
    }
    catch (e){
        console.log("Error: ", e);
    }

    if(alreadyOnTarget.length > 0){

        let exportedList = await extractNames(list);
        let choices = intersect.big(exportedList, alreadyOnTarget);

        if(choices.length > 0){

            promptUser(list, choices, exportedList);
        }

        else {
            //import everything here directly;
            processImport(list);
        }

    }
    else {
        console.log('Nothing found in target org "' + config.to.org + '"');
        //import everything here directly;
        processImport(list);
    }
}




async function getProductList(expand = false) {

    let url  =urlBuilder.getApiProductPath(config.to.org);
    let request = utilsForImport.requestForImport;
    request.url = utilsForImport.requestForImport.baseurl + url;
    request.qs = {
        expand: expand
    };
    try{
        return await utils.makeRequest(request, config.to.userid, config.to.passwd);
    }
    catch (e){
        return console.log(e);
    }
}

module.exports.getProductList = getProductList;




function extractNames(exportedProducts) {

    return new Promise(function (resolve, reject) {
        let exportedList = [];
        exportedProducts.forEach((product)=>{
            let productPath = product.replace(/^.*[\\\/]/, '');
            //console.log(targetServerPath);
            let prodName = productPath.slice(0, -5);
            exportedList.push(prodName);
        });
        resolve(exportedList);
    });
}

module.exports.extractNames = extractNames;




function promptUser(listOfPaths, promptChoices, exportedList) {

    let promptObject = {
        name: "exists",
        message: 'These products were found in target org, select those which should be updated',
        radio: true,
        choices: promptChoices
    };

    let prompt = new promptCheckbox(promptObject);

    prompt.run().then(function (answers) {

        if(answers.length === 0){
            console.log("No products were tagged for update");
            //subtract prompt choices from listOfPaths
            importWithoutUpdate(listOfPaths, promptChoices);
        }
        else {
            //these are to be updated
            processAnswers(listOfPaths, answers);

            let toBeImported = _.difference(exportedList, promptChoices);

            if(toBeImported.length > 0){
                correctAndImport(listOfPaths, toBeImported)
            }
            else{
                console.log("We don't have anything new to import");
            }
        }
    }).catch(function (e) {
        console.log("Error in prompt: ", e);
    });
}




async function importWithoutUpdate(listOfPath, promptChoices) {

    let exportedList = await extractNames(listOfPath);

    let toBeImported = _.difference(exportedList, promptChoices);

    if (toBeImported.length > 0) {
        let correctedPaths = await performCorrection(listOfPath, toBeImported);

        processImport(correctedPaths);
    }
    else {
        console.log("Everything is set up already");
    }
}




function performCorrection(withPath, withoutPath) {

    return new Promise(function (resolve, reject) {
        let uniqueWithoutPath = _.sortedUniq(withoutPath);
        let toBeImported = [];
        withPath.forEach((path)=>{
            uniqueWithoutPath.forEach((unique)=>{
                if(path.indexOf(unique) > -1){
                    toBeImported.push(path);
                }
            });
        });
        resolve(toBeImported);
    });
}

module.exports.performCorrection = performCorrection;




function processAnswers(listOfPaths, answers) {

    listOfPaths.forEach((path)=>{
        answers.forEach((answer)=>{
            if(path.indexOf(answer) > -1){
                updateProducts(path);
            }
        });
    })
}



function correctAndImport(listOfPaths, toBeImported) {

    listOfPaths.forEach((path)=>{
        toBeImported.forEach((readyToImport)=>{
            if(path.indexOf(readyToImport) > -1){
                importProducts(path);
            }
        })
    });
}



function processImport(listOfPath) {
    listOfPath.forEach(async (path)=>{
        importProducts(path);
    })
}



function importProducts(productPath) {

    let productName = productPath.replace(/^.*[\\\/]/, '').slice(0, -5);
    let url = urlBuilder.getApiProductPath(config.to.org);

    let requestObject = utilsForImport.requestForImport;
    requestObject.url = utilsForImport.requestForImport.baseurl + url;
    requestObject.method = 'POST';
    requestObject.body = fs.readFileSync(productPath, 'utf8');

    utils.makePostRequest(requestObject, config.to.userid, config.to.passwd, function (err, res) {
        if(err){
            console.log('Error while uploading api product "' + productName + '" to "' + config.to.org + '"');
            return console.log("Error is ", err);
        }
        if(res.statusCode >= 400){
            console.log('Error while uploading api product "' + productName + '" to "' + config.to.org + '"');
            return console.log("Error is " +  res.statusMessage + "");
        }
        console.log('Api product "' + productName + '" was uploaded to "' + config.to.org + '"');
    });
}



function updateProducts(productPath) {

    let productName = productPath.replace(/^.*[\\\/]/, '').slice(0, -5);
    let url = urlBuilder.getApiProductUrl(config.to.org, productName);

    let requestObject = utilsForImport.requestForImport;
    requestObject.url = utilsForImport.requestForImport.baseurl + url;
    requestObject.method = 'PUT';
    requestObject.body = fs.readFileSync(productPath, 'utf8');

    utils.makePostRequest(requestObject, config.to.userid, config.to.passwd, function (err, res) {
        if(err){
            console.log('Error while updating api product "' + productName + '" to "' + config.to.org + '"');
            return console.log("Error is ", err);
        }
        if(res.statusCode >= 400){
            console.log('Error while updating api product "' + productName + '" to "' + config.to.org + '"');
            return console.log("Error is " +  res.statusMessage + "");
        }
        console.log('Api product "' + productName + '" was successfully updated in "' + config.to.org + '"');
    });
}