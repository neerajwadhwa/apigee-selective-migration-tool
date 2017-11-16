#!/usr/bin/env node

/**
 * Created by Neeraj Wadhwa on 7/4/17.
 */


const commands = require('./commands/commands');

if (process.argv.length < 3) {
    console.error('Usage: apigeemigrate <command>');
    commands.printCommandHelp();
    process.exit(2);
}

let commandName = process.argv[2];

let command = commands.getCommand(commandName);

if(command === undefined){
    console.error('There is no command named ' + commandName);
    commands.printCommandHelp();
    process.exit(3);
}

command.load().start();