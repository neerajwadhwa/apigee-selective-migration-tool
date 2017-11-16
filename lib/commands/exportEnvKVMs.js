/**
 * Created by Neeraj Wadhwa on 7/13/17.
 */



const promptCheckbox = require('prompt-checkbox');
const fs = require('fs');
const mkdirp = require('mkdirp');
const objectForeach = require('object-foreach');
const _ = require('lodash');

const utilsForExport = require('../utilsForExport');
const utils = require('../utils');
const options = require('../options');
const config = require('../../config');
const urlBuilder = require('../URLBuilders');




async function start() {

    let envList;
    try {
        envList = JSON.parse(await utilsForExport.getListOfEnvironments());
    }
    catch (e) {
        return console.log("Error: ", e);
    }

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
        let kvmList = JSON.parse(await getListOfKvms(env));
        return {[env]: kvmList}
    }
    catch (e) {
        console.log("Error: ", e);
    }
}

module.exports.processEnvironment = processEnvironment;




async function getListOfKvms(env) {
    let url = urlBuilder.getKvmEnvPath(config.from.org, env);
    let requestObject = utilsForExport.requestForExport;
    requestObject.url = utilsForExport.requestForExport.baseurl + url;

    return await utils.makeRequest(requestObject, config.from.userid, config.from.passwd);
}

module.exports.getListOfKvms = getListOfKvms;




function promptUser(promptChoices) {

    let promptObject = {
        name: "kvm",
        message: "Choose the KVMs that are to be exported",
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
            let def = await getKvmDefinition(env, answer);
            saveKvm(env, answer, def);
        });
    });
}

module.exports.processAnswers = processAnswers;




async function getKvmDefinition(env, answer) {
    let url = urlBuilder.getKvmEnvUrl(config.from.org, env, answer);

    let requestObject = utilsForExport.requestForExport;
    requestObject.url = utilsForExport.requestForExport.baseurl + url;

    return await utils.makeRequest(requestObject, config.from.userid, config.from.passwd);
}

module.exports.getKvmDefinition = getKvmDefinition;




function saveKvm(env, kvm, definition) {
    let dirToSave = options.dataDir.envKvmDir + env + "/";

    mkdirp.sync(dirToSave);
    fs.writeFile(dirToSave + kvm + ".json", definition, function (err) {
        if (err) {
            console.log(err);
        }
        console.log('KVM "' + kvm + '" was saved successfully');
    });
}

module.exports.saveKvm = saveKvm;



//use this in case there are kvms with the same name in different envs.
function getEnvForAnswer(kvmName, promptChoices) {

    return new Promise(function (resolve, reject) {
        let envs = [];
        objectForeach(promptChoices, function (val, prop, obj) {
            if(_.includes(val, kvmName)){
                envs.push(prop);
            }
        });
        Promise.all(envs).resolve(resolve(envs));
    });
}

module.exports.getEnvForAnswer = getEnvForAnswer;

// function getEnvForAnswer(cacheName, promptChoices) {
//
//     return new Promise(function (resolve, reject) {
//         objectForeach(promptChoices, function (val, prop, obj) {
//             if(_.includes(val, cacheName)){
//                 resolve(prop);
//             }
//         });
//     });
// }