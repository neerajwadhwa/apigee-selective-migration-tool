/**
 * Created by Neeraj Wadhwa on 7/5/17.
 */


const fs = require('fs');
const mkdirp = require('mkdirp');
const request = require('request');

const utilsForExports = require('../utilsForExport');
const inquirer = require('inquirer');
const urlBuilder = require('../URLBuilders');
const config = require('../../config');
const utils = require('../utils');
const options = require('../options');




function exportProxies(proxyList) {

    proxyList.forEach(async (proxy) => {

        let revisions;
        try{
            revisions = await getRevisionsForProxy(proxy);
        }
        catch (e){
            console.log("Error: ", e);
        }

        if(typeof revisions == "object" && revisions.length <= 0){
            console.log("Proxy " + proxy + " does not have any revisions");
        }

        if(!revisions){
            console.log("Didn't get any revisions, proxy name could be wrong");
        }

        let response = await getDeploymentDetailsForProxy(proxy);
        printDeploymentStatus(proxy, response);

        revisions.forEach(async (revision)=>{
            await exporter(proxy, revision);
        });
    });
}

module.exports.exportProxies = exportProxies;




async function getDeploymentDetailsForProxy(proxy) {

    return new Promise(async function (resolve, reject) {

        let url = urlBuilder.getProxyUrl(config.from.org, proxy);
        let requestObject = utilsForExports.requestForExport;
        requestObject.url = utilsForExports.requestForExport.baseurl + url + 'deployments/';

        let response = JSON.parse(await utils.makeRequest(requestObject, config.from.userid, config.from.passwd));
        resolve(response);
    });
}

module.exports.getDeploymentDetailsForProxy = getDeploymentDetailsForProxy;



function printDeploymentStatus(proxy, response) {

    if(response.environment.length === 0){
        return console.log('Proxy "' + proxy + '" is not deployed in any of the available environments');
    }

    console.log();
    console.log();
    console.log('Following is the deployment status for proxy "' + proxy + '"');
    console.log();
    response.environment.forEach((envDetails)=>{
        console.log('Environment => ' + envDetails.name);
        envDetails.revision.forEach((revision)=>{
            console.log('Revision ' + revision.name + ' => ' + revision.state);
        });
        console.log();
    });
}




async function exporter(proxyName, revision) {

    let url = urlBuilder.getProxyUrl(config.from.org, proxyName);

    let requestObject = utilsForExports.requestForExport;
    requestObject.url = utilsForExports.requestForExport.baseurl + url + 'revisions/' + revision;

    let pathToSave = options.dataDir.proxyDir + proxyName + '/' + revision;

    try{
        mkdirp.sync(pathToSave);
    }
    catch (e){
        return console.log("Directory creation failed, check permissions and try again.");
    }

    requestObject.qs = {format: "bundle"};

    request(requestObject).auth(config.from.userid, config.from.passwd)
        .pipe(fs.createWriteStream(pathToSave +  "/" + proxyName + '.zip'))
        .on('close', function () {
            console.log();
            console.log(proxyName + " saved to " + pathToSave);
        }).on('error', function (e) {
            console.log(e);
    });
}

module.exports.exporter = exporter;




function getRevisionsForProxy(proxyName) {

    return new Promise(async function (resolve, reject) {
        let url = urlBuilder.getProxyUrl(config.from.org, proxyName);
        let requestObject = utilsForExports.requestForExport;
        requestObject.url = utilsForExports.requestForExport.baseurl + url;

        let response;
        try{
            response = JSON.parse(await utils.makeRequest(requestObject, config.from.userid, config.from.passwd));
        }
        catch (e){
            console.log(e);
        }
        resolve(response.revision);
    });
}

module.exports.getRevisionsForProxy = getRevisionsForProxy;




async function start() {

    await utilsForExports.getListOfEntities("proxy").then(async (proxyList) => {

        proxyList = JSON.parse(proxyList);
        if(proxyList.length > 0){
            let promptObject = await utils.populateCheckBoxDisplay(proxyList, "export",
                'Select proxies to export from "' + config.from.org + '"');

            let answers = await inquirer.prompt(promptObject);
            //make calls for export here;
            // export property here and the name argument in populateCheckBoxDisplay are the same;
            exportProxies(answers.export);
        }
        else {
            console.log('No proxies were found in source org "' + config.from.org + '"')
        }

    }).catch(function (e) {
        return console.log("Error: ", e);
    });
}

module.exports.start = start;