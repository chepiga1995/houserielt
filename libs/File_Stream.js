var EventEmitter = require('events').EventEmitter;
var fs = require('fs');
var config = require('../config');
var childProcess = require("child_process");
var util = require('util');
var async = require('async');

function File_StreamError(status, message){
    Error.apply(this, arguments);
    Error.captureStackTrace(this, File_StreamError);

    this.message = message || "File_StreamError";
}
util.inherits(File_StreamError, Error);
File_StreamError.prototype.name = "File_StreamError";

function File_Stream(file, options){
    if(!options)
        options = {};
    this._daley = options.delay | 50;
    this._minMessageInterval = options.minMessageInterval | 500;
    this._path = options.path?options.path:(config.get("path") + '/python/communication');
    this._filename = file;
    this._position = 0;
    this._mtime = 0;
    this._fd_in = 0;
    this._fd_out = 0;
    this._connected = 0;
    this._active = 0;
    this._size = 0;
    this._buffer = new Buffer(options.buffer | 10000);
    this._last_sent = 0;
    this._temp_file = 0;
    this._queue = [];

}
util.inherits(File_Stream, EventEmitter);
File_Stream.prototype.run = function(callback){

    var stream = this;


    function check_path(nextTick){
        fs.exists(stream._path, function(exists){
            if(!exists)
                nextTick(new File_StreamError('Invalid path to temporal storage'));
            else
                nextTick(null);
        })
    }

    function open_temp(time, expand){
        var path = stream._path + '/' + time + expand;
        var flag = (expand == '.in'? 'wx+': 'wx');
        return function(callback){
            fs.open(path, flag, function(err, fd){
                if(err)
                    callback(err);
                else
                    callback(null, fd);
            });
        }
    }

    function create_temp_file(nextTick){
        var counter = 0;
        var max_attempt = 10;
        var time = 0;
        var success = false;
        async.whilst(
            function(){
                time = (new Date()).getTime();
                counter++;
                return !success;
            },
            function(callback){
                async.series([open_temp(time, '.in'), open_temp(time, '.out')],
                    function(err, result){
                        if(!err) {
                            success = true;
                            stream._fd_in = result[0];
                            stream._fd_out = result[1];
                            stream._temp_file = time;
                            callback(null);
                        } else {
                            if(result[0]) {
                                fs.unlink(stream._path + '/' + time + '.in', function () {
                                    if (err)
                                        nextTick(err);
                                    else
                                        setTimeout(callback, 50);
                                });
                            } else {
                                if (counter >= max_attempt) {
                                    callback(new File_StreamError('Cant create temporary files'));
                                } else {
                                    setTimeout(callback, 50);
                                }
                            }
                        }

                    }
                );
            },
            function(err){
                if(err)
                    nextTick(err);
                else
                    nextTick(null);
            }
        );

    }

    function establish_connection(nextTick){
        //var shell = childProcess.spawn('python', [stream._filename, stream._temp_file]);
        //var data = '';
        //var err_data = '';
        //shell.stdin.write(JSON.stringify({
        //    command: "add_article",
        //    data: {
        //        username: username,
        //        password: password,
        //        article: article,
        //        site: site
        //    }
        //}) + '\n');
        //shell.stdin.write(JSON.stringify({
        //    command: "end"
        //}));
        //shell.stdin.end();
        //shell.stdout.on('data', function(msg){
        //    data += msg + '';
        //});
        //
        //shell.stderr.on('data', function(msg){
        //    err_data += msg + '';
        //});
        //shell.on('close', function(){
        //    console.error(err_data);
        //    console.log(data);
        //    var message = '';
        //    if (data){
        //        message = data;
        //    } else {
        //        if (err_data.lastIndexOf('Exception: ') == -1)
        //            message = 'Exception: Something goes wrong. Please connect with administrations';
        //        else
        //            message = err_data.slice(err_data.lastIndexOf('Exception: '));
        //    }
        //    console.log('close');
        //    callback(message);
        //});
        nextTick(null);
    }

    function init(nextTick){
        fs.fstat(stream._fd_in, function(err, status){
            if (err){
                nextTick(err);
            } else {
                stream._mtime = (status.mtime).getTime();
                stream._size = status.size;
                nextTick(null);
            }
        });
    }

    async.series([check_path, create_temp_file, establish_connection, init],
        function(err){
            if (err) return callback(err);
            stream._connected = true;
            var check_full_data = 0;
            async.whilst(
                function(){
                    return true;
                },
                function(callback){
                    fs.fstat(stream._fd_in, function(err, status){
                        if (err){
                            callback(err);
                        } else {
                            var new_time = (status.mtime).getTime();
                            if(stream._mtime != new_time){
                                if (check_full_data == new_time){
                                    var length = status.size - stream._size;
                                    fs.read(stream._fd_in, stream._buffer, 0, length, stream._position, function(err, data_len, buffer){
                                        if(err) throw err;
                                        stream.emit('message', buffer.toString('utf8', 0, data_len));
                                    });
                                    stream._position += length - 1;
                                    stream._mtime = new_time;
                                    stream._size = status.size;
                                } else {
                                    check_full_data = new_time
                                }
                            }
                            setTimeout(callback, stream._daley);
                        }
                    });
                },
                function(err){
                    if(err && stream._connected) {
                        stream.end();
                    }
                }
            );
            callback(null, stream);
        }
    );
};
File_Stream.prototype.send = function(text, callback){

};
module.exports = File_Stream;
