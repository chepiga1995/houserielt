var crypto = require('crypto');
var mongoose = require('../libs/mongoosedb');
var AuthError = require('../error').AuthError;
var async = require('async');
var Schema = mongoose.Schema;
var crypt = require('../libs/crypt');
var config = require('../config');

var schema = new Schema(
    {
        username: {
            type: String,
            unique: true,
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
        name: {
            type: String,
            required: true
        },
        activate: {
            type: Boolean,
            default: false
        },
        telephone: String,
        skype: String,
        log: {
            process_time: Number,
            process_left: Number,
            sub_process_time: Number,
            sub_process_left: Number,
            status: {
                type: Boolean,
                default: true
            },
            sub_status: {
                type: Boolean,
                default: true
            },
            messages: [String],
            data: Number,
            errors: Number,
            done: Number
        }
    }
);

schema.methods.encryptPassword = function(password){
    return crypto.createHmac('sha1', this.salt).update(password).digest('hex');
};

schema.virtual('password')
    .set(function(password){
        this._plainPassword = password;
        this.salt = Math.random() + '';
        this.hashedPassword = this.encryptPassword(password);
    }).get(function(){ return this._plainPassword});

schema.methods.checkPassword = function(password){
    return this.hashedPassword == this.encryptPassword(password);
};
schema.statics.authorize = function(username, password, callback){
    var User = this;
    async.waterfall([function(callback){
        User.findOne({username: username}, callback);
    },function(user, callback){
        if(user){
            if (user.checkPassword(password) && user.activate){
                callback(null, user);
            } else {
                callback(new AuthError("Incorrect password"));
            }
        } else {
            callback(new AuthError("Incorrect password"));
        }
    }], callback);
};
schema.statics.registration = function(username, password, name, telephone, skype, callback) {
    var User = this;
    var user = new User({username: username, password: password, name: name, telephone: telephone, skype: skype});
    user.save(function (err, user) {
        if (err) return callback(err);
        callback(null, user)
    });
};
schema.statics.checkEmail = function(username, callback){
    var User = this;
    User.findOne({username: username}, callback);
};

schema.statics.start_process = function(id, time, callback){
    id = crypt.decrypt(id + "", config.get("user:password"));
    User.findOne({_id: id}, function(err, user){
        if (err || !user) return callback(new Error('Cant find user'));
        user.log.status = false;
        user.log.sub_status = true;
        user.log.messages = ['Process start'];
        user.log.process_time = time;
        user.log.process_left = time;
        user.log.errors = 0;
        user.log.done = 0;
        user.log.data = (new Date()).getTime();
        user.save(function(){});
        return callback();
    });
};

schema.statics.start_sub_process = function(id, time, message){
    id = crypt.decrypt(id + "", config.get("user:password"));
    User.findOne({_id: id}, function(err, user){
        if (err || !user) return false;
        user.log.messages.push(message);
        user.log.sub_process_time = time;
        user.log.sub_process_left = time;
        user.log.sub_status = false;
        user.save(function(){});
    });
};
schema.statics.end_process = function(id, error){
    id = crypt.decrypt(id + "", config.get("user:password"));
    User.findOne({_id: id}, function(err, user){
        if (err || !user) return false;
        user.log.status = true;
        user.log.sub_status = true;
        if (error){
            user.log.messages.push('Process end with errors');
        } else {
            user.log.messages.push('Process end successfully');
        }
        user.log.process_left = 0;
        user.save(function(){});
    });
};
schema.statics.end_sub_process = function(id, error, message){
    id = crypt.decrypt(id + "", config.get("user:password"));
    User.findOne({_id: id}, function(err, user){
        if (err || !user) return false;
        user.log.process_left -= user.log.sub_process_left;
        user.log.sub_process_left = 0;
        user.log.sub_status = true;
        if (error){
            user.log.messages.push('End of sub_process: Error: ' + error.message);
            user.log.errors += 1;
        } else {
            user.log.messages.push('End of sub_process: ' + message);
            user.log.done += 1;
        }
        user.save(function(){});
    });
};
schema.statics.message = function(id, effect, message){
    id = crypt.decrypt(id + "", config.get("user:password"));
    User.findOne({_id: id}, function(err, user){
        if (err || !user) return false;
        if(user.log.sub_process_left > 0) {
            user.log.sub_process_left -= user.log.sub_process_time * effect;
            user.log.process_left -= user.log.sub_process_time * effect;
        }
        user.log.messages.push(message);
        user.save(function(){});
    });
};

var User = mongoose.model('User', schema);
exports.User = User;

