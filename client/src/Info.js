import React, { Component } from 'react';
import './Info.css';

class Info extends Component {

    render() {

        return(
            <div className="Info">{this.props.message}</div>
        )
    }
}

export default Info;