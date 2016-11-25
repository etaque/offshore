import React from 'react';
import ViewportMercator from 'viewport-mercator-project';
import TWEEN from 'tween.js';

import h from 'react-hyperscript';
import connect from 'fluxx/lib/ReactConnector';

import { actions, store } from '../../stores';

import Boat from '../boat';

class BoatOverlay extends React.Component {

  constructor(props) {
    super(props);
    this.tween = new TWEEN.Tween({time: 0})
      .to({time: 30}, 1000) // 15 fps
      .onUpdate(function() {
        actions.fakeBoatMovement();
      })
      .repeat(Infinity);
  }

  componentDidMount() {
    this.tween.start();
  }

  componentWillUnmount() {
    this.tween.stop();
  }

  render() {
    const { boat } = this.props;
    const mercator = ViewportMercator(this.props.viewport);
    if (boat) {
      const pixel = mercator.project([boat[1], boat[0]]);
      return h('.boat-overlay', {
        style: { position: "absolute", top: 0, bottom: 0, left: 0, right: 0 }
      }, [
        h(Boat, { x: pixel[0], y: pixel[1], angle: (180 - boat[2]) })
      ]);
    }
  }
}

export default connect(BoatOverlay, store, state => state);
