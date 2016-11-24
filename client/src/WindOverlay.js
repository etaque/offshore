import R from 'ramda';
import h from 'react-hyperscript';
import React from 'react';
import DeckGL from 'deck.gl/react';
import { LineLayer } from 'deck.gl';
import TWEEN from 'tween.js';
import connect from 'fluxx/lib/ReactConnector';

import { store } from './Store';

class WindOverlay extends React.Component {

  constructor(props) {
    super(props);

    const thisDemo = this;

    this.state = {
      offset: 0
    };
    this.tween = new TWEEN.Tween({offset: 0})
      .to({offset: 50}, 2000)
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
      const long = windCell[1] + 0.05 * this.state.offset,
            lat = windCell[0] + 0.05 * this.state.offset;
      return {
        sourcePosition: [long, lat],
        targetPosition: [long + 1, lat + 1]
      };
    }, this.props.wind);
  }

  render() {
    return h(DeckGL, R.merge({
      layers: [new LineLayer({
        id: 'wind',
        data: this.getData(),
        getColor: () => [0, 0, 150, 180]
      })]
    }, this.props));
  }

}

export default connect(WindOverlay, store, state => state);
