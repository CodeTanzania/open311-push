'use strict';

/**
 * @module open311-push
 * @version 0.1.0
 * @description fcm(gcm) push notification transport for open311-messages
 * @see {@link https://github.com/CodeTanzania/open311-messages}
 * @see {@link https://github.com/ToothlessGear/node-gcm}
 * @author lally elias <lallyelias87@gmail.com>
 * @public
 */


//dependencies
const _ = require('lodash');
const kue = require('kue');
const mongoose = require('mongoose');
const gcm = require('node-gcm');
const noop = function () {};


/**
 * @name defaults
 * @description default configuration options
 * @type {Object}
 * @since 0.1.0
 * @private
 */
exports.defaults = {
  timeout: 5000,
  concurrency: 10,
  from: 'open311'
};


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
 * @example
 *
 * const push = require('open311-push');
 * push.options = {
 *  apiKey:<your_api_key>
 * };
 * push.init();
 * 
 */
exports.init = function () {

  //merge options
  exports.options = _.merge({}, exports.defaults, exports.options);

  //ensure Google FCM API Key
  const { apiKey } = exports.options;
  if (_.isEmpty(apiKey)) {
    throw new Error('Missing FCM API Key');
  }

  //initiate node GCM(FCM) sender
  //@see {@link https://github.com/ToothlessGear/node-gcm#example-application}
  if (!exports.fcm) {
    exports.fcm = new gcm.Sender(apiKey);
  }

  //initialize worker processing queue
  //for internal usage
  if (!exports._queue) {
    exports._queue = kue.createQueue(exports.options);
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
 * const Message = require('open311-messages')(<your_options>);
 * const push = require('open311-push');
 * const message = new Message(options);
 * push.queue(message);
 * 
 */
exports.queue = function (message) {
  message.transport = exports.transport;
  message.queueName = exports.queueName;
  //ensure from is set-ed
  if (!message.from) {
    message.from = exports.options.from;
  }
  message.queue();
};


/**
 * @name _send
 * @description send push notification message
 * Note!: message options may contain push message data & notification
 * @see {@link https://github.com/ToothlessGear/node-gcm#notification-payload-option-table}
 * @param  {Message}   message valid open311-message instance
 * @param  {Function} done    a callback to invoke on success or failure
 * @type {Function}
 * @since 0.1.0
 * @private
 */
exports._send = function (message, done) {

  //prepare FCM push notification compliant payload
  let payload =
    _.merge({}, message.options, {
      notification: {
        title: message.subject,
        body: message.body
      }
    });

  //prepare recipients
  const to = message.to && message.to.length > 1 ? message.to : message.to[0];

  //instantiate node-gcm message
  payload = new gcm.Message(payload);

  //ensure push is initializes
  exports.init();

  //TODO add support to request options
  //TODO add support to retries times

  exports.fcm.send(payload, to, function (error, response) {

    //check for reachability
    //@see {@link https://github.com/ToothlessGear/node-gcm/blob/master/lib/sender.js#L153}
    if (error && _.isNumber(error) && error >= 500) {
      error = new Error('GCM(FCM) Server Unavailable');
      error.status = 'Internal Server Error';
      error.code = error;
    }

    //check for authorization
    //@see {@link https://github.com/ToothlessGear/node-gcm/blob/master/lib/sender.js#L157}
    if (error && _.isNumber(error) && error === 401) {
      error = new Error(
        'Unauthorized (401). Check that your API token is correct.'
      );
      error.status = 'Unauthorized';
      error.code = error;
    }

    //check failure response
    //@see {@link https://github.com/ToothlessGear/node-gcm/blob/master/lib/sender.js#L161}
    if (error && _.isNumber(error) &&
      error !== 200 && error !== 401 && error <= 500) {
      error = new Error('Invalid Request');
      error.status = 'Invalid Request';
      error.code = error;
    }

    //respond with error
    if (error) {
      done(error);
    }

    //respond with success result
    else {
      //merge default response details
      response = _.merge({}, { message: 'success' }, response);

      //process push results if available
      if (response.results) {
        response.results = _.map(message.to, function (val, index) {
          return _.merge({}, { to: val }, response.results[index]);
        });
      }
      done(null, response);
    }

  });

};


/**
 * @name send
 * @description implementation of open311 message send to allow send message
 *              as a push notification using Google FCM 
 * @param  {Message}   message valid open311 message instance
 * @param  {Function} done    a callback to invoke on success or failure
 * @return {Object|Error}     FCM result or error during sending push notification
 * @type {Function}
 * @since 0.1.0
 * @public
 * @example
 *
 * const Message = require('open311-messages')(<your_options>);
 * const push = require('open311-push');
 * const message = new Message(options);
 * push.send(message, function(error, response){
 *  ...
 * });
 */
exports.send = function (message, done) {

  //obtain message additional send options
  const options = message.options;

  //simulate send
  if (options && options.fake) {
    done(null, {
      message: 'success'
    });
  }

  //send actual gcm push
  else {
    exports._send(message, done);
  }

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
 * const push = require('open311-push');
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
  } else {
    done();
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
 * const push = require('open311-push');
 * push.start();
 * 
 */
exports.start = function () {

  //ensure push is initialized
  exports.init();

  //reference open311-message model
  const Message = mongoose.model('Message');

  //register worker for processing message 
  //and send it as push notification
  const { concurrency } = exports.options;
  exports._queue.process(exports.queueName, concurrency, Message.process);

  //listen for process termination
  //and gracefull shutdown push worker queue
  process.once('SIGTERM', function ( /*signal*/ ) {
    exports._queue.shutdown(function ( /*error*/ ) {
      process.exit(0);
    });
  });

};