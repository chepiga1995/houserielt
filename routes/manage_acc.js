var Account = require('../modules/account').Account;
var Article = require('../modules/article').Article;
var AuthError = require('../error').AuthError;
var HttpError = require('../error').HttpError;
var sendMail = require("../libs/mailer");
var config = require('../config');
var log = require('../libs/log')(module);
var async = require('async');
var crypt = require('../libs/crypt');
var PythonShell = require('python-shell');

exports.get = function(req, res, next){
    res.render("manage_acc");
};

exports.checkAccount = function(req, res, next){
    var username = req.body.username;
    var site = req.body.site;
    Account.checkAccount(username, site, function(err, account) {
        if(err) return next(err);
        if(account){
            res.send("Nope");
        } else {
            res.send("Yep");
        }
    });
};
exports.addAccount = function(req, res, next){
    var username = req.body.username;
    var password = req.body.password;
    var telephone = req.body.telephone;
    var site = req.body.site;
    var id = crypt.encrypt(req.user._id + "", config.get("account:password"));
    PythonShell.run('../python/checkAccounts.py', {mode: 'text', args: [username, password, site]}, function (err, result) {
        if (err) return next(err);
        if(result == "Yep"){
            Account.registration(username, password, site, telephone, id, function(err, account){
                if (err){
                    return next(err);
                } else {
                    res.send("Yep");
                }
            });
        } else {
            res.send("Nope");
        }
    });
    /*Account.registration(username, password, site, id, function(err, account){
        if (err){
            return next(err);
        } else {
            res.send("Yep");
        }
    });*/
};
exports.getAccounts = function(req, res, next){
    var id = crypt.encrypt(req.user._id + "", config.get("account:password"));
    Account.find({id: id}, function(err, result){
        if(err) return next(err);
        var send = [];
        async.each(result, function(item, callback){
            var acc_info = {};
            try {
                acc_info.username = item.username;
                acc_info.site = item.site;
                send.push(acc_info);
                callback(null);
            } catch(e){
                if (e){
                    callback(e);
                }
            }
        }, function(err){
            if(err) return next(err);
            res.json(send);
        });
    });
};

exports.getAccountsOnSite = function(req, res, next){
    var id = crypt.encrypt(req.user._id + "", config.get("account:password"));
    var article_id = crypt.decrypt(req.body.article_id, config.get("account:password"));
    var site = req.body.site;
    Account.get_available(id, site, article_id, function(arr){
        res.json(arr.map(function(el){
            delete el.account_id;
            delete el.password;
            return el;
        }));
    });
    //Account.find({id: id, site: site}, function(err, result){
    //    if(err) return next(err);
    //    var send = [];
    //    async.each(result, function(item, callback){
    //        var acc_info = {};
    //        try {
    //            var ar_id = crypt.encrypt(item._id + '', config.get("article:password"));
    //            if(+max){
    //                Article.find({$or: [{'posted.olx_ua.id': ar_id}, {'posted.fn_ua.id': ar_id}, {'posted.aviso_ua.id': ar_id}, {'posted.address_ua.id': ar_id}, {'posted.mirkvartir_ua.id': ar_id}]}, function(err, result){
    //                    if (err) return callback(null);
    //                    if (result.length < max) {
    //                        acc_info.username = item.username;
    //                        acc_info.site = item.site;
    //                        send.push(acc_info);
    //                    }
    //                    callback(null);
    //                });
    //            } else {
    //                acc_info.username = item.username;
    //                acc_info.site = item.site;
    //                send.push(acc_info);
    //                callback(null);
    //            }
    //        } catch(e){
    //            callback(e);
    //        }
    //    }, function(err){
    //        if(err) return next(err);
    //        res.json(send);
    //    });
    //});
};

exports.sendAccountInfo = function(req, res, next){
    var username = req.body.username;
    var site = req.body.site;
    Account.checkAccount(username, site, function(err, account) {
        if(err) return next(err);
        if(account){
            var password = crypt.decrypt(account.hashedPassword, config.get("account:password") + account.salt);
            sendMail(req.user.username, "Напоминания информацию об аккаунте", username + " " + password + " " + site, "<p>" + req.user.name + " </p>" +
                "<p>Ваша информация пользователя для сайта:  " + site + "</p>" +
                "<p>Ваш адрес электронной почты:  " + username + "</p>" +
                "<p>Ваш телефон:  " + account.telephone + "</p>" +
                "<p>Ваш пароль:  " + password + "</p>",function(error, info){
                if(error){
                    log.error(err);
                    next(err);
                }else{
                    res.send('Yep');
                    log.info('Message sent: ' + info.response);
                }
            });
        } else {
            res.send("Nope");
        }
    });
};
exports.deleteAccount = function(req, res, next){
    var username = req.body.username;
    var site = req.body.site;
    Account.checkAccount(username, site, function(err, account) {
        if(err) return next(err);
        if(account){
            Account.remove({ _id: account._id }, function(err) {
                if (err) return next(err);
                res.send("Yep");
            });
        } else {
            res.send("Nope");
        }
    });
};
exports.getAccountInfo = function(req, res, next){
    var id = crypt.decrypt(req.body.id + "", config.get("article:password"));
    var result_send = {id: req.body.id, username: "Undefined"};
    Account.findOne({_id: id}, function(err, result){

        if(err || !result) return res.json(result_send);
        result_send.username = result.username;
        res.json(result_send);
    });
};