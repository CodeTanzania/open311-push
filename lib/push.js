'use strict';

/**
 * @module push
 * @description push message transpport for open311-messages
 * @version 0.1.0
 * @public
 * @author lally elias<lallyelias87@gmail.com>
 */

//dependencies
const _ = require('lodash');
const kue = require('kue');
const mongoose = require('mongoose');
const gcm = require('node-gcm');
const Message = mongoose.model('Message');
const noop = function () {};


/**
 * @name queueName
 * @description name of the queue that will be used by push transport
 *              to enqueue message for sending
 * @type {String}
 * @since 0.1.0
 * @public
 */
exports.queueName = 'push';


/**
 * @name transport
 * @description name of the transport provided by push.
 *              This must be name of node module or file path pointing to
 *              a node module implement `send()`.
 * @type {String}
 * @since 0.1.0
 * @public
 */
exports.transport = 'open311-push';


/**
 * @name init
 * @description initialize push internals
 * @since 0.1.0
 * @private
 */
exports.init = function () {
  //initiate node GCM(FCM) sender
  //@see {@link https://github.com/ToothlessGear/node-gcm#example-application}
  if (!exports.sender) {
    const { apiKey } = exports.options;
    exports.sender = new gcm.Sender(apiKey);
  }

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
 * @example
 *
 * const message = new Message(options);
 * push.queue(message);
 * 
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


/**
 * @name stop
 * @description gracefull shutdown kue
 * @see {@link https://github.com/Automattic/kue#graceful-shutdown}
 * @param {Function} [done] a callback to invoke on succes or failure
 * @type {Function}
 * @since 0.1.0
 * @public
 * @example
 *
 * const push = require('open311-push')(options);
 * push.stop();
 *  
 */
exports.stop = function stop(done) {

  //ensure callback
  if (!done && !_.isFunction(done)) {
    done = noop;
  }

  //ensure queue safe shutdown
  if (exports._queue) {
    if (exports._queue.shuttingDown) {
      done();
    } else {
      const { timeout } = exports.options;
      exports._queue.shutdown(timeout, done);
    }
  }

};


/**
 * @name start
 * @description setup push message(s) worker and start to process `push` jobs
 * @type {Function}
 * @since 0.1.0
 * @public
 * @example
 *
 * const push = require('open311-push')(options);
 * push.start();
 * 
 */
exports.start = function () {

  //ensure push is initialized
  exports.init();

  //listen for process termination
  //and gracefull shutdown push worker queue
  process.once('SIGTERM', function ( /*signal*/ ) {
    exports.queue.shutdown(function ( /*error*/ ) {
      process.exit(0);
    });
  });

};