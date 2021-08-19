#!/usr/bin/env node

require('dotenv').config();
const inquirer = require('inquirer');
const { welcome, tapsAff } = require('./tapsaffbot');

const city = process.argv[2];
if (city) {
    tapsAff(city, response => console.log(response));
} else {
    const welcomeText = welcome();
    const prompt = [{
            type: 'input',
            name: 'city',
            message: welcomeText,
        }];
    inquirer.prompt(prompt).then(answers => {
        tapsAff(answers.city, response => console.log(response));
    })
}

