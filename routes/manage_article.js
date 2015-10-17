var Article = require('../modules/article').Article;
var Account = require('../modules/account').Account;
var User = require('../modules/user').User;
var crypt = require('../libs/crypt');
var log = require('../libs/log')(module);
var config = require('../config');
var Redis = require('ioredis');
var fs = require('fs');
var async = require('async');
var childProcess = require("child_process");


var Map_sites = ["olx_ua", "fn_ua", "aviso_ua", "address_ua", "mirkvartir_ua"];

var Map_tasks =
    {
        "find_status": find_status,
        "activate_article": activate_article,
        "deactivate_article": deactivate_article,
        "add_article": post_article,
        "delete_article": delete_article
    };

var Map_time =
    {
        "find_status": 60,
        "activate_article": 30,
        "deactivate_article": 30,
        "add_article": 60,
        "delete_article": 60
    };


exports.up_position = function (req, res, next) {
    var id = crypt.decrypt(req.body.id + "", config.get("article:password"));

    if(req.user.log.status){
        up_on([id], req.user._id);
        res.end('Запуск обновления');
    } else {
        res.end('Данные по-прежнему в обработке');
    }
};

function delete_on(ids, user_id) {
    var array = new Array();
    async.each(ids, function(id, callback){
        Article.findOne({_id: id}, function(err, article) {
            if(err) return callback(null);
            async.each(Map_sites, function(site, callback){
                if (article.posted[site].id) {
                    var _id = crypt.decrypt(article.posted[site].id + '', config.get("account:password"));
                    Account.findOne({_id: _id}, function(err, account){
                        if (!err && account) {
                            var elem  = {
                                method: delete_article,
                                command: "delete_article",
                                article_id: id,
                                site: account.site,
                                username: account.username
                            };
                            array.push(elem);
                        }
                        return callback(null);
                    });
                } else {
                    return callback(null);
                }
            },function(){
                callback(null);
            });
        });
    }, function (){
        action_chain(array, user_id);
    });
}
exports.delete_on = delete_on;

function up_on(ids, user_id) {
    var array = new Array();
    async.each(ids, function(id, callback){
        Article.findOne({_id: id}, function(err, article) {
            if(err) return callback(null);
            async.each(Map_sites, function(site, callback){
                if (article.posted[site].id) {
                    var _id = crypt.decrypt(article.posted[site].id + '', config.get("account:password"));
                    Account.findOne({_id: _id}, function(err, account){
                        if (!err && account) {
                            var elem  = {
                                method: delete_article,
                                command: "delete_article",
                                article_id: id,
                                site: account.site,
                                username: account.username
                            };
                            array.push(elem);
                        }
                        return callback(null);
                    });
                } else {
                    return callback(null);
                }
            },function(){
                callback(null);
            });
        });
    }, function(){
        async.each(ids, function(id, callback){
            Article.findOne({_id: id}, function(err, article) {
                if(err) return callback(null);
                async.each(Map_sites, function(site, callback) {

                    var elem = {
                        method: post_article,
                        command: "add_article",
                        article_id: id,
                        site: site.split('_').join('.'),
                        username: ""
                    };
                    array[array.length] = elem;

                    callback(null);
                },function(){
                    callback(null);
                });
            });
        }, function (){
            //console.log(array);
            if (array.length) {
                action_chain(array, user_id);
            }
        });
    });
}

exports.up_on = up_on;
exports.find_status = function(req, res, next) {
    var id = crypt.decrypt(req.body.id + "", config.get("article:password"));
    Article.findOne({_id: id}, function(err, article) {
        if(err || !req.user.log.status)return res.end('Incorrect data');
        var array = [];
        async.each(["olx_ua"], function(item, callback){
            if (article.posted[item].id) {
                var _id = crypt.decrypt(article.posted[item].id + '', config.get("account:password"));
                Account.findOne({_id: _id}, function(err, account){
                    if (!err && account) {
                        var elem  = {
                            method: find_status,
                            command: "find_status",
                            article_id: id,
                            site: account.site,
                            username: account.username
                        };
                        array.push(elem);
                    }
                    return callback(null);
                });
            } else {
                return callback(null);
            }
        }, function (err, result){
            if (array.length) {
                action_chain(array, req.user._id);
                return res.end('Запуск сканирования');
            } else {
                return res.end('Статья не размещена');
            }
        });
    });
};

function pre_processing(req, res, task, msg){

    var id = crypt.decrypt(req.body.id + "", config.get("article:password"));
    var site = req.body.site;
    var username = req.body.username;
    if (id && site && username/* && req.user.log.status*/) {
        action_chain([{
            method: Map_tasks[task],
            command: task,
            article_id: id,
            site: site,
            username: username
        }], req.user._id);
        res.end(msg);
    } else {
        res.end('Неправильная обработка данных');
    }
}

