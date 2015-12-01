var express = require("express");
var app = express();

app.get("/", function(req, res) {
    res.sendfile('index.htm')
});

//SMILExtract -C config/demo/signalGenerator.conf -I example-audio/opensmile.wav -O opensmile.signalGenerator.csv

