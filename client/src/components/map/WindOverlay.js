import R from 'ramda';
import h from 'react-hyperscript';
import React from 'react';
import DeckGL from 'deck.gl/react';
import { LineLayer } from 'deck.gl';
import TWEEN from 'tween.js';
import connect from 'fluxx/lib/ReactConnector';

import { store } from '../../stores';

class WindOverlay extends React.Component {

  constructor(props) {
    super(props);

    const thisDemo = this;

    this.state = {
      time: 0
    };
    this.tween = new TWEEN.Tween({time: 0})
      .to({time: 50}, 2000)
      .onUpdate(function() {
        thisDemo.setState(this);
      })
      .repeat(Infinity);
  }

  componentDidMount() {
    this.tween.start();
  }

  componentWillUnmount() {
    this.tween.stop();
  }

  getData() {
    return R.map((windCell) => {
      // offset is used to prevent all segments to start and end at the same place
      // We generate a [-25, 25] value so the segment occillate around its position
      const offset = Math.abs(this.state.time + Math.round(windCell[1])*10 + Math.round(windCell[0])*10) % 50 - 25;
      const u = windCell[2];
      const v = windCell[3] / 10; // normalized, otherwise segments are too big
      const long = windCell[1] + (0.05 * offset * Math.cos(u));
      const lat = windCell[0] + (0.05 * offset * Math.sin(u));
      const opacity = 255 - (Math.abs(offset) * 255 / 25);
      return {
        sourcePosition: [long, lat],
        targetPosition: [long + (v * Math.cos(u)), lat + (v * Math.sin(u))],
        color: [0, 0, 150, opacity]
      };
    }, this.props.wind);
  }

  render() {
    return h(DeckGL, R.merge({
      layers: [new LineLayer({
        id: 'wind',
        data: this.getData()
      })]
    }, this.props));
  }

}

export default connect(WindOverlay, store, state => state);
