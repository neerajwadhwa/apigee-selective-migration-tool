/**
 * Created by Neeraj Wadhwa on 7/4/17.
 */

const config = require('../config');
const urlBuilder = require('./URLBuilders');
const utils = require('./utils');


/*

 request objects for import purpose

 */


let requestForImport = {
    baseurl: config.to.url,
    methodToUse: "GET",
    headers: {
        'Content-Type' : 'application/json'
    }
};

module.exports.requestForImport = requestForImport;




async function getListOfEntities(entityType) {

    if(entityType in ["developerApplication", "kvmProxy"]){
        throw new Error("Listing of developerApplication or kvmProxy is not supported," +
            " use respective methods");
    }

    if(entityType === "proxy"){
        let url = urlBuilder.getProxyPath(config.to.org);
        let request = requestForImport;
        request.url = requestForImport.baseurl + url;
        try {
            return await utils.makeRequest(request, config.to.userid, config.to.passwd);
        }
        catch (e){
            console.log(e);
        }
    }

    if(entityType === "developer"){
        let url  =urlBuilder.getDeveloperPath(config.to.org);
        let request = requestForImport;
        request.url = requestForImport.baseurl + url;
        try {
            return await utils.makeRequest(request, config.to.userid, config.to.passwd);
        }
        catch (e){
            console.log(e);
        }
    }

    // for this we need dev_id
    // if(entityType === "developerApplication"){
    //     urlBuilder
    // }

    if(entityType === "apiProduct"){
        let url = urlBuilder.getApiProductPath(config.to.org);
        let request = requestForImport;
        request.url = requestForImport.baseurl + url;
        try {
            return await utils.makeRequest(request, config.to.userid, config.to.passwd);
        }
        catch (e){
            console.log(e);
        }
    }

    if(entityType === "targetServer"){
        let url = urlBuilder.getTargetServerPath(config.to.org, config.to.env);
        let request = requestForImport;
        request.url = requestForImport.baseurl + url;
        try {
            return await utils.makeRequest(request, config.to.userid, config.to.passwd);
        }
        catch (e){
            console.log(e);
        }
    }

    if(entityType === "cache"){
        let url = urlBuilder.getCachePath(config.to.org, config.to.env);
        let request = requestForImport;
        request.url = requestForImport.baseurl + url;
        try {
            return await utils.makeRequest(request, config.to.userid, config.to.passwd);
        }
        catch (e){
            console.log(e);
        }
    }

    if(entityType === "kvmOrg"){
        let url = urlBuilder.getKvmOrgPath(config.to.org);
        let request = requestForImport;
        request.url = requestForImport.baseurl + url;
        try {
            return await utils.makeRequest(request, config.to.userid, config.to.passwd);
        }
        catch (e){
            console.log(e);
        }
    }

    if(entityType === "kvmEnv"){
        urlBuilder.getKvmEnvPath(config.to.org, config.to.env);
        let request = requestForImport;
        request.url = requestForImport.baseurl + url;
        try {
            return await utils.makeRequest(request, config.to.userid, config.to.passwd);
        }
        catch (e){
            console.log(e);
        }
    }

    // for this we need proxy name
    // if(entityType === "kvmProxy"){
    //     urlBuilder.getKvmProxyPath()
    // }

    if(entityType === "keyStore"){
        let url = urlBuilder.getKeyStorePath(config.to.org, config.to.env);
        let request = requestForImport;
        request.url = requestForImport.baseurl + url;
        try {
            return await utils.makeRequest(request, config.to.userid, config.to.passwd);
        }
        catch (e){
            console.log(e);
        }
    }

    if(entityType === "trustStore"){
        let url = urlBuilder.getKeyStorePath(config.to.org, config.to.env);
        let request = requestForImport;
        request.url = requestForImport.baseurl + url;
        try {
            return await utils.makeRequest(request, config.to.userid, config.to.passwd);
        }
        catch (e){
            console.log(e);
        }
    }

    if(entityType === "user"){
        let url = urlBuilder.getUserPath();
        let request = requestForImport;
        request.url = requestForImport.baseurl + url;
        try {
            return await utils.makeRequest(request, config.to.userid, config.to.passwd);
        }
        catch (e){
            console.log(e);
        }
    }

    if(entityType === "userRole"){
        let url = urlBuilder.getUserRolePath(config.to.org);
        let request = requestForImport;
        request.url = requestForImport.baseurl + url;
        try {
            return await utils.makeRequest(request, config.to.userid, config.to.passwd);
        }
        catch (e){
            console.log(e);
        }
    }
}

module.exports.getListOfEntities = getListOfEntities;




async function getListOfDevApplications(developerId) {
    let url = urlBuilder.getDevApplicationPath(config.to.org, developerId);
    let request = requestForImport;
    request.url = requestForImport.baseurl + url;
    try {
        return await utils.makeRequest(request, config.to.userid, config.to.passwd);
    }
    catch (e){
        console.log(e);
    }
}

//getListOfDevApplications("helloworld@apigee.com");

module.exports.getListOfDevApplications = getListOfDevApplications;




async function getListOfKvmsForProxy(proxyName) {
    let url = urlBuilder.getKvmProxyPath(config.to.org, proxyName);
    let request = requestForImport;
    request.url = requestForImport.baseurl + url;
    return await utils.makeRequest(request, config.to.userid, config.to.passwd);
}

//getListOfKvmsForProxy("sdf");
module.exports.getListOfKvmsForProxy = getListOfKvmsForProxy;




async function getListOfEnvironments() {
    let url = urlBuilder.getEnvPath(config.to.org);
    let requestObject = requestForImport;
    requestObject.url = requestForImport.baseurl + url;

    return await utils.makeRequest(requestObject, config.to.userid, config.to.passwd);
}

module.exports.getListOfEnvironments = getListOfEnvironments;




async function getListOfTargetServers(envName) {

    let url = urlBuilder.getTargetServerPath(config.to.org, envName);

    let requestObject = requestForImport;
    requestObject.url = requestForImport.baseurl + url;

    return await utils.makeRequest(requestObject, config.to.userid, config.to.passwd);
}

module.exports.getListOfTargetServers = getListOfTargetServers;



async function getListOfCaches(envName) {

    let url = urlBuilder.getCachePath(config.to.org, envName);
    let requestObject = requestForImport;
    requestObject.url = requestForImport.baseurl + url;

    return await utils.makeRequest(requestObject, config.to.userid, config.to.passwd);
}

module.exports.getListOfCaches = getListOfCaches;
