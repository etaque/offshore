import React from 'react';
import ViewportMercator from 'viewport-mercator-project';
import TWEEN from 'tween.js';

import h from 'react-hyperscript';
import connect from 'fluxx/lib/ReactConnector';

import { store, actions } from '../../stores';

class WindOverlay extends React.Component {

  constructor(props) {
    super(props);
    this.tween = new TWEEN.Tween({time: 0})
      .to({time: 15}, 1000) // 15 fps
      .onUpdate(function() {
        actions.stepTrails();
      })
      .repeat(Infinity);
  }

  componentDidMount() {
    this.tween.start();
    this._redraw();
  }

  componentDidUpdate() {
    this._redraw();
  }

  componentWillUnmount() {
    this.tween.stop();
  }

  _redraw() {
    const mercator = ViewportMercator(this.props.viewport);
    const { width, height } = this.props.viewport;
    const dotRadius = 1;

    const pixelRatio = window.devicePixelRatio || 1;
    const canvas = this.refs.overlay;
    const ctx = canvas.getContext('2d');

    ctx.save();
    ctx.scale(pixelRatio, pixelRatio);
    ctx.clearRect(0, 0, width, height);
    ctx.globalCompositeOperation = 'source-over';

    if (!this.props.viewport.isDragging && this.props.windTrails) {
      for (const point of this.props.windTrails) {
        let opacity;
        if (point.tail.length > 10) {
          opacity = 1;
        } else if (point.tail.length > 5) {
          opacity = 0.7;
        } else {
          opacity = 0.4;
        }
        for (const trail of point.tail) {
          let pixel = mercator.project(trail);
          if (pixel[0] + dotRadius >= 0 &&
            pixel[0] - dotRadius < width &&
            pixel[1] + dotRadius >= 0 &&
            pixel[1] - dotRadius < height
          ) {
            ctx.fillStyle = `rgba(255, 0, 0, ${opacity})`;
            ctx.beginPath();
            ctx.arc(pixel[0], pixel[1], dotRadius, 0, Math.PI * 2);
            ctx.fill();
          }
          if (opacity > 0.1) {
            opacity = opacity - 0.1;
          }
        }
      }
    }

    ctx.restore();
  }

  render() {
    const pixelRatio = window.devicePixelRatio || 1;
    return h('canvas', {
      ref: 'overlay',
      width: this.props.viewport.width * pixelRatio,
      height: this.props.viewport.height * pixelRatio,
      style: {
        width: `${this.props.viewport.width}px`,
        height: `${this.props.viewport.height}px`,
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
