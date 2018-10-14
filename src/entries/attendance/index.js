import React from 'react';
import ReactDOM from 'react-dom';
import App from '../../pages/App/App.js';

import registerServiceWorker from '../../util/registerServiceWorker';

ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();
