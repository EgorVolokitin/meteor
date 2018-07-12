import React, { Component } from 'react';
import ReactDOM from 'react-dom';
// import logo from './logo.svg';
import './App.css';
import List from './List';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {value: '', data: []};
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({value: event.target.value});
  }

  handleSubmit(event) {
    var content = document.getElementById('content');

      let xhr = new XMLHttpRequest();
      xhr.open('post', '/getStore', true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.send(JSON.stringify({value: this.state.value}));

      xhr.onreadystatechange = function() {
        console.log(xhr); //.responseText

        // this.setState({ data: xhr.responseText }, () => {

        //   ReactDOM.render(
        //     <List store={Array.from(this.state.data)} />,
        //     content
        //   );
        // });

      }

      
  }

  render() {
    return (
      <div>
        <input type="text"
          placeholder="Hello!"
          value={this.state.value}
          onChange={this.handleChange} />
        <button onClick={this.handleSubmit}>
          Найти магазин
        </button>
        <div id="content"></div>
      </div>
    );
  }
}

export default App;