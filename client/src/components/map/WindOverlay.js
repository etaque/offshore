import R from 'ramda';
import h from 'react-hyperscript';
import React from 'react';
import DeckGL from 'deck.gl/react';
import TWEEN from 'tween.js';
import connect from 'fluxx/lib/ReactConnector';

import WindLayer from './WindLayer';
import { store } from '../../stores';

class WindOverlay extends React.Component {

  constructor(props) {
    super(props);

    const thisDemo = this;

    this.state = {
      time: 0
    };
    this.tween = new TWEEN.Tween({time: 0})
      .to({time: 3600}, 120000)
      .onUpdate(function() {
        console.log('now state is: ', this);
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

  render() {
    return h(DeckGL, R.merge({
      layers: [new WindLayer({
        id: 'wind',
        data: [
          [38, -46, 10, 10] // lat, lng, u, v
        ],
        getPath: d => d.segments,
        getColor: d => d.vendor === 0 ? [253,128,93] : [23,184,190],
        opacity: 0.3,
        strokeWidth: 2,
        trailLength: 180,
        currentTime: this.state.time
      })]
    }, this.props));
  }

}

export default connect(WindOverlay, store, state => state);
