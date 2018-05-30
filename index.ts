'use strict';

//dts
import {RequestHandler} from 'express';

//core
import util = require('util');
import path = require('path');
import fs = require('fs');

//npm
const Handlebars = require('handlebars');

/////////////////////////////////////////////////////////////////////////////////////////////////////

export interface MemVizOptions {
  frequency: number,
  maxCount: number,
  maxAge: number
}

export const validateInterval = function (freq: number) {
  
  if (!Number.isInteger(freq)) {
    throw new Error('"frequency" option value is not an integer: ' + freq);
  }
  
  if (freq < 0.2) {
    throw new Error('"frequency" integer value must be greater than 0.2 (1/5 of a second.).');
  }
  
  return freq * 1000;
  
};

export const validateMaxCount = function (maxCount: number) {
  
  if (!Number.isInteger(maxCount)) {
    throw new Error('"maxCount" option value is not an integer: ' + maxCount);
  }
  
  if (maxCount < 100) {
    throw new Error('"maxCount" integer value must be greater than 100.');
  }
  
  if (maxCount > 5000) {
    throw new Error('"maxCount" integer value must be less than 5001.');
  }
  
  return maxCount;
  
};

export const validateMaxAge = function (maxAge: number) {
  
  if (!Number.isInteger(maxAge)) {
    throw new Error('"maxAge" option value is not an integer: ' + maxAge);
  }
  
  if (maxAge < 10) {
    throw new Error('"maxAge" integer value must be greater than 9 (9 seconds).');
  }
  
  if (maxAge > 1728000) {
    throw new Error('"maxAge" integer value must be less than 1728001 - you cannot collect more than 20 days worth of data.');
  }
  
  return maxAge * 1000;
  
};

