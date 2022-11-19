import React from 'react';

import { initialAuthState } from './AuthState';

const stub = () => {
	throw new Error('You forgot to wrap your component in <Auth0Provider>.');
};

const initialContext = {
	...initialAuthState,
	buildAuthorizeUrl: stub,
	buildLogoutUrl: stub,
	getAccessTokenSilently: stub,
	getAccessTokenWithPopup: stub,
	getIdTokenClaims: stub,
	loginAnonymously: stub,
	loginWithRedirect: stub,
	loginWithPopup: stub,
	logout: stub,
	handleRedirectCallback: stub,
	signUp: stub,
};

export const AuthContext = React.createContext(initialContext);
