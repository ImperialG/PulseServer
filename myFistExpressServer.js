var express = require("express");
var app = express();

app.get("/", function(req, res) {
    res.send('jahaha');
});

app.listen(3000);

