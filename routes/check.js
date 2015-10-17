var User = require('../modules/user').User;
var crypt = require('../libs/crypt');
var config = require('../config');

exports.testEmail = function(req, res, next){
    var username = req.body.username;
    User.checkEmail(username, function(err, user) {
        if(err) return next(err);
        if(user){
            res.send("Nope");
        } else {
            res.send("Yep");
        }
    });
};
exports.checkCode = function(req, res, next){
    var code = req.body.code;
    var username = req.body.username;
    var pas = config.get("sendCode:password");
    var key = config.get("sendCode:key");
    if (crypt.decrypt(code, username + pas) == key){

        res.send("Yep");
    } else {
        res.send("Nope");
    }
};