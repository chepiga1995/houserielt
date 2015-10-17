
define(['jquery', 'maps', 'check_info'], function($) {
    function post_data(res){
        var cat1 = Map_olx_cat[+res.building[0]];
        var cat2 = Map_olx_sub_cat[+res.adv_type][+res.building[0]][+res.building[1]];
        var loc1 = Map_olx_city[+res.location[0]][+res.location[1]];
        var loc2 = Map_olx_directs[+res.location[0]][+res.location[1]];
        var space = (res.space[0]?"Общая площадь: " + res.space[0]:"") + (res.space[1]?"<br>Жилая площадь: " + res.space[1]:"") + (res.space[2]?"<br>Площадь кухни: " + res.space[2]:"");
        var floor = (res.floor[0]?"Этаж: " + res.floor[0]:"") + (res.floor[1]?"<br>Этажность дома: " + res.floor[1]:"");
        $("#modal_info").css("display", "block").attr("class", res._id).find(".container").remove();
        add_container("Заглавие:", res.title);
        add_container("Ссылка:", res.url);
        add_container("Сайт:", res.site);
        add_container("Цена:", res.price + " " + Map_currency[+res.currency]);
        add_container("Тип здания:", (res.type)?Map_type[+res.type]:"");
        add_container("Категория:", cat1 + (cat2?" > " + cat2:" > "));
        add_container("Описание:", res.description);
        add_container("Дата:", res.date);
        add_container("Тип:", ((+res.adv_type)?("Продажа"):("Оренда")));
        add_container("Телефон владельца:", res.telephone);
        add_container("Имя владельца:", res.name);
        add_container("Сдается с:", res.rent_from);
        add_container("Адрес:", ((res.location[2] && +res.location[0])?res.location[2]:loc1) + " > " + loc2 + " район");
        add_container("Количество комнат:", res.rooms);
        add_container("Площадь:", space);
        add_container("Этаж:", floor);
        add_container("Расстояние до ближайшего города:", res.remote);
        add_container("Телефон:", res.per_telephone);
        add_container("Skype:", res.skype);
        add_img(res.img_src, res._id);
        if(!$('#submit_add_new').length)
            add_post(res.posted);
        $("#title").find("input").on("change", function(){
            $("#status").find(" li").css("display", "none");
            $("#status #" +$("#title").find("input:radio[name=site]:checked").val()).css("display", "block");
        });
    }

    function add_container(name, data){
        var res = '<div class="container"><div class="left">';
        res += '<h3>' + name + '</h3>';
        res += '</div><div class="right">';
        res += '<h5>' + data + '</h5></div></div>';
        $("#modal_info").find(".wrapper > .right").append(res);
    }

    function add_img(arr, id){
        $.each(arr, function(i, val){
            if(!$('#submit_add_new').length)
                var res = '<div class="container"><img src="../../articles_img/' + id + '/' + val +'"></div>';
            else
                res = '<div class="container"><img src="' + val +'"></div>';
            $("#modal_info").find(".wrapper > .left").append(res);
        });
    }

    function add_post(posted){
        //var res = '<div class="container"><div class="left"><h3>Posted:</h3></div><div class="right"><ul id="title"><li><input type="radio" name="site" value="olx_ua"><span>olx.ua</span></li>' +
        //    '<li><input type="radio" name="site" value="fn_ua"><span>fn.ua</span></li><li><input type="radio" name="site" value="aviso_ua"><span>aviso.ua</span></li>' +
        //    '<li><input type="radio" name="site" value="address_ua"><span>address.ua</span></li><li><input type="radio" name="site" value="mirkvartir_ua"><span>mirkvartir.ua</span></li>' +
        //    '</ul><ul id="status">';
        $.each(posted, function(index, val){
            var res = '<li id="' + index + '"><h5>Статус: <span class="' + Map_post_light[val.status] + '">' + Map_post[val.status] + '</span></h5>';
            if (val.status) {
                res += '<h5>Аккаунт: <span class="blue" id="' + val.id + '">';
                $.ajax({
                    method: "POST",
                    url: "getAccountInfo",
                    data: {id: val.id}
                }).always(function (msg) {
                    add_container(index.split('_').join('.') + ":", res + msg.username + '</span></h5></li>');
                });
            } else {
                add_container(index.split('_').join('.') + ":", res + '</li>');
            }
        });
        //res += '</ul></div></div>';
        //$("#modal_info").find(".wrapper > .right").append(res);
    }
    return function(elem){
        var All = '';
        if(elem.target.type == "checkbox")
            return 0;
        $(".modal").css("display", "block");
        var id = this.id;
        if($('#submit_add_new').length)
            All = 'All';
        $.ajax({
            method: "POST",
            url: "getArticle" + All,
            data: {id: id}}).always(function(res){
            if (res.title) {
                post_data(res);
                $("#modal_info").find(".wrapper > .left img").on('click', function(){
                    $("#modal_img").css("display", "block");
                    $("#show").attr("src", $(this).attr("src"));
                });
            } else {
                alert("К сожалению, невозможно получить информацию с сервера");
            }
            $(".modal").css("display", "none");
        });
    };
});


