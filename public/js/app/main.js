define(['jquery', 'modal'], function($, modal) {
    function returnElements(element){
        if (element.Type == 'true')
            element.Type = '1';
        if (element.Type == 'false')
            element.Type = '0';
        var result = '<tr class="article" id="' + element.id + '">';
        var Currency = Map_currency[+element.Currency];
        var cat1 = Map_olx_cat[+element.Category[0]];
        var cat2 = Map_olx_sub_cat[+element.Type][+element.Category[0]][+element.Category[1]];
        var loc1 = Map_olx_city[+element.Location[0]][+element.Location[1]];
        var loc2 = Map_olx_directs[+element.Location[0]][+element.Location[1]];
        result += '<td class="medium"><p><input type="checkbox"></p></td>';
        result += '<td class="big">' + cat1 + (cat2?" > " + cat2:" > ") + '</td>';
        result += '<td>' + ((+element.Type)?("Продажа"):("Оренда"))  + '</td>';
        result += '<td class="big">' + ((element.Location[2] && +element.Location[0])?element.Location[2]:loc1) + " > " + loc2 + " район" + '</td>';
        result += '<td>' + element.Square + '</td>';
        result += '<td>' + element.Price + " " + Currency + '</td>';
        result += '<td>' + element.Site + '</td>';
        result += '<td>' + element.Rooms + '</td>';
        result += '<td class="big">' + element.Title + '</td>';
        result += '<td class="medium">' + element.Telephone + '</td>';
        result += '<td>' + element.Name + '</td>';
        result += '</tr>';
        return result;

    }



    function search_func_eq(val1){
        return (val1?function(val2){
            return val1 == val2;
        }:function(){
            return true;
        });
    }

    function search_func_in(val1){
        return (val1?function(val2){
            return val2.indexOf(val1) != -1;
        }:function(){
            return true;
        });
    }

    function search_func_more(val1){
        return (isNumeric(val1)?function(val2){
            return +val2 >= +val1;
        }:function(){
            return true;
        });
    }

    function search_func_less(val1){
        return (isNumeric(val1)?function(val2){
            return +val2 <= +val1;
        }:function(){
            return true;
        });
    }


    function search_check(func, num){
        var elem = $("#table").find(".article");
        for(var  i = 0; i < elem.length; i++){
            if(elem.eq(i).is(":visible")){
                var val2 = elem.eq(i).find("td:nth-child(" + num + ")").text();
                if(num == 6 && func.toString( ) != (search_func_in("")).toString( ) && func.toString( ) != (search_func_in(" ")).toString( )){
                    val2 = val2.slice(0, -2);
                }
                if(!func(val2)){
                    elem.eq(i).hide();
                }
            }
        }

    }
    function isNumeric(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }
    function search(){
        $("#table").find(".article").show();
        $(".modal").css("display", "block");
        search_check(search_func_eq($("#type_input").find("option:selected").text()), 3);
        search_check(search_func_eq($("#post_input").find("option:selected").text()), 10);
        search_check(search_func_eq($("#site_input").find("option:selected").text()), 7);
        search_check(search_func_in($("#title_input").find("input").val()), 9);
        search_check(search_func_in($("#name_input").find("input").val()), 11);
        search_check(search_func_in($("#telephone_input").find("input").val()), 10);
        search_check(search_func_in($("#city_input").find("input").val() + " > "), 4);
        search_check(search_func_in(" " + $("#cur_price_input").find("option:selected").text()), 6);
        search_check(search_func_in(" > " + $("#location_input").find("option:selected").text()), 4);
        search_check(search_func_in($("#category_input").find("option:selected").text() + " > "), 2);
        if($("#sub_category_input").is(":visible")){
            search_check(search_func_in(" > " + $("#sub_category_input").find("option:selected").text()), 2);
        }
        search_check(search_func_more($("#from_square_input").find("input").val()), 5);
        search_check(search_func_less($("#to_square_input").find("input").val()), 5);
        search_check(search_func_more($("#from_rooms_input").find("input").val()), 8);
        search_check(search_func_less($("#to_rooms_input").find("input").val()), 8);
        search_check(search_func_more($("#from_price_input").find("input").val()), 6);
        search_check(search_func_less($("#to_price_input").find("input").val()), 6);
        $(".modal").css("display", "none");
    }
    function getArticles(){
        $(".article").remove();
        $(".modal").css("display", "block");
        $.ajax({
            method: "POST",
            url: "getArticles"}).always(function(res){
            if (res instanceof Object){
                $.each(res, function(index, val){
                    try{
                        $("#articles").find("table").append(returnElements(val));
                    } catch(e){
                        return $(".modal").css("display", "none");
                    }
                });
                $(".article").on('click', modal);
                $(".modal").css("display", "none");
            } else {
                alert("К сожалению, невозможно получить информацию с сервера");
                return $(".modal").css("display", "none");
            }


        });
    }
    function deleteArticles(){
        var len = $("#articles").find(".article input:checked").length;
        var art = $("#articles").find(".article input:checked");
        var res = [];
        if(len) {
            $(".modal").css("display", "block");
            for (var i = 0; i < len; i++){
                res.push(art.eq(i).parent().parent().parent().attr("id"));
            }
            $.ajax({
                method: "POST",
                url: "deleteArticles",
                data: { 'id': JSON.stringify(res)}
            }).always(function(msg){
                if(msg == "Yep"){
                    alert("Успешно удалено");
                } else {
                    alert("Ошибка сервера");
                }
                $(".modal").css("display", "none");
                $(document).trigger("getArticles");
            });
        }
    }
    function up_position(){
        var len = $("#articles").find(".article input:checked").length;
        var art = $("#articles").find(".article input:checked");
        var res = [];
        if(len) {
            for (var i = 0; i < len; i++){
                res.push(art.eq(i).parent().parent().parent().attr("id"));
            }
            $.ajax({
                method: "POST",
                url: "up_position",
                data: { 'id': JSON.stringify(res)}
            }).always(function(msg){
                if(msg == "Yep"){
                    alert("Запуск обновления");
                } else {
                    alert("Ошибка сервера");
                }
            });
        }
    }
    return {
        getArticles: getArticles,
        deleteArticles: deleteArticles,
        search: search,
        up_position: up_position
    };
});