import React from 'react';
import ViewportMercator from 'viewport-mercator-project';
import TWEEN from 'tween.js';

import h from 'react-hyperscript';
import connect from 'fluxx/lib/ReactConnector';

import { store } from '../../stores';

function round(x, n) {
  const tenN = Math.pow(10, n);
  return Math.round(x * tenN) / tenN;
}

class WindOverlay extends React.Component {

  constructor(props) {
    console.log('construct WindOverlay');
    super(props);
  }

  componentDidMount() {
    this._redraw();
  }

  componentDidUpdate() {
    // TODO: Update the state on component update
    this._redraw();
  }

  _redraw() {
    const mercator = ViewportMercator(this.props);
    const { width, height } = this.props;
    const dotRadius = 1;

    const pixelRatio = window.devicePixelRatio || 1;
    const canvas = this.refs.overlay;
    const ctx = canvas.getContext('2d');

    ctx.save();
    ctx.scale(pixelRatio, pixelRatio);
    ctx.clearRect(0, 0, width, height);
    ctx.globalCompositeOperation = 'source-over';

    if (this.props.windTrails) {
      for (const point of this.props.windTrails) {
        let pixel = mercator.project(point.origin);
        if (pixel[0] + dotRadius >= 0 &&
            pixel[0] - dotRadius < width &&
            pixel[1] + dotRadius >= 0 &&
            pixel[1] - dotRadius < height
        ) {
          ctx.fillStyle = '#F00';
          ctx.beginPath();
          ctx.arc(pixel[0], pixel[1], dotRadius, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    ctx.restore();
  }

  render() {
    const pixelRatio = window.devicePixelRatio || 1;
    return h('canvas', {
      ref: 'overlay',
      width: this.props.width * pixelRatio,
      height: this.props.height * pixelRatio,
      style: {
        width: `${this.props.width}px`,
        height: `${this.props.height}px`,
        position: 'absolute',
        pointerEvents: 'none',
        opacity: 0.7,
        left: 0,
        top: 0
      }
    });
  }

}

export default connect(WindOverlay, store, state => state);
