'use strict';

/**
 * @module push
 * @description push message transpport for open311-messages
 * @version 0.1.0
 * @public
 * @author lally elias<lallyelias87@gmail.com>
 */

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


/**
 * @name queue
 * @description queue message instance for sending
 * @param  {Message} message valid instance of open311-message
 * @since 0.1.0
 * @public
 */
exports.queue = function (message) {
  message.transport = exports.transport;
  message.queueName = exports.queueName;
  message.queue();
};

exports.send = function (message, done) {
  //TODO implement push message send
  done(null, {});
};