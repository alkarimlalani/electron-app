const {app, BrowserWindow} = require('electron')
const { ipcMain } = require('electron')
const { MAIN_REQUEST, GET_USERS, RENDERER_TO_MAIN_CHANNEL, MAIN_TO_RENDERER_CHANNEL } = require('./constants');
const fetch = require('node-fetch');
const express = require('express')
const bodyParser = require('body-parser');

const sampleUserApi = 'https://reqres.in/api/users'
  
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win

function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({width: 800, height: 600})

  // and load the index.html of the app.
  win.loadFile('index.html')

  // Open the DevTools.
  win.webContents.openDevTools()

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})

// Communicate with renderer process
ipcMain.on(RENDERER_TO_MAIN_CHANNEL, (event, message) => {
  console.log("Message from renderer to main:", message);
  if (message === MAIN_REQUEST) {
    event.sender.send(MAIN_TO_RENDERER_CHANNEL, 'Chicken Soup');
  } else if (message === GET_USERS) {
    makeRequest().then( (resp) => {
      event.sender.send(MAIN_TO_RENDERER_CHANNEL, resp);
    })
  } else {
    event.sender.send(MAIN_TO_RENDERER_CHANNEL, 'Not sure how to respond');
  }
})


function makeRequest() {
  const body = {
    url: sampleUserApi
  }
  return fetch(`http://localhost:${port}`, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' }
  }).then(res => res.json())
}

// Create a proxy server for all HTTP requests
const server = express()
server.use(bodyParser.json());
const port = 3000

server.post('/', async function(req, res){
  url = req.body.url;
  const proxiedResponse = await fetch(url);
  const jsonResponse = await proxiedResponse.json();
  return res.json(jsonResponse);
});

server.listen(port);
