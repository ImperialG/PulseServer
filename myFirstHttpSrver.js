var express = require('express');
var multer  = require('multer');

var app = express();

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/recordings')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '.wav');
  }
})

var upload = multer({ storage: storage })
app.use(upload.single('audio'));

app.get('/', function(req, res){
  res.send('hello world');
});

app.post('/', function(req, res){
    console.log(req.file.originalname) // form fields
    res.send('File Stored');
});



var server = app.listen(8000, function() {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);
});