import React from 'react';
import ViewportMercator from 'viewport-mercator-project';

import h from 'react-hyperscript';
import connect from 'fluxx/lib/ReactConnector';

import { actions, store } from '../../stores';


class BoatOverlay extends React.Component {

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this._redraw();
  }

  componentDidUpdate() {
    this._redraw();
  }



  _redraw() {
    const { width, height, boat } = this.props;
    const TO_RADIANS = Math.PI/180;
    const mercator = ViewportMercator(this.props);
    const pixelRatio = window.devicePixelRatio || 1;
    const canvas = this.refs.overlay;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    //size : 192*67
    const boatSizeRatio = 0.15;
    const displayWidth = 192 * boatSizeRatio;
    const displayHeight = 67 * boatSizeRatio;
    img.src = 'assets/media/boat.png';

    ctx.save();
    ctx.scale(pixelRatio, pixelRatio);
    ctx.clearRect(0, 0, width, height);
    ctx.globalCompositeOperation = 'source-over';
    ctx.restore();

    if (boat) {
      const pixel = mercator.project([boat[1], boat[0]]);
      const ctxBoat = canvas.getContext('2d');
      ctxBoat.save();
      ctxBoat.scale(pixelRatio, pixelRatio);
      ctxBoat.translate(pixel[0], pixel[1]);
      ctxBoat.rotate(boat[2]*TO_RADIANS);
      ctxBoat.drawImage(img,-(0+displayWidth/2),-(0+displayHeight/2), displayWidth, displayHeight);
      ctxBoat.restore();
    }
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

export default connect(BoatOverlay, store, state => state);
