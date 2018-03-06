

### MemViz - Express middleware for visualizing memory usage


##### <i> install </i>:  `npm install memviz -S`


### Usage 

```js
const express = require('express');
const {memviz} = require('memviz');

const app = express();

app.use('/memory', memviz({
  frequency: 100000,  // sample interval (in milliseconds)
  maxCount: 200000  // maximum number of entries to store 
}));
```


If you do a `GET /memory`, you will see this in the browser:


![MemViz visual example](https://raw.githubusercontent.com/oresoftware/memviz/master/media/memviz.png "Memviz Primary Image")


You can probably use an iframe to display this on a webpage as well.


