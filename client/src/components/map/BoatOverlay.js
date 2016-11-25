import React from 'react';
import ViewportMercator from 'viewport-mercator-project';

import h from 'react-hyperscript';
import connect from 'fluxx/lib/ReactConnector';

import { actions, store } from '../../stores';

import Boat from '../boat';

class BoatOverlay extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    const { boat } = this.props;
    const mercator = ViewportMercator(this.props.viewport);
    if (boat) {
      const pixel = mercator.project([boat[1], boat[0]]);
      return h('.boat-overlay', {
        style: { position: "absolute", top: 0, bottom: 0, left: 0, right: 0 }
      }, [
        h(Boat, { x: pixel[0], y: pixel[1], angle: boat[2] })
      ]);
    }
  }
}

export default connect(BoatOverlay, store, state => state);
