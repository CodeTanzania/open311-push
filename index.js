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
const path = require('path');
const _ = require('lodash');
const messages = require('open311-messages');


/**
 * @param  {Object} [options] valid push notification transport options
 * @param  {String} options.apiKey valid and active Google FCM API Key
 * @param  all kue and open311-messages supported configuration options
 * @see {@link https://github.com/Automattic/kue#redis-connection-settings}
 * @return {Object}         push notification message transport
 * @since 0.1.0
 */
exports = module.exports = function (options) {
  //merge options
  options = _.merge({ timeout: 5000 }, options);

  //ensure FCM/GCM api key
  if (_.isEmpty(options.apiKey)) {
    throw new Error('Missing FCM API Key');
  }

  //initialize open311-messages
  messages(options);

  //import push
  let push = require(path.join(__dirname, 'lib', 'push'));

  //init push internals
  push.options = options;
  push.init();

  return push;

};