/**
 * Created by Neeraj Wadhwa on 7/27/17.
 */
/**
 * Created by Neeraj Wadhwa on 7/6/17.
 */


const request = require('request');
const _ = require('lodash');
const fs = require('fs');
const colors = require('colors');
const intersect = require('intersect');

const utilsForImport = require('../utilsForImport');
const utilsForExport = require('../utilsForExport');
const inquirer = require('inquirer');
const urlBuilder = require('../URLBuilders');
const config = require('../../config');
const utils = require('../utils');
const options = require('../options');




async function start() {

    let pathToProxies = options.dataDir.proxyDir;

    utils.getExportedEntities(pathToProxies).then(async (list)=>{
        if(list){

            let toBeImported = await checkForExistence(list);
            if(list[0] === toBeImported[0]){

                toBeImported.forEach(async (proxy)=>{
                    await revisionManagement(proxy);
                });
            }
            else {

                let taggerForImport = await performCorrection(list, toBeImported);

                if (taggerForImport.length <= 0) {
                    return console.log("No proxies were tagged for import");
                }

                taggerForImport.forEach(async (proxy) => {

                    await revisionManagement(proxy);
                });
            }
        }
        else{
            return console.log("No exported proxies were found");
        }
    }).catch(function (e) {
        console.log(e);
    });
}

// start();

module.exports.start = start;




function importProxy(proxy) {

    return new Promise( function (resolve, reject) {
        let proxyPath = proxy.replace(/^.*[\\\/]/, '');
        let nameOfProxy = proxyPath.slice(0, -4);

        let formData = {
            'file': fs.createReadStream(proxy)
        };

        let url = utilsForImport.requestForImport.baseurl + urlBuilder.getProxyPath(config.to.org);

        let req = {
            url: url,
            method: "POST",
            qs: {
                action: "import",
                name: nameOfProxy
            },
            headers: {
                'Content-Type': "multipart/form-data"
            },
            formData: formData
        };

        utils.makePostRequest(req, config.to.userid, config.to.passwd, function (err, res) {
            if(err){
                console.log(colors.red('Error while uploading proxy "' + nameOfProxy + '"' +  ' to "' + config.to.org + '"'));
                console.log("Error is ", err);
                resolve();
            }
            if(res.statusCode >= 400){
                console.log(res.statusCode);
                // throw res.statusMessage;
                // console.log(colors.red('Error while uploading proxy ' + '"' + nameOfProxy + '" to "' + config.to.org + '"'));
                console.log(colors.red("Error is " +  res.statusMessage + ""));
                resolve();
            }
            else if(res.statusCode === 201){
                console.log(colors.green('Proxy "' + nameOfProxy + '"' +  ' was uploaded to "' + config.to.org + '"'));
                resolve();
            }
        });
    });
}




function checkForExistence(exportedProxies) {

    return new Promise(async function (resolve, reject) {

        let exportedList = await extractNames(exportedProxies);
        let url = urlBuilder.getProxyPath(config.to.org);
        let requestObject =  utilsForImport.requestForImport;
        requestObject.url = utilsForImport.requestForImport.baseurl + url;

        let alreadyOnTarget = JSON.parse(await utils.makeRequest(requestObject, config.to.userid, config.to.passwd));

        if(alreadyOnTarget.length > 0){

            let choices = intersect.big(exportedList, alreadyOnTarget);
            //prompt with exists
            let promptObject = utils.createPromptObject('exists', 'These proxies already exist in the target org "' + config.to.org + '"');
            utils.populateCheckBoxWithSeparator(promptObject, choices, "Select proxies that should be imported again", "");
            let answers = await inquirer.prompt(promptObject);

            let toBeImported = _.difference(exportedList, _.difference(alreadyOnTarget, answers.exists));
            resolve(toBeImported);
        }
        else{
            console.log('Nothing found on the target org "' + config.to.org + '"');
            resolve(exportedProxies);
        }
    });
}





