define(['jquery'],function($){
    return  function(){
        var email = $('#username_input').find('input').val();
        var password =$('#password_input').find('input').val();
        $.ajax({
            method: "POST",
            url: "login",
            data: { 'username': email, 'password': password }
        }).always(function( msg ) {
            if (msg == 'Yep'){
                window.location.href = "/";
            } else{
                $('.input').css('box-shadow','0px 0px 2px 1px #F63154 inset');
            }
        });
    };
});
