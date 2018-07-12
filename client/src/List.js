import React, { Component } from 'react';

class List extends Component {
    state = {title: 'Выполняется поиск, пожалуйста подождите...' };

    componentDidMount() {

        setTimeout(() => {
            this.setState({ title: 'Данные не найдены, обновите страницу и попробуйте снова.' })
        }, 15000);
    };

    render() {

        if(this.props.store.length > 0) {
            return (
                <div>
                  <h4>Названия товаров одинаковы у</h4>

                    {this.props.store.map((s, index) => 
                        <p key={index}>{s}</p>
                    )}
                </div>
              );
        }
        else {
            return (
                <div>
                    <h5>{this.state.title}</h5>
                </div>
            );
        }
    }
}

export default List;