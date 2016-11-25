import R from 'ramda';
import { GlobalStore, Action } from 'fluxx';
import ViewportMercator from 'viewport-mercator-project';

export const actions = {
  setViewport: Action('setViewport'),
  updateDimensions: Action('updateDimensions'),
  updateBoatDirection: Action('updateBoatDirection'),
  resetWindTrails: Action('resetWindTrails')
};

function initialTrails(props) {
  console.log('reset trails');
  const mercator = ViewportMercator(props);

  let windTrails = [];
  const stepX = 50; // pixels
  const stepY = 50; // pixels
  let x = 0, y = 0;

  while (x < props.width) {
    y = 0;
    while (y < props.height) {
      windTrails.push({
        origin: mercator.unproject([x, y]) // array of [lng, lat]
      });
      y = y + stepY;
    }
    x = x + stepX;
  }

  return windTrails;
}


export const store = GlobalStore({

  state: {
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
    windTrails: [],
    boat:[47.106535, -2.112102, 0] // lat, long, direction
  },

  handlers: {
    [actions.setViewport]: (state, viewport) => {
      const withViewport = R.merge(state, viewport);
      return R.merge(withViewport, {windTrails: initialTrails(withViewport)});
    },
    [actions.updateDimensions]: (state, dimensions) => {
      const withDim = R.merge(state, dimensions);
      return R.merge(withDim, {windTrails: initialTrails(withDim)});
    },
    [actions.updateBoatDirection]: (state, direction) => {
      return R.merge(state, direction);
    },
    [actions.resetWindTrails]: (state) => {
      return R.merge(state, { windTrails: initialTrails(state) });
    }
  }

});
