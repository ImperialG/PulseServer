var express = require('express');
var path = require('path');
var multer  = require('multer');
var exec = require('child_process').exec;

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
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res){
  res.send('hello world');
});

app.post('/', function(req, res){
    console.log(req.file.originalname) // form fields
    try {
      process.chdir('openSMILE-2.1.0/');
      console.log('chdir: ' + 'openSMILE-2.1.0/');
    } catch (err) {
      console.log('chdir: ' + err);
    }
    var cmd = 'SMILExtract -C config/demo/demo1\_energy.conf -I ' + '../public/recordings/' + req.file.filename + ' -O ' + req.file.originalname + '.energy.csv';
    exec (cmd, function(error, stdout, stderr) {
      console.log(cmd);
      console.log(stderr);
    });
    var csv_file = req.file.originalname + '.energy.csv';
    res.send('75');
});

var server = app.listen(8000, function() {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);
});