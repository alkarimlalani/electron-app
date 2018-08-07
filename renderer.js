const { fork } = require('child_process');

console.log("hello from the renderer")

const child = fork('child.js', null, (error, stdout, stderr) => {
  if (error) {
    throw error;
  }
  console.log(stdout);
});
