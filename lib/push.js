'use strict';


//dependencies
const kue = require('kue');
const mongoose = require('mongoose');
const Message = mongoose.model('Message');

exports.queueName = 'push';

exports.transport = 'open311-push';

exports.init = function () {
  //TODO initialize node-gcm

  //initialize worker processing queue
  //for internal usage
  if (!exports._queue) {
    exports._queue = kue.createQueue(exports.options);

    //register worker for processing message 
    //and send it as push notification
    exports._queue.process(exports.queueName, Message.process);
  }

};


exports.queue = function (message) {
  message.transport = exports.transport;
  message.queueName = exports.queueName;
  message.queue();
};

exports.send = function (message, done) {
  //TODO implement push message send
  done(null, {});
};