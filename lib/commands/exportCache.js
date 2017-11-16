/**
 * Created by Neeraj Wadhwa on 7/10/17.
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
        let cacheList = JSON.parse(await utilsForExport.getListOfCaches(env));
        return {[env]: cacheList}
    }
    catch (e) {
        console.log("Error: ", e);
    }
}

module.exports.processEnvironment = processEnvironment;



function* provideEnvironment(envList) {
    for(let i = 0; i < envList.length; i++){
        yield envList[i];
    }
}


function promptUser(promptChoices) {

    let promptObject = {
        name: "cache",
        message: "Choose all the caches that are to be exported",
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


// async function processEnvironment(env, next) {
//     let prompt;
//     let caches;
//     try {
//         prompt = utils.createPromptObject("cache", "Select cache to be exported");
//         caches = JSON.parse(await utilsForExport.getListOfCaches(env));
//         await utils.populateCheckBoxWithSeparator(prompt, caches, "Environment Name", env);
//     }
//     catch (e) {
//         return console.log("Error: ", e);
//     }
//
//     if (caches.length <= 0) {
//         console.log('No caches were found in source env "' + env + '"');
//     }
//     else {
//
//         let answers = await inquirer.prompt(prompt);
//         answers = answers.cache;
//
//         if (answers.length <= 0) {
//             console.log("Nothing was selected");
//         }
//         else {
//             answers.forEach(async function (answer) {
//                 let definition = await utilsForExport.getCacheDefinition(env, answer);
//                 saveCache(env, answer, definition);
//             });
//         }
//     }
//     next(null);
// }
//
function processAnswers(answers, promptChoices) {

    answers.forEach(async (answer)=>{
        let envs = await getEnvForAnswer(answer, promptChoices);

        envs.forEach(async (env)=>{
            let def = await utilsForExport.getCacheDefinition(env, answer);
            saveCache(env, answer, def);
        });


        // let def = await getCacheDefinition(env, answer);
        // saveCache(env, answer, def);
    });
}




function saveCache(env, cache, definition) {
    let dirToSave = options.dataDir.cacheDir + env + "/";

    mkdirp.sync(dirToSave);
    fs.writeFile(dirToSave + cache + ".json", definition, function (err) {
        if (err) {
            console.log(err);
        }
        console.log('Cache "' + cache + '" was saved successfully.');
    });
}

module.exports.saveCache = saveCache;



//use this in case there are target servers with the same name in different envs.
function getEnvForAnswer(cacheName, promptChoices) {

    return new Promise(function (resolve, reject) {
        let envs = [];
        objectForeach(promptChoices, function (val, prop, obj) {
            if(_.includes(val, cacheName)){
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