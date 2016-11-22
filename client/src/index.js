import R from 'ramda';
import debounce from 'lodash.debounce';

import React from 'react';
import ReactDOM from 'react-dom';
import h from 'react-hyperscript';
import MapGL from 'react-map-gl';

import App from './app';

ReactDOM.render(React.createElement(App, {}), document.getElementById('container'));
