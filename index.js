'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
var fs = require("fs");
var Handlebars = require('handlebars');
exports.memviz = function (opts) {
    var frequency = opts.frequency || 100000;
    if (!Number.isInteger(frequency)) {
        throw new Error('frequency is not an integer: ' + frequency);
    }
    if (frequency < 101) {
        throw new Error('frequency integer value must be greater than 100 (100ms).');
    }
    var templatePath = path.resolve(__dirname + '/templates/d3-multi-line-plot.html');
    var source = fs.readFileSync(templatePath);
    var template = Handlebars.compile(String(source));
    var mem = {
        heapTotals: [],
        heapUseds: [],
        maxHeapTotal: 0,
        maxHeapUsed: 0,
        rss: [],
        heapTotal: [],
        heapUsed: []
    };
    var firstNow = Date.now();
    setInterval(function () {
        var m = process.memoryUsage();
        var now = Date.now() - firstNow;
        mem.rss.push({ x: now, y: m.rss });
        mem.heapTotal.push({ x: now, y: m.heapTotal });
        mem.heapUsed.push({ x: now, y: m.heapUsed });
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
    return function (req, res, next) {
        var val = {
            rss: JSON.stringify(mem.rss),
            heapTotal: JSON.stringify(mem.heapTotal),
            heapUsed: JSON.stringify(mem.heapUsed)
        };
        var htmlResult = template(val);
        res.send(htmlResult);
    };
};
exports.default = exports.memviz;
