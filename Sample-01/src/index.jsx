import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { AuthProvider } from './providers';
import { getConfig } from './config';
import history from './utils/history';

const onRedirectCallback = (appState) => {
	history.push(appState && appState.returnTo ? appState.returnTo : window.location.pathname);
};

// Please see https://auth0.github.io/auth0-react/interfaces/Auth0ProviderOptions.html
// for a full list of the available properties on the provider
const config = getConfig();

const providerConfig = {
	domain: config.domain,
	clientId: config.clientId,
	...(config.audience ? { audience: config.audience } : null),
	redirectUri: window.location.origin,
	onRedirectCallback,
};

ReactDOM.render(
	<AuthProvider {...providerConfig}>
		<App />
	</AuthProvider>,
	document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
