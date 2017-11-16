/**
 * Created by Neeraj Wadhwa on 7/17/17.
 */


const _ = require('lodash');
const fs = require('fs');
const intersect = require('intersect');
const promptCheckbox = require('prompt-checkbox');
const request = require('request');

const utilsForImport = require('../utilsForImport');
const urlBuilder = require('../URLBuilders');
const config = require('../../config');
const options = require('../options');
const utils = require('../utils');




async function start() {

    let pathDevApps = options.dataDir.appsDir;

    utils.getExportedEntities(pathDevApps).then(async (list)=>{

        if(list){

            let developerList;
            try {
                developerList = JSON.parse(await getListOfDevelopers());
            }
            catch (e){
                console.log("Error: ", e);
            }

            let toBeImported = await checkForExistence(list, developerList);
        }
        else {
            console.log('No exported developer apps were found for "' + config.from.org + '"');
        }
    });
}

module.exports.start = start;
// start(pathDevApps);




async function getListOfDevelopers(expand = false) {
    let url  =urlBuilder.getDeveloperPath(config.to.org);
    let requestObject = utilsForImport.requestForImport;
    requestObject.url = utilsForImport.requestForImport.baseurl + url;
    requestObject.qs = {
        expand: expand
    };
    try{
        return await utils.makeRequest(requestObject, config.to.userid, config.to.passwd);
    }
    catch (e){
        return console.log(e);
    }
}

module.exports.getListOfDevelopers = getListOfDevelopers;




async function checkForExistence(list, devList) {
    let exportedDevs = await extractDevListFromExports(''+ list + '');

    let devsToCheckFor = _.intersection(exportedDevs, devList);

    let alreadyOnTarget = await getAppsForSpecificDevs(devsToCheckFor);
    let exportedList = await extractNames(list);

    if(alreadyOnTarget.length > 0){
        //make intersection
        let choices = _.uniq(intersect.big(exportedList, alreadyOnTarget));

        if(choices.length > 0){

            promptUser(choices, list, exportedList);
        }
        else {
            processImport(list);
        }
    }
    else {
        //import everything that we have without any prompt;
        processImport(list);
    }
}





function promptUser(promptChoices, listOfPaths, exportedList) {

    let promptObject = {
        name: "exists",
        message: 'These developer apps were found in target org, select those which should be updated',
        radio: true,
        choices: promptChoices
    };

    let prompt = new promptCheckbox(promptObject);

    prompt.run().then(function (answers) {

        if(answers.length === 0){
            console.log("No apps were tagged for update");

            // subtract prompt choices from listOfPaths
            importWithoutUpdate(listOfPaths, promptChoices);
        }
        else {
            let toBeUpdated = _.uniq(answers);
            processAnswers(toBeUpdated, listOfPaths);

            // let toBeImported = _.difference(exportedList, promptChoices);
            //
            // if(toBeImported.length > 0){
            //     correctAndImport(listOfPaths, toBeImported)
            // }
            // else{
            //     console.log("We don't have anything new to import");
            // }
        }
    }).catch(function (e) {
        console.log("Error in prompt: ", e);
    });
}



function processAnswers(answers, listOfPath) {

    answers.forEach(async (answer)=>{
        listOfPath.forEach(async (path)=>{
            let dev = await extractDevListFromExports('' + path + '');
            if(path.indexOf(answer) > -1 && path.indexOf(dev[0] > -1)){
                updateDeveloperApps(path, dev[0]);
            }
        })
    });
}




