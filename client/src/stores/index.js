import R from 'ramda';
import { GlobalStore, Action } from 'fluxx';

export const actions = {
  setViewport: Action('setViewport'),
  updateDimensions: Action('updateDimensions')
};

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
    ]
  },

  handlers: {
    [actions.setViewport]: (state, viewport) => {
      return R.merge(state, viewport);
    },
    [actions.updateDimensions]: (state, dimensions) => {
      return R.merge(state, dimensions);
    }
  }
});
