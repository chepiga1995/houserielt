var CronJob = require('cron').CronJob;
var config = require('../config');
var childProcess = require("child_process");
var program_path = config.get("path") + '/python/scrapy';
var log = require('./log')(module);
var async = require('async');
var User = require('../modules/user').User;
var Article = require('../modules/article').Article;
var delete_on = require('../routes/manage_article').delete_on;

var job_one = new CronJob({
    cronTime: '0 0 */2 * * *',
    onTick: function() {
        async.series([function(callback){
                childProcess.exec('cd ' + program_path + ' && python deploy.py olx parse_last 2', function(){
                    callback(null);
                });
            }, function(callback){
                childProcess.exec('cd ' + program_path + ' && python deploy.py aviso parse_last 2', function(){
                    callback(null);
                });
            }, function(callback){
                childProcess.exec('cd ' + program_path + ' && python deploy.py mirkvartir parse_last 2', function(){
                    callback(null);
                });
            }, function(callback){
                childProcess.exec('cd ' + program_path + ' && python deploy.py fn parse_last 2', function(){
                    callback(null);
                });
            }],function(){
                log.info('cron process end');
            }
        );
    },
    onComplete: function(){
        log.info('stop');
    },
    start: true
});

// var job_reload = new CronJob({
//     cronTime: '0 0 0 * * *',
//     onTick: function() {
//         User.find({},function(err, users){
//             if(err) return 0;
//             async.eachSeries(users, function(user, callback){
//                 var crypt_user_id = crypt.encrypt(user._id + "", config.get("user:password"));
//                 Article.find({id: crypt_user_id}, function(err, articles){
//                     if(err) return callback(null);
//                     var send_ids = [];
//                     async.each(articles, function(article, callback){
//                         send_ids.push(article._id);
//                         callback(null);
//                     }, function(){
//                         delete_on()
//                     });
//                 });
//             }, function(){
//                 log.info('cron process end');
//             });
//         });

//     },
//     onComplete: function(){
//         log.info('stop');
//     },
//     start: true
// });

exports.job_one = job_one;
// exports.job_reload = job_reload;
