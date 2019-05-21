import React, { Component } from 'react'
import Footer from './Footer'
import './App.css'
import firebase from 'firebase'
import 'firebase/auth'
import './scss/style.scss'
import PropTypes from 'prop-types'
import { fetchCurrentUser as fetchCurrentUserAction } from './reducers/currentUser'
import { connect } from 'react-redux'
import { Route, Switch } from 'react-router-dom'
import SignIn from './views/signIn/SignIn'
import SignUp from './views/signUp/SignUp'
import ForgotPassword from './views/forgotPassword/ForgotPassword'
import HomePage from './home-page'
import HeaderArea from './header/HeaderAreaView'

class App extends Component {
  componentDidMount () {
    this.props.fetchCurrentUser()
  }

  render () {
    console.log('firebase.auth().currentUser:', firebase.auth().currentUser)
    return (
      <Switch>
        <Route
          exact
          path={'/signin'}
          render={() => (
            <div>
              <HeaderArea />
              <HomePage />
              <Footer />

              <SignIn />
            </div>
          )}
        />
        <Route
          exact
          path={'/join'}
          render={() => (
            <div>
              <HeaderArea />
              <HomePage />
              <Footer />

              <SignUp />
            </div>
          )}
        />
        <Route
          exact
          path={'/forgotpassword'}
          render={() => (
            <div>
              <HeaderArea />
              <HomePage />
              <Footer />

              <ForgotPassword />
            </div>
          )}
        />

        <Route
          exact
          path={'/'}
          render={() => (
            <div>
              <HeaderArea />
              <HomePage />
              <Footer />
            </div>
          )}
        />
      </Switch>
    )
  }
}

App.propTypes = {
  fetchCurrentUser: PropTypes.func.isRequired
}

const mapDispatchToProps = {
  fetchCurrentUser: fetchCurrentUserAction
}

const mapStateToProps = (state) => {
  return {}
}

export default connect(mapStateToProps, mapDispatchToProps)(App)
