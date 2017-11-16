/**
 * Created by Neeraj Wadhwa on 7/15/17.
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


    let developerList;

    try {
        developerList = JSON.parse(await getListOfDevelopers(true));
    }
    catch (e) {
        return console.log("Error: ", e);
    }

    developerList = developerList.developer;

    let developerEmails = [];

    developerList.forEach((developer) => {
        developerEmails.push(developer.email);
    });

    promptUser(developerEmails, developerList);
}

// start();
module.exports.start = start;



async function getListOfDevelopers(expand = false) {
    let url = urlBuilder.getDeveloperPath(config.from.org);
    let request = utilsForExport.requestForExport;
    request.url = utilsForExport.requestForExport.baseurl + url;
    request.qs = {
        expand: expand
    };
    try{
        return await utils.makeRequest(request, config.from.userid, config.from.passwd);
    }
    catch (e){
        return console.log(e);
    }
}

module.exports.getListOfDevelopers = getListOfDevelopers;




function saveDeveloper(developer) {

    let dirToSave = options.dataDir.developerDir;

    mkdirp.sync(dirToSave);
    fs.writeFile(dirToSave + developer.email + ".json", JSON.stringify(developer), function (err) {
        if (err) {
            console.log(err);
        }
        console.log('Developer "' + developer.email + '" was saved successfully');
    });
}




function promptUser(promptChoices, developersData) {

    let promptObject = {
        name: "developer",
        message: "Choose all the developers that are to be exported",
        radio: true,
        choices: promptChoices
    };

    let prompt = new promptCheckbox(promptObject);

    prompt.run().then(function (answers) {

        processAnswers(answers, developersData);

    }).catch(function (e) {
        console.log("Error in prompt: ", e);
    });
}



function processAnswers(answers, developersData) {
    answers.forEach((answer)=>{
        developersData.forEach((developer)=>{
            if(answer === developer.email){
                saveDeveloper(developer);
            }
        })
    });
}