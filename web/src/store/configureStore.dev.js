import { createStore, applyMiddleware, compose } from 'redux';
import { persistState } from 'redux-devtools';
import createSagaMiddleware, { END } from 'redux-saga';

import rootReducer from '../reducers';

/* eslint-disable no-underscore-dangle */
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
/* eslint-enable no-underscore-dangle */
const sagaMiddleware = createSagaMiddleware();
const middleware = [
  sagaMiddleware,
].filter(Boolean);

function configureStore(initialState) {
  const store = createStore(rootReducer, initialState, composeEnhancers(
    applyMiddleware(...middleware),
    persistState(
      window.location.href.match(
        /[?&]debug_session=([^&]+)\b/,
      ),
    ),
  ));

  if (module.hot) {
    // Enable Webpack hot module replacement for reducers
    module.hot.accept('../reducers', () => {
      // eslint-disable-next-line
      store.replaceReducer(require('../reducers').default);
    });
  }

  store.runSaga = sagaMiddleware.run;
  store.close = () => store.dispatch(END);
  return store;
}

export default configureStore;
