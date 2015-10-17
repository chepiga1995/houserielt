
define(['jquery', 'modal'], function($, modal){
    Date.prototype.customFormat = function(formatString){
        var YYYY,YY,MMMM,MMM,MM,M,DDDD,DDD,DD,D,hhhh,hhh,hh,h,mm,m,ss,s,ampm,AMPM,dMod,th;
        YY = ((YYYY=this.getFullYear())+"").slice(-2);
        MM = (M=this.getMonth()+1)<10?('0'+M):M;
        MMM = (MMMM=["January","February","March","April","May","June","July","August","September","October","November","December"][M-1]).substring(0,3);
        DD = (D=this.getDate())<10?('0'+D):D;
        DDD = (DDDD=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][this.getDay()]).substring(0,3);
        th=(D>=10&&D<=20)?'th':((dMod=D%10)==1)?'st':(dMod==2)?'nd':(dMod==3)?'rd':'th';
        formatString = formatString.replace("#YYYY#",YYYY).replace("#YY#",YY).replace("#MMMM#",MMMM).replace("#MMM#",MMM).replace("#MM#",MM).replace("#M#",M).replace("#DDDD#",DDDD).replace("#DDD#",DDD).replace("#DD#",DD).replace("#D#",D).replace("#th#",th);
        h=(hhh=this.getHours());
        if (h==0) h=24;
        if (h>12) h-=12;
        hh = h<10?('0'+h):h;
        hhhh = h<10?('0'+hhh):hhh;
        AMPM=(ampm=hhh<12?'am':'pm').toUpperCase();
        mm=(m=this.getMinutes())<10?('0'+m):m;
        ss=(s=this.getSeconds())<10?('0'+s):s;
        return formatString.replace("#hhhh#",hhhh).replace("#hhh#",hhh).replace("#hh#",hh).replace("#h#",h).replace("#mm#",mm).replace("#m#",m).replace("#ss#",ss).replace("#s#",s).replace("#ampm#",ampm).replace("#AMPM#",AMPM);
    };
    var article_on_page = 20;

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
        var date = new Date(element.Date * 1000);
        var str_date = date.customFormat( "#DD#/#MM#/#YYYY# #hhh#:#mm#:#ss#" );
        result += '<td class="medium">' + str_date + '</td>';
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

    function get_query(){
        var query = {};
        $.each(Map_search_query, function(index, item){
            var value = $('#' + item[0]).find('.field').val();

            if(value){
                switch(item[2]) {
                    case '$regex':
                        query[item[1]] = {$regex : ".*" + value + ".*"};
                        break;
                    case  '$gt':
                        if (! query[item[1]])
                            query[item[1]] = {};
                        query[item[1]].$gt = +value;
                        break;
                    case  '$lt':
                        if (! query[item[1]])
                            query[item[1]] = {};
                        query[item[1]].$lt = +value;
                        break;
                    default:
                        query[item[1]] = value;
                }
            }
        });
        var value = $('#location_input').find('.field').val();
        if(value){
            query['location.0'] = (value > 10? '1': '0');
            query['location.1'] = (value > 10? value - 10: value) + '';
        }
        console.log(query);
        return query;
    }
    function page(element){
        var navigation = $('#articles').find('.navigation');
        var value = article_on_page * (element.target.innerText - 1);
        navigation.attr('current', value);
        getArticles();
    }
    function getArticles(){
        $(".article").remove();
        $(".modal").css("display", "block");
        var navigation = $('#articles').find('.navigation');
        var from = navigation.attr('current');
        var query = get_query();
        $.ajax({
            method: "POST",
            url: "getAllArticles",
            data: {
                from: from,
                query: JSON.stringify(query)
            }
        }).always(function(res){
            if (res.array){
                $.each(res.array, function(index, val){
                    try{
                        $("#articles").find("table").append(returnElements(val));
                    } catch(e){
                        return $(".modal").css("display", "none");
                    }
                });
                create_navigation(res.len);
                navigation.find('span[value]').click(page);
                $(".article").on('click', modal);
                $(".modal").css("display", "none");
            } else {
                alert("К сожалению, невозможно получить информацию с сервера");
                return $(".modal").css("display", "none");
            }


        });
    }

    function create_navigation(len){
        var navigation = $('#articles').find('.navigation');
        navigation.find('.pages > *').remove();
        var current = Math.floor(+navigation.attr('current') / article_on_page) + 1;
        var elem_append = navigation.find('.pages');
        len = Math.floor(len / article_on_page) + 1;
        for(var i = 1; i <= len; i++){
            switch(i) {
                case current:
                    elem_append.append('<span value="' + i + '" class="selected">' + i + '</span>');
                    break;
                case 1:
                    elem_append.append('<span value="' + i + '">' + i + '</span>');
                    break;
                case Math.abs(i - current) + i - 1:
                    elem_append.append('<span value="' + i + '">' + i + '</span>');
                    break;
                case current + 2:
                    if(len - current < 4)
                        elem_append.append('<span value="' + i + '">' + i + '</span>');
                    else
                        elem_append.append('<span value="' + i + '">' + i + '</span><span>...</span>');
                    break;
                case current - 2:
                    if(current < 5)
                        elem_append.append('<span value="' + i + '">' + i + '</span>');
                    else
                        elem_append.append('<span>...</span><span value="' + i + '">' + i + '</span>');
                    break;
                case len:
                    elem_append.append('<span value="' + i + '">' + i + '</span>');
                    break;
            }

        }
    }

    function add(){
        $('.modal').css('display', 'block');
        var url = $('#url_input').find('input').val();
        $.ajax({
            method: 'POST',
            url: 'add',
            data: { 'url': url}
        }).always(function(msg){
            if(typeof(msg) == 'string' && msg.match(/^Yep /)){
                window.location.href = "/edit_article/" +  msg.slice(4);
            } else {
                alert("Ошибка сервера");
            }
            $(".modal").css("display", "none");
        });
    }
    function add_from(){
        $('.modal').css('display', 'block');
        var id = $('#modal_info').attr('class');
        $.ajax({
            method: 'POST',
            url: 'add_from',
            data: { 'id': id}
        }).always(function(msg){
            if(typeof(msg) == 'string' && msg.match(/^Yep /)){
                window.location.href = "/edit_article/" +  msg.slice(4);
            } else {
                alert("Ошибка сервера");
            }
            $(".modal").css("display", "none");
        });
    }
    return {
        add: add,
        getArticles: getArticles,
        add_from: add_from
    };
});