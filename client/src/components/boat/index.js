import React from 'react';
import h from 'react-hyperscript';

import connect from 'fluxx/lib/ReactConnector';
import { store } from '../../stores';

class Boat extends React.Component {

  render() {
    return h('svg', {
      className: 'boat',
      viewBox: '0 0 14 14',
      xmlns: 'http://www.w3.org/2000/svg',
      style: {
        transform: `translate3d(${this.props.x}px, ${this.props.y}px, 0) rotateZ(${this.props.angle}deg)`,
        color: `${this.props.player.color}`
      }
    }, [
      h('path', {
        className: "boat__background",
        d: "M9.2,0.7c0,0,0.1,2.9,0,4.4C9.1,6.6,8.9,8.2,8.5,9.7c-0.2,0.7-0.4,1.6-0.8,2.4c-0.2,0.5-0.4,0.9-0.6,1.4 c-0.1,0.1-0.2,0.2-0.3,0.1c-0.1,0-0.1-0.1-0.1-0.1c-0.2-0.3-0.4-0.8-0.6-1.4c-0.3-0.8-0.6-1.8-0.8-2.4C5.1,8.2,4.9,6.6,4.8,5.1 c-0.1-1.5,0-4.4,0-4.4L9.2,0.7L9.2,0.7z"
      }),
      h('path', {
        className: "boat__foreground",
        d: "M8.5,1.6c0,0,0.1,3,0,4.2c-0.1,0.9-0.9,3.5-1.3,4.8c0,0.1-0.2,0.2-0.3,0.2c-0.1,0-0.1-0.1-0.2-0.2 C6.4,9.3,5.5,6.7,5.5,5.8c-0.1-1.2,0-4.2,0-4.2H8.5z"
      }),
    ]);
  }
}

export default connect(Boat, store, state => state);
