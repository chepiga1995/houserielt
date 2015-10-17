var User = require('../modules/user').User;
module.exports = function(id, len, data, callback){
    User.findById(id, function(err, user){
        if (err || !user) return callback({Error: err.message});
        var log = user.log.messages;
        if (!user.log.data){
            callback({status: user.log.status, data: '0'});
        } else {
            if (log.length <= len && data == user.log.data) {
                callback({status: user.log.status, data: user.log.data});
            }
            if (data == user.log.data && log.length > len) {
                callback({
                    status: user.log.status,
                    errors: user.log.errors,
                    done: user.log.done,
                    time_left: user.log.process_left,
                    time: user.log.process_time,
                    data: user.log.data,
                    log: log.slice(len)
                });
            }
            if (data != user.log.data) {
                callback({
                    status: user.log.status,
                    errors: user.log.errors,
                    done: user.log.done,
                    time_left: user.log.process_left,
                    time: user.log.process_time,
                    data: user.log.data,
                    log: log
                });
            }
        }
    })
};