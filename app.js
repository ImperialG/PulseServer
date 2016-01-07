var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var multer = require('multer');
var sys = require('sys');
var exec = require('child_process').exec;

//var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();
var router = express.Router();

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './root/PulseServer/public/recordings')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '.wav');
    }
})

var upload = multer({ storage: storage })

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(upload.single('audio'));

app.use('/', router);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        console.log(err);
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

//GET Requests

//POST Requests
router.post('/file-upload', function (req, res) {
    console.log('Received file ' + JSON.stringify(req.file.originalname) + ' as ' + req.file.filename);
    try {
        process.chdir('openSMILE-2.2rc1/');
    } catch (err) {
        console.log('chdir: ' + err);
    } 
    //var cmd = 'SMILExtract -C config/demo/demo1\_energy.conf -I ' + '../' + req.file.path + ' -O ' + '../' + req.file.path + '.energy.csv';

    var touch = 'touch ' + req.file.path + '_hr.txt';
    exec(touch, function (error, stdout, stderr) {
        console.log(touch);
        console.log(stdout);
        console.log(stderr);
        var cmd = 'python predict.py ' + req.file.path + ' ' + req.file.path + '_hr.txt'
        exec(cmd, function (error, stdout, stderr) {
            console.log(cmd);
            res.json({
                "heartrate": stdout
            })
            console.log(stdout);
            console.log(stderr);
            var rm_txt = 'rm ' + req.file.path + '_hr.txt';    
            exec(rm_txt, function (error, stdout, stderr) {
                console.log(rm_txt);
                console.log(stdout);
                console.log(stderr); 
                var rm_wav = 'rm ' + req.file.path
                exec(rm_wav, function (error, stdout, stderr) {
                    console.log(rm_wav);
                    console.log(stdout);
                    console.log(stderr); 
                });
            });
        });
    });

    
});

router.post('/train', function (req, res) {
    console.log('Received file ' + JSON.stringify(req.file.originalname) + ' as ' + req.file.filename);
    try {
        process.chdir('openSMILE-2.2rc1/');
    } catch (err) {
        console.log('chdir: ' + err);
    } 

    var id = " "
    var hr = " "

    var mk = 'mkdir -p ../users/' + id ;
    exec(mk, function (error, stdout, stderr) {
        console.log(mk);
        console.log(stdout);
        console.log(stderr);
        var cp = 'cp ../' + req.file.path + ' ' + '../public/recordings/' + 'user=(' + id + ')_hr=(' + hr + ').wav'
        var tempfile = '../users/' + id + '/' + req.file.filename + '.txt'
        var model = '../users/' + id + '/' + id + '_' + 'libsvm.model' 
        exec('test -e ' + model + ' || touch ' + model, function (error, stdout, stderr) {
            console.log('touch ' + model);
            console.log(stdout);
            console.log(stderr);
            exec(cp, function (error, stdout, stderr) {
                console.log(cp);
                console.log(stdout);
                console.log(stderr);
                exec('python createIndividualModel.py ../public/recordings/' + 'user=(' + id + ')_hr=(' + hr + ').wav ' + tempfile + ' ' + model, function (error, stdout, stderr) {
                    console.log('python createIndividualModel.py ../public/recordings/' + 'user=(' + id + ')_hr=(' + hr + ').wav' + tempfile + ' ' + model);
                    console.log(stdout);
                    console.log(stderr);
                }); 
            });
        }); 
    }); 
})

module.exports = app;

var server = app.listen(3000, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Pulse server listening at http://%s:%s', host, port);
});
