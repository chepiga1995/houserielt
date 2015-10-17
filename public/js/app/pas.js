define(['jquery', 'check_info'], function($) {
    return function(){
        async_series([checkEmail_inv], function(res) {
            if (res) {
                var email = $('#username_input').find('input').val();
                $(".modal").css("display", "block");
                $.ajax({
                    method: "POST",
                    url: "pas",
                    data: {'username': email}
                }).always(function (msg) {
                    $(".modal").css("display", "none");
                    $(".wrapper > *").css("display", "none");
                    $(".wrapper").css("height", "60px");
                    if (msg == 'Yep') {
                        $("#ms").show().text("Инструкции были отправлены на ваш электронный адрес");
                    } else {
                        $("#ms").show().text("Извините, ошибка на сервере");
                    }
                });
            }
        });
    };
});

