var config = require('../config');
var User = require('../modules/user').User;
var crypt = require('../libs/crypt');

exports.get = function(req, res, next){
    if(req.user){
        redirect("/");
    } else {
        res.render('changepw');
    }
};
exports.post = function(req, res, next){
    var id = crypt.decrypt(req.params.id, config.get("change_password:password"));
    var password = req.body.password;
    console.log(id, password);
    User.findById(id, function (err, user) {
        if (err)  return next(err);
        user.password = password;
        user.save(function (err, user) {
            if (err)  return next(err);
            res.send("Yep");
        });
    });
};