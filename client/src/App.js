import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import './App.css';
import List from './List';
import Info from './Info';

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
    // document.getElementById('searchButton').setAttribute('disabled', 'disabled');
    // document.getElementById('searchInput').setAttribute('disabled', 'disabled');

      let xhr = new XMLHttpRequest();
      xhr.open('post', '/getStore', true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.send(JSON.stringify({value: this.state.value}));

      ReactDOM.render(
        <Info message="Собираем данные. Пожалуйста, подождите..." />,
        content
      );

      let getData;
      xhr.onreadystatechange = function() {
        if(xhr.readyState === 4) {
          if(xhr.responseText === 'fail') {

            ReactDOM.render(
              <Info message="Не удалось найти магазин с таким именем. Проверьте правильность введенных данных или повторите попытку позднее." />,
              content
            );
          }
          else {

            getData = JSON.parse(xhr.response).data;

              if(Object.keys(getData).length > 0) {

                ReactDOM.render(
                  <Info message="Данные получены, выводим на страницу..." />,
                  content
                );
                setInterval(() => {
                  ReactDOM.render(
                    <List store={getData} />,
                    content
                  );
                },3000)
                
              }
              else {
                ReactDOM.render(
                  <Info message="У данного продавца не нашлось товаров с одинаковым названием." />,
                  content
                );
              }
          }
        }
      }
  }

  render() {
    return (
      <div className="App">
        <div className="header">
          <input id="searchInput"
            type="text"
            placeholder="Введите ник продавца"
            value={this.state.value}
            onChange={this.handleChange} />
          <button id="searchButton" onClick={this.handleSubmit}>Найти соответствия</button>
        </div>
        <hr/>
        <div id="content"></div>
      </div>
    );
  }
}

export default App;