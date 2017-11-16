/**
 * Created by Neeraj Wadhwa on 7/5/17.
 */


/*
 *
 * resource url getters
 *
 */

/*
 *
 * organization url getters
 *
 */

function getOrgUrlString() {
    return 'organizations/';
}

module.exports.getOrgUrlString = getOrgUrlString;

function getOrgUrl(orgName) {
    return getOrgUrlString() + orgName + '/';
}

module.exports.getOrgUrl = getOrgUrl;


/*
 *
 * environment url getters
 *
 */


function getEnvPath(orgName) {
    return getOrgUrl(orgName) + 'environments/';
}

module.exports.getEnvPath = getEnvPath;


function getEnvUrl(orgName, envName) {
    return getEnvPath(orgName) + envName + '/';
}

module.exports.getEnvUrl = getEnvUrl;


/*
 *
 * resource url getters   //end
 *
 */


/*
 *
 * entity url getters
 *
 */

/*
 *
 * proxy url getters
 *
 */


function getProxyPath(orgName) {
    return getOrgUrl(orgName) + 'apis/';
}

module.exports.getProxyPath = getProxyPath;


function getProxyUrl(orgName, proxyName) {
    return getProxyPath(orgName) + proxyName + '/';
}

module.exports.getProxyUrl = getProxyUrl;


function urlForProxyDeployment(orgName, envName, proxyName, revision) {
    return getOrgUrl(orgName) + '/environments/' + envName + '/apis/' + proxyName + '/revisions/' + revision + '/deployments';
}

module.exports.urlForProxyDeployment = urlForProxyDeployment;

/*
 *
 * developer url getters
 *
 */


function getDeveloperPath(orgName) {
    return getOrgUrl(orgName) + 'developers/';
}

module.exports.getDeveloperPath = getDeveloperPath;


function getDeveloperUrl(orgName, developerId) {
    return getDeveloperPath(orgName) + developerId + '/';
}

module.exports.getDeveloperUrl = getDeveloperUrl;


/*
 *
 * developer application url getters
 *
 */


function getDevApplicationPath(orgName, developerId) {
    return getDeveloperUrl(orgName, developerId) + 'apps/';
}

module.exports.getDevApplicationPath = getDevApplicationPath;


function getDevApplicationUrl(orgName, developerId, appName) {
    return getDevApplicationPath(orgName, developerId) + appName + '/';
}

module.exports.getDevApplicationUrl = getDevApplicationUrl;


/*
 *
 * api product url getters
 *
 */

function getApiProductPath(orgName) {
    return getOrgUrl(orgName) + 'apiproducts/';
}

module.exports.getApiProductPath = getApiProductPath;


function getApiProductUrl(orgName, productName){
    return getApiProductPath(orgName) + productName + '/';
}

module.exports.getApiProductUrl = getApiProductUrl;


/*
 *
 * target server url getters
 *
 */

function getTargetServerPath(orgName, envName) {
    return getEnvUrl(orgName, envName) + 'targetservers/';
}

module.exports.getTargetServerPath = getTargetServerPath;

function getTargetServerUrl(orgName, envName, targetServerName) {
    return getTargetServerPath(orgName, envName) + targetServerName + '/';
}

module.exports.getTargetServerUrl = getTargetServerUrl;


/*
 *
 * cache url getters
 *
 */

function getCachePath(orgName, envName) {
    return getEnvUrl(orgName, envName) + 'caches/';
}

module.exports.getCachePath = getCachePath;


function getCacheUrl(orgName, envName, cacheName) {
    return getCachePath(orgName, envName) + cacheName + '/';
}

module.exports.getCacheUrl = getCacheUrl;


/*
 *
 * kvm url getters
 *
 */


function getKvmOrgPath(orgName) {
    return getOrgUrl(orgName) + 'keyvaluemaps/';
}

module.exports.getKvmOrgPath = getKvmOrgPath;

function getKvmOrgUrl(orgName, kvmName) {
    return getKvmOrgPath(orgName) + kvmName + '/';
}

module.exports.getKvmOrgUrl = getKvmOrgUrl;


function getKvmEnvPath(orgName, envName) {
    return getEnvUrl(orgName, envName) + 'keyvaluemaps/';
}

module.exports.getKvmEnvPath = getKvmEnvPath;


function getKvmEnvUrl(orgName, envName, kvmName) {
    return getKvmEnvPath(orgName, envName) + kvmName + '/';
}

module.exports.getKvmEnvUrl = getKvmEnvUrl;


function getKvmProxyPath(orgName, proxyName) {
    return getProxyUrl(orgName, proxyName) + 'keyvaluemaps/';
}

module.exports.getKvmProxyPath = getKvmProxyPath;


function getKvmProxyUrl(orgName, proxyName, kvmName) {
    return getKvmProxyPath(orgName, proxyName) + kvmName + '/';
}

module.exports.getKvmProxyUrl = getKvmProxyUrl;


/*
 *
 * key store/trust store url getters
 *
 */


function getKeyStorePath(orgName, envName) {
    return getEnvUrl(orgName, envName) + 'keystores/';
}

module.exports.getKeyStorePath = getKeyStorePath;


function getKeyStoreUrl(orgName, envName, ksName) {
    return getKeyStorePath(orgName, envName) + ksName + '/';
}

module.exports.getKeyStoreUrl = getKeyStoreUrl;


/*
 *
 * user url getters
 *
 */

function getUserPath() {
    return 'users/';
}

module.exports.getUserPath = getUserPath;


function getUserUrl(userId) {
    return getUserPath() + userId + '/';
}

module.exports.getUserUrl = getUserUrl;


/*
 *
 * user role url getters
 *
 */


function getUserRolePath(orgName) {
    return getOrgUrl(orgName) + 'userroles/';
}

module.exports.getUserRolePath = getUserRolePath;


function getUserRoleUrl(orgName, roleName){
    return getUserRolePath(orgName) + roleName + '/';
}

module.exports.getUserRoleUrl = getUserRoleUrl;


/*
 *
 * entity url getters       //end
 *
 */
