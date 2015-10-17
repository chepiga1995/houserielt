var User = require('../modules/user').User;
var AuthError = require('../error').AuthError;
var HttpError = require('../error').HttpError;
exports.get = function(req, res, next){
    if (req.user){
        res.redirect('/');
    } else {
        res.render('login');
    }
};
exports.post = function(req, res, next){
    var username = req.body.username;
    var password = req.body.password;
    User.authorize(username, password, function(err, user){
        if (err){
            if(err instanceof AuthError){
                res.send("nope");
            } else {
                next(err);
            }
        } else {
            req.session.user = user._id;
            res.send('Yep');
        }
    });
};