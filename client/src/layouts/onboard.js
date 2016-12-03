import React from 'react';
import h from 'react-hyperscript';

import Map from '../components/map';
import Settings from '../components/settings';


export default class Layout extends React.Component {

  render() {
    return h('main', [
      h(Map),
      h(Settings)
    ]);
  }

}
