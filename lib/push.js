'use strict';


//dependencies

exports.queueName = 'push';

exports.init = function () {
  //TODO initialize queue
  //TODO register worker for processing push message send job
};

exports.queue = function (message) {
  message.transport = 'open311-push';
  message.queueName = exports.queueName;
  message.queue();
};

exports.send = function (message, done) {
  //TODO implement push message send
  done(null, {});
};