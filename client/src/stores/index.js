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
  stepTrails: Action('stepTrails'),
  fakeBoatMovement: Action('fakeBoatMovement')
};

function wsurl(s) {
  var l = window.location;
  return ((l.protocol === "https:") ? "wss://" : "ws://") + l.host + l.pathname + s;
}
var ws = new WebSocket(wsurl('ws/socket'));
ws.onopen = function() {
  const mercator = ViewportMercator(store.state.viewport);
  const topleft = mercator.unproject(0, 0);
  const bottomright = mercator.project(store.state.viewport.height, store.state.viewport.width);
  ws.send(JSON.stringify({
    command: "moveWindow",
    value: {
      p1: {
        latitude: topleft[1],
        longitude: topleft[0]
      },
      p2: {
        latitude: bottomright[1],
        longitude: bottomright[0]
      }
    }
  }));
};

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
    windUpdate: 0,
    windCells: [],
    windTrails: [],
    boat:[46.483619, -1.785940, 90], // lat, long, direction
    player: {
      name: "Anonymous",
      color: "red"
    }
  },

  handlers: {
    [actions.setViewport]: (state, viewport) => {
      const mergedViewport = R.merge(state.viewport, viewport);
      if (ws.readyState === 1) {
        ws.send(JSON.stringify({
          command: "moveWindow",
          value: {
            latitude: mergedViewport.latitude,
            longitude: mergedViewport.longitude,
            height:mergedViewport.height,
            width: mergedViewport.width
          }
        }));
      }
      return R.mergeAll([state, {viewport: mergedViewport}, {windTrails: initialTrails(mergedViewport)}]);
    },
    [actions.sendUpdateBoatDirection]: (state, boatInfo) => {
      //call socket io
      ws.send(JSON.stringify({
        command: "rotate",
        value: {
          angle: boatInfo.boat[2]
        }
      }));

      return R.merge(state, boatInfo);
    },
    [actions.receiveUpdateBoatDirection]: (state, newBoatInfo)=> {
      return R.merge(state, newBoatInfo);
    },
    [actions.updatePlayer]: (state, player) => {
      ws.send(JSON.stringify({
        value: player
      }));
      return R.merge(state, player);
    },
    [actions.updateWindCells]: (state, windCells) => {
      return R.merge(state, {
        windUpdate: Date.now(),
        windCells: windCells,
        geoStore: makeGeoStore(windCells)
      });
    },
    [actions.closeWs]: () => {
      ws.close();
    },
    [actions.resetWindTrails]: (state) => {
      return R.merge(state, { windTrails: initialTrails(state.viewport) });
    },
    [actions.stepTrails]: (state) => {
      const step = 0.1 / (state.viewport.zoom * state.viewport.zoom);
      const windTrails = R.map((trail) => {
        let last = trail.tail[0];
        const wind = getWindOnPoint(Math.round(last[1]), Math.round(last[0])) || { origin: 200, speed: 0 };
        let speed = wind.speed;
        if (trail.tail.length > 30 + speed) {
          trail.tail = [trail.origin];
        } else {
          let angle = wind.origin * (Math.PI / 180);
          let newPoint = [last[0] + (step * speed * Math.sin(angle)), last[1] + (step * speed * Math.cos(angle))];
          trail.tail.unshift(newPoint);
        }
        return trail;
      }, state.windTrails);
      return R.merge(state, { windTrails: windTrails });
    },
    [actions.fakeBoatMovement]: (state) => {
      let angle = (90 - state.boat[2]) * (Math.PI / 180);
      return R.merge(state, {boat: [
        state.boat[0] + 0.2 * Math.sin(angle),
        state.boat[1] - 0.2 * Math.cos(angle),
        state.boat[2]
      ]});
    }
  }

});

function makeGeoStore(windCells) {
  let geoStore = {};
  windCells.map(cell => {
    geoStore[cell.latitude + "," + cell.longitude] = cell;
  });
  console.log('geoStore', geoStore);
  return geoStore;
}

export function getWindOnPoint(lat, lon) {
  const key = Math.round(lat) + "," + Math.round(lon);
  return store.state.geoStore[key];
}

ws.onmessage = function(event) {
  var data = JSON.parse(event.data);

  switch(data.command) {
  case 'refreshWind':
    console.log("received wind data");
    actions.updateWindCells(data.value);
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
