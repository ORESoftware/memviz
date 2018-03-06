'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
var fs = require("fs");
var Handlebars = require('handlebars');
exports.memviz = function (opts) {
    var freq = opts.frequency || 100000;
    var maxCount = opts.maxCount || 100000;
    if (!Number.isInteger(freq)) {
        throw new Error('"frequency" option value is not an integer: ' + freq);
    }
    if (!Number.isInteger(maxCount)) {
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
    var templatePath = path.resolve(__dirname + '/templates/memviz.html');
    var source = fs.readFileSync(templatePath);
    var template = Handlebars.compile(String(source));
    var mem = {
        count: 0,
        newOne: []
    };
    var firstNow = Date.now();
    var div = 1024 * 1024;
    setInterval(function () {
        var m = process.memoryUsage();
        var now = Date.now() - firstNow;
        mem.newOne.push([
            mem.count++,
            m.rss / div,
            m.heapTotal / div,
            m.heapUsed / div
        ]);
        if (mem.newOne.length > maxCount) {
            mem.newOne.shift();
        }
    }, freq);
    return function (req, res) {
        var htmlResult = template({ intervalSeconds: String(freq / 10000), ms: String(freq), aa: JSON.stringify(mem.newOne) });
        res.send(htmlResult);
    };
};
exports.default = exports.memviz;
