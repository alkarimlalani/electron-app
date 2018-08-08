const { MAIN_REQUEST } = require('./constants');
const fetch = require('node-fetch');
const net = require('net');

console.log("hello from your child");

// Log messages from the parent process
process.on('message', message => {
  console.log('Message from renderer from child:', message);
});

// Send messages to the parent process
if (process.send) {
  process.send(MAIN_REQUEST);
}


// Make request to local-host
const sampleUserApi = 'https://reqres.in/api/users'

function makeRequest() {
  const body = {
    url: sampleUserApi
  }
  return fetch(`http://localhost:3000`, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' }
  }).then(res => res.json())
}

makeRequest().then((response) => {
  console.log("HTTP Request was returned with the following response", response)
})

const client = net.createConnection({ port: 8124 }, () => {
  // 'connect' listener
  console.log('connected to server!');
  client.write(`${sampleUserApi}\r`);
});
client.on('data', (data) => {
  const str = data.toString();
  const json = JSON.parse(str);
  console.log("Main sent us this data via socket:", json);
});
client.on('end', () => {
  console.log('disconnected from server');
});
