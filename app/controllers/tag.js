var _ = require('lodash');
var async = require('async');
var crypto = require('crypto');
var nodemailer = require('nodemailer');
var passport = require('passport');
var Tag = require('../models/Tag');

exports.insertTag = function(req, res){

  var obj = {
    text: req.params.text,
    date: new Date()
  }
  Tag.collection.insert(obj, onInsert);

  function onInsert(err, doc) {
    if (err) {
        res.status(400).json({'err': err});
    } else {
        res.send(doc)
    }
  }
}
