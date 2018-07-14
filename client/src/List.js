import React, { Component } from 'react';

class List extends Component {
    state = {title: 'Выполняется поиск, пожалуйста подождите...' };

    componentDidMount() {

        console.log('I have Data');

        setTimeout(() => {
            this.setState({ title: 'Данные не найдены, обновите страницу и попробуйте снова.' })
        }, 15000);
    };

    render() {

        return(
            <div>{this.props.store.map((item, index) => 
                <div key={index} className="storeItem"> 
                    <p className="itemTitle">{item._id.title}</p>
                    <a href={item.dups[0]}>Тык</a>
                    <div className="counter">{item.count}</div>
                </div>
            )}</div>
        )

        // if(this.props.store.length > 0) {
        //     return (
        //         <div>
        //           <h4>Названия товаров одинаковы у</h4>

        //             {this.props.store.map((s, index) => 
        //                 <p key={index}>{s}</p>
        //             )}
        //         </div>
        //       );
        // }
        // else {
        //     return (
        //         <div>
        //             <h5>{this.state.title}</h5>
        //         </div>
        //     );
        // }
    }
}

export default List;