import React from 'react';
import ReactDOM from 'react-dom';
import h from 'react-hyperscript';
import MapGL from 'react-map-gl';

class App extends React.Component {
  render() {
    return h(MapGL, {
      width: 800,
      height: 600,
      latitude: 37.7577,
      longitude: -122.4376,
      zoom: 8,
      onChangeViewport: (viewport) => {
        const {latitude, longitude, zoom} = viewport;
        // Optionally call `setState` and use the state to update the map.
      }
    });
  }
}

ReactDOM.render(React.createElement(App, {}), document.getElementById('container'));

module.exports = {};
