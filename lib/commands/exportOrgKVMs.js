/**
 * Created by Neeraj Wadhwa on 7/13/17.
 */


const promptCheckbox = require('prompt-checkbox');
const fs = require('fs');
const mkdirp = require('mkdirp');
const _ = require('lodash');

const utilsForExport = require('../utilsForExport');
const utils = require('../utils');
const options = require('../options');
const config = require('../../config');
const urlBuilder = require('../URLBuilders');


async function start() {

    let orgKvmList = [];

    try{
        orgKvmList = JSON.parse(await getOrgKvms());
    }
    catch (e){
        console.log("Error: ", e);
    }
    //prompt user here
    promptUser(orgKvmList);
}
// start();
module.exports.start = start;




async function getOrgKvms(){

    let url = urlBuilder.getKvmOrgPath(config.from.org);
    let requestObject = utilsForExport.requestForExport;
    requestObject.url = utilsForExport.requestForExport.baseurl + url;

    return await utils.makeRequest(requestObject, config.from.userid, config.from.passwd);
}

module.exports.getOrgKvms = getOrgKvms;



function promptUser(choices) {

    let promptObject = {
        name: "kvm",
        message: 'Choose the KVMs that are to be exported from org "' + config.from.org + '"',
        radio: true,
        choices: choices
    };

    let prompt = new promptCheckbox(promptObject);

    prompt.run().then(function (answers) {
        let uniqAnswers = _.uniq(answers);

       processAnswers(uniqAnswers);

    }).catch(function (e) {
        console.log("Error in prompt: ", e);
    });
}




function processAnswers(answers) {

    answers.forEach(async (ans)=>{
        let def = await getKvmDefinition(ans);
       saveKvm(config.from.org, ans, def);
    });
}




async function getKvmDefinition(kvmName) {
    let url = urlBuilder.getKvmOrgUrl(config.from.org, kvmName);
    let requestObject = utilsForExport.requestForExport;
    requestObject.url = utilsForExport.requestForExport.baseurl + url;

    return await utils.makeRequest(requestObject, config.from.userid, config.from.passwd);
}

module.exports.getKvmDefinition = getKvmDefinition;




function saveKvm(orgName, kvm, definition) {
    let dirToSave = options.dataDir.orgKvmDir + orgName + "/";

    mkdirp.sync(dirToSave);
    fs.writeFile(dirToSave + kvm + ".json", definition, function (err) {
        if (err) {
            console.log(err);
        }
        console.log('KVM "' + kvm + '" was saved successfully');
    });
}
