import R from 'ramda';
import { GlobalStore, Action } from 'fluxx';

export const actions = {
  setViewport: Action('setViewport'),
  updateDimensions: Action('updateDimensions')
};

export const store = GlobalStore({

  state: {
    dimensions: {
      width: window.innerWidth,
      height: window.innerHeight,
    },
    viewport: {
      latitude: 38,
      longitude: -46,
      zoom: 3,
      startDragLngLat: null,
      isDragging: false
    },
    wind: [
      [38, -46, 10, 10] // lat, lng, u, v
    ]
  },

  handlers: {
    [actions.setViewport]: (state, viewport) => {
      return R.merge(state, {
        viewport: R.merge(state.viewport, viewport)
      });
    },
    [actions.updateDimensions]: (state, dimensions) => {
      return R.merge(state, {dimensions});
    }
  }
});
