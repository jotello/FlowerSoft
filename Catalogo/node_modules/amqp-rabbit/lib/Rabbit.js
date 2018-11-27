const amqp = require('amqplib')
const uuid = require('uuid/v1')

class Rabbit {
  
  constructor(host) {

    this.host = host
    this.open = amqp.connect(host)
    
    this.listenHandlers = []
    this.replyHandlers = []
    this.subscribeHandlers = []

    const self = this
    const connectInterval = async function() {
      try {
        self.open = amqp.connect(self.host)
        const connection = await self.open
        
        for(let i = 0; i < self.listenHandlers.length; i++) {
          const listenHandler = self.listenHandlers[i]
          await self.listen(listenHandler.queue, listenHandler.handler)
        }

        for(let i = 0; i < self.replyHandlers.length; i++) {
          const replyHandler = self.replyHandlers[i]
          await self.reply(replyHandler.queue, replyHandler.handler)
        }

        for(let i = 0; i < self.subscribeHandlers.length; i++) {
          const subscribeHandler = self.subscribeHandlers[i]
          await self.subscribe(subscribeHandler.exchange, subscribeHandler.handler)
        }

        connection.on('close', onClose)
        clearInterval(this)
      } catch (error) {
        console.log(`Rabbit is trying to reconnect at ${self.host}`)
      }
    }
    
    const onClose = () => {
      setInterval(connectInterval, 3000)
    }
    
    this.open.then(connection => {
      connection.on('close', onClose)
    })
    
  }

  async listen(queue, handler) {
    try {
      this.listenHandlers.push({ queue, handler })
      
      const conn = await this.open
      const channel = await conn.createChannel()

      await channel.assertQueue(queue, { durable: false })
      
      channel.consume(queue, async (message) => {
        await Promise.resolve(handler(JSON.parse(message.content.toString())))
        channel.ack(message)
      })
    } catch (error) {
      throw error
    }
  }

  async send(queue, message) {
    try {
      const conn = await this.open
      const channel = await conn.createChannel()

      await channel.assertQueue(queue, { durable: false })
      channel.sendToQueue(queue, new Buffer(JSON.stringify(message)));
    } catch (error) {
      throw error
    }
  }

  async reply(queue, handler) {
    try {
      this.replyHandlers.push({ queue, handler })
      
      const conn = await this.open
      const channel = await conn.createChannel()

      await channel.assertQueue(queue, { durable: false })
      await channel.prefetch(1)

      channel.consume(queue, async (msg) => {
        const message = await Promise.resolve(handler(JSON.parse(msg.content.toString())))
        
        channel.sendToQueue(msg.properties.replyTo, new Buffer(JSON.stringify(message)), { correlationId: msg.properties.correlationId })
        channel.ack(msg)
      })
    } catch (error) {
      throw error
    }
  }

  async setupRequest(queue) {
    try {
      const conn = await this.open
      const channel = await conn.createChannel()
      const q = await channel.assertQueue('', { exclusive: true })

      const waiters = {};

      channel.consume(q.queue, async (msg) => {
        if(waiters[msg.properties.correlationId]) {
          const go = waiters[msg.properties.correlationId];
          delete waiters[msg.properties.correlationId];
          go(JSON.parse(msg.content.toString()));
        }
      },{ noAck: true });
      
      return async (message) => {
        const correlationId = uuid()
        await channel.sendToQueue(queue, new Buffer(JSON.stringify(message)), { correlationId, replyTo: q.queue })
        return new Promise((resolve, reject) => {
          waiters[correlationId] = resolve;
        })
      };

    } catch (error) {
      throw error
    }
  }

  async request(queue, message) {
    try {

      const conn = await this.open
      const channel = await conn.createChannel()

      const q = await channel.assertQueue('', { exclusive: true })
      
      const correlationId = uuid()

      await channel.sendToQueue(queue, new Buffer(JSON.stringify(message)), { correlationId, replyTo: q.queue })
      
      return new Promise((resolve, reject) => {
        channel.consume(q.queue, async (msg) => {
          if(msg.properties.correlationId === correlationId) {
            resolve(JSON.parse(msg.content.toString()))
          }
        })
      })
    } catch (error) {
      throw error
    }
  }

  async subscribe(exchange, handler) {
    try {
      this.subscribeHandlers.push({ exchange, handler })

      const conn = await this.open
      const channel = await conn.createChannel()
      
      await channel.assertExchange(exchange, 'fanout', { durable: false })

      const q = channel.assertQueue('', { exclusive: true })
      
      await channel.bindQueue(q.queue, exchange, '')

      channel.consume(q.queue, async(message) => {
        await Promise.resolve(handler(JSON.parse(message.content.toString())))
        channel.ack(message)
      })

    } catch (error) {
      throw error
    }
  }

  async publish(exchange, message) {
    try {
      const conn = await this.open
      const channel = await conn.createChannel()

      await channel.assertExchange(exchange, 'fanout', { durable: false })
      await channel.publish(exchange, '', new Buffer(JSON.stringify(message)))
    } catch (error) {
      throw error
    }
  }
}

module.exports = Rabbit