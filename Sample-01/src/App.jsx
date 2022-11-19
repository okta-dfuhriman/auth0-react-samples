import React from 'react';
import { Router, Route, Switch } from 'react-router-dom';
import { Container } from 'reactstrap';

import Loading from './components/Loading';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import Home from './views/Home';
import Profile from './views/Profile';
import ExternalApi from './views/ExternalApi';
import { useAuth } from './hooks';
import history from './utils/history';

// styles
import './App.css';

// fontawesome
import initFontAwesome from './utils/initFontAwesome';
initFontAwesome();

const App = () => {
	const { isAuthenticated, isLoading, error } = useAuth();

	// React.useEffect(() => {
	// 	if (!isLoading && !isAuthenticated && !error) {
	// 	}
	// }, []);

	return (
		<>
			{isLoading && <Loading />}
			{error && <div> Oops... {error.message}</div>}
			{!isLoading && !error && (
				<Router history={history}>
					<div id='app' className='d-flex flex-column h-100'>
						<NavBar />
						<Container className='flex-grow-1 mt-5'>
							<Switch>
								<Route path='/' exact component={Profile} />
								<Route path='/home' exact component={Home} />
								<Route path='/profile' component={Profile} />
								<Route path='/external-api' component={ExternalApi} />
							</Switch>
						</Container>
						<Footer />
					</div>
				</Router>
			)}
		</>
	);
};

export default App;
