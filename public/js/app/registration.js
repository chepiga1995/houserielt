define(['jquery', 'check_info'], function($){
    return  function(){
        if($('#confirm').find('input').is(':checked')){
            async_series(regF, function(res){
                if (res){
                    var username = $('#username_input').find('input').val();
                    var password = $('#password_input').find('input').val();
                    var name = $('#name_input').find('input').val();
                    var telephone = $('#telephone_input').find('input').val();
                    var skype = $('#skype_input').find('input').val();
                    $('.modal').css('display', 'block');
                    $.ajax({
                        method: "POST",
                        url: "reg",
                        data: { 'username': username, 'password': password, name: name, skype: skype, telephone: telephone}
                    }).always(function( msg ) {
                        $('.modal').css('display', 'none');
                        $('.wrapper > *').css('display', 'none');
                        $('.wrapper').css('height', '60px');
                        if (msg == 'Yep'){
                            $('#ms').show().text("Инструкции по активации отправлено на ваш Email");
                        } else{
                            $('#ms').show().text("Извините, ошибка на сервере");
                        }
                    });
                }
            });
        } else {
            return 0;
        }
    };
});
