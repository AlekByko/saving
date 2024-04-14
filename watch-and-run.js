const fs = require('fs');
const { willDareExecute } = require('./running-commands');

const args = process.argv.slice(2);
let isRunning = false;
const watchedDir = args[0];
const command = args[1];
const pattern = new RegExp(args[2]);
fs.watch(watchedDir, { encoding: 'utf-8', recursive: true }, (eventType, filename) => {
  if (isRunning) return;
  const isWelcome = new RegExp(args[2]).test(filename);
  console.log('trying ' + filename + ': ' + isWelcome);
  if (filename && isWelcome) {
    console.log('');
    console.log('running for ' + filename);
    isRunning = true;
    willDareExecute(command, text => text).then(text => {
      console.log('\u0007');
      console.log(text);
      isRunning = false;
    }).catch(x => {
      console.log('\u0007');
      console.log('\u0007');
      console.log('\u0007');
    });
  }
});
