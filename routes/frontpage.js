var Article = require('../modules/article').Article;
var AuthError = require('../error').AuthError;
var HttpError = require('../error').HttpError;
var User = require('../modules/user').User;
var config = require('../config');
var log = require('../libs/log')(module);
var async = require('async');
var crypt = require('../libs/crypt');
var rmdir = require( 'rmdir' );
var delete_on = require('./manage_article').delete_on;
var up_on = require('./manage_article').up_on;
exports.get = function (req, res, next){
    if (req.user){
        res.render('main')
    } else {
        res.redirect('/login');
    }
};
exports.getArticles = function(req, res, next){
    var id = crypt.encrypt(req.user._id + "", config.get("article:password"));
    Article.find({id: id}, function(err, result){
        if(err) return next(err);
        var send = [];
        async.each(result, function(item, callback){
            var acc_info = {};
            try {
                acc_info.Category = item.building;
                acc_info.Type = item.adv_type;
                acc_info.Location = item.location.slice(0, 3);
                acc_info.Square = item.space[0];
                acc_info.Price = item.price;
                acc_info.Site = item.site;
                acc_info.Rooms = item.rooms;
                acc_info.Floors = item.floor[0];
                acc_info.Title = item.title;
                acc_info.Telephone = item.telephone;
                acc_info.Name = item.name;
                acc_info.Currency = item.currency;
                acc_info.id = crypt.encrypt(item._id + "", config.get("article:password"));
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

exports.getArticle = function(req, res, next){
    var id = crypt.decrypt(req.body.id + "", config.get("article:password"));
    Article.findOne({_id: id}, function(err, result){
        if(err || !result) return next(new Error('not found'));
        var copy = JSON.parse(JSON.stringify(result));
        copy._id = crypt.encrypt(result._id + "", config.get("article:password"));
        res.json(copy);
    });
};

exports.deleteArticles = function(req, res, next){
    try {
        var arr_id = JSON.parse(req.body.id);
    } catch(e){
        return next(e);
    }
    arr_id = arr_id.map(function(id){
        return crypt.decrypt(id + "", config.get("article:password"));
    });
    if (!req.user.log.status){
        return next(new Error('processing'));
    }
    delete_on(arr_id, req.user._id);
    setTimeout(function () {
        wait_for_process_start(req.user._id, arr_id)
    }, 150);
    res.send("Yep");
};

exports.up_position = function(req, res, next){
    try {
        var arr_id = JSON.parse(req.body.id);
    } catch(e){
        return next(e);
    }
    arr_id = arr_id.map(function(id){
        return crypt.decrypt(id + "", config.get("article:password"));
    });
    if (!req.user.log.status){
        return next(new Error('processing'));
    }
    up_on(arr_id, req.user._id);
    res.send("Yep");
};

function wait_for_process_start(_id, arr_id){
    User.findOne({_id: _id}, function(err, user) {
        if (user.log.status) {
            setTimeout(function () {
                wait_for_process_start(_id, arr_id)
            }, 150);
        } else {
            wait_for_process_end(_id, arr_id);
        }
    });
}

function wait_for_process_end(_id, arr_id){
    User.findOne({_id: _id}, function(err, user) {
        if (!user.log.status) {
            setTimeout(function () {
                wait_for_process_end(_id, arr_id)
            }, 500);
        } else {
            async.each(arr_id, function (id, callback) {
                Article.findOne({_id: id}, function (err, article) {
                    if (err || !article) return callback(null);
                    rmdir(config.get('path') + '/public/articles_img/' + crypt.encrypt(id + "", config.get("article:password")), function(){});
                    Article.remove({_id: article._id}, function () {});
                    callback(null);
                });
            });
        }
    });
}
