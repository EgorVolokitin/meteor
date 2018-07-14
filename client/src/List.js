import React, { Component } from 'react';
import './List.css';

class List extends Component {
  render() {
    return(
      <div className="Item">{this.props.store.map((item, index) => 
        <div key={index} className="storeItem"> 
          <div className="counter">x{item.count}</div>
          <p className="itemTitle">{item._id.title}</p>
          <br />
          <a target="_blank" href={item.dups[0]}>Открыть товар</a>
        </div>
      )}</div>
    )
  }
}

export default List;