var sendMail = require("../libs/mailer");
var User = require('../modules/user').User;
var log = require('../libs/log')(module);
var config = require('../config');
var crypt = require('../libs/crypt');


exports.get = function(req, res, next){
    if(req.user){
        redirect("/");
    } else {
        res.render('pas');
    }
};
exports.post = function(req, res, next){
    var username = req.body.username;
    User.findOne({username: username}, function(err, user){
        if(err) next(err);
        if (user && user.activate){
            var id = crypt.encrypt(user._id + "", config.get("change_password:password"));
            var url = "http://" + config.get("out_host") + ":" + config.get("port") + "/changepw/" + id;
            sendMail(username, "Восстановление пароля", url, "<p>" + user.name + "</p>" +
                "<p>Чтобы изменить пароль необходимо перейти по ссылке ниже</p>" +
                "<a href='"+ url + "'>" + url +"</a>",function(error, info){
                if(error){
                    log.error(err);
                    next(err);
                }else{
                    res.send('Yep');
                    log.info('Message sent: ' + info.response);
                }
            });
        } else {
            res.send("nope");
        }
    });
};

