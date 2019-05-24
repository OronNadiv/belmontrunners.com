import { applyMiddleware, compose, createStore } from 'redux'
import thunk from 'redux-thunk'
import createRootReducer from './reducers/rootReducer'
import { createBrowserHistory } from 'history'
import { routerMiddleware } from 'connected-react-router'

export const history = createBrowserHistory()

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export default function configureStore (initialState = {}) {
  return createStore(
    createRootReducer(history), // root reducer with router state
    initialState,
    composeEnhancers(
      applyMiddleware(
        routerMiddleware(history), // for dispatching history actions
        thunk
      )
    )
  )
}