function updateDeveloperApps(appPath, dev) {

    let appName = appPath.replace(/^.*[\\\/]/, '').slice(0, -5);

    let appDetails;
    let callbackURL;
    let attributes;
    try {
        appDetails = JSON.parse(fs.readFileSync(appPath, 'utf8'));
        callbackURL = appDetails.callbackUrl;
        attributes = appDetails.attributes;

        let url = urlBuilder.getDevApplicationUrl(config.to.org, dev, appName);
        let requestObject = utilsForImport.requestForImport;
        requestObject.url = utilsForImport.requestForImport.baseurl + url;
        requestObject.method = 'PUT';
        requestObject.body = {
            "name": appName,
            "callbackUrl": callbackURL,
            "attributes": attributes
        };

        utils.makePostRequest(requestObject, config.to.userid, config.to.passwd, async function (err, res) {
            if(err){
                console.log('Error while updating app "' + appName + '" for "' + dev + '"');
                return console.log("Error is ", err, res.statusCode);
            }
            if(res.statusCode >= 400){
                console.log('Error while updating app "' + appName + '" for "' + dev + '"');
                return console.log("Error is " + res.statusCode + " " + res.statusMessage + "");
            }

            if(res.statusCode === 200){

                //delete auto-generated api key
                importExistingKeys(dev, appName, appPath);
            }

            console.log('Developer app "' + appName + '" was updated for "' + dev + '"');
        });
    }
    catch (e){
        console.log("Error :", e)
    }
}




async function importWithoutUpdate(listOfPath, promptChoices) {

    let exportedList = await extractNames(listOfPath);

    let toBeImported = _.difference(exportedList, promptChoices);

    if(toBeImported.length > 0){
        let correctedPaths = await performCorrection(listOfPath, toBeImported);

        processImport(correctedPaths);
    }
    else{
        console.log("Everything is set up already");
    }
}




function processImport(listOfPath) {
    listOfPath.forEach(async (path)=>{
        let dev = await extractDevListFromExports('' + path + '');
        if(path.indexOf(dev[0] > -1)){
            importDevApplication(path, dev);
        }
    })
}




function importDevApplication(appPath, dev) {

    let appName = appPath.replace(/^.*[\\\/]/, '').slice(0, -5);

    let url = urlBuilder.getDevApplicationPath(config.to.org, dev);

    let requestObject = utilsForImport.requestForImport;
    requestObject.url = utilsForImport.requestForImport.baseurl + url;
    requestObject.method = 'POST';
    requestObject.body = fs.readFileSync(appPath, 'utf8');

    utils.makePostRequest(requestObject, config.to.userid, config.to.passwd, async function (err, res) {
        if(err){
            console.log('Error while uploading app "' + appName + '" for "' + dev + '"');
            return console.log("Error is ", err);
        }

        if(res.statusCode >= 400){
            console.log('Error while uploading app "' + appName + '" for "' + dev + '"');
            return console.log("Error is " +  res.statusMessage + "");
        }

        if(res.statusCode === 201){

            //delete auto-generated api key
            await deleteApiKey(dev, appName, JSON.parse(res.body).credentials[0].consumerKey);

            importExistingKeys(dev, appName, appPath);
        }

        console.log('Developer application "' + appName + '" was uploaded for "' + dev + '"');
    });
}



function deleteApiKey(dev, appName, consumerKey){

    return new Promise(function (resolve, reject) {
        let url = urlBuilder.getDevApplicationUrl(config.to.org, dev, appName);

        let requestObject = utilsForImport.requestForImport;
        requestObject.url = utilsForImport.requestForImport.baseurl + url + 'keys/' + consumerKey;
        requestObject.method = "DELETE";

        request.delete(requestObject, function (err, res, body) {

            if(err){
                return console.log('Error in deleting auto-generated keys for the "' + appName + '"');
            }

            if (res.statusCode === 200){
                console.log('Deleted the auto generated keys for "' + appName + '"');
            }
        }).auth(config.to.userid, config.to.passwd, true);

        resolve();
    });
}




function importExistingKeys(dev, appName, appPath) {

    return new Promise(function (resolve, reject) {

        let appDetails;
        try {
            appDetails = JSON.parse(fs.readFileSync(appPath, 'utf8'));

            for(let i = 0; i < appDetails.credentials.length; i++){

                let consumerSecret = appDetails.credentials[i].consumerSecret;
                let consumerKey = appDetails.credentials[i].consumerKey;

                let url = urlBuilder.getDevApplicationUrl(config.to.org, dev, appName);

                let requestObject = utilsForImport.requestForImport;
                requestObject.url = utilsForImport.requestForImport.baseurl + url + 'keys/create';
                requestObject.method = "POST";
                requestObject.body = {
                    "consumerKey": consumerKey,
                    "consumerSecret": consumerSecret
                };
                requestObject.json = true;

                request(requestObject, function (err, res, body) {
                    if(err){
                        console.log('Error in importing existing consumer key for "' + appName + '"');
                        console.log(err);
                    }
                    if (res.statusCode === 201){
                        console.log('Consumer key was added for "' + appName + '"');

                        //need to call this here to make it sync or won't work
                        associateProductsWithKeys(dev, appName, appPath);
                    }
                }).auth(config.to.userid, config.to.passwd, true);
            }
            resolve();
        }
        catch (e){
            console.log("Error: ", e);
            resolve();
        }
    });
}




