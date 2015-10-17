var User = require('../modules/user').User;
var AuthError = require('../error').AuthError;
var HttpError = require('../error').HttpError;
var sendMail = require("../libs/mailer");
var config = require('../config');
var log = require('../libs/log')(module);

exports.get = function (req, res, next){
    if (req.user){
        res.redirect('/');
    } else {
        res.render('reg');
    }
};

exports.post = function(req, res, next){
    var username = req.body.username;
    var password = req.body.password;
    var name = req.body.name;
    var telephone = req.body.telephone;
    var skype = req.body.skype;
    User.registration(username, password, name, telephone, skype, function(err, user){
        if (err){
            next(err);
        } else {
            var url = "http://" + config.get("out_host") + ":" + config.get("port") + "/activate/" + user._id;
            sendMail(username, "Активация", url, "<p>" + user.name + "</p>" +
                "<p>Для активации аккаунта необходимо перейти по ссылки ниже</p>" +
                "<a href='"+ url + "'>" + url +"</a>",function(error, info){
                if(error){
                    log.error(err);
                    User.remove({ _id: user._id }, function(err) {
                        if (err) next(err);
                    });
                    next(err);
                }else{
                    res.send('Yep');
                    log.info('Message sent: ' + info.response);
                }
            });
        }
    });
};
exports.activate = function(req, res, next){
    var id = req.params.id;
    User.findByIdAndUpdate(id, { $set: { activate: true }}, function (err, user) {
        if (err)  return next(err);
        res.render('message', {text: "Ваша учетная запись успешно активирована"});
    });
};