import { combineReducers } from 'redux'
import currentUser from './currentUser'
import { connectRouter } from 'connected-react-router'

export default history =>
  combineReducers({
    currentUser,
    router: connectRouter(history)
  })
