'use strict';
var util = require("util");
var path = require("path");
var fs = require("fs");
var Handlebars = require('handlebars');
exports.validateInterval = function (freq) {
    if (!Number.isInteger(freq)) {
        throw new Error('"frequency" option value is not an integer: ' + freq);
    }
    if (freq < 0.2) {
        throw new Error('"frequency" integer value must be greater than 0.2 (1/5 of a second.).');
    }
    return freq * 1000;
};
exports.validateMaxCount = function (maxCount) {
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
exports.validateMaxAge = function (maxAge) {
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
exports.memviz = function (opts) {
    var freqMillis = exports.validateInterval(opts.frequency || 100);
    var maxCount = exports.validateMaxCount(opts.maxCount || 5000);
    var maxAgeMillis = exports.validateMaxAge(opts.maxAge || 1728000);
    console.log('maxCount:', maxCount);
    console.log('freq:', freqMillis);
    console.log('maxAge:', maxAgeMillis);
    var templatePath = path.resolve(__dirname + '/templates/memviz.html');
    var source = fs.readFileSync(templatePath);
    var template = Handlebars.compile(String(source));
    var firstNow = Date.now();
    var div = 1024 * 1024;
    var x = 0;
    var dates = [];
    var onInterval = function () {
        var m = process.memoryUsage();
        var now = Date.now() - firstNow;
        dates.push(Date.now());
        mem.newOne.push([
            mem.count++,
            m.rss / div,
            m.heapTotal / div,
            m.heapUsed / div
        ]);
        var v = mem.newOne;
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
        var l = v.length;
        if (l > maxCount) {
            var rand = Math.floor(Math.random() * l);
            mem.newOne.splice(rand, 1);
            dates.splice(rand, 1);
            console.log('new temp array:\n', util.inspect(mem.newOne));
        }
        console.log('new temp array length:\n', mem.newOne.length);
    };
    var mem = {
        count: 0,
        maxCount: maxCount,
        temp: [],
        v: setInterval(onInterval, freqMillis),
        newOne: []
    };
    return function (req, res) {
        if (!(req.query && req.query.update)) {
            var htmlResult = template({
                intervalSeconds: String(freqMillis / 1000),
                ms: String(freqMillis),
                aa: JSON.stringify(mem.newOne)
            });
            return res.send(htmlResult);
        }
        try {
            var opts_1 = JSON.parse(req.query.update);
            if (Object.keys(opts_1).length < 1) {
                return res.status(500).send("<html>MemViz update object received, but the update object had no keys.</html>");
            }
            if (Object.keys(opts_1).length > 1) {
                return res.status(500).send("<html>MemViz update object received, but MemViz can only handle 1 update object key per request.</html>");
            }
            if (Number.isInteger(opts_1.newInterval)) {
                clearInterval(mem.v);
                mem.v = setInterval(onInterval, exports.validateInterval(opts_1.newInterval));
                return res.status(200).send("<html>MemViz interval changed to " + opts_1.newInterval + "ms.</html>");
            }
            if (Number.isInteger(opts_1.newMaxCount)) {
                mem.maxCount = exports.validateMaxCount(opts_1.newMaxCount);
                return res.status(200).send("<html>MemViz maxCount changed to " + opts_1.newMaxCount + ".</html>");
            }
        }
        catch (err) {
            return res.status(500).send("<html>MemViz error parsing options (you may be using malformed JSON): " + err.stack + "</html>");
        }
    };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = exports.memviz;
