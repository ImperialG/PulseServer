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
        cb(null, './public/recordings')
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

/* 
 *  Method Name: File-Upload
 *  Description: This method handles the heart rate estimation
 */
router.post('/file-upload', function (req, res) {
    console.log('Received file ' + JSON.stringify(req.file.originalname) + ' as ' + req.file.filename);
    
    //req.body.usePersonalModel is a string being {true | false} to specify user dependent or independent model
    var usePersonal = req.body.usePersonalModel
    //phoneID is an alphanumeric string unique to each individual android device
    var id = req.body.phoneID;
    
    //Create temporary file for use in predict.py
    var touch = 'touch ' + req.file.path + '_hr.txt';
    exec(touch, function (error, stdout, stderr) {
        console.log(touch);
        console.log(stdout);
        console.log(stderr);
        //Select usermodel or general model depending on usePersonal flag
        if (usePersonal === 'false') {
            var cmd = 'python predict.py ' + req.file.path + ' ' + req.file.path + '_hr.txt'
        } else if (usePersonal === 'true') {
            var usrmodel = 'users/' + id + '/libsvm.model' 
            var cmd = 'python predict.py ' + req.file.path + ' ' + req.file.path + '_hr.txt' + ' ' + usrmodel
        } else {
            res.send("usePersonalModel field not specified");
        }
        var model = 'users/' + id + '/libsvm.model' 
        //Execute predict.py
        exec(cmd, function (error, stdout, stderr) {
            console.log(cmd);
            //Return heartrate as res
            res.json({
                "heartrate": stdout
            })
            console.log(stdout);
            console.log(stderr);
            //Delete temporary and audio file
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

router.post('/file-upload-test', function (req, res) {
    var ans = 70 + (10 * Math.random());
    res.json({
        "heartrate": ans
    })
});
/* 
 *  Method Name: Train
 *  Description: This method handles the user model training
 */
router.post('/train', function (req, res) {
    console.log('Received file ' + JSON.stringify(req.file.originalname) + ' as ' + req.file.filename);

    //phoneID is an alphanumeric unique to each individual android device
    var id = req.body.phoneID;
    //user logs their heartrate when the audio was recorded
    var hr = req.body.estimatedHR;

    //Create a new directory in users for this user if one does not exist
    var mk = 'mkdir -p users/' + id ;
    exec(mk, function (error, stdout, stderr) {
        console.log(mk);
        console.log(stdout);
        console.log(stderr);
        //Copy the generic model into this user's directory if they do not have one
        var model = 'users/' + id + '/libsvm.model' 
        exec('test -e ' + model + ' || cp libsvm-3.20/Model/libsvm.model ' + model, function (error, stdout, stderr) {
            console.log('test -e ' + model + ' || cp libsvm-3.20/Model/libsvm.model ' + model);
            console.log(stdout);
            console.log(stderr);
            //Copy the audio to an audio with the right format for processing
            var cp = 'cp ' + req.file.path + ' ' + 'public/recordings/' + 'user=' + id + '_hr=' + hr + '.wav'
            exec(cp, function (error, stdout, stderr) {
                console.log(cp);
                console.log(stdout);
                console.log(stderr);
                //Create a temporary file for the python script to use in processing
                var tempfile = 'users/' + id + '/tempfile.txt'
/*                var createTemp = ' test -e ' + tempfile + ' || touch ' + tempfile;
                exec(createTemp, function (error, stdout, stderr) {
                    console.log(createTemp);
                    console.log(stdout);
                    console.log(stderr);
*/                    //createIndividualModel overwrites the existing model with a new trained one
                    var train = 'python createIndividualModel.py public/recordings/' + 'user=' + id + '_hr=' + hr + '.wav ' + tempfile + ' ' + model
                    exec(train, function (error, stdout, stderr) {
                        console.log(train);
                        console.log(stdout);
                        console.log(stderr);
                        
                        //Remove files no longer needed
                        var rm_wav = 'rm ' + req.file.path
                        exec(rm_wav, function (error, stdout, stderr) {
                            console.log(rm_wav);
                            console.log(stdout);
                            console.log(stderr); 
                            
                                var rm_wav2 = 'rm public/recordings/' + 'user=' + id + '_hr=' + hr + '.wav'
                                exec(rm_wav2, function (error, stdout, stderr) {
                                    console.log(rm_wav2);
                                    console.log(stdout);
                                    console.log(stderr); 
                                    res.send('Training Complete');
                                });
                        });
                    });
                //}); 
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
