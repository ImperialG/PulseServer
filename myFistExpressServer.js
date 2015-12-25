var express = require("express");
var app = express();

app.get("/", function(req, res) {
    res.sendfile('index.htm')
});

app.listen(3000);

