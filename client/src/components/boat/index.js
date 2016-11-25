import React from 'react';
import ReactDOM from 'react-dom';

import connect from 'fluxx/lib/ReactConnector';
import { store } from '../../stores';

class Boat extends React.Component {


  render() {
    return (
      <svg className="boat" viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg" style={{
        transform: `translate3d(${this.props.x}px, ${this.props.y}px, 0) rotateZ(${this.props.angle}deg)`,
        color: `${this.props.player.color}`
      }}>
        <path className="boat__background" d="M4.784 13.635s-.106-2.924.006-4.38c.115-1.5.318-3.15.686-4.63.163-.655.45-1.624.755-2.44A24.8 24.8 0 0 1 6.786.83a.235.235 0 0 1 .43 0c.15.342.36.835.554 1.352.304.817.59 1.786.754 2.44.368 1.48.57 3.13.686 4.632.112 1.455.006 4.38.006 4.38H4.784z" />
        <path className="boat__foreground" d="M5.48 12.73s-.072-3.047.004-4.22c.06-.908.886-3.52 1.293-4.763a.234.234 0 0 1 .447 0C7.63 4.988 8.456 7.6 8.516 8.51c.076 1.173.003 4.22.003 4.22H5.48z" />
      </svg>
    )
  }
}

export default connect(Boat, store, state => state);
