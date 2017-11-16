/**
 * Created by Neeraj Wadhwa on 7/28/17.
 */

const _ = require('lodash');
const objectForeach = require('object-foreach');
const promptCheckbox = require('prompt-checkbox');

const config = require('../../config');
const urlBuilder = require('../URLBuilders');
const utils = require('../utils');
const utilsForExport = require('../utilsForExport');
const utilsForImport = require('../utilsForImport');




async function start() {

    let proxiesOnTarget = JSON.parse(await utilsForImport.getListOfEntities('proxy'));
    let proxiesOnSource = JSON.parse(await utilsForExport.getListOfEntities('proxy'));

    let choicesForDeploy =  _.intersection(proxiesOnSource, proxiesOnTarget);

    let promises = [];

    choicesForDeploy.forEach(async (choice)=>{

        promises.push(processProxy(choice));
    });

    let out = await Promise.all(promises);

    let promptObject = await makePromptCompatibleChoice(out);

    let answers = await promptUser(promptObject);

    if(answers.length > choicesForDeploy.length){
        console.log("Incorrect input, please choose one revision (max) for each proxy");
    }
    else {
        processPromptAnswers(answers);
    }
}

// start();
module.exports.start = start;




async function processProxy(proxy) {

    let revisionsFromTarget = await getRevisionsForProxy(proxy);
    let deploymentDetailsFromSource = await getDeploymentDetailsForProxy(proxy);

    let promptCompatibleRevisions = [];
    revisionsFromTarget.forEach((revision)=>{
        promptCompatibleRevisions.push(revision + '-' + proxy);
    });

    let key = proxy + ' ( already deployed in ' + config.from.org + ' => ' + deploymentDetailsFromSource + ' )';

    return {[key]: promptCompatibleRevisions}
}




function getRevisionsForProxy(proxyName) {

    return new Promise(async function (resolve, reject) {
        let url = urlBuilder.getProxyUrl(config.to.org, proxyName);
        let requestObject = utilsForImport.requestForImport;
        requestObject.url = utilsForImport.requestForImport.baseurl + url;

        let response;
        try{
            response = JSON.parse(await utils.makeRequest(requestObject, config.to.userid, config.to.passwd));
        }
        catch (e){
            console.log(e);
        }
        resolve(response.revision);
    });
}




async function getDeploymentDetailsForProxy(proxy) {

    return new Promise(async function (resolve, reject) {

        let url = urlBuilder.getProxyUrl(config.from.org, proxy);
        let requestObject = utilsForExport.requestForExport;
        requestObject.url = utilsForExport.requestForExport.baseurl + url + 'deployments/';

        let response = JSON.parse(await utils.makeRequest(requestObject, config.from.userid, config.from.passwd));

        if(response.environment.length === 0){
            resolve();
        }
        else {
            let deploymentDetails = [];

            response.environment.forEach((envDetails)=>{
                envDetails.revision.forEach((revision)=>{

                    let input = JSON.stringify({[envDetails.name]:revision.name});

                    // if(!_.includes(deploymentDetails, input)){
                    //
                    // }
                    deploymentDetails.push(input);
                });
            });
            resolve(deploymentDetails);
        }
    });
}




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

    return new Promise((function (resolve) {

        let promptObject = {
            name: "deployproxy",
            message: "Choose proxies that are to be deployed",
            radio: true,
            choices: promptChoices
        };

        let prompt = new promptCheckbox(promptObject);

        prompt.run().then(function (answers) {

            resolve(answers);
            // processAnswers(answers, promptChoices);

        }).catch(function (e) {
            console.log("Error in prompt: ", e);
        });
    }));
}




function processPromptAnswers(answers) {

    answers.forEach((answer)=>{

        let [revision, proxyName] = answer.split('-');

        let url = urlBuilder.urlForProxyDeployment(config.to.org, config.to.env, proxyName, revision);
        let requestObject = utilsForImport.requestForImport;
        requestObject.url = utilsForImport.requestForImport.baseurl + url;
        requestObject.method = 'POST';
        requestObject.headers = {
            'Content-Type' : 'application/x-www-form-urlencoded'
        };
        requestObject.qs = {
            "delay": 2,
            "override": true
        };

        utils.makePostRequest(requestObject, config.to.userid, config.to.passwd, function (err, res) {

            if(err){
                return console.log('Error occurred while deploying proxy "' + proxyName + '", error is: ', err);
            }

            if(res.statusCode >= 400){
                return console.log('Error occurred while deploying proxy "' + proxyName + '", error is: ', res.statusMessage);
            }

            if(res.statusCode === 200){
                console.log('Proxy "' + proxyName + '" deployed as revision "' + revision + '" in environment "' + config.to.env +'"');
            }
        });
    });
}