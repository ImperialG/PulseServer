var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var http = require('http');
var fs = require('fs');

//var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();
var router = express.Router();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
//app.use(bodyParser({uploadDir:'./uploads'}));

app.use('/', router);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// static files stored in the public directory
app.use(express.static('public'));

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;

//Routes

//GET requests
router.get('/route', function(req, res) {
    res.send('Received GET request');
});

//POST requests
//Audio sample uploads nust have name "audio" in POST request
router.post('/file-upload', function(req, res) {
    var tmp_path = req.files.audio.path;
    var target_path = './public/recordings/' + req.files.audio.name;
    fs.rename(tmp_path, target_path, function(err) {
        if (err) {
           throw err;
        }
        fs.unlink(tmp_path, function() {
            if (err) {
               throw err;
            }
            res.send('File uploaded to: ' + target_path + '-' + req.files.audio.size + 'bytes');
        });
    });
    res.send('stored');
});

var server = app.listen(3000, function() {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);
});
