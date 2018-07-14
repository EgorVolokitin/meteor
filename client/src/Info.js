import React, { Component } from 'react';
import './Info.css';

// Класс для отправки сообщений о процессе выполнения.
class Info extends Component {
  render() {
    return(
      <div className="Info">{this.props.message}</div>
    )
  }
}

export default Info;