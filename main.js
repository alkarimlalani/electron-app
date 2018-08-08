const {app, BrowserWindow} = require('electron')
const { ipcMain } = require('electron')
const { MAIN_REQUEST, RENDERER_TO_MAIN_CHANNEL, MAIN_TO_RENDERER_CHANNEL } = require('./constants');
const fetch = require('node-fetch');
const express = require('express')
const bodyParser = require('body-parser');
const net = require('net');

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
  } else {
    event.sender.send(MAIN_TO_RENDERER_CHANNEL, 'Not sure how to respond');
  }
})

// Create a http proxy server for all HTTP requests
const httpServer = express()
httpServer.use(bodyParser.json());
const port = 3000

httpServer.post('/', async function(req, res){
  const url = req.body.url;
  const proxiedResponse = await fetch(url);
  const jsonResponse = await proxiedResponse.json();
  return res.json(jsonResponse);
});

httpServer.listen(port);

// Create a net socket server to proxy HTTP requests
const socketServer = net.createServer((c) => {
  // 'connection' listener
  console.log('client connected');
  
  c.on('end', () => {
    console.log('client disconnected');
  });

  c.on('data', async function (data) {
    const url = data.toString();
    const proxiedResponse = await fetch(url);
    const jsonResponse = await proxiedResponse.json();
    c.write(`${JSON.stringify(jsonResponse)}\r`);
  });
});
socketServer.on('error', (err) => {
  throw err;
});
socketServer.listen(8124, () => {
  console.log('server bound');
});
