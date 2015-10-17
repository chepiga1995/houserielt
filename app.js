var express = require('express');
var app  = express();
var favicon = require('serve-favicon');
var morgan = require('morgan');
var cookieParse = require('cookie-parser');
var serveStatic = require('serve-static');
var config = require('config');
var errorhandler = require('errorhandler');
var log = require('./libs/log')(module);
var HttpError = require('./error').HttpError;
var session = require('express-session');
var mongoose = require('./libs/mongoosedb');
var sessionStore = require('./libs/sessionStore');
var bodyParser = require('body-parser');
var busboy = require('connect-busboy');
var server = require('http').Server(app);


var cron_one =  require('./libs/cron').job_one;

//cron_one.start();


app.use(busboy());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.engine('ejs', require('ejs-locals'));
app.set('views', __dirname + '/templates');
app.set('view engine', 'ejs');
app.use(favicon(__dirname + "/public/favicon.ico"));
app.use(morgan('dev'));
app.use(cookieParse());
app.use(session({
    name: config.get("session:name"),
    secret: config.get("session:secret"),
    cookie: {
        maxAge: config.get("session:cookie:maxAge")
    },
    store: sessionStore
}));
app.use(require('middleware/sendHttpError'));
app.use(require('middleware/loadUser'));
app.use(serveStatic('public'));
if (app.get('env') == 'development'){
    app.use(errorhandler());
}
require('./routes')(app);


app.use(function(err, req, res, next){
    var sendErrorMethod = res.sendPostError;
    if(req.method == 'GET') {
        sendErrorMethod = res.sendHttpError;
    }
    if (typeof err == "number"){
        err = new HttpError(err);
    }
    log.error(err);
    sendErrorMethod(err);
});


server.listen(config.get('port'), config.get('host'), function(){
    log.info("Express server listening on port %d in %s mode", config.get('port'), app.get('env'));
});

var io = require('./socket')(server);
app.set('io', io);