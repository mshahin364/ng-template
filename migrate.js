const chalk = require('chalk');
const inquirer = require('inquirer');
const exec = require('child_process').execSync;
const fs = require('fs');

const newline = () => console.log();

console.log(fs.readFileSync('./resources/banner').toString());

newline();
console.log(chalk.green('Let\'s migrate your templates!'));
newline();

const files = process.argv.slice(1, process.argv.length);

if (!files.length) {
  console.log(chalk.red('Path is not provided!'));
  console.log(chalk.white('Please use the tool with:'));
  newline();
  console.log(chalk.gray('   npm run migrate [PATH_TO_YOUR_FILES]'));
  newline();
  process.exit(0);
}

const command = './node_modules/.bin/tslint -c migrate.json ' + files.join(' ');
let foundErrors = false;

try {
  console.log(exec(command).toString());
} catch (e) {
  foundErrors = true;

  if (e && e.output && e.output[1]) {
    console.log(chalk.cyan.bold('I found these warnings:'));
    console.log(e.output[1].toString());

    inquirer.prompt([
      {
        type: 'confirm',
        message: 'Do you want me to fix them for you?',
        name: 'migrate'
      }
    ])
    .then(function (res) {
      if (res.migrate) {
        newline();
        console.log(exec(command + ' --fix').toString());
        console.log(chalk.cyan.bold('Done!'));
        newline();
        console.log(chalk.yellow('⚠️  Do not forget to "diff" the changes!'));
        newline();
      } else {
        newline();
        console.log(chalk.cyan('No problems!'), chalk.cyan.bold('Better take care of those before the next major release!'));
        newline();
      }
    }).catch(function (e) {
      if (e && e.output && e.output[1]) {
        console.log(chalk.cyan.bold('Uuupsss. I hit an error:'));
        console.log(e.output[1].toString());
      }
    });
  }
}

if (!foundErrors) {
  console.log(chalk.green.bold('I didn\'t find anything wrong! All seems fine!'));
  newline();
}
