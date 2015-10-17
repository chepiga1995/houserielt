var Article = require('../modules/article').Article;
var AuthError = require('../error').AuthError;
var HttpError = require('../error').HttpError;
var config = require('../config');
var log = require('../libs/log')(module);
var async = require('async');
var crypt = require('../libs/crypt');
var path = require('path');
var fs = require('fs');
var rmdir = require( 'rmdir' );

exports.get = function(req, res, next){
    var id  = crypt.decrypt(req.params.id + "", config.get("article:password"));
    Article.findOne({_id: id}, function(err, article){
        if (err || !article) return next(new HttpError(404, "Article not found"));
        res.render("edit_article");
    });
};

exports.delete = function(req, res, next){
    var id  = crypt.decrypt(req.body.id + "", config.get("article:password"));
    Article.findOne({_id: id}, function(err, article){
        if (err || !article) return next(new Error("Article not found"));
        rmdir(config.get('path') + '/public/articles_img/' + req.body.id, function(){
            return 0;
        });
        Article.remove({_id: article._id}, function (err) {
            if (err) return next(new Error("Can't delete"));
            res.end('Done');
        });
    });
};
exports.saveArticle = function(req, res, next){
    try {
        var data = JSON.parse(req.body.data);
        var id = crypt.decrypt(data.id + "", config.get("article:password"));
        delete data.id;
        Article.findOne({_id: id}, function(err, article){
            if (err || !article) return next(err);
            for (var key in data) {
                if(data.hasOwnProperty(key)) {
                    article[key] = data[key];
                }
            }
            article.confirm = true;
            article.save(function(err){
                if (err) return next(err);
                res.send('Yep');
            });
        });
    } catch(e) {
        res.send('Nope');
    }
};
exports.addImage = function(req, res, next){
    try {
        var fstream;
        req.pipe(req.busboy);
        req.busboy.on('file', function (fieldname, file, filename) {
            var d = new Date();
            var name = d.getTime() + path.extname(filename);
            fstream = fs.createWriteStream(config.get("path") + '/public/articles_img/' + fieldname + '/' + name);
            file.pipe(fstream);
            fstream.on('close', function () {
                log.info("Upload Finished of " + filename);
                res.end(name);
            });
        });
    } catch(err){
        return next(new Error("Couldn't load image"))
    }
};