import R from 'ramda';
import React from 'react';
import ViewportMercator from 'viewport-mercator-project';

import h from 'react-hyperscript';
import connect from 'fluxx/lib/ReactConnector';

import { store } from './Store';

function round(x, n) {
  const tenN = Math.pow(10, n);
  return Math.round(x * tenN) / tenN;
}

class WindOverlay extends React.Component {

  componentDidMount() {
    this._redraw();
  }

  componentDidUpdate() {
    this._redraw();
  }

  _redraw() {
    const { width, height, wind } = this.props;
    const dotRadius = 2;

    const mercator = ViewportMercator(this.props);
    const pixelRatio = window.devicePixelRatio || 1;
    const canvas = this.refs.overlay;
    const ctx = canvas.getContext('2d');

    ctx.save();
    ctx.scale(pixelRatio, pixelRatio);
    ctx.clearRect(0, 0, width, height);
    ctx.globalCompositeOperation = 'source-over';

    console.log ("draw ", wind);
    if (wind) {
      for (const windCell of wind) {
        console.log("Add windcell = ", [windCell[1], windCell[0]]);
        const pixel = mercator.project([windCell[1], windCell[0]]);
        const pixelRounded = [round(pixel[0], 1), round(pixel[1], 1)];
        if (pixelRounded[0] + dotRadius >= 0 &&
            pixelRounded[0] - dotRadius < width &&
            pixelRounded[1] + dotRadius >= 0 &&
            pixelRounded[1] - dotRadius < height
        ) {
          ctx.fillStyle = '#1FBAD6';
          ctx.beginPath();
          ctx.arc(pixelRounded[0], pixelRounded[1], dotRadius, 0, Math.PI * 2);
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
