/**
 * Created by Neeraj Wadhwa on 7/4/17.
 */

const request = require('request');
const inquirer = require('inquirer');
const fs = require('fs');
const dir = require('node-dir');




function makeRequest(requestObject, userid, password) {
    return new Promise(function (resolve, reject) {
        request(requestObject, (error, response, body)=>{

            if(error){
                return console.log("Error in make request: ", error);
            }

            if(response){
                if(response.statusCode >= 400){
                    // console.log(response.statusMessage);
                    //console.log("typeof body ", typeof body);
                    console.log(response.statusMessage);
                    if(body){
                        console.log(body.message);
                    }
                    return;
                    // return console.log(body);
                }
                else{
                    //console.log(body);
                    return resolve(body);
                }
            }
        }).auth(userid, password, true);
    });
}

module.exports.makeRequest = makeRequest;




function makePostRequest(requestObject, userId, passwd, cb) {
    request(requestObject, function (err, res, body) {
        if(err){
            return cb(err);
        }
        return cb(null, res);
    }).auth(userId, passwd, true);
}

module.exports.makePostRequest = makePostRequest;


async function getListOfProxies(requestObject, organization, userid, password) {
    requestObject.url = requestObject.url + organization + '/apis';
    return await makeRequest(requestObject, userid, password);
}

module.exports.getListOfProxies = getListOfProxies;




function getExportedEntities(dir) {
    
    return new Promise(async function (resolve, reject) {
        if (!fs.existsSync(dir)) {
            //return reject(console.log("Directory " + dir + " does not exists"));
            return resolve();
        }
        getFilePath(dir).then((files)=>{
            resolve(files);
        });
    });
}

module.exports.getExportedEntities = getExportedEntities;




function getFilePath(dirPath) {
    return new Promise(function(resolve, reject){
        dir.files(dirPath, function(err, files) {
            if (err) throw err;
            return resolve(files);
        });
    });
}


//don't need filenames
// function walkDirSync(dir, filelist) {
//     let files = fs.readdirSync(dir);
//     filelist = filelist || [];
//     files.forEach(function(file) {
//         if (fs.statSync(path.join(dir, file)).isDirectory()) {
//             filelist = walkDirSync(path.join(dir, file), filelist);
//         }
//         else {
//             filelist.push(file);
//         }
//     });
//     return filelist;
// }
//
// module.exports.walkDirSync = walkDirSync;


function createPromptObject(name, message) {
    return[
        {
            type: 'checkbox',
            name: name,
            message: message,
            choices: [],
            validate: function () {
                return true;
            }
        }
    ];
}

module.exports.createPromptObject = createPromptObject;




function populateCheckBoxWithSeparator(promptObject, choices, separatorPrompt, separatorName) {

    return new Promise(function (resolve, reject) {

        promptObject[0].choices.push(new inquirer.Separator(' ' + separatorPrompt + ' -> ' + separatorName));
        choices.forEach((choice)=>{
            promptObject[0].choices.push(choice);
        });
        resolve(promptObject);
    });
}

module.exports.populateCheckBoxWithSeparator = populateCheckBoxWithSeparator;




function populateCheckBoxDisplay(choices, name, message){
    return new Promise(function (resolve, reject) {
        let promptObject = [
            {
                type: 'checkbox',
                message: message,
                name: name,
                choices: [],
                validate: function (answer) {
                    if (answer.length < 1) {
                        return message;
                    }
                    return true;
                }
            }
        ];
        choices.forEach((choice)=>{
            promptObject[0].choices.push(choice);
        });
        // promptObject[0].choices.push("============================ end of list ============================");
        resolve(promptObject);
    });
}

module.exports.populateCheckBoxDisplay = populateCheckBoxDisplay;
