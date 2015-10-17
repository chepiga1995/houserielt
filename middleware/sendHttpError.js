module.exports = function (req, res, next){
    res.sendHttpError = function(err){
        res.status(err.status || 500);
        if (req.headers['x-requested-with'] == 'XMLHttpRequest'){
            res.json(err);
        } else {
            res.render('error', {error: err});
        }
    };
    res.sendPostError = function(err){
        res.status(err.status || 500);
        res.end(err.message?err.message:'Server Error');
    };
    next();
};