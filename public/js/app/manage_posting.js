define(['jquery'], function($) {
    function fill_field(posting, id){
        $.each(posting, function(index, val){
            var elem = '';
            if(val.status){
                elem += '<h5 class="email" id="' + val.id + '">Undefined</h5>';
            } else {
                elem += '<div class="inner"><div id="accounts_input" class="input"><form><select class="field">' +
                        '<option value=""></option></select></form></div></div>';
            }
            elem += '<h5>Статус: <span class="' + Map_post_light[val.status] + '">' + Map_post[val.status] + '</span></h5>';
            switch (val.status) {
                case 0:
                    elem += '<div class="act add"><h3>Добавить</h3></div>';
                    break;
                case 1:
                    elem += '<div class="act active"><h3>Активировать</h3></div><div class="act remove"><h3>remove</h3></div>';
                    break;
                case 3:
                    elem += '<div class="act deactivate"><h3>Дезактивировать</h3></div><div class="act remove"><h3>remove</h3></div>';
                    break;
                default:
                    elem += '<div class="act remove"><h3>Удалить</h3></div>';
            }
            $('#' + index).find('.data').append(elem);
            if(val.status){
                $.ajax({
                    method: "POST",
                    url: "getAccountInfo",
                    data: {id: val.id}
                }).always(function (msg) {
                    $("#" + msg.id).text(msg.username);
                });
            } else {

                $.ajax({
                    method: "POST",
                    url: "getAccountsOnSite",
                    data: {site: index.split('_').join('.'), article_id: id}
                }).always(function (msg) {
                    $.each(msg, function(index, val){
                        $('#' + val.site.split('.').join('_')).find('.field').append('<option value="' + index + '">' + val.username + '</option>');
                    });
                });
            }
        });
    }
    function click(e){
        $("#manage_posting").css("display", "block");
        $('.modal').show();
        var id = e.currentTarget.parentElement.parentElement.parentElement.className;
        $('#manage_posting').attr('class', id);
        $.ajax({
            method: "POST",
            url: "getArticle",
            data: {id: id}}).always(function(res) {
            if (res instanceof Object) {
                $('.container .data').html('');
                fill_field(res.posted, id);
                $('.act').filter('.add').on('click', post);
                $('.act').filter('.remove').on('click', del);
                $('.act').filter('.active').on('click', activate);
                $('.act').filter('.deactivate').on('click', deactivate);


                $('.modal').hide();
            }
        });
    }
    function post(e){

        if ($(e.currentTarget.parentElement).find('.field').val()) {
            var id = $('#manage_posting').attr('class');
            var site = e.currentTarget.parentElement.parentElement.id.split('_').join('.');
            var username = $(e.currentTarget.parentElement).find('option:selected').text();
            $.ajax({
                method: "POST",
                url: "post_article",
                data: {id: id, site: site, username: username}}).always(function(res) {
                    alert(res);
                    $("#progress").css("display", "block");

            });
        }

    }
    function find_status(){
        var id = $('#modal_info').attr('class');
        $.ajax({
            method: "POST",
            url: "find_status",
            data: {id: id}}).always(function(res) {
                alert(res);
                $("#progress").css("display", "block");
        });
    }
    function up_position(){
        var id = $('#modal_info').attr('class');
        $.ajax({
            method: "POST",
            url: "up_position_one",
            data: {id: id}}).always(function(res) {
            alert(res);
            $("#progress").css("display", "block");
        });
    }
    function del(e){

        var id = $('#manage_posting').attr('class');
        var site = e.currentTarget.parentElement.parentElement.id.split('_').join('.');
        var username = $(e.currentTarget.parentElement).find('.email').text();
        $.ajax({
            method: "POST",
            url: "delete_article",
            data: {id: id, site: site, username: username}}).always(function(res) {
                alert(res);
                $("#progress").css("display", "block");
        });
    }
    function activate(e){
        var id = $('#manage_posting').attr('class');
        var site = e.currentTarget.parentElement.parentElement.id.split('_').join('.');
        var username = $(e.currentTarget.parentElement).find('.email').text();
        $.ajax({
            method: "POST",
            url: "activate_article",
            data: {id: id, site: site, username: username}}).always(function(res) {
                alert(res);
                $("#progress").css("display", "block");

        });
    }
    function deactivate(e){
        var id = $('#manage_posting').attr('class');
        var site = e.currentTarget.parentElement.parentElement.id.split('_').join('.');
        var username = $(e.currentTarget.parentElement).find('.email').text();
        $.ajax({
            method: "POST",
            url: "deactivate_article",
            data: {id: id, site: site, username: username}}).always(function(res) {
                alert(res);
                $("#progress").css("display", "block");

        });
    }

    return {
        click: click,
        refresh: find_status,
        up_position: up_position
    };
});