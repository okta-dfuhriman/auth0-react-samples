import { Auth0Client } from '@auth0/auth0-spa-js';

import React from 'react';

import { AuthContext } from './AuthContext';
import { AuthReducer } from './AuthReducer';
import { initialAuthState } from './AuthState';
import { hasAuthParams, loginError, tokenError } from '../utils/auth0Utils';

const toAuth0ClientOptions = (opts) => {
	const { clientId, redirectUri, maxAge, ...validOpts } = opts;
	return {
		...validOpts,
		client_id: clientId,
		redirect_uri: redirectUri,
		max_age: maxAge,
		auth0Client: {
			name: 'auth0-react',
		},
	};
};

const toAuth0LoginRedirectOptions = (opts) => {
	if (!opts) {
		return;
	}
	const { redirectUri, ...validOpts } = opts;
	return {
		...validOpts,
		redirect_uri: redirectUri,
	};
};

const defaultOnRedirectCallback = (appState) => {
	window.history.replaceState({}, document.title, appState?.returnTo || window.location.pathname);
};

export const AuthProvider = (opts) => {
	const { children, skipRedirectCallback, onRedirectCallback = defaultOnRedirectCallback, ...clientOpts } = opts;

	const [client] = React.useState(() => new Auth0Client(toAuth0ClientOptions(clientOpts)));
	const [state, dispatch] = React.useReducer(AuthReducer, initialAuthState);

	React.useEffect(() => {
		(async () => {
			try {
				if (hasAuthParams() && !skipRedirectCallback) {
					const { appState } = await client.handleRedirectCallback();
					onRedirectCallback(appState);
				} else {
					await client.checkSession();
				}
				const user = await client.getUser();
				dispatch({ type: 'INITIALISED', user });
			} catch (error) {
				dispatch({ type: 'ERROR', error: loginError(error) });
			}
		})();
	}, [client, onRedirectCallback, skipRedirectCallback]);

	const buildAuthorizeUrl = React.useCallback(
		(opts) => client.buildAuthorizeUrl(toAuth0LoginRedirectOptions(opts)),
		[client]
	);

	const buildLogoutUrl = React.useCallback((opts) => client.buildLogoutUrl(opts), [client]);

	const loginWithRedirect = React.useCallback(
		(opts) => client.loginWithRedirect(toAuth0LoginRedirectOptions(opts)),
		[client]
	);

	const loginWithPopup = React.useCallback(
		async (options, config) => {
			dispatch({ type: 'LOGIN_POPUP_STARTED' });
			try {
				await client.loginWithPopup(options, config);
			} catch (error) {
				dispatch({ type: 'ERROR', error: loginError(error) });
				return;
			}
			const user = await client.getUser();
			dispatch({ type: 'LOGIN_POPUP_COMPLETE', user });
		},
		[client]
	);

	const logout = React.useCallback(
		(opts = {}) => {
			const maybePromise = client.logout(opts);
			if (opts.localOnly) {
				if (maybePromise && typeof maybePromise.then === 'function') {
					return maybePromise.then(() => dispatch({ type: 'LOGOUT' }));
				}
				dispatch({ type: 'LOGOUT' });
			}
			return maybePromise;
		},
		[client]
	);

	const getAccessTokenSilently = React.useCallback(
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		async (opts) => {
			let token;
			try {
				token = await client.getTokenSilently(opts);
			} catch (error) {
				throw tokenError(error);
			} finally {
				dispatch({
					type: 'GET_ACCESS_TOKEN_COMPLETE',
					user: await client.getUser(),
				});
			}
			return token;
		},
		[client]
	);

	const getAccessTokenWithPopup = React.useCallback(
		async (opts, config) => {
			let token;
			try {
				token = await client.getTokenWithPopup(opts, config);
			} catch (error) {
				throw tokenError(error);
			} finally {
				dispatch({
					type: 'GET_ACCESS_TOKEN_COMPLETE',
					user: await client.getUser(),
				});
			}
			return token;
		},
		[client]
	);

	const getIdTokenClaims = React.useCallback((opts) => client.getIdTokenClaims(opts), [client]);

	const handleRedirectCallback = React.useCallback(
		async (url) => {
			try {
				return await client.handleRedirectCallback(url);
			} catch (error) {
				throw tokenError(error);
			} finally {
				dispatch({
					type: 'HANDLE_REDIRECT_COMPLETE',
					user: await client.getUser(),
				});
			}
		},
		[client]
	);

	const contextValue = React.useMemo(() => {
		return {
			...state,
			buildAuthorizeUrl,
			buildLogoutUrl,
			getAccessTokenSilently,
			getAccessTokenWithPopup,
			getIdTokenClaims,
			loginWithRedirect,
			loginWithPopup,
			logout,
			handleRedirectCallback,
		};
	}, [
		state,
		buildAuthorizeUrl,
		buildLogoutUrl,
		getAccessTokenSilently,
		getAccessTokenWithPopup,
		getIdTokenClaims,
		loginWithRedirect,
		loginWithPopup,
		logout,
		handleRedirectCallback,
	]);

	return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};
