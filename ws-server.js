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
          // We received a request which does not require a response
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
          /* We received a request which requires a response. We make an
             asynchronous call to the mongo proxy. When the response is received
             we send a message on the WebSocket, with an ID that correlates to the request */
          case 'rpc':
            let response = await this.proxyMap[id].echo(msg.request);
            this.clientMap[id].send(JSON.stringify({cmd: 'rpc', id: msg.id, response}));
            /* When the mongo proxy is implemented, we can invoke its API using
               an action field in the request. For example, we could do something like this: */
            // switch (msg.action) {
            //   case 'getMemberData':
            //     let response = this.proxyMap[id].getMemberData(msg.request);
            //     this.clientMap[id].send(JSON.stringify({cmd: 'rpc', id: msg.id, response}));
            //     break;
            //   case 'setMemberData':
            //     let response = this.proxyMap[id].setMemberData(msg.request);
            //     this.clientMap[id].send(JSON.stringify({cmd: 'rpc', id: msg.id, response}));
            //     break;
            // }
            break;
          default:
            // PASS
        }
      });

      ws.on('error', (err) => {
        console.log("websocket error:", err);
      });
    });

    // We keep multiuple browser sessions separate with map objects keyed to the remote socket
    this.clientMap = {  }; // Keeps a reference to each client's web socket
    this.counterMap = {}; //Here we simulate some server-side business logic scoped for each brosser session
    this.proxyMap = {}; // Each client has its own mongo proxy

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
