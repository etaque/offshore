import React from 'react';
import ReactDOM from 'react-dom';

import Board from '../components/board';
import Map from '../components/map';


export default class Layout extends React.Component {

  render() {
    return <main>
      <Map />
      <Board />
    </main>;
  }

}
