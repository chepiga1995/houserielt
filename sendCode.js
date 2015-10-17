var sendMail = require("./libs/mailer");
var crypt = require('./libs/crypt');
var config = require('./config');
var email = process.argv[2];
var pas = config.get("sendCode:password");
var key = config.get("sendCode:key");
var code = crypt.encrypt(key, email + pas);
sendMail(email, "Invitation code", code, "<p>This code attached to this email address</p>" +
    "<p>Use this code to register on the service</p>" +
    "<b>" + code +"</b>", function(error, info){
    if(error){
        console.log(error);
    }else{
        console.log('Message sent: ' + info.response);
    }
    console.log(code);
});