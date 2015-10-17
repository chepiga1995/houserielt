requirejs.config({
    shim : {
        'bootstrap' : { deps :['jquery']},
        'check_info' : { deps :['jquery']}
    },
    baseUrl: '../js',
    paths: {
        'jquery': "./lib/jquery-2.1.4.min",
        'bootstrap': "./lib/bootstrap.min",
        'socket.io': "./lib/socket.io",
        'edit_article': "./app/edit_article",
        'header': "./app/header",
        'add': "./app/add",
        'login': "./app/login",
        'registration': "./app/registration",
        'check_info': "./app/check_info",
        'pas': "./app/pas",
        'changepw': "./app/changepw",
        'manage_acc': "./app/manage_acc",
        'maps': "./app/maps",
        'modal': "./app/modal",
        'main': "./app/main",
        'manage_posting': './app/manage_posting',
        'socket': './app/socket'
    }
});
requirejs(['require', 'jquery'], function(require, $) {
    $(document).ready(function() {
        $('form').on('keyup keypress', function(e) {
            var code = e.keyCode || e.which;
            if (code == 13) {
                e.preventDefault();
                return false;
            }
        });
        $('.modal').css("display", "block");
        if ($('#edit_article').length) {
            require(['edit_article', 'header', 'socket'], ready_edit_article);
        }
        if ($('#add').length) {
            require(['add', 'header', 'socket'], ready_add_article);
        }
        if ($('#login').length) {
            require(['login'], ready_login);
        }
        if ($('#reg').length) {
            require(['registration'], ready_reg);
        }
        if ($('#pas').length) {
            require(['pas'], ready_pas);
        }
        if ($('#changepw').length) {
            require(['changepw'], ready_changepw);
        }
        if ($('#manage_acc').length) {
            require(['manage_acc', 'header', 'socket'], ready_manage_acc);
        }
        if ($('#msg').length) {
            $('.modal').css("display", "none");
        }
        if ($('#main').length) {
            require(['main', 'header', 'manage_posting', 'socket'], ready_main);
        }
    });
});

function ready_edit_article(article, header){
    $("#user").find(".min_prog").click(function(){
        $("#progress").css("display", "block");
    });
    $("#progress").find("#close").click(function(){
        $("#progress").css("display", "none");
    });
    $('#add_img').click(function(){
        $(this).parent().find('#file').find('input').trigger('click');
    });
    $('#file').find('input').change(article.addImage);
    $("#modal_img").find("#close").click(function(){
        $("#modal_img").css("display", "none");
    });
    $('#logout').find('span').on('click', header.logout);
    $('#header').find('.container').on('click', header.head_click);
    $(document).on('getArticle', article.get_info);
    $("#category_input").find("select").change(check_if_display_sub_location);
    $("#type_input").find("select").change(check_if_display_sub_location);
    $("#sub_category_input").find("select").change(article.change);
    $('#edit_article').trigger("getArticle");
    $('#title').find('input').on("change", function(){
        $('#status').find('li').css("display", "none");
        $('#status #' + $('#title').find('input:radio[name=site]:checked').val()).css("display", "block");
    }).trigger('change');
    $("#submit_save").click(article.send_info);
    window.onbeforeunload = article.unload;
    window.onunload = article.leaveP;
    $('.modal').css("display", "none");
}
function ready_add_article(add, header){
    $("#category_input").find("select").change(check_if_display_sub_location);
    $("#type_input").find("select").change(check_if_display_sub_location);
    $("#modal_img").find("#close").click(function(){
        $("#modal_img").css("display", "none");
    });

    $('#submit_add_new').on('click', add.add_from);
    $("#modal_info").find("#close").click(function(){
        $("#modal_info").css("display", "none");
    });
    $("#user").find(".min_prog").click(function(){
        $("#progress").css("display", "block");
    });
    $("#progress").find("#close").click(function(){
        $("#progress").css("display", "none");
    });
    $(document).on("getArticles", add.getArticles);
    $("#submit_search").click(function(){
        $('#articles').find('.navigation').attr('current', '0');
        add.getArticles();
    });
    $('#logout').find('span').on('click', header.logout);
    $('#header').find('.container').on('click', header.head_click);
    $('#submit_add').on('click', add.add);
    $('.modal').css("display", "none");
    $("#add").trigger("getArticles");
}
function ready_login(login){
    $('#submit_login').on('click', login);
    $('.modal').css("display", "none");
}
function ready_reg(registration){
    for (var i = 0; i < 5; i++)
        $('#' + reg[i]).find('input').on('focusout', focusout).on('focusin', focusin);
    $('#submit_reg').on('click', registration);
    $('.modal').css("display", "none");
}
function ready_pas(pas){
    $('#username_input').find('input').on('focusout', focusout_inv).on('focusin', focusin);
    $('#submit_pas').on('click', pas);
    $('.modal').css("display", "none");
}
function ready_changepw(changepw){
    $("#" + cpw[0]).find('input').on('focusout', focusout).on('focusin', focusin);
    $("#" + cpw[1]).find('input').on('focusout', focusout).on('focusin', focusin);
    $('#submit_changepw').on('click', changepw);
    $('.modal').css("display", "none");
}
function ready_manage_acc(manage_acc, header){
    $("#user").find(".min_prog").click(function(){
        $("#progress").css("display", "block");
    });
    $("#progress").find("#close").click(function(){
        $("#progress").css("display", "none");
    });
    $('#logout').find('span').on('click', header.logout);
    $('#header').find('.container').on('click', header.head_click);
    $("#" + aa[0]).find('input').on('focusout', focusout_acc).on('focusin', focusin);
    $("#" + aa[1]).find('input').on('focusout', focusout_acc).on('focusin', focusin);
    $('#submit_manage_acc').on('click', manage_acc.check);
    $(document).on("getAccounts", manage_acc.getAccounts);
    $("#manage_acc").trigger("getAccounts");
    $('.modal').css("display", "none");
}
function ready_main(main, header, manage_posting){
    $('#logout').find('span').on('click', header.logout);
    $('#header').find('.container').on('click', header.head_click);
    $(document).on("getArticles", main.getArticles);
    $("#deleteArticles").click(main.deleteArticles);
    $("#up_position").click(main.up_position);

    $("#category_input").find("select").change(check_if_display_sub_location);
    $("#type_input").find("select").change(check_if_display_sub_location);


    $("#submit_search").click(main.search);
    $("#modal_img").find("#close").click(function(){
        $("#modal_img").css("display", "none");
    });
    $("#modal_info").find("#close").click(function(){
        $("#modal_info").css("display", "none");
    });
    $("#progress").find("#close").click(function(){
        $("#progress").css("display", "none");
    });
    $("#user").find(".min_prog").click(function(){
        $("#progress").css("display", "block");
    });
    $("#manage_posting").find("#close").click(function(){
        $("#manage_posting").css("display", "none");
    });
    $("#submit_edit").click(function(){
        window.location.href = "/edit_article/" +  $("#modal_info").attr("class");
    });
    $("#submit_posting").on('click', manage_posting.click);
    $("#head").find("input").click(function(){
        if(!$(this).prop("checked")){
            $("#articles").find(".article input").prop("checked", false);
        } else{
            $("#articles").find(".article input").prop("checked", true);
        }
    });
    $('html #submit_status').on('click', manage_posting.refresh);
    $('html #submit_position').on('click', manage_posting.up_position);
    $("#main").trigger("getArticles");
    $('.modal').css("display", "none");

}