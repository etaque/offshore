import R from 'ramda';
import { GlobalStore, Action } from 'fluxx';
import ViewportMercator from 'viewport-mercator-project';


const GeoStore = require('terraformer-geostore').GeoStore;
const GeoStoreMemory = require('terraformer-geostore-memory').Memory;
const RTree = require('terraformer-rtree').RTree;

export const actions = {
  setViewport: Action('setViewport'),

  updateDimensions: Action('updateDimensions'),
  sendUpdateBoatDirection: Action('sendUpdateBoatDirection'),
  receiveUpdateBoatDirection: Action('receiveUpdateBoatDirection'),
  updateWindCells: Action('updateWindCells'),
  closeWs: Action('closeWs'),
  updatePlayer: Action('updatePlayer'),
  updateBoatDirection: Action('updateBoatDirection'),
  resetWindTrails: Action('resetWindTrails'),
  stepTrails: Action('stepTrails')
};

function wsurl(s) {
  var l = window.location;
  return ((l.protocol === "https:") ? "wss://" : "ws://") + l.host + l.pathname + s;
}
var ws = new WebSocket(wsurl('ws/socket'));

function initialTrails(props) {
  const mercator = ViewportMercator(props);

  let windTrails = [];
  const stepX = 30; // pixels
  const stepY = 30; // pixels
  let x = 0, y = 0;

  while (x < props.width) {
    y = 0;
    while (y < props.height) {
      let lnglat = mercator.unproject([x, y]); // array of [lng, lat]
      windTrails.push({
        origin: lnglat,
        tail: [lnglat]
      });
      y = y + stepY;
    }
    x = x + stepX;
  }

  return windTrails;
}

export const store = GlobalStore({

  state: {
    geoStore: makeGeoStore([]),
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight,
      latitude: 38,
      longitude: -46,
      zoom: 3,
      startDragLngLat: null,
      isDragging: false
    },
    wind: [
      [38, -46, 3.4000000953674316, 10.600000381469727], // lat, lng, u, v
      [35, -86, -4.699999809265137,4.400000095367432], // lat, lng, u, v
      [33, -84, -2.799999952316284, -4.099999904632568] // lat, lng, u, v
    ],
    windTrails: [],
    boat:[47.106535, -2.112102, 0], // lat, long, direction
    player: {
      name: "Anonymous",
      color: "red"
    }
  },

  handlers: {
    [actions.setViewport]: (state, viewport) => {
      const mergedViewport = R.merge(state.viewport, viewport);
      return R.mergeAll([state, {viewport: mergedViewport}, {windTrails: initialTrails(mergedViewport)}]);
    },
    [actions.sendUpdateBoatDirection]: (state, direction) => {
      //call socket io
      ws.send({lat: state.boat[0], long: state.boat[1], direction: direction });

      return state;
    },
    [actions.receiveUpdateBoatDirection]: (state, newBoatInfo)=> {
      return R.merge(state, newBoatInfo);
    },
    [actions.updatePlayer]: (state, player) => {
      return R.merge(state, player);
    },
    [actions.updateWindCells]: (state, windCells) => {
      return R.merge(state, { geoStore: makeGeoStore(windCells) });
    },
    [actions.closeWs]: () => {
      ws.close();
    },
    [actions.resetWindTrails]: (state) => {
      return R.merge(state, { windTrails: initialTrails(state.viewport) });
    },
    [actions.stepTrails]: (state) => {
      const step = 0.5 / (state.viewport.zoom * state.viewport.zoom);
      const windTrails = R.map((trail) => {
        if (trail.tail.length > 20 + (20 * Math.random())) {
          trail.tail = [trail.origin];
        } else {
          let last = trail.tail[0];
          let newPoint = [last[0] + step, last[1] + step];
          trail.tail.unshift(newPoint);
        }
        return trail;
      }, state.windTrails);
      return R.merge(state, { windTrails: windTrails });
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


ws.onmessage = function(event) {
  var data = JSON.parse(event.data);

  switch(data.command) {
  case 'refreshWind':
    actions.updateWindCells(data.values);
    break;
  case 'refreshBoat':
    actions.receiveUpdateBoatDirection({
      boat:[data.value.latitude,data.value.longitude,data.value.angle]
    });
    break;
  default:
    console.log("unknown command");
  }

};

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
