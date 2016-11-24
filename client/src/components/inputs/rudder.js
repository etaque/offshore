import React from 'react';
import ReactDOM from 'react-dom';

export default class InputRudder extends React.Component {

  render() {
    return (
      <div classname="input-rudder">
        <input classname="input-rudder__input" type="range" value="0" min="-1" max="1"/>
      </div>
    )
  }

}
