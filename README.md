# pm-web
Church membership tracking application

# Demo App
Displays a counter which can be started, stopped, and reset. This is used to demosntrate how commands can be sent from the client to the server. It also has a text field in which you enter text that is then echoed to another text field by the server. This is used to demonstrate an RPC style exchange.

The app works with multiple browsers, keeping data for each browser session separate. It automatically connectes to the WebSocket server, and tries to reconnect automatically every five seconds if the server goes down.

The client wraps the WebSocket exchange in a way that emulates a synchronous exchange. It assigns a unique ID to each request an returns a Promise that resolves when a response with the same ID is received. Using the `async await` facility of ES6, we even use synchronous method syntax for this asynchronous exchange.

# install
cd pm-web

npm install

cd client

npm install

# usage
cd pm-web

npm run dev `# starts the React development server, which adjusts to source code changes automatically`

or build an optimized version of the app (compiled into a few files) and run it

cd client

npm run build

cd ..

npm run ops `# Serves the app via express (in server.js)`


In either case, the app can ge found at http://localhost:3000

There is a WebSocket server running on port 4000
