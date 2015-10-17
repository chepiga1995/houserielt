var reg = ['username_input', 'name_input', 'password_input', "password_confirm", "invitation_input"];
var regF = [checkEmail, checkName, checkPassword, checkConfirm, checkInvent];
var cpw = ['password_input', "password_confirm"];
var cpwF = [checkPassword, checkConfirm];
var aa = ['username_input', 'password_input'];
var aaF = [checkAccount, checkPassword_acc];

function focusout(){
    var i = reg.indexOf(this.parentElement.parentElement.id);
    var temp = $('#' + reg[i] + ' input').val();
    if(temp != ''){
        regF[i](function(){return 0;});
    }
}
function focusout_inv(){
    var i = reg.indexOf(this.parentElement.parentElement.id);
    var temp = $('#' + reg[i] + ' input').val();
    if(temp != ''){
        checkEmail_inv(function(){return 0;});
    }
}

function focusout_acc(){
    var i = aa.indexOf(this.parentElement.parentElement.id);
    var temp = $('#' + aa[i] + ' input').val();
    if(temp != '' || i == 1){
        aaF[i](function(){return 0;});
    }
}
function focusin(){
    var i = reg.indexOf(this.parentElement.parentElement.id);
    lightWhite("#" + reg[i]);
}

function isValidEmailAddress(emailAddress) {
    var pattern = new RegExp(/^(("[\w-+\s]+")|([\w-+]+(?:\.[\w-+]+)*)|("[\w-+\s]+")([\w-+]+(?:\.[\w-+]+)*))(@((?:[\w-+]+\.)*\w[\w-+]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][\d]\.|1[\d]{2}\.|[\d]{1,2}\.))((25[0-5]|2[0-4][\d]|1[\d]{2}|[\d]{1,2})\.){2}(25[0-5]|2[0-4][\d]|1[\d]{2}|[\d]{1,2})\]?$)/i);
    return pattern.test(emailAddress);
}
function testEmail(email, callback){
    $.ajax({
        method: "POST",
        url: "testEmail",
        data: { 'username': email}
    }).always(callback);
}
function lightGreen(selector){
    $(selector).css('box-shadow','0px 0px 2px 1px #63EE3F inset');
    $(selector + " ~ .message").css('display','none');
}
function lightRed(selector, msg){
    if(msg){
        $(selector + " ~ .message").css('display','block');
        $(selector + " ~ .message").text(msg);
    } else{
        $(selector + " ~ .message").css('display','none');
    }
    $(selector).css('box-shadow','0px 0px 2px 1px #F63154 inset');
}
function lightWhite(selector){
    $(selector).css('box-shadow','0px 0px 3px 3px #f5f5f5 inset');
    $(selector + " ~ .message").css('display','none');
}
function checkEmail(callback){
    var email = $('#username_input').find('input').val();
    if(!isValidEmailAddress(email)){
        lightRed('#username_input',"Не действительный адрес электронной почты");
        return callback(false);
    } else{
        testEmail(email, function(msg){
            if(msg == "Yep"){
                lightGreen("#username_input");
                return callback(true);
            } else{
                lightRed('#username_input',"Этот адрес электронной почты уже существует");
                return callback(false);
            }
        });
    }
}

function checkEmail_inv(callback){
    var email = $('#username_input').find('input').val();
    if(!isValidEmailAddress(email)){
        lightRed('#username_input',"Не действительный адрес электронной почты");
        return callback(false);
    } else{
        testEmail(email, function(msg){
            if(msg != "Yep"){
                lightGreen("#username_input");
                return callback(true);
            } else{
                lightRed('#username_input',"Эта электронная почта не зарегистрирована");
                return callback(false);
            }
        });
    }
}
function checkName(callback){
    var name = $('#name_input').find('input').val();
    if(name){
        lightGreen("#name_input");
        return callback(true);
    } else{
        lightRed('#name_input',"Input your name");
        return callback(false);
    }
}
function checkPassword(callback){
    var password = $('#password_input').find('input').val();
    if(password.length > 5){
        lightGreen("#password_input");
        return callback(true);
    } else{
        lightRed('#password_input',"Пароль слишком короткий");
        return callback(false);
    }
}
function checkConfirm(callback){
    var pas = $('#password_input').find('input').val();
    var password = $('#password_confirm').find('input').val();
    if(password == pas && password.length > 5){
        lightGreen("#password_confirm");
        return callback(true);
    } else{
        lightRed('#password_confirm',"Пароли не совпадают");
        return callback(false);
    }
}
function checkInvent(callback){
    var email = $('#username_input').find('input').val();
    var code = $('#invitation_input').find('input').val();
    checkCode(email, code, function(msg){
        if(msg == 'Yep') {
            lightGreen("#invitation_input");
            return callback(true);
        } else{
            lightRed('#invitation_input',"Введен некорректный код");
            return callback(false);
        }
    });

}
function checkCode(email, code, callback){
    $.ajax({
        method: "POST",
        url: "checkCode",
        data: { 'username': email, code: code}
    }).always(callback);
}
function async_series(arr_func, callback){
    series(0, arr_func, true, callback);
}
function series(i, arr_func, res, callback){

    arr_func[i](function(result){
        res = result && res;
        if(i >= arr_func.length - 1){
            callback(res);
        } else {
            series(i + 1, arr_func, res, callback);
        }

    });
}

function checkPassword_acc(callback){
    var password = $('#password_input').find('input').val();
    if(password){
        lightGreen("#password_input");
        return callback(true);
    } else{
        lightRed('#password_input');
        return callback(false);
    }
}
function checkAccount(callback){
    var email = $('#username_input').find('input').val();
    var site = $('#site_input').find('select').val();
    if(!isValidEmailAddress(email)){
        lightRed('#username_input');
        return callback(false);
    } else{
        testAccount(email, site, function(msg){
            if(msg == "Yep"){
                lightGreen("#username_input");
                return callback(true);
            } else{
                lightRed('#username_input');
                return callback(false);
            }
        });
    }
}
function testAccount(email, site, callback){
    $.ajax({
        method: "POST",
        url: "checkAccount",
        data: { 'username': email, site: site}
    }).always(callback);
}
function check_if_display_sub_location (){
    var sub_cat = $("#sub_category_input");
    sub_cat.find('select').find('*').remove();
    sub_cat.parent().hide();
    var val_cat = $("#category_input").find("select").val();
    var val_adv = $("#type_input").find("select").val();

    if (val_cat && val_adv){
        var elements = '<option value=""></option>';
        var arr = Map_olx_sub_cat[+val_adv][+val_cat];
        var temp;
        if (arr.length) {
            $.each(Map_field_require, function(index, value){
                temp = $('#' + value).parent().prev().find('span');
                temp.attr('class', '');
                temp.text('');
            });
            $.each(arr, function(index, value){
                elements += '<option value="' + index + '">' + value + '</option>';
            });

            $(elements).appendTo(sub_cat.find('.field'));
            sub_cat.parent().show();
        } else {
            var map = Map_olx_field[+val_adv][+val_cat];
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
}

