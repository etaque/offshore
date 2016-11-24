import R from 'ramda';
import debounce from 'lodash.debounce';
import TWEEN from 'tween.js';

import React from 'react';
import h from 'react-hyperscript';
import MapGL from 'react-map-gl';
import connect from 'fluxx/lib/ReactConnector';

import { actions, store } from '../../stores';
import WindOverlay from './WindOverlay';
import BoatOverlay from './BoatOverlay';

function animate(time) {
  requestAnimationFrame(animate);
  TWEEN.update(time);
}

class Map extends React.Component {

  updateDimensions = debounce(() => {
    actions.updateDimensions({
      width: window.innerWidth,
      height: window.innerHeight
    });
  }, 500);

  componentWillMount = () => {
    this.updateDimensions();
  }

  componentDidMount = () => {
    window.addEventListener("resize", this.updateDimensions);
    animate();
  }

  componentWillUnmount = () => {
    window.removeEventListener("resize", this.updateDimensions);
  }

  _onChangeViewport = (opt) => {
    if (this.props && this.props.onChangeViewport) {
      return this.props.onChangeViewport(opt);
    }
    actions.setViewport({
      latitude: opt.latitude,
      longitude: opt.longitude,
      zoom: opt.zoom,
      startDragLngLat: opt.startDragLngLat,
      isDragging: opt.isDragging
    });
  }

  render() {
    return h(MapGL, R.merge({
      mapboxApiAccessToken: 'pk.eyJ1IjoiZWxvaXNhbnQiLCJhIjoiY2l2dGt6MDJoMDAyYzJ6bDRmMXdtNWE2ciJ9.ph6CziqSFFnHUzc35qvuzw',
      onChangeViewport: this._onChangeViewport
    }, this.props), [
      h(WindOverlay), h(BoatOverlay)
    ]);
  }

}

export default connect(Map, store, state => state);
