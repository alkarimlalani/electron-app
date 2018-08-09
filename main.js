const {app, BrowserWindow} = require('electron')
const { ipcMain } = require('electron')
const { MAIN_REQUEST, RENDERER_TO_MAIN_CHANNEL, MAIN_TO_RENDERER_CHANNEL } = require('./constants');
const fetch = require('node-fetch');
const http = require('http');

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
const port = 3000

http.createServer((request, response) => {
  // Only accept POST requests
  // POST requests includes the URL and options for the request
  if(request.method == 'POST') {
    let queryData = '';
    request.on('data', (data) => {
      queryData += data;
    });

    request.on('end', () => {
      const data = JSON.parse(queryData);
      console.log("Data", data);
      fetch(data.url, data.options)
      .then(res => {
        return new Promise((resolve, reject) => {
          const headers = res.headers.raw();
          delete headers['content-encoding'];
          response.writeHead(res.status, headers);
          res.body.on('data', (chunk) => {
            // console.log('writing chunk');
            response.write(chunk);
          });

          res.body.on('end', () => {
            response.end();
            resolve();
          })
        });
      });
    })
  } else {
    Error('Incorrect request method')
  }
}).listen(port);

