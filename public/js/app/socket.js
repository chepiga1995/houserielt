define(['jquery', 'socket.io'], function($, io){
    var socket = io.connect('http://localhost:3000');
    var progress = $('#progress');
    var min_prog = $('#user').find('.min_prog');
    var errors = progress.find('.right span');
    var done = progress.find('.left span');
        socket.on('onConnected', function (data) {
        if(data.result == 'Yep'){
            setInterval(function(){
                var response = {
                    len: progress.find('.input > li').length,
                    data: progress.find('h3:nth-child(2)').attr('data')
                };
                console.log(response);
                socket.emit('getData', response);
            }, 5000);
            socket.on('receiveData', function(data){
                console.log(data);
                fill_fields(data);

            });
        }

    });
    function fill_fields(data){
        var progress = $('#progress');
        var status = progress.find('h3:nth-child(2)').attr('status') == 'true';
        var len = progress.find('.input > li').length;
        var par_data = +progress.find('h3:nth-child(2)').attr('data');
        if(data.data == par_data && data.log){
            add(data);
        }
        if (data.data != par_data && data.log){
            replace(data);
        }
        if(!data.log && data.status && !status){
            progress.find('h3:nth-child(2)').attr('status', 'true');
            progress.find('h3:nth-child(2)').text('Готово');
            min_prog.find('h3:nth-child(1)').text('Готово');
            if ($('#manage_posting').css('display') == 'block') {
                $("#submit_posting").trigger('click');
            }
        }
    }
    function add(data){
        result(data);
        put_time(+data.time_left);
        dis_prog((100 * data.time_left) / data.time);
        logging(data.log);
    }
    function replace(data){
        var progress = $('#progress');
        result(data);
        put_time(+(data.time_left));
        dis_prog((100 * data.time_left) / data.time);
        progress.find('.input > li').remove();
        logging(data.log);
        progress.find('h3:nth-child(2)').attr('data', data.data);
        progress.find('h3:nth-child(2)').attr('status', 'false');
        progress.find('h3:nth-child(2)').text('Обработка');
        min_prog.find('h3:nth-child(1)').text('Обработка');

    }
    function result(data){
        errors.text(data.errors.toString());
        done.text(data.done.toString());
    }
    function put_time(sec){
        var progress = $('#progress');
        var time = (Math.floor(sec / 60)?Math.floor(sec / 60) + ' мин ':'') + (sec % 60) + ' сек';
        progress.find('.time').text(time);
        min_prog.find('.time').text(time);
    }
    function dis_prog(percent){
        var progress = $('#progress');
        progress.find('.prog').css('width', (100 - percent) + '%');
        min_prog.find('.prog').css('width', (100 - percent) + '%');
    }
    function logging(log){
        var progress = $('#progress');
        var elements = '';
        log.forEach(function (el){
            if(el == 'Process start' || el == 'Process end successfully')
                elements += '<li class="orange">' + el + '</li>';
            else if(el == 'End of sub_process: data effected in db')
                elements += '<li class="green">' + el + '</li>';
            else
                elements += '<li>' + el + '</li>';
        });
        $(elements).appendTo(progress.find('.input'));
    }
    return true;
});
