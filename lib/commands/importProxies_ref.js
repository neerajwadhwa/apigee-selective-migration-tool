/**
 * Created by Neeraj Wadhwa on 7/6/17.
 */


const request = require('request');
const _ = require('lodash');
const fs = require('fs');
const colors = require('colors');
const intersect = require('intersect');

const utilsForImport = require('../utilsForImport');
const inquirer = require('inquirer');
const urlBuilder = require('../URLBuilders');
const config = require('../../config');
const utils = require('../utils');
const options = require('../options');




async function start() {

    let pathToProxies = options.dataDir.proxyDir;

    utils.getExportedEntities(pathToProxies).then(async (list)=>{
        if(list){
            let toBeImported = await checkForExistence(list);
            if(list[0] === toBeImported[0]){
                importProxies(toBeImported);
            }
            else {
                let taggerForImport = await performCorrection(list, toBeImported);
                if(taggerForImport.length <= 0){
                    return console.log("No proxies were tagged for import");
                }
                importProxies(taggerForImport);
            }
        }
        else{
            return console.log("No exported proxies were found");
        }
    }).catch(function (e) {
        console.log(e);
    });
}

module.exports.start = start;




function importProxies(proxyList) {

    proxyList.forEach(async (proxy) => {

        let proxyPath = proxy.replace(/^.*[\\\/]/, '');
        let nameOfProxy = proxyPath.slice(0, -4);
        //console.log(nameOfProxy);

        let formData = {
            'file': fs.createReadStream(proxy)
        };

        let url = utilsForImport.requestForImport.baseurl + urlBuilder.getProxyPath(config.to.org);

        let req = {
            url: url,
            method: "POST",
            qs: {
                action: "import",
                name: nameOfProxy
            },
            headers: {
                'Content-Type': "multipart/form-data"
            },
            formData: formData
        };

        utils.makePostRequest(req, config.to.userid, config.to.passwd, function (err, res) {
            if(err){
                console.log(colors.red('Error while uploading proxy "' + nameOfProxy + '"' +  ' to "' + config.to.org + '"'));
                return console.log("Error is ", err);
            }
            if(res.statusCode >= 400){
                console.log(colors.red('Error while uploading proxy ' + '"' + nameOfProxy + '" to "' + config.to.org + '"'));
                return console.log(colors.red("Error is " +  res.statusMessage + ""));
            }
            console.log(colors.green('Proxy "' + nameOfProxy + '"' +  ' was uploaded to "' + config.to.org + '"'));
        })
    });
}





function checkForExistence(exportedProxies) {

    return new Promise(async function (resolve, reject) {

        let exportedList = await extractNames(exportedProxies);
        let url = urlBuilder.getProxyPath(config.to.org);
        let requestObject =  utilsForImport.requestForImport;
        requestObject.url = utilsForImport.requestForImport.baseurl + url;

        let alreadyOnTarget = JSON.parse(await utils.makeRequest(requestObject, config.to.userid, config.to.passwd));

        if(alreadyOnTarget.length > 0){

            let choices = intersect.big(exportedList, alreadyOnTarget);
            //prompt with exists
            let promptObject = utils.createPromptObject('exists', 'These proxies already exist in the target org "' + config.to.org + '"');
            utils.populateCheckBoxWithSeparator(promptObject, choices, "Select proxies that should be imported again", "");
            let answers = await inquirer.prompt(promptObject);

            let toBeImported = _.difference(exportedList, _.difference(alreadyOnTarget, answers.exists));
            resolve(toBeImported);
        }
        else{
            console.log('Nothing found on the target org "' + config.to.org + '"');
            resolve(exportedProxies);
        }
    });
}





function extractNames(exportedProxies) {

    return new Promise(function (resolve, reject) {
        let exportedList = [];
        exportedProxies.forEach((proxy)=>{
            let proxyPath = proxy.replace(/^.*[\\\/]/, '');
            //console.log(proxyPath);
            let nameOfProxy = proxyPath.slice(0, -4);
            exportedList.push(nameOfProxy);
        });
        resolve(_.sortedUniq(exportedList));
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