import "babel-polyfill";

import React from 'react';
import ReactDOM from 'react-dom';

import Layout from './layouts/onboard';

ReactDOM.render(React.createElement(Layout, {}), document.getElementById('container'));
