import React from 'react';
import ReactDOM from 'react-dom';

export default class Boat extends React.Component {
  render() {
    return (
      <img src="/assets/media/boat.svg" width="34" height="34" style={{
          marginLeft: "-17px",
          marginTop: "-17px",
          transform: `translate3d(${this.props.x}px, ${this.props.y}px, 0) rotateZ(${this.props.angle}deg)`,
          transformOrigin: '17px 17px 0'
        }} />
    )
  }
}
