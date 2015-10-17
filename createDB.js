
var async = require('async');
var mongoose = require('./libs/mongoosedb');
mongoose.set('debug', true);

async.series([
    open,
    dropDatabase,
    requireModules//,
    //createUsers
], function(err, result){
    if(err) throw err;
    console.log(result);
    mongoose.disconnect();
});


function open(callback){
    mongoose.connection.on('open',callback);
}
function dropDatabase(callback){
    var db = mongoose.connection.db;
    db.dropDatabase(callback);
}
function requireModules(callback){
    require('./modules/account');
    require('./modules/user');
    async.each(Object.keys(mongoose.models), function(model, callback){
        mongoose.models[model].ensureIndexes(callback);
    }, callback)
}
function createUsers(callback) {
    var users = [
        {username: "peta", password: "123"},
        {username: "vasa", password: "123"},
        {username: "saha", password: "123"}
    ];
    async.each(users, function(item, callback){
        var user = new mongoose.models.User(item);
        user.save(callback);
    }, callback);
}


