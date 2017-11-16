/**
 * Created by Neeraj Wadhwa on 7/16/17.
 */



const promptCheckbox = require('prompt-checkbox');
const fs = require('fs');
const objectForeach = require('object-foreach');
const mkdirp = require('mkdirp');
const _ = require('lodash');

const utilsForExport = require('../utilsForExport');
const utils = require('../utils');
const options = require('../options');
const config = require('../../config');
const urlBuilder = require('../URLBuilders');




async function start() {


    let developerList;

    try {
        developerList = JSON.parse(await getListOfDevelopers(false));
    }
    catch (e) {
        return console.log("Error: ", e);
    }

    let promises = [];

    developerList.forEach((developer)=>{
        promises.push(getAppsForDeveloper(developer));
    });

    let out = await Promise.all(promises);

    let promptObject = await makePromptCompatibleChoice(out);

    await promptUser(promptObject);
}

// start();
module.exports.start = start;




async function getListOfDevelopers(expand = false) {
    let url  =urlBuilder.getDeveloperPath(config.from.org);
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

module.exports.getListOfDevelopers = getListOfDevelopers;




async function getAppsForDeveloper(developer) {

    try{
        let appList = JSON.parse(await getListOfApps(developer));
        return {[developer]: appList}
    }
    catch (e) {
        console.log("Error: ", e);
    }
}

module.exports.getAppsForDeveloper = getAppsForDeveloper;




async function getListOfApps(developer, expand = false) {

    let url = urlBuilder.getDevApplicationPath(config.from.org, developer);
    let request = utilsForExport.requestForExport;
    request.url = utilsForExport.requestForExport.baseurl + url;
    request.qs = {
        expand : expand
    };

    try{
        return await utils.makeRequest(request, config.from.userid, config.from.passwd);
    }
    catch (e){
        console.log("Error: ", e);
    }
}

module.exports.getListOfApps = getListOfApps;





function makePromptCompatibleChoice(arr){
    return new Promise(function(resolve, reject){
        let newObject = {};
        arr.forEach((ob)=>{

            objectForeach(ob, function (val, prop, ob) {
                newObject[prop] = val;
            });
        });
        resolve(newObject);
    });
}

module.exports.makePromptCompatibleChoice = makePromptCompatibleChoice;




function promptUser(promptChoices) {

    let promptObject = {
        name: "devapps",
        message: "Choose all the developer apps that are to be exported",
        radio: true,
        choices: promptChoices
    };

    let prompt = new promptCheckbox(promptObject);

    prompt.run().then(function (answers) {

        processAnswers(answers, promptChoices);

    }).catch(function (e) {
        console.log("Error in prompt: ", e);
    });
}



function processAnswers(answers, promptChoices) {

    answers.forEach(async (answer)=>{
        let devs = await getDeveloperForApp(answer, promptChoices);

        let def = JSON.parse(await getAppDetails(devs[0], answer));

        saveApp(devs[0], answer, def);

        // devs.forEach(async (dev)=>{
        //     try{
        //         let defs = JSON.parse(await getListOfApps(dev, true));
        //
        //         defs = defs.app;
        //         defs.forEach((def)=>{
        //             saveApp(dev, answer, def);
        //         });
        //         // console.log(defs.app[0])
        //     }
        //     catch (e){
        //         console.log("Error: ", e);
        //     }
        // });
    });
}



function getDeveloperForApp(devName, promptChoices) {

    return new Promise(function (resolve, reject) {
        let developers = [];
        objectForeach(promptChoices, function (val, prop, obj) {

            if(_.includes(val, devName)){
                developers.push(prop);
            }
        });
        Promise.all(developers).resolve(resolve(developers));
    });
}

module.exports.getDeveloperForApp = getDeveloperForApp;




function saveApp(dev, app, definition) {
    let dirToSave = options.dataDir.appsDir + dev + "/";

    mkdirp.sync(dirToSave);
    fs.writeFile(dirToSave + app + ".json", JSON.stringify(definition), function (err) {
        if (err) {
            console.log(err);
        }
        console.log('Developer Application "' + app + '" was saved successfully');
    });
}



async function getAppDetails(dev, answer) {

    let url = urlBuilder.getDevApplicationUrl(config.from.org, dev, answer);
    let request = utilsForExport.requestForExport;
    request.url = utilsForExport.requestForExport.baseurl + url;

    try{
        return await utils.makeRequest(request, config.from.userid, config.from.passwd);
    }
    catch (e){
        console.log("Error: ", e);
    }
}

module.exports.getAppDetails = getAppDetails;