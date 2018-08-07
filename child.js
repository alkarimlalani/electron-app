console.log("hello from your child");

const { MAIN_REQUEST } = require('./constants');

// Log messages from the parent process
process.on('message', message => {
  console.log('message from renderer:', message);
});

// Send messages to the parent process
if (process.send) {
  process.send(MAIN_REQUEST);
}
