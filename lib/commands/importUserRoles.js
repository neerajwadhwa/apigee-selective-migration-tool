/**
 * Created by Neeraj Wadhwa on 7/18/17.
 */


const _ = require('lodash');
const fs = require('fs');
const intersect = require('intersect');

const utilsForImport = require('../utilsForImport');
const urlBuilder = require('../URLBuilders');
const config = require('../../config');
const options = require('../options');
const utils = require('../utils');




async function start() {

    let pathUserRoles = options.dataDir.userrole;

    utils.getExportedEntities(pathUserRoles).then(async (list)=>{

        if(list){
            processList(list);
        }
        else {
            console.log('No exported user roles were found for "' + config.from.org + '"');
        }
    });
}

module.exports.start = start;
// start(pathUserRoles);



async function processList(list) {

    //get all the roles here

    let rolesList = await extractUserRolesFromExports('' + list + '');

    let rolesAlreadyOnTarget = JSON.parse(await getUserRoles());

    let rolesToCheckFor = _.difference(rolesList, rolesAlreadyOnTarget);

    if(rolesToCheckFor.length > 0){
        await createRoles(rolesToCheckFor, list);
    }
    else {
        associateUsersWithUserRoles(list);
        console.log("Don't have any new users to create");
    }
}




function createRoles(rolesList, list) {

    let rolesBody = {};
    rolesBody.role = [];

    rolesList.forEach((role) => {

        if (_.includes(["orgadmin", "readonlyadmin", "opsadmin", "businessuser", "user"], role)) {
            // leave the default roles
        }
        else {
            rolesBody.role.push({"name": role});
        }
    });

    let url = urlBuilder.getUserRolePath(config.to.org);
    let requestObject = utilsForImport.requestForImport;
    requestObject.url = utilsForImport.requestForImport.baseurl + url;
    requestObject.method = "POST";
    requestObject.body = rolesBody;
    requestObject.json = true;

    utils.makePostRequest(requestObject, config.to.userid, config.to.passwd, function (err, res) {
        if (err) {
            console.log('Error while uploading user roles in "' + config.to.org + '"');
            return console.log("Error is ", err);
        }

        if (res.statusCode >= 400) {
            console.log('Error while uploading user roles in  "' + config.to.org + '"');
            return console.log("Error is " + res.statusMessage + "");
        }

        if (res.statusCode === 201) {

            // import resource permissions

            // associate users with roles
            associateUsersWithUserRoles(list);
        }
        console.log('User roles were uploaded to "' + config.to.org + '"');
    });
}




function associateUsersWithUserRoles(list){

    list.forEach((path)=>{
        if(path.indexOf('users') > -1 && path.indexOf('@') > -1){
            addUserToRole(path);
        }
    });
}




function addUserToRole(path) {

    let roleName = path.match(/^.*[\\\/]/);
    roleName = roleName.toString();
    roleName = roleName.split('/')[2];
    let userId = path.replace(/^.*[\\\/]/, '').slice(0, -5);

    let url = urlBuilder.getUserRoleUrl(config.to.org, roleName) + "users";

    //make new obj here to make sure we don't have data from previous calls
    let requestObject = {
        url: utilsForImport.requestForImport.baseurl + url,
        method: 'POST',
        qs : {
            id: userId
        },
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    };

    utils.makePostRequest(requestObject, config.to.userid, config.to.passwd, function (err, res) {

        if(err){
            console.log('Error while adding user "' + userId + '" as "' + roleName + '"');
            return console.log("Error is ", err);
        }
        if(res.statusCode >= 400){
            console.log('Error while adding user "' + userId + '" as "' + roleName + '"');
            return console.log("Error is " +  res.statusMessage);
        }

        if(res.statusCode === 200){
            console.log('User "' + userId + '" was added as "' + roleName + '"');
        }
    });
}




async function getUserRoles() {

    let url = urlBuilder.getUserRolePath(config.to.org);
    let requestObject = utilsForImport.requestForImport;
    requestObject.url = utilsForImport.requestForImport.baseurl + url;
    return await utils.makeRequest(requestObject, config.to.userid, config.to.passwd);
}

module.exports.getUserRoles = getUserRoles;




function extractUserRolesFromExports(str){
    return new Promise(function(resolve, reject){
        const regex = /\/[a-z].*\//g;
        let m;
        let userRoleList = [];
        while ((m = regex.exec(str)) !== null) {
            // This is necessary to avoid infinite loops with zero-width matches
            if (m.index === regex.lastIndex) {
                regex.lastIndex++;
            }
            // The result can be accessed through the `m`-variable.
            m.forEach((match, groupIndex) => {
                let mat = match.split(',');
                mat.forEach((arr)=>{
                    let roleName = arr.split('/')[2];
                    if(!_.includes(userRoleList, roleName)){
                        userRoleList.push(roleName);
                    }
                })
            });
        }
        resolve(userRoleList);
    });
}

module.exports.extractUserRolesFromExports = extractUserRolesFromExports;