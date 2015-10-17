var HttpError = require('../error').HttpError;
exports.get = function(req, res, next){
    next(new HttpError(404, "Page Not Found"));
};