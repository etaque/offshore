import React from 'react';
import HeatmapOverlay from 'react-map-gl-heatmap-overlay';

import h from 'react-hyperscript';
import connect from 'fluxx/lib/ReactConnector';

import { store } from '../../stores';

class WindHeatOverlay extends React.Component {

  render() {
    return h(HeatmapOverlay, {
      locations: this.props.windCells,
      lngLatAccessor: (cell) => cell.position,
      intensityAccessor: (cell) => cell.force
    });
  }

}

export default connect(WindHeatOverlay, store, state => state);
