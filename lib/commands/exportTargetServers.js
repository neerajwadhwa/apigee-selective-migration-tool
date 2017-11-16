/**
 * Created by Neeraj Wadhwa on 7/12/17.
 */




const promptCheckbox = require('prompt-checkbox');
const fs = require('fs');
const async = require('async');
const mkdirp = require('mkdirp');
const forEachAsync = require('forEachAsync').forEachAsync;
const objectForeach = require('object-foreach');
const _ = require('lodash');

const utilsForExport = require('../utilsForExport');
const utils = require('../utils');
const options = require('../options');
const config = require('../../config');




async function start() {

    let envList;
    try {
        envList = JSON.parse(await utilsForExport.getListOfEnvironments());
    }
    catch (e) {
        return console.log("Error: ", e);
    }

    // let env = provideEnvironment(envList);

    let promises = [];

    envList.forEach(async (env)=>{
        promises.push(processEnvironment(env));
    });

    let out = await Promise.all(promises);

    let promptObject = await makePromptCompatibleChoice(out);

    await promptUser(promptObject);
}

// start();
module.exports.start = start;




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



async function processEnvironment(env) {

    try{
        let targetServerList = JSON.parse(await utilsForExport.getListOfTargetServers(env));
        return {[env]: targetServerList}
    }
    catch (e) {
        console.log("Error: ", e);
    }
}

module.exports.processEnvironment = processEnvironment;



function promptUser(promptChoices) {

    let promptObject = {
        name: "targetserver",
        message: "Choose target servers that are to be exported",
        radio: true,
        choices: promptChoices
    };

    let prompt = new promptCheckbox(promptObject);

    prompt.run().then(function (answers) {

        let uniqAnswers = _.uniq(answers);
        processAnswers(uniqAnswers, promptChoices);

    }).catch(function (e) {
        console.log("Error in prompt: ", e);
    });
}


function processAnswers(answers, promptChoices) {

    answers.forEach(async (answer)=>{
        let envs = await getEnvForAnswer(answer, promptChoices);

        envs.forEach(async (env)=>{
            let def = await utilsForExport.getTargetServer(env, answer);
            saveTargetServer(env, answer, def);
        });


        //this is for the case if target server name is unique for all envs
        // let def = await utilsForExport.getTargetServer(env, answer);
        // saveTargetServer(env, answer, def);
        // let def = await getCacheDefinition(env, answer);
    });
}

module.exports.processAnswers = processAnswers;




function saveTargetServer(env, targetServer, definition) {
    let dirToSave = options.dataDir.targetserverDir + env + "/";

    mkdirp.sync(dirToSave);
    fs.writeFile(dirToSave + targetServer + ".json", definition, function (err) {
        if (err) {
            console.log(err);
        }
        console.log('Target server "' + targetServer + '" was saved successfully.');
    });
}

module.exports.saveTargetServer = saveTargetServer;



//use this in case there are target servers with the same name in different envs.
function getEnvForAnswer(targetServerName, promptChoices) {

    return new Promise(function (resolve, reject) {
        let envs = [];
        objectForeach(promptChoices, function (val, prop, obj) {
            if(_.includes(val, targetServerName)){
                envs.push(prop);
            }
        });
        Promise.all(envs).resolve(resolve(envs));
    });
}

module.exports.getEnvForAnswer = getEnvForAnswer;

// function getEnvForAnswer(targetServerName, promptChoices) {
//
//     return new Promise(function (resolve, reject) {
//         objectForeach(promptChoices, function (val, prop, obj) {
//             if(_.includes(val, targetServerName)){
//                 resolve(prop);
//             }
//         });
//     });
// }