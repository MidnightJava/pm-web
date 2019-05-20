import React from 'react';
import Button from 'react-bootstrap/Button';
import ButtonToolbar from 'react-bootstrap/ButtonToolbar';
import InputGroup from 'react-bootstrap/InputGroup';
import FormControl from 'react-bootstrap/FormControl';
import './App.css';

const uuidv4 = require('uuid/v4');
const WSS_ADDR = 'localhost';
const WSS_PORT = 4000;

class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      counting: false,
      count: 0,
      msg: '',
      response: ''
    }
    this.rpcMap = {};
    this.connectToWebsocket();
  }

  connectToWebsocket() {
    this.ws = new WebSocket(`ws://${WSS_ADDR}:${WSS_PORT}`);
    this.ws.onmessage = (msg) => {
      msg= JSON.parse(msg.data);
      switch (msg.cmd) {
        case 'count':
          this.setState({count: msg.value});
          break;
        case 'rpc':
          this.rpcMap[msg.id] && this.rpcMap[msg.id](msg.response);
          break;
        default:
          //PASS
      }
    }

    this.ws.onclose = () => {
      console.log('The server closed the connection');
    }
  }

  startCounter() {
    let msg = {cmd: 'count', action: 'start'};
    this.setState({counting: true});
    this.ws.send(JSON.stringify(msg));
  }

  stopCounter() {
    let msg = {cmd: 'count', action: 'stop'};
    this.setState({counting: false});
    this.ws.send(JSON.stringify(msg));
  }

  resetCounter() {
    let msg = {cmd: 'count', action: 'reset'};
    this.setState({count: 0});
    this.ws.send(JSON.stringify(msg));
  }

  async sendMsg() {
    let req = {cmd: 'rpc', id: uuidv4(), request: this.state.msg};
    let response = await this.sendRpc(req);
    this.setState({response});
  }

  sendRpc(req) {
    return new Promise( (resolve, reject) => {
      this.rpcMap[req.id] = resolve;
      this.ws.send(JSON.stringify(req));
    });
  }

  render() {
    return (
      <div className="container-fluid">
        <header className="App-header">
           <h1 className="text-primary">Simple Counter and Text Echo Example</h1>
        </header>
        <div className='row py-2'>
            <div className='col-md-4 offset-md-4'>
              <label>Counter:</label>&nbsp;&nbsp;
              <input type="text" value={this.state.count} size="8" onChange={() =>{}}/>
            </div>
        </div>
        <div className="row py-2">
          <div className='col-md-4 offset-md-4'>
            <ButtonToolbar>
              <Button 
                variant='success'
                className="m2-2"
                disabled={this.state.counting}
                onClick={this.startCounter.bind(this)}>
                  Start
              </Button>
              <Button
                variant='danger'
                className="mx-2"
                disabled={!this.state.counting}
                onClick={this.stopCounter.bind(this)}>
                  Stop
              </Button>
              <Button
                variant='primary'
                className="mxl-2"
                onClick={this.resetCounter.bind(this)}>
                  Reset
              </Button>
            </ButtonToolbar>
          </div>
        </div>
        <div className="row pt-4">
          <div className='col-md-4 offset-md-4'>
            <InputGroup size="sm">
              <InputGroup.Prepend>
                <InputGroup.Text>Message</InputGroup.Text>
              </InputGroup.Prepend>
              <FormControl 
                as="textarea"
                placeholder="Enter text for the server to echo"
                onChange={e => this.setState({msg: e.target.value})} />
            </InputGroup>
          </div>
        </div>
        <div className="row pt-1">
          <div className='col-md-4 offset-md-4'>
            <Button
              variant='success'
              disabled={!this.state.msg.length}
              onClick={this.sendMsg.bind(this)}>
                Submit
              </Button>
          </div>
        </div>
        <div className="row pt-4">
          <div className='col-md-4 offset-md-4'>
            <InputGroup size="sm">
              <InputGroup.Prepend>
                <InputGroup.Text>Response</InputGroup.Text>
              </InputGroup.Prepend>
              <FormControl as="textarea" readOnly value={this.state.response} />
            </InputGroup>
          </div>
        </div>
        <div className="row pt-1">
          <div className='col-md-4 offset-md-4'>
            <Button variant='success' onClick={() => {this.setState({response: ''})}}>Clear</Button>
          </div>
        </div>
      </div>
    );
  }
  
}

export default App;
