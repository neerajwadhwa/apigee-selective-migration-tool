/**
 * Created by Neeraj Wadhwa on 7/13/17.
 */


const promptCheckbox = require('prompt-checkbox');
const fs = require('fs');
const mkdirp = require('mkdirp');

const utilsForExport = require('../utilsForExport');
const utils = require('../utils');
const options = require('../options');
const config = require('../../config');
const urlBuilder = require('../URLBuilders');


async function start() {

    let usersList = [];

    try{
        usersList = JSON.parse(await getUsers());
    }
    catch (e){
        console.log("Error: ", e);
    }

    //prompt user here
    promptUser(usersList);
}
// start();
module.exports.start = start;




async function getUsers(){

    let url = urlBuilder.getUserPath();
    let requestObject = utilsForExport.requestForExport;
    requestObject.url = utilsForExport.requestForExport.baseurl + url;

    return await utils.makeRequest(requestObject, config.from.userid, config.from.passwd);
}

module.exports.getUsers = getUsers;




function promptUser(choices) {

    let promptObject = {
        name: "user",
        message: 'Choose the users that are to be exported from org "' + config.from.org,
        radio: true,
        choices: choices
    };

    let prompt = new promptCheckbox(promptObject);

    prompt.run().then(function (answers) {
        // let uniqAnswers = _.uniq(answers);
        processAnswers(answers);

    }).catch(function (e) {
        console.log("Error in prompt: ", e);
    });
}



function processAnswers(answers) {

    answers.forEach(async (ans)=>{
        let def = await getUserDefinition(ans);
        saveUser(config.from.org, ans, def);
    });
}




async function getUserDefinition(user) {
    let url = urlBuilder.getUserUrl(user);
    let requestObject = utilsForExport.requestForExport;
    requestObject.url = utilsForExport.requestForExport.baseurl + url;

    return await utils.makeRequest(requestObject, config.from.userid, config.from.passwd);
}

module.exports.getUserDefinition = getUserDefinition;




function saveUser(orgName, user, def) {

    let dirToSave = options.dataDir.userDir + orgName + "/";

    mkdirp.sync(dirToSave);
    fs.writeFile(dirToSave + user + ".json", def, function (err) {
        if (err) {
            console.log(err);
        }
        console.log('User "' + user + '" was saved successfully');
    });
}