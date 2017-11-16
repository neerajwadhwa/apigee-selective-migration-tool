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
const utils = require('../utils');
const options = require('../options');




async function start() {

    let pathProxyKvms = options.dataDir.proxyKvmDir;

    utils.getExportedEntities(pathProxyKvms).then(async (list)=>{

        if(list){

            let proxyList;
            try {
                proxyList = JSON.parse(await utilsForImport.getListOfEntities("proxy"));
            }
            catch (e){
                return console.log("Error: ", e);
            }

            let toBeImported = await checkForExistence(list, proxyList);
        }
        else {
            console.log("No exported proxy kvms were found.");
        }
    });
}

module.exports.start = start;
// start(pathProxyKvms);




async function checkForExistence(list, proxyList) {
    let exportedProxies = await extractProxyListFromExports(''+ list + '');

    let proxiesToCheckFor = _.intersection(exportedProxies, proxyList);

    let alreadyOnTarget = await getKVMsForSpecificProxies(proxiesToCheckFor);
    let exportedList = await extractNames(list);

    if(alreadyOnTarget.length > 0){

        let choices = _.uniq(intersect.big(exportedList, alreadyOnTarget));

        if(choices.length > 0){

            // let promptCompatibleChoices = await makePromptCompatibleChoices(list, proxiesToCheckFor, choices);
            //make the prompt object compatible here if possible
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
        message: 'These kvms were found in target proxies, select those which should be updated',
        radio: true,
        choices: promptChoices
    };

    let prompt = new promptCheckbox(promptObject);

    prompt.run().then(function (answers) {
        if(answers.length === 0){
            console.log("No kvms were tagged for update");
            //subtract prompt choices from listOfPaths
            importWithoutUpdate(listOfPaths, promptChoices);
        }
        else {
            let toBeUpdated = _.uniq(answers);
            processAnswers(toBeUpdated, listOfPaths);

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

    if(toBeImported.length > 0){
        let correctedPaths = await performCorrection(listOfPath, toBeImported);

        processImport(correctedPaths);
    }
    else{
        console.log("Everything is set up already");
    }
}




function processAnswers(answers, listOfPath) {

    answers.forEach(async (answer)=>{
        listOfPath.forEach(async (path)=>{
            let proxy = await extractProxyListFromExports('' + path + '');
            if(path.indexOf(answer) > -1 && path.indexOf(proxy[0] > -1)){
                updateKvms(path, proxy[0]);
            }
        })
    });
}





function updateKvms(kvmPath, proxy) {

    let kvmName = kvmPath.replace(/^.*[\\\/]/, '').slice(0, -5);

    let url = urlBuilder.getKvmProxyUrl(config.to.org, proxy, kvmName);
    let requestObject = utilsForImport.requestForImport;
    requestObject.url = utilsForImport.requestForImport.baseurl + url;
    requestObject.method = 'POST';
    requestObject.body = fs.readFileSync(kvmPath, 'utf8');

    utils.makePostRequest(requestObject, config.to.userid, config.to.passwd, function (err, res) {
        if(err){
            console.log('Error while uploading kvm "' + kvmName + '" to "' + proxy + '"');
            return console.log("Error is ", err, res.statusCode);
        }
        if(res.statusCode >= 400){
            console.log('Error while uploading kvm "' + kvmName + '" to "' + proxy + '"');
            return console.log("Error is " + res.statusCode + " " + res.statusMessage + "");
        }
        console.log('kvm "' + kvmName + '" was uploaded to "' + proxy + '"');
    });
}




function correctAndImport(listOfPaths, toBeImported) {

    listOfPaths.forEach((path)=>{
        toBeImported.forEach((readyToImport)=>{
            if(path.indexOf(readyToImport) > -1){
                importProxyKvms(path);
            }
        })
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




function processImport(listOfPath) {
    listOfPath.forEach(async (path)=>{
        let proxy = await extractProxyListFromExports('' + path + '');
        if(path.indexOf(proxy[0] > -1)){
            importProxyKvms(path, proxy);
        }
    })
}





function importProxyKvms(kvmPath, proxy) {

    let kvmName = kvmPath.replace(/^.*[\\\/]/, '').slice(0, -5);

    let url = urlBuilder.getKvmProxyPath(config.to.org, proxy);

    let requestObject = utilsForImport.requestForImport;
    requestObject.url = utilsForImport.requestForImport.baseurl + url;
    requestObject.method = 'POST';
    requestObject.body = fs.readFileSync(kvmPath, 'utf8');

    utils.makePostRequest(requestObject, config.to.userid, config.to.passwd, function (err, res) {
        if(err){
            console.log('Error while uploading kvm "' + kvmName + '" to "' + proxy + '"');
            return console.log("Error is ", err);
        }
        if(res.statusCode >= 400){
            console.log('Error while uploading kvm "' + kvmName + '" to "' + proxy + '"');
            return console.log("Error is " +  res.statusMessage + "");
        }
        console.log('Kvm "' + kvmName + '" was uploaded to "' + proxy + '"');
    });
}




function getKVMsForSpecificProxies(proxiesToCheckFor) {

    return new Promise(async function (resolve, reject) {

        let proxyList = [];

        for(let i = 0; i < proxiesToCheckFor.length; i++){
            let kvms = JSON.parse(await getProxyKvms(proxiesToCheckFor[i]));
            if(kvms.length > 0){
                proxyList.push(...kvms);
            }
        }
        resolve(proxyList);
    });
}

module.exports.getKVMsForSpecificProxies = getKVMsForSpecificProxies;




async function getProxyKvms(proxy) {

    let url = urlBuilder.getKvmProxyPath(config.to.org, proxy);
    let requestObject = utilsForImport.requestForImport;
    requestObject.url = utilsForImport.requestForImport.baseurl + url;

    return await utils.makeRequest(requestObject, config.to.userid, config.to.passwd);
}




function extractNames(exportedKvms) {

    return new Promise(function (resolve, reject) {
        let exportedList = [];
        exportedKvms.forEach((kvm)=>{
            let kvmPath = kvm.replace(/^.*[\\\/]/, '');
            //console.log(targetServerPath);
            let nameOfKvm = kvmPath.slice(0, -5);
            exportedList.push(nameOfKvm);
        });
        resolve(exportedList);
    });
}

module.exports.extractNames = extractNames;




function extractProxyListFromExports(str){
    return new Promise(function(resolve, reject){
        const regex = /\/[a-z].*\//g;
        let m;
        let proxyList = [];
        while ((m = regex.exec(str)) !== null) {
            // This is necessary to avoid infinite loops with zero-width matches
            if (m.index === regex.lastIndex) {
                regex.lastIndex++;
            }
            // The result can be accessed through the `m`-variable.
            m.forEach((match, groupIndex) => {
                let mat = match.split(',');
                mat.forEach((arr)=>{
                    let proxyName = arr.split('/')[2];
                    if(!_.includes(proxyList, proxyName)){
                        proxyList.push(proxyName);
                    }
                })
            });
        }
        resolve(proxyList);
    });
}

module.exports.extractProxyListFromExports = extractProxyListFromExports;