exports.activate_article = function(req, res, next){
    pre_processing(req, res, "activate_article", 'Запуск активации');
};
exports.deactivate_article = function(req, res, next){
    pre_processing(req, res, "deactivate_article", 'Запуск деактивации');
};
exports.post_article = function(req, res, next){
    pre_processing(req, res, "add_article", 'Начало публикации');
};
exports.delete_article = function(req, res, next){
    pre_processing(req, res, "delete_article", 'Запуск удаления');
};

var path = config.get("path") + '/python/manage_article.py';

function process_articles(user_id, time, array){
    //array = [{data, callback}]
    console.log(array);
    var shell = childProcess.spawn('python', [path, user_id], {detached: false});
    var iterator = 0;
    var read = new Redis('localhost', 6380);
    var write = new Redis('localhost', 6379);
    async.parallel([function(callback) {
        User.start_process(user_id, time, callback);
        log.info('Process start');
    }, function (callback){
        write.on('ready', function(err){
            callback(err)
        })
    }, function(callback){
        read.on('ready', function(err){
            callback(err)
        })
    }, function(callback){
        read.subscribe('response_' + user_id, function(err){
            callback(err)
        });
    }], function(err){

        shell.on('close', function(code){
            read.disconnect();
            write.disconnect();
            if (code)
                array[array.length - 1].callback(new Error('Unknown server error. Connect with administration'), user_id);
            else
                array[array.length - 1].callback(null, user_id)
        });

        if (err) {
            shell.end();
        }

        read.on('message', function(channel, data){
            try {
                data = JSON.parse(data);
            } catch (e) {
                log.info(data);
                //console.log(array[iterator].data.data);
                if(data == "start at " + user_id) {
                    publish(array[iterator], user_id, function(elem){
                        array[iterator] = elem;
                        //console.log(elem);
                        write.publish('commands_' + user_id, JSON.stringify(elem.data));
                    });
                    User.message(user_id, 0, data);
                }
            }
            try {
                if (data.result) {
                    iterator++;
                    var article_id = array[iterator - 1].article_id;
                    var account_id = array[iterator - 1].account_id;
                    log.info('Result: ' + data.result);

                    publish(array[iterator], user_id, function(elem){
                        array[iterator] = elem;
                        write.publish('commands_' + user_id, JSON.stringify(elem.data));
                    });
                    User.message(user_id, 0, 'Result: ' + data.result);

                    return array[iterator - 1].callback(data.result, user_id, article_id, account_id);
                }
                if (data.progress) {
                    log.info('Progress: ' + data.progress);
                    log.info('Message: ' + data.message);
                    User.message(user_id, 0.25, 'Progress: ' + data.progress + ' Message: ' + data.message);
                }
                if (data.start) {
                    log.info('Start: ' + data.start);
                    User.start_sub_process(user_id, array[iterator].time, 'Start: ' + data.start);
                }
            } catch (e){
                array[array.length - 1].callback(new Error('Unknown server error. Connect with administration'), user_id);
            }
        });

    });
}

function publish(elem, id, callback){
    if (!elem.data.data){
        return callback(elem);
    }
    _id = crypt.decrypt(id + "", config.get("user:password"));
    User.findOne({_id: _id}, function(err, user){
        if (!user.log.sub_status){
            setTimeout(function(){
                publish(elem, id, callback)
            }, 150);
        } else {
            if(elem.account_id){
                callback(elem);
            } else {
                Account.get_available(crypt.encrypt(_id + "", config.get("account:password")), elem.data.data.site, elem.article_id, function(arr){
                    if (arr.length > 0) {
                        elem.account_id = arr[0].account_id;
                        elem.data.data.password = arr[0].password;
                        elem.data.data.username = arr[0].username;
                        if(!elem.data.data.article.per_telephone)
                            elem.data.data.article.per_telephone = arr[0].telephone;
                        callback(elem);
                    } else {
                        elem.data.command = "error";
                        elem.callback = error;
                        callback(elem);
                    }
                });
            }

        }
    });
}

