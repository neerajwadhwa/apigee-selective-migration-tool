# ApigeeSelectiveMigrationTool

This tool is used to selectively migrate Apigee entities from one organization to another organization.


### Prerequisites

Following are some prerequisites for Apigee Selective Migration Tool:

1) [Node.js](https://nodejs.org/en/download/) v8.1.0 or above installed.

2) Appropriate permissions to install the tool globally.

3) Write access to the current directory.


### Installation Steps

Follow the below mentioned steps to install the tool

1) Clone the repository from [https://github.com/neerajwadhwa/apigeeselectivemigatetool.git].

2) Edit the configuration file "config.js" with appropriate credentials.

2) In the root directory of the project run the following command-

                    npm install -g .

Note:
    Please append /v1/ when configuring the from and to urls in the "config.js" file.


### Configuration

This is the sample configuration file.

```
module.exports = {

    from: {
        version: '<version (for source)>',
        url: '<url of the edge server (for source)>',
        userid: '<username (for source)>',
        passwd: '<password (for source)>',
        org: '<org name (for source)>',
        env: '<env name (for source)>'
    },
    to: {
        version: '<version (for destination)>',
        url: '<url of the edge server (for destination)',
        userid: '<username (for destination)',
        passwd: '<password (for destination)',
        org: '<org name (for destination)',
        env: '<env name (for destination)'
    }
};
```

Description of the configuration fields:

| Field name   |                      from (source)                      |                   to (target)                   |
|:------------:|:-------------------------------------------------------:|:-----------------------------------------------:|
| version      | source OPDK version                                     | target OPDK version                             |
| url          | source OPDK URL                                         | target OPDK URL                                 |
| userid       | userid or email id of source organization user          | userid or email id of target organization user  |
| passwd       | password for source organization user                   | password for target organization user           |
| org          | source organization name                                | target organization name                        |
| env          | source environment name                                 | target environment name                         |


### Running the tool

From the command-line run the tool as:

                     apigeemigrate {command-name}

See the Commands section to know more about all the available commands.



### Commands

Please select the Apigee entities when the prompt appears on the screen for any of the below-mentioned commands.

* `apigeemigrate` - Get the list of all available commands.

* `apigeemigrate exportProxies` - Export all the specified proxies from the source organization.

* `apigeemigrate importProxies` - Import all the proxies which were exported previously to the target organization.

* `apigeemigrate exportTargetServers` - Export all the specified target servers from the source organization.

* `apigeemigrate importTargetServers` - Import all the target servers which were exported previously to the target organization.

* `apigeemigrate exportCache` - Export all the specified cache definitions from the source organization.

* `apigeemigrate importCache` - Import all the cache definitions which were exported previously to the target organization.

* `apigeemigrate exportDevelopers` - Export all the specified developers from the source organization.

* `apigeemigrate importDevelopers` - Import all the developers which were exported previously to the target organization.

* `apigeemigrate exportProducts` - Export all the specified API products from the source organization.

* `apigeemigrate importProducts` - Import all the API products which were exported previously to the target organization.

* `apigeemigrate exportDeveloperApps` - Export all the specified developer apps from the source organization.

* `apigeemigrate importDeveloperApps` - Import all the developer apps which were exported previously to the target organization.

* `apigeemigrate exportEnvKvms` - Export all the specified environment KVMs from the source organization.

* `apigeemigrate importEnvKvms` - Import all the environment KVMs which were exported previously to the target organization.

* `apigeemigrate exportOrgKvms` - Export all the specified organization KVMs from the source organization.

* `apigeemigrate importOrgKvms` - Import all the organization KVMs which were exported previously to the target organization.

* `apigeemigrate exportProxyKvms` - Export all the specified proxy KVMs from the source organization.

* `apigeemigrate importProxyKvms` - Import all the proxy KVMs which were exported previously to the target organization.

* `apigeemigrate exportUsers` - Export all the specified users from the source organization.

* `apigeemigrate importUsers` - Import all the users which were exported previously to the target organization.

* `apigeemigrate exportUserRoles` - Export all the specified user roles from the source organization.

* `apigeemigrate importUserRoles` - Import all the user roles which were exported previously to the target organization.

* `apigeemigrate deployAPIProxy` - Deploy the imported API proxies to the target organization in the target environment.

