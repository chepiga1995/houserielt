var config = require('config');
var log = require('../libs/log')(module);
var sen_response = require('./response');
module.exports = function(app){
    var io = require('socket.io')(app);
    io.origins(config.get('out_host') + ':' + config.get('port'));
    io.use(require('./save_id').pre_processing);
    io.on('connection', function (socket) {
        if(socket.id){
            socket.emit('onConnected', { result: 'Yep' });
            socket.on('getData', function (data) {
                sen_response(socket.id, data.len, data.data,  function(result){
                    socket.emit('receiveData', result);
                });
            });
        } else {
            socket.emit('onConnected', { result: 'Nope' });
        }

    });
    return io;
};