import { combineReducers } from 'redux'
import currentUser from './currentUser'
import { connectRouter } from 'connected-react-router'
import { History } from 'history'

const rootReducer = (history: History) =>
  combineReducers({
    currentUser,
    router: connectRouter(history)
  })
export default rootReducer
