define(['jquery', 'bootstrap', 'check_info'], function($) {
    function hideEmpty(){
        var containers = $("#inner").find(".container");
        for(var i = 0; i < containers.length; i++){
            if (containers.eq(i).find(".account").length){
                containers.eq(i).find(".empty").hide();
            } else {
                containers.eq(i).find(".empty").show();
            }
        }
    }
    function initTooltip (){
        var options = {placement: "top", delay: { "show": 2000, "hide": 10 }, trigger: "hover"};
        var containers = $("#inner").find(".container");
        for(var i = 0; i < containers.length; i++){
            var accounts = containers.eq(i).find(".account");
            for(var j = 0; j < accounts.length; j++){
                options.content = accounts.eq(j).find("p").text();
                accounts.eq(j).popover(options)
            }
        }
    }
    function check(){
        async_series(aaF, function(res) {
            if (res) {
                var email = $('#username_input').find('input').val();
                var password = $('#password_input').find('input').val();
                var site = $('#site_input').find('select').val();
                var telephone = $('#telephone_input').find('input').val();
                $(".modal").css("display", "block");
                $.ajax({
                    method: "POST",
                    url: "addAccount",
                    data: {'username': email, password: password, 'site': site, telephone: telephone}
                }).always(function (msg) {
                    $(".modal").css("display", "none");
                    if (msg == 'Yep') {
                        $("#username_input, #password_input").css('box-shadow','0px 0px 2px 1px #F7F7F7 inset');
                        $("#username_input input, #password_input input").val("");
                        alert("Пользователь успешно добавлен");
                        $(document).trigger("getAccounts");
                    } else {
                        $("#username_input, #password_input").css('box-shadow','0px 0px 2px 1px #F63154 inset');
                        if(msg == "Nope"){
                            alert("Неправильный пароль или адрес электронной почты");
                        } else{
                            alert("Ошибка сервера");
                        }

                    }
                });
            }
        });
    }
    function getAccounts(){
        $(".account").remove();
        $(".modal").css("display", "block");
        $.ajax({
            method: "POST",
            url: "getAccounts"}).always(function(res){
            if (typeof res === 'object'){
                $.each(res, function(index, val){
                    try{
                        $("#" + val.site.split('.').join("\\.")).find(" ul").append('<li class="account"> ' +'<p>' + val.username + '</p><div><img class="sendDetails" src="../../img/message_new.png"><img class="deleteAccount" src="../../img/DeleteRed.png"></div></li>');
                    } catch(e){
                        if (e) return 0;
                    }
                });
                hideEmpty();
                initTooltip();
                $(".account").on("mouseenter", function(){
                    $(this).find("img").css("display", "inline");
                }).on("mouseleave", function(){
                    $(this).find("img").css("display", "none");
                });
                $(".sendDetails").on("click", function(){
                    var username = $(this.parentElement.parentElement).find("p").text();
                    var site = this.parentElement.parentElement.parentElement.parentElement.id;
                    $.ajax({
                        method: "POST",
                        url: "sendAccountInfo",
                        data: { 'username': username, site: site}
                    }).always(function(msg){
                        if(msg == "Yep"){
                            alert("Сообщение отправлено на ваш электронный адрес");
                        } else {
                            alert("Ошибка сервера");
                        }

                    });
                });
                $(".deleteAccount").on("click", function(){
                    if (confirm("Вы уверены?")) {
                        var username = $(this.parentElement.parentElement).find("p").text();
                        var site = this.parentElement.parentElement.parentElement.parentElement.id;
                        $.ajax({
                            method: "POST",
                            url: "deleteAccount",
                            data: {'username': username, site: site}
                        }).always(function (msg) {
                            if (msg == "Yep") {
                                alert("Аккаунт удален успешно");
                                $(this.parentElement.parentElement).remove();
                                hideEmpty();
                            } else {
                                alert("Ошибка сервера");
                            }

                        }.bind(this));
                    }
                });
                $(".modal").css("display", "none");
            } else {
                alert("К сожалению, невозможно получить информацию с сервера");
                return $(".modal").css("display", "none");
            }
        });
    }
    return {
        check: check,
        getAccounts: getAccounts
    };
});

