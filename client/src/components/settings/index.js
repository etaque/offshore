import React from 'react';
import ReactDOM from 'react-dom';

import connect from 'fluxx/lib/ReactConnector';
import { actions, store } from '../../stores';

import Boat from '../boat';

class Settings extends React.Component {

  constructor(props){
    super(props)
  }

  updatePlayer = () => {
    actions.updatePlayer({
      player: {
        name: this.refs['player.name'].value,
        color: this.refs['player.color'].value
      }
    });
  }

  render() {

    return (
      <div id="settings" className="settings">
        <a className="settings__toggle settings__toggle--onClosed" href="#settings">⚙</a>

        <div className="settings__content">
          <a className="settings__toggle settings__toggle--onOpened" href="#">❌</a>

          <div className="settings__player">
            <Boat />
          </div>

          <input type="text" ref="player.color"
            style={{backgroundColor: this.props.player.color}}
            defaultValue={this.props.player.color}
            onChange={this.updatePlayer} />

          <input type="text" ref="player.name"
            defaultValue={this.props.player.name}
            onChange={this.updatePlayer} />

        </div>
      </div>
    )
  }

}

export default connect(Settings, store, state => state);
