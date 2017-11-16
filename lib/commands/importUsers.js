/**
 * Created by Neeraj Wadhwa on 7/14/17.
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

    let pathUsers = options.dataDir.userDir;

    utils.getExportedEntities(pathUsers).then(async (list)=>{

        if(list){
            await checkForExistence(list);
        }
        else {
            console.log('No exported users were found for "' + config.from.org + '"');
        }
    });
}

module.exports.start = start;
// start(pathUsers);




async function checkForExistence(list) {

    let alreadyOnTarget;
    try {
        alreadyOnTarget = JSON.parse(await getUsers());
    }
    catch (e){
        console.log("Error: ", e);
    }

    if(alreadyOnTarget.length > 0){

        let exportedList = await extractNames(list);
        let choices = intersect.big(exportedList, alreadyOnTarget);

        if(choices.length > 0){
            //prompt user
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



function extractNames(exportedUsers) {

    return new Promise(function (resolve, reject) {
        let exportedList = [];
        exportedUsers.forEach((user)=>{
            let userPath = user.replace(/^.*[\\\/]/, '');
            //console.log(targetServerPath);
            let userId = userPath.slice(0, -5);
            exportedList.push(userId);
        });
        resolve(exportedList);
    });
}

module.exports.extractNames = extractNames;




async function getUsers(){
    let url = urlBuilder.getUserPath();
    let requestObject = utilsForImport.requestForImport;
    requestObject.url = utilsForImport.requestForImport.baseurl + url;

    return await utils.makeRequest(requestObject, config.to.userid, config.to.passwd);
}

module.exports.getUsers = getUsers;




function promptUser(listOfPaths, promptChoices, exportedList) {

    let promptObject = {
        name: "exists",
        message: 'These users were found in target org, select those which should be updated',
        radio: true,
        choices: promptChoices
    };

    let prompt = new promptCheckbox(promptObject);

    prompt.run().then(function (answers) {
        if(answers.length === 0){
            console.log("No users were tagged for update");
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




function processImport(listOfPath) {
    listOfPath.forEach(async (path)=>{
        importUsers(path);
    })
}




function importUsers(userPath) {

    let userId = userPath.replace(/^.*[\\\/]/, '').slice(0, -5);

    let url = urlBuilder.getUserPath();

    let requestObject = utilsForImport.requestForImport;
    requestObject.url = utilsForImport.requestForImport.baseurl + url;
    requestObject.method = 'POST';
    requestObject.body = fs.readFileSync(userPath, 'utf8');

    utils.makePostRequest(requestObject, config.to.userid, config.to.passwd, function (err, res) {
        if(err){
            console.log('Error while uploading user "' + userId + '" to "' + config.to.org + '"');
            return console.log("Error is ", err);
        }
        if(res.statusCode >= 400){
            console.log('Error while uploading user "' + userId + '" to "' + config.to.org + '"');
            return console.log("Error is " +  res.statusMessage + "");
        }
        console.log('User "' + userId + '" was uploaded to "' + config.to.org + '"');
    });
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
                updateOrgKvms(path);
            }
        });
    })
}





function updateOrgKvms(userPath) {

    let userId = userPath.replace(/^.*[\\\/]/, '').slice(0, -5);

    let url = urlBuilder.getUserUrl(userId);

    let requestObject = utilsForImport.requestForImport;
    requestObject.url = utilsForImport.requestForImport.baseurl + url;
    requestObject.method = 'POST';
    requestObject.body = fs.readFileSync(userPath, 'utf8');

    utils.makePostRequest(requestObject, config.to.userid, config.to.passwd, function (err, res) {
        if(err){
            console.log('Error while uploading user "' + userId + '" to "' + config.to.org + '"');
            return console.log("Error is ", err);
        }
        if(res.statusCode >= 400){
            console.log('Error while uploading user "' + userId + '" to "' + config.to.org + '"');
            return console.log("Error is " +  res.statusMessage + "");
        }
        console.log('User "' + userId + '" was uploaded to "' + config.to.org + '"');
    });
}




function correctAndImport(listOfPaths, toBeImported) {

    listOfPaths.forEach((path)=>{
        toBeImported.forEach((readyToImport)=>{
            if(path.indexOf(readyToImport) > -1){
                importUsers(path);
            }
        })
    });
}
