# amqp-rabbit
Simple RabbitMQ library that built on top of amqplib

#### INSTALLATION

npm install --save amqp-rabbit

#### FEATURES
* send/listen
* request/reply
* publish/subscribe
* auto reconnect

#### Setting up a connection

``` javascript
  const Rabbit = require('amqp-rabbit')
  const rabbit = new Rabbit('amqp://localhost:5672')
```

### Usage
---

### request-reply
Process B makes an rpc request to 'add' queue and received by Process A 'add' queue handler. The handler sends a reply by returning an object.

NOTE: message to send and return value must be an object

Process A:
```javascript

  // receive a request
  rabbit.reply('add', (message) => {
    return {
      result: message.num1 + message.num2
    }
  })

```

Process B:
```javascript

  // send a request
  rabbit.request('add', { num1: 10, num2: 15 })
    .then(rep => {
      console.log(rep.result) // 25
    })

```

Alternative Process B:
```javascript
  
  const add = rabbit.setupRequest('add');
  // send a request
  add({ num1: 10, num2: 15 })
    .then(rep => {
      console.log(rep.result) // 25
    })

```
---
### send - listen
Make a simple sending and receiving of messages in a 1:1 sender:listener fashion. Process B send a message every 1 second to Process A.

Process A:
```javascript
  
  // listen to an event
  rabbit.listen('event', (message) => {
    console.log(message) // { msg: 'hello from Process B'}
  })

```

Process B:

```javascript

  setInterval(() => {
    rabbit.send('event', { msg: 'hello from Process B'})
  }, 1000)
```
---
### publish - subscribe
Make a simple sending and receiving of messages in a 1:N fashion. Looks similar to send - listen, the difference is one sends a message and any subsribers can receive.

Process A:

```javascript

  rabbit.subscribe('broadcast', (message) => {
    console.log(message) // { msg: 'this is a broadcast message'}
  })

```

Process B:

```javascript

  rabbit.subscribe('broadcast', (message) => {
    console.log(message) // { msg: 'this is a broadcast message'}
  })

```

Process C: 

```javascript

  setInterval(() => {
    rabbit.publish('broadcast', { msg: 'this is a broadcast message'})
  }, 1000)

```