#!/usr/bin/env node

const inquirer = require('inquirer');
const { welcome, tapsAff } = require('./tapsaffbot');

const city = process.argv[2];
if (city) {
    const response = tapsAff(city);
    console.log(response);
} else {
    const welcomeText = welcome();
    const prompt = [{
            type: 'input',
            name: 'city',
            message: welcomeText,
        }];
    inquirer.prompt(prompt).then(answers => {
        const response = tapsAff(answers.city);
        console.log(response);
    })
}

