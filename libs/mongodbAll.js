var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://localhost:27017/houserielt';


function find_houserielt(query, from, callback) {
    MongoClient.connect(url, function (err, db) {
        if (err) return callback(err, null, next);
        var options = {
            "sort": [
                ['date','desc']
            ]
        };

        var cursor = db.collection('adverts').find(query, options);
        cursor.count(function(err, len){
            cursor.skip(from).limit(20).toArray(function(err, docs) {

                return callback(err, {array: docs, len: len}, next);
            });
        });



        function next() {
            db.close();
        }
    });
}
exports.find_houserielt = find_houserielt;

