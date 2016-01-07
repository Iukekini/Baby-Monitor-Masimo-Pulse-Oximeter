var _ = require('lodash');
var async = require('async');
var crypto = require('crypto');
var nodemailer = require('nodemailer');
var passport = require('passport');
var User = require('../models/User');
var secrets = require('../config/secrets');


/**
 * GET /admin
 * Login page.
 */
exports.accounts = function (req, res) {
    var events = User.find({})

    events.exec(function (e, docs) {
        res.render('admin/accounts', {
            title: 'Admin Accounts',
            users: docs

        });
    });



};


exports.updateRights = function(req, res){
    User.findById(req.params.id, function(err, user) {
    
    
    if (req.params.role == "admin" && req.params.state == "true")
        user.admin = true;
    else if (req.params.role == "admin" && req.params.state == "false")
        user.admin = false;
    if (req.params.role == "history" && req.params.state == "true")
        user.history = true;
    else if (req.params.role == "history" && req.params.state == "false")
        user.history = false;
    if (req.params.role == "live" && req.params.state == "true")
        user.live = true;
    else if (req.params.role == "live" && req.params.state == "false")
        user.live = false;
            
    user.save(function(err) {
      
      req.flash('success', { msg: 'Profile information updated.' });
    });
  });
}