import R from 'ramda';
import { GlobalStore, Action } from 'fluxx';

const GeoStore = require('terraformer-geostore').GeoStore;
const GeoStoreMemory = require('terraformer-geostore-memory').Memory;
const RTree = require('terraformer-rtree').RTree;

export const actions = {
  setViewport: Action('setViewport'),
  updateDimensions: Action('updateDimensions'),
  updateBoatDirection: Action('updateBoatDirection'),

  updatePlayer: Action('updatePlayer'),

  updateWindCells: Action('updateWindCells')
};

export const store = GlobalStore({

  state: {
    geoStore: makeGeoStore([]),
    width: window.innerWidth,
    height: window.innerHeight,
    latitude: 38,
    longitude: -46,
    zoom: 3,
    startDragLngLat: null,
    isDragging: false,

    wind: [
      [38, -46, 3.4000000953674316, 10.600000381469727], // lat, lng, u, v
      [35, -86, -4.699999809265137,4.400000095367432], // lat, lng, u, v
      [33, -84, -2.799999952316284, -4.099999904632568] // lat, lng, u, v
    ],
    boat:[47.106535, -2.112102, 0], // lat, long, direction

    player: {
      name: "Anonymous",
      color: "red"
    }
  },

  handlers: {
    [actions.setViewport]: (state, viewport) => {
      return R.merge(state, viewport);
    },
    [actions.updateDimensions]: (state, dimensions) => {
      return R.merge(state, dimensions);
    },
    [actions.updateBoatDirection]: (state, direction) => {
      return R.merge(state, direction);
    },

    [actions.updatePlayer]: (state, player) => {
      return R.merge(state, player);
    },

    [actions.updateWindCells]: (state, windCells) => {
      return R.merge(state, { geoStore: makeGeoStore(windCells) });
    }
  }
});


function makeGeoStore(windCells) {
  const geoStore = new GeoStore({
    store: new GeoStoreMemory(),
    index: new RTree()
  });

  windCells.forEach(cell => {
    geoStore.add(cellToGeoJSON(cell));
  });

  return geoStore;
}


function cellToGeoJSON(cell) {
  const polygon = [
    [ cell.latitude - 0.5, cell.longitude - 0.5 ],
    [ cell.latitude - 0.5, cell.longitude + 0.5 ],
    [ cell.latitude + 0.5, cell.longitude + 0.5 ],
    [ cell.latitude + 0.5, cell.longitude - 0.5 ]
  ];

  return {
    "type": "Feature",
    "geometry": {
      "type": "Polygon",
      "coordinates": polygon
    },
    "properties": {
      "origin": cell.direction,
      "speed": cell.force
    }
  };
}

export function getWindOnPoint(lat, lon) {
  const result = store.state.geoStore.contains({
    "type": "Feature",
    "geometry": {
      "type": "Point",
      "coordinates": [lat, lon]
    }
  });

  return result[0] ? result[0].properties : null;
}
