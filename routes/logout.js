exports.post = function(req, res, next){
    req.session.destroy(function(err){
        if(err) next(err);
        res.send("Yep");
    });
};