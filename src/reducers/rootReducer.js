import { combineReducers } from 'redux'
import currentUser from './currentUser'
import identity from '../identity/identityReducers'
import { connectRouter } from 'connected-react-router'


export default (history) => combineReducers({
  currentUser,
  identity,
  router: connectRouter(history)
})