function extractNames(exportedProxies) {

    return new Promise(function (resolve, reject) {
        let exportedList = [];
        exportedProxies.forEach((proxy)=>{
            let proxyPath = proxy.replace(/^.*[\\\/]/, '');
            //console.log(proxyPath);
            let nameOfProxy = proxyPath.slice(0, -4);
            exportedList.push(nameOfProxy);
        });
        resolve(_.sortedUniq(exportedList));
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




async function revisionManagement(proxyPath) {

    let proxyName = await extractNames([proxyPath]);
    let revision = await extractInfoFromExports('' + proxyPath + '', 3);
    revision = parseInt(revision.toString());
    proxyName = proxyName.toString();

    if(revision == 1){
        await importProxy(proxyPath);
    }
    else {
        let revisionsOnTarget = await getRevisionsForProxyFromTarget(proxyName);

        if(!revisionsOnTarget){
            // no revisions

            for(let i = 1; i <= revision; i++){

                await importProxy(proxyPath);
            }
            await deleteExtraRevisions(proxyPath);
        }
        else {
            // revisions found

            revisionsOnTarget = revisionsOnTarget.revision;
            // let maxRevisionOnTarget = parseInt(revisionsOnTarget[revisionsOnTarget.length - 1]);
            revisionsOnTarget = revisionsOnTarget.map(parseInt);
            revisionsOnTarget.sort(function (a, b) {
                return a - b;
            });
            let maxRevisionOnTarget = revisionsOnTarget[revisionsOnTarget.length - 1];

            for(let i = maxRevisionOnTarget + 1; i <= revision; i++) {
                await importProxy(proxyPath);
            }
            await deleteExtraRevisions(proxyPath);
        }
    }
}




function getRevisionsForProxyFromTarget(proxyName) {

    return new Promise(async function (resolve, reject) {
        let url = urlBuilder.getProxyUrl(config.to.org, proxyName);
        let requestObject = utilsForImport.requestForImport;
        requestObject.url = utilsForImport.requestForImport.baseurl + url;

        request(requestObject, function (err, res, body) {

            if(err){
                console.log("Error: ", err);
                resolve();
            }

            if(res.statusCode === 200){
                resolve(JSON.parse(body));
            }

            resolve();

        }).auth(config.to.userid, config.to.passwd, true);
    });
}





function extractInfoFromExports(str, location){
    return new Promise(function(resolve, reject){
        const regex = /\/[a-z].*\//g;
        let m;
        let envList = [];
        while ((m = regex.exec(str)) !== null) {
            // This is necessary to avoid infinite loops with zero-width matches
            if (m.index === regex.lastIndex) {
                regex.lastIndex++;
            }
            // The result can be accessed through the `m`-variable.
            m.forEach((match, groupIndex) => {
                let mat = match.split(',');
                mat.forEach((arr)=>{
                    let envName = arr.split('/')[location];
                    if(!_.includes(envList, envName)){
                        envList.push(envName);
                    }
                })
            });
        }
        resolve(envList);
    });
}



function getRevisionsForProxyFromSource(proxyName) {

    return new Promise(async function (resolve, reject) {
        let url = urlBuilder.getProxyUrl(config.from.org, proxyName);
        let requestObject = utilsForExport.requestForExport;
        requestObject.url = utilsForExport.requestForExport.baseurl + url;

        request(requestObject, function (err, res, body) {

            if(err){
                console.log("Error: ", e);
                resolve();
            }

            if(res.statusCode === 200){
                resolve(JSON.parse(body));
            }

            resolve();

        }).auth(config.from.userid, config.from.passwd, true);
    });
}




function deleteExtraRevisions(proxyPath) {

    return new Promise(async function (resolve, reject) {

        let proxyName = proxyPath.replace(/^.*[\\\/]/, '').slice(0, -4);

        let url = urlBuilder.getProxyUrl(config.to.org, proxyName) + 'revisions/';
        let response = await getRevisionsForProxyFromSource(proxyName);

        if(response){
            let revisionsFromSource = response.revision;
            let responseFromTarget = await getRevisionsForProxyFromTarget(proxyName);
            let revisionsFromTarget = responseFromTarget.revision;

            let revisionsToBeDeleted = _.difference(revisionsFromTarget, revisionsFromSource);

            if(revisionsToBeDeleted.length > 0){
                revisionsToBeDeleted.forEach((revision)=>{

                    let requestObject = utilsForImport.requestForImport;
                    requestObject.url = utilsForImport.requestForImport.baseurl + url + revision;
                    requestObject.method = 'DELETE';

                    utils.makePostRequest(requestObject, config.to.userid, config.to.passwd, function (err, res) {
                        if(err){
                            return console.log("Error occurred: ", err);
                        }
                        if(res.statusCode >= 400){
                            return console.log("Error from Management APIs: ", res.statusMessage);
                        }
                        if(res.statusCode === 200){
                            console.log('Extra revision "' + revision + '" deleted for "' + proxyName +'"');
                        }
                    });
                });
                resolve()
            }
        }
    });
}