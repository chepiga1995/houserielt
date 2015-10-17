var Article = require('../modules/article').Article;
var crypt = require('../libs/crypt');
var mongodbAll = require('../libs/mongodbAll');
var config = require('../config');
var childProcess = require("child_process");
var fs = require('fs');
var http = require('http');
var url = require('url');
var path = require('path');
var async = require('async');
var Redis = require('ioredis');
var log = require('../libs/log')(module);
var ObjectId = require('mongodb').ObjectID;

var program_path = config.get("path") + '/python/scrapy';

exports.get = function(req, res, next){
    res.render('add');
};


exports.add_from = function(req, res, next){
    mongodbAll.find_houserielt({_id: ObjectId.createFromHexString(req.body.id)}, 0, function(err, result, next_db){
        if(err || result.array[0].length > 1) {
            next_db();
            return next(err);
        }
        result = result.array[0];
        result.id = crypt.encrypt(req.user._id + "", config.get("article:password"));
        result.skype = (req.user.skype?req.user.skype:"");
        result.per_name = (req.user.name?req.user.name:"");
        if(!result.space[0])
            result.space[0] = '';
        if(!result.space[1])
            result.space[1] = '';
        if(!result.space[2])
            result.space[2] = '';
        if(!result.space)
            result.space = ['', '', ''];
        var img = result.img_src.slice();
        var names = [];
        for(i = 0; i < result.img_src.length; i++) {
            var pathname = url.parse(result.img_src[i]).pathname;
            names[i] = ((new Date()).getTime() + i) + path.extname(pathname);
            result.img_src[i] = names[i];
        }
        delete result.posted;
        delete result.created;
        delete result.ad_id;
        console.log(result);
        Article.registration(result, function(err, article){
            if(err) return next(err);
            var id = crypt.encrypt(article._id + "", config.get("article:password"));
            try {
                fs.mkdirSync(config.get("path") + '/public/articles_img/' + id);
            } catch(e) {
                if ( e.code != 'EEXIST' ) return next(e);
            }
            res.send("Yep " + id);
            async.each(img, function(item){
                var file = fs.createWriteStream(config.get("path") + '/public/articles_img/' + id + '/' + names[img.indexOf(item)]);
                http.get(item, function(response) {
                    response.pipe(file);
                    log.info(names[img.indexOf(item)]);
                });
            });
        });
    });
};


exports.add = function(req, res, next){
    get_article(req, function(err, result, img, names){
        if(err) return next(err);
        Article.registration(result, function(err, article){
            if(err) return next(err);
            var id = crypt.encrypt(article._id + "", config.get("article:password"));
            try {
                fs.mkdirSync(config.get("path") + '/public/articles_img/' + id);
            } catch(e) {
                if ( e.code != 'EEXIST' ) return next(e);
            }
            res.send("Yep " + id);
            async.each(img, function(item){
                var file = fs.createWriteStream(config.get("path") + '/public/articles_img/' + id + '/' + names[img.indexOf(item)]);
                http.get(item, function(response) {
                    response.pipe(file);
                    log.info(names[img.indexOf(item)]);
                });
            });
        });
    });
};

function get_article(req, callback){
    var url_parse = req.body.url;
    var redis = new Redis();
    redis.on('connect', function(){
        var get = url_parse.lastIndexOf('.html') + 5;
        if (get < 10)
            get = url_parse.length;
        console.log(url_parse.slice(0, get));
        redis.set('article' + url_parse.slice(0, get), 'error');
        childProcess.exec('cd ' + program_path + ' && python deploy.py ' + url_parse, function(code, signal){
            //console.log(url_parse.slice(0, url_parse.lastIndexOf('.html') + 5));

            redis.get('article' + url_parse.slice(0, get), function(err, result){
                if(err) return callback(err);
                analyse(result);
                redis.disconnect();
            });

        });
    });



    function analyse(result) {
        try{

            result = result.toString().split("'").join('"').replace(/\u005c\u0078\u0062\u0062/g,'').replace(/\u005c\u0078\u0061\u0062/g,'');
            result = result.toString().split('u"').join('"').replace(/\"\[\"/g, '["').replace(/\"\]\"/g, '"]');
            result = result.toString('utf8');
            log.info(result);
            result = JSON.parse(result);
            //var space = new Array();
            //if (typeof result.space == 'string')
            //    space.push(result.space);
            //log.info(space.length);
            //for (var i = space.length; i < 3; i++) {
            //    space.push('');
            //    log.info(space.length);
            //}
            //result.space = space;

            //result.adv_type = (result.adv_type == '0'?'1':'0');
            //result.building[1] = (result.building[1]- 1) + '';
            result.id = crypt.encrypt(req.user._id + "", config.get("article:password"));
            result.skype = (req.user.skype?req.user.skype:"");
            result.per_name = (req.user.name?req.user.name:"");
            if(!result.space[0])
                result.space[0] = '';
            if(!result.space[1])
                result.space[1] = '';
            if(!result.space[2])
                result.space[2] = '';
            if(!result.space)
                result.space = ['', '', ''];
            //result.data = result.rent_from;
            //result.rent_from = '';
            var img = result.img_src.slice();
            var names = [];
            for(i = 0; i < result.img_src.length; i++) {
                var pathname = url.parse(result.img_src[i]).pathname;
                names[i] = ((new Date()).getTime() + i) + path.extname(pathname);
                result.img_src[i] = names[i];
            }
            callback(null, result, img, names);

        } catch(err){
            callback(err);
        }
    }
}

exports.getAllArticles = function(req, res, next){
    var from = +req.body.from;
    try {
        var query = JSON.parse(req.body.query);
    } catch(e){
        query = {};
    }
    console.log(query);
    mongodbAll.find_houserielt(query, from, function(err, result, next_db){
        if(err) {
            next_db();
            return next(err);
        }
        var send = [];
        async.eachSeries(result.array, function(item, callback){
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
                acc_info.Date = item.date;
                acc_info.Currency = item.currency;
                acc_info.id = item._id;
                send.push(acc_info);
            } catch(e){}
            callback(null);
        }, function(err){
            if(err) {
                next_db();
                return next(err);
            }
            res.json({array: send, len: result.len});
        });
    });
};

exports.getArticleAll = function(req, res, next){
    mongodbAll.find_houserielt({_id: ObjectId.createFromHexString(req.body.id)}, 0, function(err, result, next_db){
        if(err || result.array[0].length > 1) {
            next_db();
            return next(err);
        }
        res.json(result.array[0]);
    });
};
