import { OAuthError } from './errors';

const CODE_RE = /[?&]code=[^&]+/;
const STATE_RE = /[?&]state=[^&]+/;
const ERROR_RE = /[?&]error=[^&]+/;

export const hasAuthParams = (searchParams = window.location.search) =>
	(CODE_RE.test(searchParams) || ERROR_RE.test(searchParams)) && STATE_RE.test(searchParams);

const normalizeErrorFn = (fallbackMessage) => (error) => {
	if ('error' in error) {
		return new OAuthError(error.error, error.error_description);
	}
	if (error instanceof Error) {
		return error;
	}
	return new Error(fallbackMessage);
};

export const loginError = normalizeErrorFn('Login failed');

export const tokenError = normalizeErrorFn('Get access token failed');
