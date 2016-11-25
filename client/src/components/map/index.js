import R from 'ramda';
import debounce from 'lodash.debounce';
import TWEEN from 'tween.js';

import React from 'react';
import h from 'react-hyperscript';
import MapGL from 'react-map-gl';
import connect from 'fluxx/lib/ReactConnector';

import { actions, store } from '../../stores';
import WindOverlay from './WindOverlay';
import WindHeatOverlay from './WindHeatOverlay';
import BoatOverlay from './BoatOverlay';

function animate(time) {
  requestAnimationFrame(animate);
  TWEEN.update(time);
}

class Map extends React.Component {

  updateDimensions = debounce(() => {
    actions.setViewport({
      width: window.innerWidth,
      height: window.innerHeight
    });
  }, 500);

  componentWillMount = () => {
    this.updateDimensions();
  }

  componentDidMount = () => {
    window.addEventListener("resize", this.updateDimensions);
    document.addEventListener("keydown", this.updateBoatDirection, false);
    animate();
  }

  componentWillUnmount = () => {
    window.removeEventListener("resize", this.updateDimensions);
    document.removeEventListener("keydown", this.updateBoatDirection, false);
    actions.closeWs();
  }

  _onChangeViewport = (opt) => {
    actions.setViewport({
      latitude: opt.latitude,
      longitude: opt.longitude,
      zoom: opt.zoom,
      startDragLngLat: opt.startDragLngLat,
      isDragging: opt.isDragging
    });
  }

  updateBoatDirection = (event) => {
    const { boat } = this.props;
    const arbitraryPad =  5;
    const newBoat = event.keyCode == 37 ? [boat[0], boat[1], boat[2] + arbitraryPad] : ( event.keyCode == 39 ? [boat[0], boat[1], boat[2] - arbitraryPad] : [boat[0], boat[1], boat[2]]);

    actions.sendUpdateBoatDirection({
      boat: newBoat
    });
  }

  render() {
    return h(MapGL, R.merge({
      mapboxApiAccessToken: 'pk.eyJ1IjoiZWxvaXNhbnQiLCJhIjoiY2l2dGt6MDJoMDAyYzJ6bDRmMXdtNWE2ciJ9.ph6CziqSFFnHUzc35qvuzw',
      onChangeViewport: this._onChangeViewport
    }, this.props.viewport), [
      //h(WindHeatOverlay),
      h(WindOverlay), h(BoatOverlay)
    ]);
  }

}

export default connect(Map, store, state => state);
