#!/usr/bin/env node

const inquirer = require('inquirer');

const city = process.argv[2];
if (city) {
    console.log( `There is weather in %s`, city );
} else {
    const prompt = [{
            type: 'input',
            name: 'city',
            message: "What city are you in?",
        }];
    inquirer.prompt(prompt).then(answers => {
        console.log(`There is weather in ${answers['city']}!`)
    })
}