function action_chain(array, user_id){
    var container = [];
    var total_time = 0;
    //array = [{method, command, article_id, site, username}]
    async.eachSeries(array, function(item, callback){
        var username = item.username;
        var site = item.site;
        var article_id = item.article_id;
        var command = item.command;
        var method = item.method;
        console.log(item);
        if (!username){
            async.waterfall([
                function(callback){
                    Article.findOne({_id: article_id}, function(err, article) {
                        if (err || !article) {
                            return callback(new Error('Not found'));
                        } else {
                            article = JSON.parse(JSON.stringify(article));
                            article._id = config.get("path") + '/public/articles_img/' + crypt.encrypt(article._id + "", config.get("article:password")) + '/';
                            callback(null, article);
                        }
                    });
                }], function(err, article){
                    //console.log(container);
                    if(err){
                        var obj = {};
                        obj['posted.' + site.split('.').join('_') + '.id'] = "";
                        obj['posted.' + site.split('.').join('_') + '.status'] = 0;
                        Article.update({_id: article_id}, obj, {}, function(){});
                        return callback(null);
                    } else {
                        var time = Map_time[command];
                        var element = {
                            callback: method,
                            account_id: '',
                            article_id: article_id,
                            time: time,
                            data: {
                                command: command,
                                data: {
                                    username: '',
                                    password: '',
                                    article: article,
                                    site: site
                                }
                            }
                        };
                        container.push(element);
                        console.log('2');
                        total_time += time;
                        return callback(null);
                    }
                }
            );
        } else {
            async.waterfall([
                function(callback){
                    Account.findOne({site: site, username: username}, function(err, account) {
                        if (err || !account)
                            return callback(new Error('Not found'));
                        else
                            return callback(null, account);
                    });
                }, function(account, callback){
                    var obj = {_id: article_id};
                    var site_id = 'posted.' + site.split('.').join('_') + '.id';
                    if (command != "add_article")
                        obj[site_id] = crypt.encrypt(account._id + "", config.get("account:password"));
                    Article.findOne(obj, function(err, article) {
                        if (err || !article) {
                            return callback(new Error('Not found'));
                        } else {
                            article = JSON.parse(JSON.stringify(article));
                            article._id = config.get("path") + '/public/articles_img/' + crypt.encrypt(article._id + "", config.get("article:password")) + '/';
                            if(!article.per_telephone)
                                article.per_telephone = account.telephone;
                            callback(null, account, article);
                        }
                    });
                }], function(err, account, article){
                    if(err){
                        var obj = {};
                        obj['posted.' + site.split('.').join('_') + '.id'] = "";
                        obj['posted.' + site.split('.').join('_') + '.status'] = 0;
                        Article.update({_id: article_id}, obj, {}, function(){});
                        return callback(null);
                    } else {
                        var password = crypt.decrypt(account.hashedPassword, config.get("account:password") + account.salt);
                        var time = Map_time[command];
                        var element = {
                            callback: method,
                            account_id: account._id,
                            article_id: article_id,
                            time: time,
                            data: {
                                command: command,
                                data: {
                                    username: username,
                                    password: password,
                                    article: article,
                                    site: site
                                }
                            }
                        };
                        container.push(element);
                        console.log('1');
                        total_time += time;
                        return callback(null);
                    }
                }
            );
        }
    }, function(){
        var end = {
            callback: final,
            data: {
                command: "end"
            }
        };
        container.push(end);
        process_articles(crypt.encrypt(user_id + "", config.get("user:password")), total_time, container);
    });
}
function after_processing(user_id, article_id, account_id, new_id, status, old_id){
    Account.findOne({_id: account_id}, function(err, account){
        if (err) return log_progress(user_id, err);
        var site = 'posted.' + account.site.split('.').join('_');
        var obj = {};

        obj[site + '.id'] = crypt.encrypt(new_id + "", config.get("account:password"));
        obj[site + '.status'] = status;
        obj[site + '.postedOn'] = crypt.encrypt(old_id + "", config.get("account:password"));
        Article.update({_id: article_id}, obj, {}, function(err, effected){
            if (err) {
                return log_progress(user_id, err, '', user_id);
            } else {
                return log_progress(user_id, null, 'data effected in db', user_id);
            }
        });
    });
}
function post_article(msg, user_id, article_id, account_id){
    if (msg != 'posted') return log_progress(user_id, new Error(msg), '', user_id);
    after_processing(user_id, article_id, account_id, account_id, 2, "");
}
function error(msg, user_id){
    User.end_sub_process(user_id, new Error('Not found'), msg);
}

function find_status(msg, user_id, article_id, account_id){
    try{
        var status = +msg;
    } catch(e){
        log_progress(user_id, new Error(msg), '', user_id);
        status = 4;
    }
    after_processing(user_id, article_id, account_id, account_id, status, "");
}

function activate_article(msg, user_id, article_id, account_id){
    if (msg != 'activate') return log_progress(user_id, new Error(msg), '', user_id);
    after_processing(user_id, article_id, account_id, account_id, 3, "");
}
function deactivate_article(msg, user_id, article_id, account_id){
    if (msg != 'deactivate') return log_progress(user_id, new Error(msg), '', user_id);
    after_processing(user_id, article_id, account_id, account_id, 1, "");
}

function delete_article(msg, user_id, article_id, account_id){
    if (msg != 'deleted') return log_progress(user_id, new Error(msg), '', user_id);
    after_processing(user_id, article_id, account_id, '', 0, account_id);
}
function final(err, user_id){
    User.end_process(user_id, err);
    if (err){
        log.error(err.message);
    } else {
        log.info('Process end successfully');
    }
}

function log_progress(user_id, err, msg){
    User.end_sub_process(user_id, err, msg);
    if (err)
        log.error(err);
    else
        log.info(msg);
}