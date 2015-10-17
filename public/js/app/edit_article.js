define(['jquery', 'maps', 'check_info'], function (){

    function post(article, map){
        $.each(map, function (index, val) {
            var elem = $('#' + val[0].split(':')[0]).find(val[0].split(':')[1]);
            if(val[1].split(':')[1]){
                var data = article[val[1].split(':')[0]][val[1].split(':')[1]];
            } else{
                data = article[val[1].split(':')[0]];
            }
            if(val[0].split(':')[0] == 'location_input' && (+data > 34 || isNaN(+data)))
                data = 34;
            elem.val(data);
        });
    }
    function fill_field(article) {
        $('#edit').attr('confirm', '' + article.confirm);
        article.location[0] = 10 * article.location[0] + (+article.location[1]);
        post(article, map_field);
        check_if_display_sub_location();
        post(article, [['sub_category_input:select', 'building:1']]);
        change();
        var url = '../articles_img/' + window.location.href.slice(window.location.href.indexOf('/edit_article/') + 14) + '/';
        $.each(article.img_src, function(index, val){
            add_image(url + val);

        });

    }
    function get_info(){
        $('.modal').css('display', 'block');
        var id = window.location.href.slice(window.location.href.indexOf('/edit_article/') + 14);
        $.ajax({
            method: 'POST',
            url: 'getArticle',
            timeout: 30000,
            data: {id: id}
        }).always(function(res){
            if (res instanceof Object) {
                fill_field(res);
            } else {
                alert("К сожалению, невозможно получить информацию с сервера");
            }
            $('.modal').css('display', 'none');
        });
    }
    function required(elem){
        return elem.parent().parent().parent().prev().find('span').attr('class') == 'red';
    }
    function change(){
        var val_cat = $("#category_input").find("select").val();
        var val_adv = $("#type_input").find("select").val();
        var val_sub = $("#sub_category_input").find("select").val();
        var map = Map_olx_field[+val_adv][+val_cat];
        var temp;
        if(!val_sub) {
            $.each(Map_field_require, function (index, value) {
                temp = $('#' + value).parent().prev().find('span');
                temp.attr('class', '');
                temp.text('');
            });
        } else {
            if (typeof map != 'string') {
                map = map[+val_sub]
            }
            $.each(map.split(''), function (index, value) {
                temp = $('#' + Map_field_require[index]).parent().prev().find('span');
                switch (value) {
                    case '0':
                        temp.attr('class', '');
                        temp.text('');
                        break;
                    case '1':
                        temp.attr('class', 'green');
                        temp.text('*');
                        break;
                    case '2':
                        temp.attr('class', 'red');
                        temp.text('*');
                        break;
                }
            });
        }
    }
    function match(reg, data, id, elem){
        if (Map_field_require.indexOf(id) >= 0 && required(elem)){
            return !data || (reg && !data.match(reg));
        } else {
            return !elem.length || (reg && !data.match(reg));
        }
    }
    function get(map, callback){
        var res = {send: true};

        $.each(map, function(index, val){
            var reg = val[2];

            var elem = $('#' + val[0].split(':')[0]).find(val[0].split(':')[1]);
            var title = val[1].split(':')[0];
            var num = val[1].split(':')[1];
            var data = elem.val();
            if (data) {
                data = data.replace(/  /g, ' ');
            }
            if (num) {
                num = +num;
                if (!res[title]) {
                    res[title] = [];
                }
                res[title][num] = data;
            } else {
                res[title] = data;
            }
            if (match(reg, data, val[0].split(':')[0], elem)) {
                res.send = false;
                lightRed('#' + val[0].split(':')[0]);
            } else {
                lightWhite('#' + val[0].split(':')[0]);
            }

        });
        res['img_src'] = [];
        $('.main_image').each(function(index, elem){
            if($(elem).attr('src').indexOf('/articles_img/') != -1) {
                res['img_src'].push($(elem).attr('src').slice(65));
            }
        });
        callback(res);
    }

    function send_info(){
        get(map_field, function(res) {
            if (res.location[0] > 9){
                res.location[1] = res.location[0] - 10;
                res.location[0] = 1;
            } else {
                res.location[1] = res.location[0];
                res.location[0] = 0;
            }
            res.id = window.location.href.slice(window.location.href.indexOf('/edit_article/') + 14);
            if (res.send) {
                delete res.send;
                $('.modal').css('display', 'block');
                $.ajax({
                    method: 'POST',
                    url: 'saveArticle',
                    timeout: 30000,
                    data: {data: JSON.stringify(res)}
                }).always(function(msg){
                    if(msg == "Yep"){
                        alert("Change saved");
                        $('#edit').attr('confirm', '');
                        window.location.href = '/';
                    } else {
                        alert("Server error");
                    }
                    $('.modal').css('display', 'none');
                });
            } else {
                alert("Некоторые поля являются неверными");
            }
        });
    }
    function add_image(url){
        var element = '<div class="img"><img id="close" src="../img/close.svg"><img src="' + url + '" class="main_image"></div>';
        $('.add_image').before(element);
        $('.img').on('mouseenter', function(){
            $(this).find("#close").show();
        }).on('mouseleave', function(){
            $(this).find("#close").hide();
        }).find('#close').on('click', function(){
            $(this).parent().remove();
        });
        $('.main_image').filter('[src^="../articles_img/"]').on('click', show_modal);

    }
    function show_modal(element){
        $("#modal_img").css("display", "block");
        $("#show").attr("src", $(this).attr("src"));
    }
    function addImage(){
        var data = new FormData();
        data.append(window.location.href.slice(window.location.href.indexOf('/edit_article/') + 14), $('#file').find('input')[0].files[0]);
        $('#file').find('input').val('');   
        add_image('../img/loading.gif');
        $.ajax({
            url: 'addImage',
            method: 'POST',
            timeout: 30000,
            processData: false,
            data: data,
            contentType: false
        }).always(function(msg){
            var el = $('img[src="../img/loading.gif"]').parent();
            if(msg != "Nope"){
                el.find('.main_image').attr('src', '../articles_img/' + window.location.href.slice(window.location.href.indexOf('/edit_article/') + 14) + '/' + msg);
                el.find('.main_image').on('click', show_modal);
            } else {
                el.remove();
            }
        });
    }
    function unload(){
        var confirm = $('#edit').attr('confirm');
        if(confirm == 'true')
            return "Изменения будут потеряны";
        if(confirm == 'false')
            return "Статья будет удалена";
    }
    function leaveP(){
        var confirm = $('#edit').attr('confirm');
        if(confirm == 'false') {
            var id = window.location.href.slice(window.location.href.indexOf('/edit_article/') + 14);
            $.ajax({
                url: 'delete',
                method: 'POST',
                async: false,
                data: {id: id}
            });
        }
    }
    return {
        get_info: get_info,
        send_info: send_info,
        addImage: addImage,
        unload: unload,
        leaveP: leaveP,
        change: change
    };
});