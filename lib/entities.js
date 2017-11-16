/**
 * Created by Neeraj Wadhwa on 7/4/17.
 */

const _ = require('lodash');


const orgEntities = {
    proxy: "apis",
    targetServer: "targetservers",
    cache: "caches",
    kvm: "keyvaluemaps",
    developer: "developers",
    developerApplication: "apps",
    apiProduct: "apiproducts",
    userRole: "userroles"
};

module.exports.orgEntities = orgEntities;




const envEntities = {
    kvm: "keyvaluemaps",
    cache: "caches",
    targetServer: "targetservers",
    keyStore: "keystores",
    trustStore: "keystores",
};

module.exports.envEntities = envEntities;




const entities = {
    proxy: "apis",
    developer: "developers",
    developerApplication: "apps",
    apiProduct: "apiproducts",
    targetServer: "targetservers",
    cache: "caches",
    kvm: "keyvaluemaps",
    keyStore: "keystores",
    trustStore: "keystores",
    user: "users",
    userRole: "userroles"

};

module.exports.entities = entities;


function getEntityName(entity) {
    //console.log(_.get(entities, '' + entity + ''));
    return _.get(entities, '' + entity + '');
}

module.exports.getEntityName = getEntityName;