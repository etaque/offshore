import React from 'react';
import ReactDOM from 'react-dom';

export default class Settings extends React.Component {

  render() {
    return (
      <div id="settings" className="settings">
        <a className="settings__toggle settings__toggle--onClosed" href="#settings">⚙</a>

        <div className="settings__content">
          <a className="settings__toggle settings__toggle--onOpened" href="#">❌</a>

          <img src="/assets/media/boat.svg" width="34" height="34" style={{
              marginLeft: "-17px",
              marginTop: "-17px",
              transformOrigin: '17px 17px 0'
            }} />
          <input type="color" />
          <input type="text" />

        </div>
      </div>
    )
  }

}
