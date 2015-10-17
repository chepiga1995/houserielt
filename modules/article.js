var crypt = require('../libs/crypt');
var config = require('../config');
var mongoose = require('../libs/mongoosedb');
var AuthError = require('../error').AuthError;
var async = require('async');
var Schema = mongoose.Schema;

var schema = new Schema({
    title: String,
    url: String,
    site: String,
    price: String,
    type: String,
    building: [String],
    currency: String,
    description: String,
    img_src: [String],
    date: String,
    adv_type: String,
    telephone: String,
    rent_from: String,
    location: [String],
    rooms: String,
    space: [String],
    floor: [String],
    name: String,
    remote: String,
    per_telephone: String,
    per_name: String,
    skype: String,
    posted:{
        olx_ua:{
            id: String,
            status: {
                type: Number,
                default: 0
            },
            postedOn: String
        },
        fn_ua:{
            id: String,
            status: {
                type: Number,
                default: 0
            },
            postedOn: String
        },
        aviso_ua:{
            id: String,
            status: {
                type: Number,
                default: 0
            },
            postedOn: String
        },
        address_ua:{
            id: String,
            status: {
                type: Number,
                default: 0
            },
            postedOn: String
        },
        mirkvartir_ua:{
            id: String,
            status: {
                type: Number,
                default: 0
            },
            postedOn: String
        }
    },
    created: {
        type: Date,
        default: Date.now
    },
    id: {
        type: String,
        required: true
    },
    confirm:{
        type: Boolean,
        default: false
    }
});


schema.statics.registration = function(obj, callback) {
    var Account = this;
    var account = new Account(obj);
    account.save(function (err, account) {
        if (err) return callback(err);
        callback(null, account)
    });
};


var Article = mongoose.model('Article', schema);
exports.Article = Article;