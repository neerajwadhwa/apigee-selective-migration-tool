/**
 * Created by Neeraj Wadhwa on 7/14/17.
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

    let listOfProxies;
    try {
        listOfProxies = JSON.parse(await utilsForExport.getListOfEntities("proxy"));
    }
    catch (e){
        console.log("Error : ", e);
    }

    let promises = [];

    listOfProxies.forEach((proxy)=>{
        promises.push(processProxy(proxy));
    });

    let out = await Promise.all(promises);

    let proxiesWithKvms = await correctUndefinedEntries(out);

    let promptCompatibleObject = await makePromptCompatibleChoice(proxiesWithKvms);

    promptUser(promptCompatibleObject);
}

// start();
module.exports.start = start;




async function getProxyKvms(proxy) {

    let url = urlBuilder.getKvmProxyPath(config.from.org, proxy);
    let requestObject = utilsForExport.requestForExport;
    requestObject.url = utilsForExport.requestForExport.baseurl + url;

    return await utils.makeRequest(requestObject, config.from.userid, config.from.passwd);
}

module.exports.getProxyKvms= getProxyKvms;




async function  processProxy(proxy) {

    let res;
    try {
        res = JSON.parse(await getProxyKvms(proxy));
        if(res.length  > 0){
            return {[proxy]: res}
        }
    }
    catch (e){
        console.log("Error: ", e);
    }
}

module.exports.processProxy = processProxy;




function correctUndefinedEntries(arr) {
    return new Promise(function (resolve, reject) {

        let newArray = [];

        arr.forEach((el)=>{
            if(el !== undefined){
                newArray.push(el);
            }
        });
        resolve(newArray);
    });
}

module.exports.correctUndefinedEntries = correctUndefinedEntries;




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
        let proxies = await getProxyNameForKVM(answer, promptChoices);

        proxies.forEach(async (proxy)=>{
            let def = await getKvmDefinition(proxy, answer);
            saveKvm(proxy, answer, def);
        });
    });
}




function getProxyNameForKVM(kvmName, promptChoices) {

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

module.exports.getProxyNameForKVM = getProxyNameForKVM;



async function getKvmDefinition(proxy, answer) {
    let url = urlBuilder.getKvmProxyUrl(config.from.org, proxy, answer);
    let requestObject = utilsForExport.requestForExport;
    requestObject.url = utilsForExport.requestForExport.baseurl + url;

    return await utils.makeRequest(requestObject, config.from.userid, config.from.passwd);
}


function saveKvm(proxy, kvm, definition) {
    let dirToSave = options.dataDir.proxyKvmDir + proxy + "/";

    mkdirp.sync(dirToSave);
    fs.writeFile(dirToSave + kvm + ".json", definition, function (err) {
        if (err) {
            console.log(err);
        }
        console.log('KVM "' + kvm + '" was saved successfully');
    });
}

