open311-push
================

[![Build Status](https://travis-ci.org/CodeTanzania/open311-push.svg?branch=master)](https://travis-ci.org/CodeTanzania/open311-push)
[![Dependencies Status](https://david-dm.org/CodeTanzania/open311-push/status.svg?style=flat-square)](https://david-dm.org/CodeTanzania/open311-push)

push notification transport for open311 messages using Google FCM

*Note!:It highly adviced to process start push in separate process for optiomal performance*

## Requirements
- [MongoDB 3.2+](https://www.mongodb.com/)
- [NodeJS v6.9.2+](https://nodejs.org)
- [Redis 2.8 +](https://redis.io/)

## Installation
```sh
$ npm install --save open311-push
```

## Usage
```js
const mongoose = require('mongoose');
const Message = require('open311-messages')(<options>);
const push = require('open311-push');
push.options = {
    apiKey:<your_fcm_api_key>
};

//queue message for sending
const message = new Message(<message_details>);
push.queue(message);


//start push worker(s) in background process(s)
//to process and send queued message(s) as push notification(s)
push.start();
```

## Options
- `apiKey:String` valid Google FCM API key
- All [kue supported configuration options](https://github.com/Automattic/kue#redis-connection-settings)



## Testing
* Clone this repository

* Install all development dependencies
```sh
$ npm install
```

* Then run test
```sh
$ npm test
```

## Contribute
It will be nice, if you open an issue first so that we can know what is going on, then, fork this repo and push in your ideas. Do not forget to add a bit of test(s) of what value you adding.

## Licence
The MIT License (MIT)

Copyright (c) 2016 lykmapipo, CodeTanzania & Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE. 