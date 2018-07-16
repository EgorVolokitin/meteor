import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import './App.css';
import List from './List';
import Info from './Info';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {value: ''};
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  // Позволяет менять значение в инпуте
  handleChange(event) {
    this.setState({value: event.target.value});
  }

  // Срабатывает при клике на кнопку поиска
  handleSubmit(event) {
    var content = document.getElementById('content');

      // Отправляем ajax-запрос на сервер с данными из инпута
      let xhr = new XMLHttpRequest();
      xhr.open('post', '/getStore', true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.send(JSON.stringify({value: this.state.value}));

      // В это время выводим "обнадеживающее" сообщение
      ReactDOM.render(
        <Info message="Собираем данные пожалуйста подождите..." />,
        content
      );

      // И блокируем кнопку и ввод.
      document.getElementById('searchButton').setAttribute('disabled', 'disabled');
      document.getElementById('searchInput').setAttribute('disabled', 'disabled');

      let getData;
      // При возврате данных с сервера
      xhr.onreadystatechange = function() {
        if(xhr.readyState === 4) {
          // Если вернулось тайное слово 'fail' - пользователь ошибся в имени магазина.
          if(xhr.responseText === 'fail') {
            // Поэтому мы ему об этом скажем
            ReactDOM.render(
              <Info message="Не удалось найти магазин с таким именем. Проверьте правильность введенных данных или повторите попытку позднее." />,
              content
            );
            // И конечно же разблокируем кнопку с инпутом.
            document.getElementById('searchButton').removeAttribute('disabled');
            document.getElementById('searchInput').removeAttribute('disabled');
          }
          else {
            getData = JSON.parse(xhr.response).data;

            // Если вернулся объект данных - проверим чтобы он имел размер.
            if(Object.keys(getData).length > 0) {
              // Если размер не равен нулю -
              // Выводим на страницу абсолютно не нужное сообщение, застравляя нервничать посетителя.
              ReactDOM.render(
                <Info message="Данные получены, выводим на страницу..." />,
                content
              );
              // И через 2 секунды ожидания мы выведем заветные одинаковые тайтлы.
              setTimeout(() => {
                ReactDOM.render(
                  <List store={getData} />,
                  content
                );
                // Конечно же мы хотим чтобы он проверил другой магазин.
                // Так что разблокируем кнопку и инпут.
                document.getElementById('searchButton').removeAttribute('disabled');
                document.getElementById('searchInput').removeAttribute('disabled');
              },1000)
            }
            else {
              // Есди же длина массива оказалась равной нулю -
              // Мы ничего не получили. Поэтому так и напишем, что этот продавец следит за магазином.
              ReactDOM.render(
                <Info message="Нормальный продавец. Следит за товаром. Одинаковых нет!" />,
                content
              );

              // Так как у пользователя после такого поворота событий разыграется интерес найти
              // продавца который не следит - разблокируем форму поиска.
              document.getElementById('searchButton').removeAttribute('disabled');
              document.getElementById('searchInput').removeAttribute('disabled');
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