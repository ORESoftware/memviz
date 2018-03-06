'use strict';

//dts
import {RequestHandler} from 'express';

//core
import path = require('path');
import fs = require('fs');

//npm
const Handlebars = require('handlebars');

/////////////////////////////////////////////////////////////////////////////////////////////////////

export interface MemVizOptions {
  frequency: number,
  maxCount: number
}

export const memviz = function (opts: MemVizOptions) {
  
  const freq = opts.frequency || 100000;
  const maxCount = opts.maxCount || 100000;
  
  if (!Number.isInteger(freq)) {
    throw new Error('"frequency" option value is not an integer: ' + freq);
  }
  
  if(!Number.isInteger(maxCount)){
    throw new Error('"maxCount" option value is not an integer: ' + freq);
  }
  
  if (freq < 101) {
    throw new Error('"frequency" integer value must be greater than 100 (100ms).');
  }
  
  if (maxCount < 1001) {
    throw new Error('"maxCount" integer value must be greater than 1000 (100ms).');
  }
  
  if (maxCount > 5000000) {
    throw new Error('"maxCount" integer value must be less than 5000001.');
  }
  
  // const templatePath = path.resolve(__dirname + '/templates/d3-multi-line-plot.html');
  const templatePath = path.resolve(__dirname + '/templates/memviz.html');
  const source = fs.readFileSync(templatePath);
  const template = Handlebars.compile(String(source));
  
  const mem = {
    count: 0,
    // heapTotals: [] as any,
    // heapUseds: [] as any,
    // maxHeapTotal: 0,
    // maxHeapUsed: 0,
    // rss: [] as any,
    // heapTotal: [] as any,
    // heapUsed: [] as any,
    newOne: [] as any
  };
  
  const firstNow = Date.now();
  const div  = 1024 * 1024;
  
  setInterval(function () {
    
    const m = process.memoryUsage();
    const now = Date.now() - firstNow;
    
    // mem.rss.push({x: now, y: m.rss});
    // mem.heapTotal.push({x: now, y: m.heapTotal});
    // mem.heapUsed.push({x: now, y: m.heapUsed});
    
    mem.newOne.push([
      mem.count++,
      m.rss/div,
      m.heapTotal/div,
      m.heapUsed/div
    ]);
    
    if(mem.newOne.length > maxCount){
      mem.newOne.shift();
    }
    
    // if (mem.heapUsed.length > 10000) {
    //   mem.heapUsed.shift();
    // }
    //
    // if (mem.rss.length > 10000) {
    //   mem.rss.shift();
    // }
    //
    // if (mem.heapTotal.length > 10000) {
    //   mem.heapTotal.shift();
    // }
    
  }, freq);
  
  return <RequestHandler> function (req, res) {
    
    // const val = {
    //   rss: JSON.stringify(mem.rss),
    //   heapTotal: JSON.stringify(mem.heapTotal),
    //   heapUsed: JSON.stringify(mem.heapUsed)
    // };
    
    const htmlResult = template({intervalSeconds: String(freq/1000), ms: String(freq), aa: JSON.stringify(mem.newOne)});
    res.send(htmlResult);
    
  }
  
};

export default memviz;