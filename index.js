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
const push = require(path.join(__dirname, 'lib', 'push'));

exports = module.exports = function (options) {
  //merge options
  options = _.merge({}, options);

  //init push internals
  push.options = options;
  push.init();

  return push;
  
};