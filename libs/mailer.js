var nodemailer = require('nodemailer');
var config = require('../config');

var transporter = nodemailer.createTransport({
    service: config.get("mail:service"),
    auth: {
        user: config.get("mail:email"),
        pass: config.get("mail:password")
    }
});


var mailOptions = {
    from: 'Houseriel <info_houseriel@gmail.com>', // sender address
    to: '', // list of receivers
    subject: '', // Subject line
    text: '', // plaintext body
    html: '' // html body
};

function sendMail(to, subject, text, html, callback){
    mailOptions.to = to;
    mailOptions.subject = subject;
    mailOptions.text = text;
    mailOptions.html = html;
    transporter.sendMail(mailOptions, callback);
}
module.exports = sendMail;

