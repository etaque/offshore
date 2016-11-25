import React from 'react';
import ReactDOM from 'react-dom';

import Board from '../components/board';
import Map from '../components/map';
import Settings from '../components/settings';


export default class Layout extends React.Component {

  render() {
    return <main>
      <Map />
      <Settings />
    </main>;
  }

}