function associateProductsWithKeys(dev, appName, appPath) {

    return new Promise(function (resolve, reject) {

        let appDetails;
        try {
            appDetails = JSON.parse(fs.readFileSync(appPath, 'utf8'));

            for(let j = 0; j < appDetails.credentials.length; j++){

                let attributes = appDetails.credentials[j].attributes;

                let apiProdsDetails = appDetails.credentials[j].apiProducts;
                let consumerKey = appDetails.credentials[j].consumerKey;

                let apiProducts = [];
                for(let i = 0; i < apiProdsDetails.length; i++){
                    apiProducts.push(apiProdsDetails[i].apiproduct);
                }
                // apiProdsDetails.forEach((prodDetails)=>{
                //     apiProducts.push(prodDetails.apiproduct);
                // });

                let url = urlBuilder.getDevApplicationUrl(config.to.org, dev, appName);

                let requestObject = utilsForImport.requestForImport;
                requestObject.url = utilsForImport.requestForImport.baseurl + url + 'keys/' + consumerKey;
                requestObject.method = "POST";
                requestObject.body = {
                    "apiProducts": apiProducts,
                    "attributes": attributes
                };
                requestObject.json = true;

                request(requestObject, function (err, res, body) {

                    if(err){
                        console.log('Error in adding api products for "' + appName + '"');
                        console.log(err);
                    }

                    if (res.statusCode === 200){
                        console.log('Api products were associated with the existing key for "' + appName + '"');
                    }

                }).auth(config.to.userid, config.to.passwd, true);
            }
            resolve();
        }
        catch (e){
            console.log("Error: ", e);
            resolve();
        }
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




function getAppsForSpecificDevs(devsToCheckFor) {

    return new Promise(async function (resolve, reject) {

        let appList = [];

        for(let i = 0; i < devsToCheckFor.length; i++){
            let apps = JSON.parse(await getListOfApps(devsToCheckFor[i]));
            if(apps.length > 0){
                appList.push(...apps);
            }
        }
        resolve(appList);
    });
}




async function getListOfApps(developer, expand = false) {

    let url = urlBuilder.getDevApplicationPath(config.to.org, developer);
    let requestObject = utilsForImport.requestForImport;
    requestObject.url = utilsForImport.requestForImport.baseurl + url;
    requestObject.qs = {
        expand : expand
    };

    try{
        return await utils.makeRequest(requestObject, config.to.userid, config.to.passwd);
    }
    catch (e){
        console.log("Error: ", e);
    }
}




function extractNames(exportedApps) {

    return new Promise(function (resolve, reject) {
        let exportedList = [];
        exportedApps.forEach((app)=>{
            let appPath = app.replace(/^.*[\\\/]/, '');
            //console.log(targetServerPath);
            let nameOfApp = appPath.slice(0, -5);
            exportedList.push(nameOfApp);
        });
        resolve(exportedList);
    });
}

module.exports.extractNames = extractNames;




function extractDevListFromExports(str){
    return new Promise(function(resolve, reject){
        const regex = /\/[a-z].*\//g;
        let m;
        let devList = [];
        while ((m = regex.exec(str)) !== null) {
            // This is necessary to avoid infinite loops with zero-width matches
            if (m.index === regex.lastIndex) {
                regex.lastIndex++;
            }
            // The result can be accessed through the `m`-variable.
            m.forEach((match, groupIndex) => {
                let mat = match.split(',');
                mat.forEach((arr)=>{
                    let devName = arr.split('/')[2];
                    if(!_.includes(devList, devName)){
                        devList.push(devName);
                    }
                })
            });
        }
        resolve(devList);
    });
}

module.exports.extractDevListFromExports = extractDevListFromExports;