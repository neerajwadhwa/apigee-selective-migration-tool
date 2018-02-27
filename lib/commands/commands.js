/**
 * Created by Neeraj Wadhwa on 7/5/17.
 */

const _ = require('lodash');
const Table = require('cli-table');
const options = require('../options');


let commands = {
    exportProxies: {
        name: "exportProxies",
        description: '      -- Export the specified proxies from the source organization.',
        load: function() {
            return require('./exportProxies');
        }
    },
    importProxies: {
        name: "importProxies",
        description: '      -- Import the proxies to the target organization.',
        load: function() {
            return require('./importProxies');
        }
    },
    //enter more commands here

    exportTargetServers: {
        name: "exportTargetServers",
        description: '      -- Export the target servers from the source organization.',
        load: function() {
            return require('./exportTargetServers');
        }
    },

    importTargetServers: {
        name: "importTargetServers",
        description: '      -- Import the target servers to the target organization.',
        load: function() {
            return require('./importTargetServers');
        }
    },

    exportCache: {
        name: "exportCache",
        description: '      -- Export the cache definitions from the source organization.',
        load: function() {
            return require('./exportCache');
        }
    },

    importCache: {
        name: "importCache",
        description: '      -- Import the cache definitions to the target organization.',
        load: function() {
            return require('./importCache');
        }
    },

    exportDevelopers: {
        name: "exportDevelopers",
        description: '      -- Export the developers from the source organization.',
        load: function() {
            return require('./exportDevelopers');
        }
    },

    importDevelopers: {
        name: "importDevelopers",
        description: '      -- Import the developers to the target organization.',
        load: function() {
            return require('./importDevelopers');
        }
    },

    exportProducts: {
        name: "exportProducts",
        description: '      -- Export the products from the source organization.',
        load: function() {
            return require('./exportProducts');
        }
    },

    importProducts: {
        name: "importProducts",
        description: '      -- Import the products to the target organization.',
        load: function() {
            return require('./importProducts');
        }
    },

    exportDeveloperApps: {
        name: "exportDeveloperApps",
        description: '      -- Export the developer apps from the source organization.',
        load: function() {
            return require('./exportDeveloperApps');
        }
    },

    importDeveloperApps: {
        name: "importDeveloperApps",
        description: '      -- Import the developer apps to the target organization.',
        load: function() {
            return require('./importDeveloperApps');
        }
    },

    exportEnvKvms: {
        name: "exportEnvKvms",
        description: '      -- Export the environment kvms from the source organization.',
        load: function() {
            return require('./exportEnvKVMs');
        }
    },

    importEnvKvms: {
        name: "importEnvKvms",
        description: '      -- Import the environment kvms to the target organization.',
        load: function() {
            return require('./importEnvKVMs');
        }
    },

    exportOrgKvms: {
        name: "exportOrgKvms",
        description: '      -- Export the organization kvms from the source organization.',
        load: function() {
            return require('./exportOrgKVMs');
        }
    },

    importOrgKvms: {
        name: "importOrgKvms",
        description: '      -- Import the organization kvms to the target organization.',
        load: function() {
            return require('./importOrgKVMs');
        }
    },

    exportProxyKvms: {
        name: "exportProxyKvms",
        description: '      -- Export the proxy kvms from the source organization.',
        load: function() {
            return require('./exportProxyKVMs');
        }
    },

    importProxyKvms: {
        name: "importProxyKvms",
        description: '      -- Import the proxy kvms to the target organization.',
        load: function() {
            return require('./importProxyKVMs');
        }
    },

    exportUsers: {
        name: "exportUsers",
        description: '      -- Export the users from the source organization.',
        load: function() {
            return require('./exportUsers');
        }
    },

    importUsers: {
        name: "importUsers",
        description: '      -- Import the users to the target organization.',
        load: function() {
            return require('./importUsers');
        }
    },

    // exportUserRoles: {
    //     name: "exportUserRoles",
    //     description: '      -- Export the user roles from the source organization.',
    //     load: function() {
    //         return require('./exportUserRoles');
    //     }
    // },
    //
    // importUserRoles: {
    //     name: "importUserRoles",
    //     description: '      -- Import the user roles to the target organization.',
    //     load: function() {
    //         return require('./importUserRoles');
    //     }
    // },

    deployAPIProxies: {
        name: "deployAPIProxies",
        description: '      -- Deploy the API proxies to the target organization and environment.',
        load: function() {
            return require('./deployAPIProxies');
        }
    },
};

module.exports.commands = commands;



module.exports.getCommand = function(n) {
    let command = _.findKey(commands, function(val, key) {
        return key.toLowerCase() === n.toLowerCase();
    });
    return commands[command]
};



module.exports.printCommandHelp = function() {
    console.error();
    console.error('Valid commands:');
    console.error("");

    let tab = new Table(options.TableFormat);
    _.each(commands, function(p) {
        tab.push([p.name.toString(),  p.description]);
    });
    console.error(tab.toString());
};
