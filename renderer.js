const { fork } = require('child_process');
const { MAIN_REQUEST, GET_USERS, RENDERER_TO_MAIN_CHANNEL, MAIN_TO_RENDERER_CHANNEL } = require('./constants');
const { ipcRenderer } = require('electron')
console.log("hello from the renderer")


// Create a child process
const child = fork('child.js', null, (error, stdout, stderr) => {
  if (error) {
    throw error;
  }
  console.log(stdout);
});


// Communicate with child process
child.on('message', message => {
  console.log('message from child:', message);
  if (message === MAIN_REQUEST) {
    ipcRenderer.send(RENDERER_TO_MAIN_CHANNEL, MAIN_REQUEST);
  }
  if (message === GET_USERS) {
    ipcRenderer.send(RENDERER_TO_MAIN_CHANNEL, GET_USERS);
  }
});


// Communicate with main process
ipcRenderer.on(MAIN_TO_RENDERER_CHANNEL, (event, message) => {
  child.send(message);
})
