import R from 'ramda';

import React from 'react';
import ReactDOM from 'react-dom';
import h from 'react-hyperscript';
import MapGL from 'react-map-gl';

class App extends React.Component {

  state = {}

  _onChangeViewport = (opt) => {
    if (this.props && this.props.onChangeViewport) {
      return this.props.onChangeViewport(opt);
    }
    this.setState({
      viewport: {
        latitude: opt.latitude,
        longitude: opt.longitude,
        zoom: opt.zoom,
        startDragLngLat: opt.startDragLngLat,
        isDragging: opt.isDragging
      }
    });
  }

  render() {
    return h(MapGL, R.merge({
      mapboxApiAccessToken: 'pk.eyJ1IjoiZWxvaXNhbnQiLCJhIjoiY2l2dGt6MDJoMDAyYzJ6bDRmMXdtNWE2ciJ9.ph6CziqSFFnHUzc35qvuzw',
      width: window.innerWidth,
      height: window.innerHeight,
      latitude: 38,
      longitude: -46,
      startDragLngLat: null,
      zoom: 3,
      onChangeViewport: this._onChangeViewport
    }, this.state.viewport));
  }

}

ReactDOM.render(React.createElement(App, {}), document.getElementById('container'));

module.exports = {};
