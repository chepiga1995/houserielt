var crypt = require('../libs/crypt');
var config = require('../config');
var mongoose = require('../libs/mongoosedb');
var AuthError = require('../error').AuthError;
var async = require('async');
var Article = require('./article').Article;
var Schema = mongoose.Schema;
var Map_max_articles =
{
    "olx_ua": 3,
    "fn_ua": 0,
    "aviso_ua": 0,
    "address_ua": 0,
    "mirkvartir_ua": 0
};
var schema = new Schema({
    username: {
        type: String,
        required: true
    },
    hashedPassword: {
        type: String,
        required: true
    },
    salt: {
        type: String,
        required: true
    },
    created: {
        type: Date,
        default: Date.now
    },
    site: {
        type: String,
        required: true
    },
    telephone: String,
    id: {
        type: String,
        required: true
    }
});

schema.methods.encryptPassword = function(password){
    return crypt.encrypt(password + '', config.get("account:password") + this.salt);
};

schema.virtual('password')
    .set(function(password){
        this.salt = Math.random() + '';
        this.hashedPassword = this.encryptPassword(password);
    }).get(function(){ return this.hashedPassword;});


schema.statics.registration = function(username, password, site, telephone, id, callback) {
    var Account = this;
    var account = new Account({username: username, password: password, site: site, telephone: telephone, id: id});
    account.save(function (err, account) {
        if (err) return callback(err);
        callback(null, account)
    });
};
schema.statics.checkAccount = function(username, site, callback){
    var Account = this;
    Account.findOne({username: username, site: site}, callback);
};
schema.statics.get_available = function(user_id, site, article_id, callback){
    Account.find({id: user_id, site: site}, function(err, result){
        if(err) return callback([]);
        var send = [];
        async.each(result, function(item, callback){
            var acc_info = {};
            var ar_id = crypt.encrypt(item._id + '', config.get("article:password"));
            if(Map_max_articles[site.split('.').join('_')]){
                Article.find({$or: [{'posted.olx_ua.id': ar_id}, {'posted.fn_ua.id': ar_id}, {'posted.aviso_ua.id': ar_id}, {'posted.address_ua.id': ar_id}, {'posted.mirkvartir_ua.id': ar_id}]}, function(err, result){
                    if (err) return callback(null);
                    if (result.length < Map_max_articles[site.split('.').join('_')]) {
                        acc_info.username = item.username;
                        acc_info.site = item.site;
                        acc_info.account_id = item._id;
                        acc_info.telephone = item.telephone;
                        acc_info.password = crypt.decrypt(item.hashedPassword, config.get("account:password") + item.salt);
                        send.push(acc_info);
                    }
                    callback(null);
                });
            } else {
                acc_info.username = item.username;
                acc_info.site = item.site;
                acc_info.account_id = item._id;
                acc_info.telephone = item.telephone;
                acc_info.password = crypt.decrypt(item.hashedPassword, config.get("account:password") + item.salt);
                send.push(acc_info);
                callback(null);
            }
        }, function(){
            next(send);

        });
    });
    function next(arr){
        if (arr.length > 1) {
            Article.findOne({_id: article_id}, function (err, article) {
                if (err) return callback([]);
                var block_id = crypt.decrypt(article.posted[site.split('.').join('_')].postedOn + '', config.get("article:password"));
                for (var i = 0; i < arr.length; i++) {
                    if (arr[i].account_id == block_id) {
                        arr.splice(i, 1);
                    }
                }
                callback(arr);
            });
        } else {
            callback(arr);
        }
    }
};
var Account = mongoose.model('Account', schema);
exports.Account = Account;