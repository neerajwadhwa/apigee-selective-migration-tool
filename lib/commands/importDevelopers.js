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

    let pathDevelopers = options.dataDir.developerDir;

    utils.getExportedEntities(pathDevelopers).then(async (list)=>{

        if(list){

            let toBeImported = await checkForExistence(list);
        }
        else {
            console.log('No exported developers were found for "' + config.from.org + '"');
        }
    });
}

module.exports.start = start;
// start(pathDevelopers);




async function checkForExistence(list) {

    let alreadyOnTarget;
    try {
        alreadyOnTarget = JSON.parse(await getListOfDevelopers());
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




async function getListOfDevelopers(expand = false) {
    let url  =urlBuilder.getDeveloperPath(config.to.org);
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

module.exports.getListOfDevelopers = getListOfDevelopers;




function extractNames(exportedDevelopers) {

    return new Promise(function (resolve, reject) {
        let exportedList = [];
        exportedDevelopers.forEach((developer)=>{
            let developerPath = developer.replace(/^.*[\\\/]/, '');
            //console.log(targetServerPath);
            let devId = developerPath.slice(0, -5);
            exportedList.push(devId);
        });
        resolve(exportedList);
    });
}

module.exports.extractNames = extractNames;




function promptUser(listOfPaths, promptChoices, exportedList) {

    let promptObject = {
        name: "exists",
        message: 'These developers were found in target org, select those which should be updated',
        radio: true,
        choices: promptChoices
    };

    let prompt = new promptCheckbox(promptObject);

    prompt.run().then(function (answers) {

        if(answers.length === 0){
            console.log("No developers were tagged for update");
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
                updateDevelopers(path);
            }
        });
    })
}



function correctAndImport(listOfPaths, toBeImported) {

    listOfPaths.forEach((path)=>{
        toBeImported.forEach((readyToImport)=>{
            if(path.indexOf(readyToImport) > -1){
                importDevelopers(path);
            }
        })
    });
}



function processImport(listOfPath) {
    listOfPath.forEach(async (path)=>{
        importDevelopers(path);
    })
}



function importDevelopers(devPath) {

    let devId = devPath.replace(/^.*[\\\/]/, '').slice(0, -5);
    let url = urlBuilder.getDeveloperPath(config.to.org);

    let requestObject = utilsForImport.requestForImport;
    requestObject.url = utilsForImport.requestForImport.baseurl + url;
    requestObject.method = 'POST';
    requestObject.body = fs.readFileSync(devPath, 'utf8');

    utils.makePostRequest(requestObject, config.to.userid, config.to.passwd, function (err, res) {
        if(err){
            console.log('Error while uploading developer "' + devId + '" to "' + config.to.org + '"');
            return console.log("Error is ", err);
        }
        if(res.statusCode >= 400){
            console.log('Error while uploading developer "' + devId + '" to "' + config.to.org + '"');
            return console.log("Error is " +  res.statusMessage + "");
        }
        console.log('Developer "' + devId + '" was uploaded to "' + config.to.org + '"');
    });
}



function updateDevelopers(devPath) {

    let devId = devPath.replace(/^.*[\\\/]/, '').slice(0, -5);
    let url = urlBuilder.getDeveloperUrl(config.to.org, devId);

    let requestObject = utilsForImport.requestForImport;
    requestObject.url = utilsForImport.requestForImport.baseurl + url;
    requestObject.method = 'PUT';
    requestObject.body = fs.readFileSync(devPath, 'utf8');

    utils.makePostRequest(requestObject, config.to.userid, config.to.passwd, function (err, res) {
        if(err){
            console.log('Error while updating developer "' + devId + '" to "' + config.to.org + '"');
            return console.log("Error is ", err);
        }
        if(res.statusCode >= 400){
            console.log('Error while updating developer "' + devId + '" to "' + config.to.org + '"');
            return console.log("Error is " +  res.statusMessage + "");
        }
        console.log('Developer "' + devId + '" was successfully updated in "' + config.to.org + '"');
    });
}