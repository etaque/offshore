import {Layer, assembleShaders} from 'deck.gl';
import {Model, Program, Geometry } from 'luma.gl';

import { vertex, fragment } from './shaders';

export default class WindsLayer extends Layer {
  /**
   * @classdesc
   * LineLayer
   *
   * @class
   * @param {object} opts
   */
  constructor(opts) {
    super(opts);
  }

  updateState({props, oldProps, changeFlags: {dataChanged, somethingChanged}}) {
    if (dataChanged) {
      this.countVertices(props.data);
    }
    if (somethingChanged) {
      this.updateUniforms();
    }
  }

  initializeState() {
    const {gl} = this.context;
    const {attributeManager} = this.state;

    const model = this.getModel(gl);

    attributeManager.addDynamic({
      indices: {size: 1, update: this.calculateIndices, isIndexed: true},
      positions: {size: 3, update: this.calculatePositions},
      colors: {size: 3, update: this.calculateColors}
    });

    gl.getExtension('OES_element_index_uint');
    this.setState({model});
    gl.lineWidth(this.props.strokeWidth);

    this.countVertices();
    this.updateUniforms();
  }

  getModel(gl) {
    return new Model({
      program: new Program(gl, assembleShaders(gl, {
        vs: vertex,
        fs: fragment
      })),
      geometry: new Geometry({
        id: this.props.id,
        drawMode: 'LINES'
      }),
      vertexCount: 0,
      isIndexed: true,
      onBeforeRender: () => {
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
        gl.blendEquation(gl.FUNC_ADD);
      },
      onAfterRender: () => {
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      }
    });
  }

  countVertices(data) {
    if (!data) {
      return;
    }

    let vertexCount = 0;
    const pathLengths = data.reduce((acc, d) => {
      console.log("work with ", d);
      const l = 1;
      vertexCount += l;
      return [...acc, l];
    }, []);
    this.setState({pathLengths, vertexCount});
  }

  updateUniforms() {
    const {opacity, trailLength, currentTime} = this.props;
    this.setUniforms({
      opacity,
      trailLength,
      currentTime
    });
  }

  calculateIndices(attribute) {
    const {pathLengths, vertexCount} = this.state;

    const indicesCount = (vertexCount - pathLengths.length) * 2;
    const indices = new Uint32Array(indicesCount);

    let offset = 0;
    let index = 0;
    for (let i = 0; i < pathLengths.length; i++) {
      const l = pathLengths[i];
      indices[index++] = offset;
      for (let j = 1; j < l - 1; j++) {
        indices[index++] = j + offset;
        indices[index++] = j + offset;
      }
      indices[index++] = offset + l - 1;
      offset += l;
    }
    attribute.value = indices;
    this.state.model.setVertexCount(indicesCount);
  }

  calculatePositions(attribute) {
    const {data} = this.props;
    const {vertexCount} = this.state;
    const positions = new Float32Array(vertexCount * 3);

    let index = 0;
    for (let i = 0; i < data.length; i++) {
      const path = [[0, 0], [10, 10], [20, 20]];
      for (let j = 0; j < path.length; j++) {
        const pt = path[j];
        positions[index++] = pt[0];
        positions[index++] = pt[1];
        positions[index++] = pt[2];
      }
    }
    attribute.value = positions;
  }

  calculateColors(attribute) {
    const {data, getColor} = this.props;
    const {pathLengths, vertexCount} = this.state;
    const colors = new Float32Array(vertexCount * 3);

    let index = 0;
    for (let i = 0; i < data.length; i++) {
      const color = getColor(data[i]);
      const l = pathLengths[i];
      for (let j = 0; j < l; j++) {
        colors[index++] = color[0];
        colors[index++] = color[1];
        colors[index++] = color[2];
      }
    }
    attribute.value = colors;
  }

}
