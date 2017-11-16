/**
 * Created by Neeraj Wadhwa on 7/4/17.
 */

const config = require('../config');
const urlBuilder = require('./URLBuilders');
const utils = require('./utils');

/*

request objects for export purpose

*/


const requestForExport = {
    baseurl: config.from.url,
    method: "GET",
    headers: {
        'Content-Type' : 'application/json'
    }
};

module.exports.requestForExport = requestForExport;



async function getListOfEntities(entityType) {

    if(entityType === "developerApplication" || entityType === "kvmProxy"){
        throw new Error("Listing of developerApplication or kvmProxy is not supported, " +
            "use respective methods");
    }

    if(entityType === "proxy"){
        let url = urlBuilder.getProxyPath(config.from.org);
        let request = requestForExport;
        request.url = requestForExport.baseurl + url;

        try{
            return await utils.makeRequest(request, config.from.userid, config.from.passwd);
        }
        catch (e){
            return console.log(e);
        }
    }

    if(entityType === "developer"){
        let url  =urlBuilder.getDeveloperPath(config.from.org);
        let request = requestForExport;
        request.url = requestForExport.baseurl + url;
        try{
            return await utils.makeRequest(request, config.from.userid, config.from.passwd);
        }
        catch (e){
            return console.log(e);
        }
    }

    // for this we need dev_id
    // if(entityType === "developerApplication"){
    //     urlBuilder
    // }

    if(entityType === "apiProduct"){
        let url = urlBuilder.getApiProductPath(config.from.org);
        let request = requestForExport;
        request.url = requestForExport.baseurl + url;
        try{
            return await utils.makeRequest(request, config.from.userid, config.from.passwd);
        }
        catch (e){
            return console.log(e);
        }
    }

    if(entityType === "targetServer"){
        let url = urlBuilder.getTargetServerPath(config.from.org, config.from.env);
        let request = requestForExport;
        request.url = requestForExport.baseurl + url;
        try{
            return await utils.makeRequest(request, config.from.userid, config.from.passwd);
        }
        catch (e){
            return console.log(e);
        }
    }

    if(entityType === "cache"){
        let url = urlBuilder.getCachePath(config.from.org, config.from.env);
        let request = requestForExport;
        request.url = requestForExport.baseurl + url;
        try{
            return await utils.makeRequest(request, config.from.userid, config.from.passwd);
        }
        catch (e){
            return console.log(e);
        }
    }

    if(entityType === "kvmOrg"){
        let url = urlBuilder.getKvmOrgPath(config.from.org);
        let request = requestForExport;
        request.url = requestForExport.baseurl + url;
        try{
            return await utils.makeRequest(request, config.from.userid, config.from.passwd);
        }
        catch (e){
            return console.log(e);
        }
    }

    if(entityType === "kvmEnv"){
        urlBuilder.getKvmEnvPath(config.from.org, config.from.env);
        let request = requestForExport;
        request.url = requestForExport.baseurl + url;
        try{
            return await utils.makeRequest(request, config.from.userid, config.from.passwd);
        }
        catch (e){
            return console.log(e);
        }
    }

    // for this we need proxy name
    // if(entityType === "kvmProxy"){
    //     urlBuilder.getKvmProxyPath()
    // }

    if(entityType === "keyStore"){
        let url = urlBuilder.getKeyStorePath(config.from.org, config.from.env);
        let request = requestForExport;
        request.url = requestForExport.baseurl + url;
        try{
            return await utils.makeRequest(request, config.from.userid, config.from.passwd);
        }
        catch (e){
            return console.log(e);
        }
    }

    if(entityType === "trustStore"){
        let url = urlBuilder.getKeyStorePath(config.from.org, config.from.env);
        let request = requestForExport;
        request.url = requestForExport.baseurl + url;
        try{
            return await utils.makeRequest(request, config.from.userid, config.from.passwd);
        }
        catch (e){
            return console.log(e);
        }
    }

    if(entityType === "user"){
        let url = urlBuilder.getUserPath();
        let request = requestForExport;
        request.url = requestForExport.baseurl + url;
        try{
            return await utils.makeRequest(request, config.from.userid, config.from.passwd);
        }
        catch (e){
            return console.log(e);
        }
    }

    if(entityType === "userRole"){
        let url = urlBuilder.getUserRolePath(config.from.org);
        let request = requestForExport;
        request.url = requestForExport.baseurl + url;
        try{
            return await utils.makeRequest(request, config.from.userid, config.from.passwd);
        }
        catch (e){
            return console.log(e);
        }
    }
}

module.exports.getListOfEntities = getListOfEntities;




async function getListOfDevApplications(developerId) {
    let url = urlBuilder.getDevApplicationPath(config.from.org, developerId);
    let request = requestForExport;
    request.url = requestForExport.baseurl + url;
    return await utils.makeRequest(request, config.from.userid, config.from.passwd);
}

module.exports.getListOfDevApplications = getListOfDevApplications;




async function getListOfKvmsForProxy(proxyName) {
    let url = urlBuilder.getKvmProxyPath(config.from.org, proxyName);
    let request = requestForExport;
    request.url = requestForExport.baseurl + url;
    return await utils.makeRequest(request, config.from.userid, config.from.passwd);
}

module.exports.getListOfKvmsForProxy = getListOfKvmsForProxy;




async function getListOfEnvironments() {
    let url = urlBuilder.getEnvPath(config.from.org);
    let requestObject = requestForExport;
    requestObject.url = requestForExport.baseurl + url;

    return await utils.makeRequest(requestObject, config.from.userid, config.from.passwd);
}

module.exports.getListOfEnvironments = getListOfEnvironments;




async function getListOfTargetServers(envName) {

    let url = urlBuilder.getTargetServerPath(config.from.org, envName);

    let requestObject = requestForExport;
    requestObject.url = requestForExport.baseurl + url;

    return await utils.makeRequest(requestObject, config.from.userid, config.from.passwd);
}

module.exports.getListOfTargetServers = getListOfTargetServers;





async function getTargetServer(env, targetServer) {
    let url = urlBuilder.getTargetServerUrl(config.from.org, env, targetServer);

    let requestObject = requestForExport;
    requestObject.url = requestForExport.baseurl + url;

    return await utils.makeRequest(requestObject, config.from.userid, config.from.passwd);
}


module.exports.getTargetServer = getTargetServer;




async function getListOfCaches(envName) {

    let url = urlBuilder.getCachePath(config.from.org, envName);
    let requestObject = requestForExport;
    requestObject.url = requestForExport.baseurl + url;

    return await utils.makeRequest(requestObject, config.from.userid, config.from.passwd);
}

module.exports.getListOfCaches = getListOfCaches;




async function getCacheDefinition(env, cacheName) {
    let url = urlBuilder.getCacheUrl(config.from.org, env, cacheName);

    let requestObject = requestForExport;
    requestObject.url = requestForExport.baseurl + url;

    return await utils.makeRequest(requestObject, config.from.userid, config.from.passwd);
}

module.exports.getCacheDefinition = getCacheDefinition;