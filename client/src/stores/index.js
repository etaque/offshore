import R from 'ramda';
import { GlobalStore, Action } from 'fluxx';


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
  updatePlayer: Action('updatePlayer')
};

function wsurl(s) {
  var l = window.location;
  return ((l.protocol === "https:") ? "wss://" : "ws://") + l.host + l.pathname + s;
}
var ws = new WebSocket(wsurl('ws/socket'));

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

    [actions.sendUpdateBoatDirection]: (state, direction) => {
      //call socket io
      ws.send({
        "command": "rotate",
        "value": direction
      });

      return state;
    },
    [actions.receiveUpdateBoatDirection]: (state, newBoatInfo)=> {
      return R.merge(state, newBoatInfo);
    },

    [actions.updatePlayer]: (state, player) => {
      ws.send({
        command: "updatePlayer",
        value: player
      });
      return R.merge(state, player);
    },

    [actions.updateWindCells]: (state, windCells) => {
      return R.merge(state, { geoStore: makeGeoStore(windCells) });
    },
    [actions.closeWs]: () => {
      ws.close();
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
    console.log("received wind data");
    actions.updateWindCells(data.values);
    break;
  case 'refreshBoat':
    console.log("refresh boat data");
    var playerData = data.value.filter(player => player.name === store.state.player.name);
    actions.receiveUpdateBoatDirection({
      boat:[playerData.latitude, playerData.longitude, playerData.angle]
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
