const WebSocket = require('ws');
const DEFAULT_PORT = 4000;
let port = DEFAULT_PORT;
const COUNTER_LOOP_INTERVAL = 1000;
const MongoProxy = require('./mongo-proxy.js');

class WebSocketServer {

  constructor(port) {
    const wss = new WebSocket.Server({port: port});
    console.log('Server listening on port ', port)

    wss.on('connection', (ws) => {
      let id = `${ws._socket.remoteAddress}:${ws._socket.remotePort}`;
      this.clientMap[id] = ws;
      this.counterMap[id] = {count: 0, counting: false};
      this.proxyMap[id] = new MongoProxy();
      console.log(`Client ${id} connected`);

      ws.on('close', () => {
        this.clientMap[id].close();
        delete this.clientMap[id];
        console.log(`Client ${id} disconnected`);
      });

      ws.on('message', async (msg) => {
        msg = JSON.parse(msg);
        switch (msg.cmd) {
          case 'count':
            switch(msg.action) {
              case "start":
                console.log('START COUNTER')
                this.counterMap[id].counting = true;
                break;
              case "stop":
                console.log('STOP COUNTER');
                this.counterMap[id].counting = false;
                break;
              case "reset":
                this.counterMap[id].count= 0;
                break;
            }
            break;
          case 'rpc':
            let response = await this.proxyMap[id].echo(msg.request);
            this.clientMap[id].send(JSON.stringify({cmd: 'rpc', id: msg.id, response}));
            break;
          default:
            // PASS
        }
      });

      ws.on('error', (err) => {
        console.log("websocket error:", err);
      });
    });

    this.clientMap = {};
    this.counterMap = {};
    this.proxyMap = {};

    this.startCounterLoop();
  }

  startCounterLoop() {
    setInterval( () => {
      Object.keys(this.clientMap).forEach(id => {
        if (this.counterMap[id].counting) {
          let msg = {cmd: "count", value: ++this.counterMap[id].count}
          this.clientMap[id].send(JSON.stringify(msg));
        }
      })
    }, COUNTER_LOOP_INTERVAL)
  }
}

if (process.argv.length >= 3) {
  port = process.argv[2];
}
console.log('Starting webscoket server')
new WebSocketServer(port);