export const memviz = function (opts: MemVizOptions) {
  
  const freqMillis = validateInterval(opts.frequency || 100);
  const maxCount = validateMaxCount(opts.maxCount || 5000);
  const maxAgeMillis = validateMaxAge(opts.maxAge || 1728000);
  
  console.log('maxCount:', maxCount);
  console.log('freq:', freqMillis);
  console.log('maxAge:', maxAgeMillis);
  
  // const templatePath = path.resolve(__dirname + '/templates/d3-multi-line-plot.html');
  const templatePath = path.resolve(__dirname + '/templates/memviz.html');
  const source = fs.readFileSync(templatePath);
  const template = Handlebars.compile(String(source));
  const firstNow = Date.now();
  const div = 1024 * 1024;
  let x = 0;
  const dates = [] as any;
  
  const onInterval = function () {
    
    const m = process.memoryUsage();
    const now = Date.now() - firstNow;
    
    // mem.rss.push({x: now, y: m.rss});
    // mem.heapTotal.push({x: now, y: m.heapTotal});
    // mem.heapUsed.push({x: now, y: m.heapUsed});
    
    dates.push(Date.now());
    
    mem.newOne.push([
      mem.count++,
      m.rss / div,
      m.heapTotal / div,
      m.heapUsed / div
    ]);
    
    const v = mem.newOne;
    // mem.temp.push(x++);
    
    while (true) {
      if (dates[0] && ((now - dates[0]) > maxAgeMillis)) {
        dates.shift();
        v.shift();
        console.log('removed an old date');
      }
      else {
        break;
      }
    }
    
    const l = v.length;
    
    if (l > maxCount) {
      const rand = Math.floor(Math.random() * l);
      mem.newOne.splice(rand, 1);
      dates.splice(rand, 1);
      console.log('new temp array:\n', util.inspect(mem.newOne));
    }
  
    console.log('new temp array length:\n', mem.newOne.length);
    
    // if(mem.temp.length > 10){
    //
    //   let prev = mem.temp.shift(), curr, i = 0;
    //
    //   while(true){
    //
    //     curr = mem.temp[i];
    //
    //     mem.temp[i] = (prev + curr)/2;
    //     // console.log('memtemi:', mem.temp[i]);
    //
    //     if(!mem.temp[i+1]){
    //       break;
    //     }
    //
    //     prev = curr;
    //     i++;
    //
    //   }
    //
    //   console.log('new temp array:\n', util.inspect(mem.temp));
    // }
    
    // if (mem.newOne.length > mem.maxCount) {
    //
    //   let prev = mem.newOne.shift();
    //   let i = 0;
    //
    //   while (true) {
    //
    //     let curr = v[i + 1];
    //
    //     v[i] = [
    //       prev[0],
    //       (prev[1] + curr[1]) / curr[1],
    //       (prev[2] + curr[2]) / curr[2],
    //       (prev[3] + curr[3]) / curr[3]
    //     ];
    //
    //     prev = [
    //       v[i + 1][0],
    //       v[i + 1][1],
    //       v[i + 1][2],
    //       v[i + 1][3],
    //     ];
    //
    //     i++;
    //
    //     if (!v[i + 1]) {
    //       break;
    //     }
    //
    //   }
    //
    //   console.log('new array:\n', util.inspect(mem.newOne));
    //
    // }
    
    // if (mem.newOne.length > mem.maxCount) {
    //
    //   const newv = [];
    //
    //   let i = 0;
    //
    //   while(true){
    //
    //     newv.push([
    //       v[i][0],
    //       (v[i][1] + v[i+1][1])/(v[i][1]),
    //       (v[i][2] + v[i+1][2])/(v[i][2]),
    //       (v[i][3] + v[i+1][3])/(v[i][3])
    //     ]);
    //
    //     i++;
    //
    //     if(!v[i+1]) {
    //       break;
    //     }
    //
    //   }
    //
    //   console.log('new array:\n', util.inspect(newv));
    //   mem.newOne = newv;
    //
    // }
    
  };
  
  const mem = {
    count: 0,
    maxCount: maxCount,
    temp: [] as any,
    v: setInterval(onInterval, freqMillis),
    // heapTotals: [] as any,
    // heapUseds: [] as any,
    // maxHeapTotal: 0,
    // maxHeapUsed: 0,
    // rss: [] as any,
    // heapTotal: [] as any,
    // heapUsed: [] as any,
    newOne: [] as any
  };
  
  return <RequestHandler> function (req, res) {
    
    // const val = {
    //   rss: JSON.stringify(mem.rss),
    //   heapTotal: JSON.stringify(mem.heapTotal),
    //   heapUsed: JSON.stringify(mem.heapUsed)
    // };
    
    if (!(req.query && req.query.update)) {
      const htmlResult = template({
        intervalSeconds: String(freqMillis / 1000),
        ms: String(freqMillis),
        aa: JSON.stringify(mem.newOne)
      });
      
      return res.send(htmlResult);
    }
    
    try {
      const opts = JSON.parse(req.query.update);
      
      if (Object.keys(opts).length < 1) {
        return res.status(500).send(`<html>MemViz update object received, but the update object had no keys.</html>`);
      }
      
      if (Object.keys(opts).length > 1) {
        return res.status(500).send(`<html>MemViz update object received, but MemViz can only handle 1 update object key per request.</html>`);
      }
      
      if (Number.isInteger(opts.newInterval)) {
        clearInterval(mem.v);
        mem.v = setInterval(onInterval, validateInterval(opts.newInterval));
        return res.status(200).send(`<html>MemViz interval changed to ${opts.newInterval}ms.</html>`);
      }
      
      if (Number.isInteger(opts.newMaxCount)) {
        mem.maxCount = validateMaxCount(opts.newMaxCount);
        return res.status(200).send(`<html>MemViz maxCount changed to ${opts.newMaxCount}.</html>`);
      }
      
    }
    catch (err) {
      return res.status(500).send(`<html>MemViz error parsing options (you may be using malformed JSON): ${err.stack}</html>`);
    }
  }
  
};

export default memviz;