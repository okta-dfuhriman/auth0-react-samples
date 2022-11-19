import React from 'react';
import { useAuth } from './useAuth';

/**
 * @ignore
 */
const defaultOnRedirecting = () => <></>;

/**
 * @ignore
 */
const defaultReturnTo = () => `${window.location.pathname}${window.location.search}`;

/**
 * ```js
 * const MyProtectedComponent = withAuthenticationRequired(MyComponent);
 * ```
 *
 * When you wrap your components in this Higher Order Component and an anonymous user visits your component
 * they will be redirected to the login page and returned to the page they we're redirected from after login.
 */
export const withAuthenticationRequired = (Component, options = {}) => {
	return function WithAuthenticationRequired(props) {
		const { user, isAuthenticated, isLoading, loginWithRedirect } = useAuth();
		const {
			returnTo = defaultReturnTo,
			onRedirecting = defaultOnRedirecting,
			claimCheck = () => true,
			loginOptions,
		} = options;

		/**
		 * The route is authenticated if the user has valid auth and there are no
		 * JWT claim mismatches.
		 */
		const routeIsAuthenticated = isAuthenticated && claimCheck(user);

		React.useEffect(() => {
			if (isLoading || routeIsAuthenticated) {
				return;
			}
			const opts = {
				...loginOptions,
				appState: {
					...(loginOptions && loginOptions.appState),
					returnTo: typeof returnTo === 'function' ? returnTo() : returnTo,
				},
			};
			(async () => {
				await loginWithRedirect(opts);
			})();
		}, [isLoading, routeIsAuthenticated, loginWithRedirect, loginOptions, returnTo]);

		return routeIsAuthenticated ? <Component {...props} /> : onRedirecting();
	};
};
