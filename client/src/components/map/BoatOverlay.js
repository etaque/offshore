import React from 'react';
import ViewportMercator from 'viewport-mercator-project';

import h from 'react-hyperscript';
import connect from 'fluxx/lib/ReactConnector';

import { actions, store } from '../../stores';


class BoatOverlay extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    const { boat } = this.props;
    const mercator = ViewportMercator(this.props);
    if (boat) {
      const [x, y] = mercator.project([boat[1], boat[0]]);
      return h('.boat-overlay', {
        style: { position: "absolute", top: 0, bottom: 0, left: 0, right: 0 }
      }, [
        h('img', {
          src: '/assets/media/boat.svg',
          width: 34,
          height: 34,
          style: {
            marginLeft: "-17px",
            marginTop: "-17px",
            transform: `translate3d(${x}px, ${y}px, 0) rotateZ(${boat[2]}deg)`,
            transformOrigin: '17px 17px 0'
          }
        })
      ]);
    }
  }
}

export default connect(BoatOverlay, store, state => state);
