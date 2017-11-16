/**
 * Created by Neeraj Wadhwa on 7/12/17.
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

    let pathToTargetServers = options.dataDir.targetserverDir;

    utils.getExportedEntities(pathToTargetServers).then(async (list)=>{

        if(list){
            let envList;
            try {
                envList = JSON.parse(await utilsForImport.getListOfEnvironments());
            }
            catch (e){
                return console.log("Error: ", e);
            }

            let toBeImported = await checkForExistence(list, envList);
        }
        else {
           console.log("No exported target servers were found");
        }
    });
}

module.exports.start = start;
// start(pathToTargetServers);




function importTargetServers(targetServerPath, env) {

    let targetServerName = targetServerPath.replace(/^.*[\\\/]/, '').slice(0, -5);

    let url = urlBuilder.getTargetServerPath(config.to.org, env);

    let requestObject = utilsForImport.requestForImport;
    requestObject.url = utilsForImport.requestForImport.baseurl + url;
    requestObject.method = 'POST';
    requestObject.body = fs.readFileSync(targetServerPath, 'utf8');

    utils.makePostRequest(requestObject, config.to.userid, config.to.passwd, function (err, res) {
        if(err){
            console.log('Error while uploading target server "' + targetServerName + '" to "' + env + '"');
            return console.log("Error is ", err);
        }
        if(res.statusCode >= 400){
            console.log('Error while uploading target server "' + targetServerName + '" to "' + env + '"');
            return console.log("Error is " +  res.statusMessage + "");
        }
        console.log('Target server "' + targetServerName + '" was uploaded to "' + env + '"');
    });
}




function promptUser(promptChoices, listOfPaths, exportedList) {

    let promptObject = {
        name: "exists",
        message: 'These target servers were found in target env, select those which should be updated',
        radio: true,
        choices: promptChoices
    };

    let prompt = new promptCheckbox(promptObject);

    prompt.run().then(function (answers) {

        if(answers.length === 0){
            console.log("No target servers were tagged for update");
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


function correctAndImport(listOfPath, toBeImported) {
    toBeImported.forEach(async (answer)=>{
        listOfPath.forEach(async (path)=>{
            let env = await extractEnvListFromExports('' + path + '');
            if(path.indexOf(answer) > -1 && path.indexOf(env[0] > -1)){
                importTargetServers(path, env[0]);
            }
        })
    });
}



// function correctAndImport(listOfPaths, toBeImported) {
//
//     listOfPaths.forEach((path)=>{
//         toBeImported.forEach((readyToImport)=>{
//             if(path.indexOf(readyToImport) > -1){
//                 importOrgKvms(path);
//             }
//         })
//     });
// }




function extractEnvListFromExports(str){
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
                    let envName = arr.split('/')[2];
                    if(!_.includes(envList, envName)){
                        envList.push(envName);
                    }
                })
            });
        }
        resolve(envList);
    });
}

module.exports.extractEnvListFromExports = extractEnvListFromExports;





async function checkForExistence(list, envList) {
    let exportedEnvs = await extractEnvListFromExports(''+ list + '');

    let envsToCheckFor = _.intersection(exportedEnvs, envList);

    let alreadyOnTarget = await getTargetServersForSpecifiedEnvs(envsToCheckFor);
    let exportedList = await extractNames(list);

    if(alreadyOnTarget.length > 0){
        //make intersection
        let choices = _.uniq(intersect.big(exportedList, alreadyOnTarget));
        // let choices = intersect.big(exportedList, alreadyOnTarget);

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




function getTargetServersForSpecifiedEnvs(envsToCheckFor) {

    return new Promise(async function (resolve, reject) {

        let targetServerList = [];

        for(let i = 0; i < envsToCheckFor.length; i++){
            let targetServers = JSON.parse(await utilsForImport.getListOfTargetServers(envsToCheckFor[i]));
            if(targetServers.length > 0){
                targetServerList.push(...targetServers);
            }
        }
        resolve(targetServerList);
    });
}

module.exports.getTargetServersForSpecifiedEnvs = getTargetServersForSpecifiedEnvs;




function extractNames(exportedTargetServers) {

    return new Promise(function (resolve, reject) {
        let exportedList = [];
        exportedTargetServers.forEach((targetServer)=>{
            let targetServerPath = targetServer.replace(/^.*[\\\/]/, '');
            //console.log(targetServerPath);
            let nameOfTargetServer = targetServerPath.slice(0, -5);
            exportedList.push(nameOfTargetServer);
        });
        resolve(exportedList);
    });
}

module.exports.extractNames = extractNames;




function processAnswers(answers, listOfPath) {

    answers.forEach(async (answer)=>{
        listOfPath.forEach(async (path)=>{
            let env = await extractEnvListFromExports('' + path + '');
            if(path.indexOf(answer) > -1 && path.indexOf(env[0] > -1)){
                updateTargetServer(path, env[0]);
            }
        })
    });
}



function processImport(listOfPath) {
    listOfPath.forEach(async (path)=>{
        let env = await extractEnvListFromExports('' + path + '');
        if(path.indexOf(env[0] > -1)){
            importTargetServers(path, env);
        }
    })
}



function updateTargetServer(targetServerPath, env) {

    let targetServerName = targetServerPath.replace(/^.*[\\\/]/, '').slice(0, -5);

    let url = urlBuilder.getTargetServerUrl(config.to.org, env, targetServerName);
    let requestObject = utilsForImport.requestForImport;
    requestObject.url = utilsForImport.requestForImport.baseurl + url;
    requestObject.method = 'PUT';
    requestObject.body = fs.readFileSync(targetServerPath, 'utf8');

    utils.makePostRequest(requestObject, config.to.userid, config.to.passwd, function (err, res) {
        if(err){
            console.log('Error while uploading target server "' + targetServerName + '"' +  ' to "' + env + '"');
            return console.log("Error is ", err);
        }
        if(res.statusCode >= 400){
            console.log('Error while uploading target server ' + '"' + targetServerName + '" to "' + env + '"');
            return console.log("Error is " +  res.statusMessage + "");
        }
        console.log('Target server "' + targetServerName + '"' +  ' was uploaded to "' + env + '"');
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