const fetch = require('node-fetch');
const fs = require('fs');

console.log("hello from your child");

// Make requests to local-host

// Fetch a simple JSON object
const sampleUserApi = 'https://reqres.in/api/users';
function fetchJson() {
  const body = {
    url: sampleUserApi,
    options: {},
  }
  request(body).then(printJson)
}
fetchJson();

// Download an image
const imageUrl = 'https://assets-cdn.github.com/images/modules/logos_page/Octocat.png';
function downloadImage() {
  const body = {
    url: imageUrl,
    options: {},
  }
  request(body).then(saveFile('./octocat.png'));
}
downloadImage();

// Download a 100MB file
const bigFileUrl = 'https://speed.hetzner.de/100MB.bin'
function downloadBigFile() {
  const body = {
    url: bigFileUrl,
    options: {}
  }
  request(body).then(saveFile('./bigFile.bin'));
}
downloadBigFile();

//
// Utility methods to make and handle requests
//
function request(body) {
  return fetch(`http://localhost:3000`, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' }
  })
}

function printJson(res) {
  res.json().then((json) => {
    console.log(json);
  })
}

function saveFile(fileName) {
  return function(res) {
    return new Promise((resolve, reject) => {
      const dest = fs.createWriteStream(fileName);
      res.body.pipe(dest);
      res.body.on('error', err => {
        console.log(`Error saving ${fileName}`);
        reject(err);
      });
      dest.on('finish', () => {
        console.log(`Finished saving ${fileName}`);
        resolve();
      });
      dest.on('error', err => {
        console.log(`Error saving ${fileName}`);
        reject(err);
      });
    });
  };
}
