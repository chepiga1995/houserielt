define(['jquery', 'check_info'], function($) {
    return function () {
        async_series(cpwF, function (res) {
            if (res) {
                var password = $('#password_input').find('input').val();
                $(".modal").css("display", "block");
                $.ajax({
                    method: 'POST',
                    url: $(location).attr('href'),
                    data: {password: password}
                }).always(function (msg) {
                    $(".modal").css("display", "none");
                    $(".wrapper > *").css("display", "none");
                    $(".wrapper").css("height", "60px");
                    if (msg == 'Yep') {
                        $("#ms").show().text("Пароль успешно изменен");
                    } else {
                        $("#ms").show().text("Извините, ошибка на сервере");
                    }
                });
            }
        });
    }
});