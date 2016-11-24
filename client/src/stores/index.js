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
      [38, -46, 10, 10], // lat, lng, u, v
      [38, -86, 10, 10] // lat, lng, u, v
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
