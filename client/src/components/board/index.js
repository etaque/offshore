import React from 'react';
import h from 'react-hyperscript';

import InputRudder from '../inputs/rudder';
import InputSails from '../inputs/sails';

import OutputCompass from '../outputs/compass';
import OutputRelativeWind from '../outputs/relativeWind';

export default class Board extends React.Component {

  render () {
    return h('aside', {className: 'board'}, [
      h('fieldset', {className: 'board__inputs'}, [
        h('legend', 'Inputs'),
        h(InputRudder),
        h(InputSails)
      ]),
      h('fieldset', {className: 'board__outputs'}, [
        h('legend', 'Outputs'),
        h(OutputCompass),
        h(OutputRelativeWind)
      ]),
    ]);
  }

}
