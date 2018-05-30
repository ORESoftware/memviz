const util = require('util');

let x = 1;
const values = [];

setInterval(function () {

  values.push(x++);

  if (values.length > 10) {

    let prev = values.shift(), curr, i = 0;

    while (true) {
      curr = values[i];

      const z = Number((prev + curr) / 2);
      values[i] = z;

      if (!values[i + 1]) {
        break;
      }

      prev = curr;
      i++;
    }

    console.log('after:', x, ', new values array:\n', util.inspect(values));
  }

}, 200);






