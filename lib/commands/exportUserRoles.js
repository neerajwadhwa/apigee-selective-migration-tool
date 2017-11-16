/**
 * Created by Neeraj Wadhwa on 7/18/17.
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

    let userRoleList = [];

    try{
        userRoleList = JSON.parse(await getUserRoles());
    }
    catch (e){
       return console.log("Error: ", e);
    }

    if(userRoleList.length > 0){
        promptUser(userRoleList);
    }
    else {
        console.log('No user roles were found in "' + config.from.org + '"');
    }
}
// start();
module.exports.start = start;




async function getUserRoles() {

    let url = urlBuilder.getUserRolePath(config.from.org);
    let requestObject = _.clone(utilsForExport.requestForExport);
    requestObject.url = utilsForExport.requestForExport.baseurl + url;
    return await utils.makeRequest(requestObject, config.from.userid, config.from.passwd);
}

module.exports.getUserRoles = getUserRoles;




function promptUser(choices) {

    let promptObject = {
        name: "userroles",
        message: 'Choose the user roles that are to be exported from "' + config.from.org + '"',
        radio: true,
        choices: choices
    };

    let prompt = new promptCheckbox(promptObject);

    prompt.run().then(function (answers) {

        processAnswers(answers);

    }).catch(function (e) {
        console.log("Error in prompt: ", e);
    });
}




function processAnswers(answers) {

    answers.forEach(async (ans)=>{

        if(ans === "devadmin"){
            //will give 403 if we try the operations that are being performed below
        }
        else {
            getAndSaveUsersForUserRole(ans);
            getAndSaveResourcePermissionsForUserRole(ans);
        }
    });
}




async function getAndSaveUsersForUserRole(userrole) {

    let users;
    try {
        users = JSON.parse(await getUsersForUserRole(userrole));
    }
    catch (e){
        console.log("Error: ", e);
    }

    if(users.length > 0){
        saveUsersForUserRole(users, userrole);
    }
    else {
        console.log('No users were associated with "' + userrole + '"');
    }
}




async function getUsersForUserRole(userrole) {

    let url = urlBuilder.getUserRoleUrl(config.from.org, userrole) + 'users/';
    let requestObject = _.clone(utilsForExport.requestForExport);
    requestObject.url = utilsForExport.requestForExport.baseurl + url;
    return await utils.makeRequest(requestObject, config.from.userid, config.from.passwd);
}

module.exports.getUsersForUserRole = getUsersForUserRole;




async function getAndSaveResourcePermissionsForUserRole(userrole) {

    let permissions;
    try {
        permissions = await getResourcePermissionsForUserRole(userrole);
    }
    catch (e){
        console.log("Error: ", e);
    }

    if(permissions){
        saveResourcePermissionsForUserRole(permissions, userrole);
    }
    else {
        console.log('No permissions were found for ' + userrole + '"')
    }
}




async function getResourcePermissionsForUserRole(userrole) {

    let url = urlBuilder.getUserRoleUrl(config.from.org, userrole) + 'permissions/';
    let requestObject = utilsForExport.requestForExport;
    requestObject.url = utilsForExport.requestForExport.baseurl + url;
    return await utils.makeRequest(requestObject, config.from.userid, config.from.passwd);
}

module.exports.getResourcePermissionsForUserRole = getResourcePermissionsForUserRole;





function saveUsersForUserRole(users, userrole) {

    users.forEach((user)=>{
        saveUserForUserRole(user, userrole);
    });
}




function saveUserForUserRole(user, userrole) {

    let dirToSave = options.dataDir.userrole + userrole + "/users/";

    mkdirp.sync(dirToSave);
    fs.writeFile(dirToSave + user + ".json", user, function (err) {
        if (err) {
            console.log(err);
        }
        console.log('User "' + user + '" was saved successfully for "' + userrole + '"');
    });
}




function saveResourcePermissionsForUserRole(permissions, userrole) {

    let dirToSave = options.dataDir.userrole + userrole + "/resourcePermissions/";

    mkdirp.sync(dirToSave);
    fs.writeFile(dirToSave + 'permissions' + ".json", permissions, function (err) {
        if (err) {
            console.log(err);
        }
        console.log('Resource permissions were saved successfully for "' + userrole + '"');
    });
}
