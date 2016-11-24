import React from 'react';
import ReactDOM from 'react-dom';

import InputRudder from '../inputs/rudder'
import InputSails from '../inputs/sails'

import OutputCompass from '../outputs/compass'
import OutputRelativeWind from '../outputs/relativeWind'

export default class Board extends React.Component {

  render () {
    return (
      <aside className="board">
        <fieldset className="board__inputs">
          <legend>Inputs</legend>
          <InputRudder />
          <InputSails />
        </fieldset>
        <fieldset className="board__outputs">
          <legend>Outputs</legend>
          <OutputCompass />
          <OutputRelativeWind />
        </fieldset>
      </aside>
    )
  }

}
