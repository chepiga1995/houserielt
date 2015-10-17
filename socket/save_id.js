var cookie = require('cookie');
var sessionStore = require('../libs/sessionStore');
var cookieParse = require('cookie-parser');
var log = require('../libs/log')(module);
var config = require('config');

exports.pre_processing = function(socket, next){
    try {
        var sidCookie = cookie.parse(socket.request.headers.cookie)[config.get('session:name')];
        var sid = cookieParse.signedCookie(sidCookie, config.get('session:secret'));
        sessionStore.load(sid, function (err, session) {
            if (err) return next();
            var id = session.user;
            socket.id = id;
            log.info('Connected user id: ' + id);
            next();
        });
    } catch(e){
        next();
    }



};