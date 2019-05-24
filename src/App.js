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
import ForgotPassword from './views/forgotPassword/ForgotPassword'
import HomePage from './home-page'
import HeaderArea from './header/HeaderAreaView'
import SignUpPage from './views/signUp/SignUpPage'
import { FORGOT_PASSWORD, JOIN, ROOT, SIGN_IN } from './views/urls'

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
          path={SIGN_IN}
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
          path={JOIN}
          render={() => (
            <div>
              <HeaderArea />
              <SignUpPage />
              <Footer />
            </div>
          )}
        />
        <Route
          exact
          path={FORGOT_PASSWORD}
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
          path={ROOT}
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

const mapStateToProps = () => {
  return {}
}

export default connect(mapStateToProps, mapDispatchToProps)(App)
