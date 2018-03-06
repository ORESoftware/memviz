'use strict';

//dts
import {Router, RequestHandler} from 'express';

//core
import path = require('path');
import fs = require('fs');

//npm
const Handlebars = require('handlebars');


export interface MemVizOptions {
  frequency: number,
  
}


export const memviz = function (opts: MemVizOptions) {
  
  const frequency = opts.frequency || 100000;
  
  if(!Number.isInteger(frequency)){
    throw new Error('frequency is not an integer: ' + frequency);
  }
  
  if(frequency < 101){
    throw new Error('frequency integer value must be greater than 100 (100ms).');
  }
  
  const templatePath = path.resolve(__dirname + '/templates/d3-multi-line-plot.html');
  const source = fs.readFileSync(templatePath);
  const template = Handlebars.compile(String(source));
  
  
   const mem = {
    heapTotals: [] as any,
    heapUseds: [] as any,
    maxHeapTotal: 0,
    maxHeapUsed: 0,
    rss: [] as any,
    heapTotal: [] as any,
    heapUsed: [] as any
  };
  
  const firstNow = Date.now();
  
  setInterval(function () {
    
    const m = process.memoryUsage();
    const now = Date.now() - firstNow;
    
    mem.rss.push({x: now, y: m.rss});
    mem.heapTotal.push({x: now, y: m.heapTotal});
    mem.heapUsed.push({x: now, y: m.heapUsed});
    
    if (mem.heapUsed.length > 10000) {
      mem.heapUsed.shift();
    }
    
    if (mem.rss.length > 10000) {
      mem.rss.shift();
    }
    
    if (mem.heapTotal.length > 10000) {
      mem.heapTotal.shift();
    }
    
    
  }, frequency);
  
  
  return <RequestHandler> function (req, res, next) {
  
  
    const val = {
      rss: JSON.stringify(mem.rss),
      heapTotal: JSON.stringify(mem.heapTotal),
      heapUsed: JSON.stringify(mem.heapUsed)
    };
  
    const htmlResult = template(val);
    res.send(htmlResult);
  
  
  }
  
};

export default memviz;