define(['jquery'], function($){
    function logout(){
        $.ajax({
            method: "POST",
            url: "logout"}).always(function(msg){
            if(msg == "Yep")
                window.location.href = "/login";
        });
    }
    function head_click(){
        if(!$(this).hasClass("selected")){
            if($(this).index() == 0)
                window.location.href = "/";
            if($(this).index() == 1)
                window.location.href = "/add";
            if($(this).index() == 2)
                window.location.href = "/manage_acc";
        }
    }
    return {
        logout: logout,
        head_click: head_click
    };
});

