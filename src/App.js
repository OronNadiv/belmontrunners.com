import React, { Component } from 'react'
import Footer from './components/Footer'
import './App.css'
import './scss/style.scss'
import PropTypes from 'prop-types'
import { fetchCurrentUser as fetchCurrentUserAction } from './reducers/currentUser'
import { connect } from 'react-redux'
import { Route, Switch } from 'react-router-dom'
import SignIn from './pages/sign-in-page/SignInPage'
import ForgotPasswordPage from './pages/forget-password-page/ForgotPasswordPage'
import HomePage from './pages/home-page'
import HeaderArea from './components/HeaderArea'
import SignUpPage from './pages/sign-up-page/SignUpPage'
import { FORGOT_PASSWORD, JOIN, RESET_PASSWORD, ROOT, SIGN_IN, USERS } from './urls'
import UsersPage from './pages/users-page/UsersPage'
import Drift from './components/Drift'
import * as Sentry from '@sentry/browser'
import ResetPasswordPage from './pages/forget-password-page/ResetPasswordPage'

class App extends Component {
  componentDidMount () {
    this.props.fetchCurrentUser()
  }

  componentDidUpdate (prevProps) {
    if (prevProps.currentUser !== this.props.currentUser) {
      if (this.props.currentUser) {
        Sentry.configureScope((scope) => {
          scope.setUser({
            id: this.props.currentUser.uid,
            email: this.props.currentUser.email,
            displayName: this.props.currentUser.display
          })
        })
      } else {
        Sentry.configureScope((scope) => {
          scope.setUser({ email: undefined, displayName: undefined, uid: undefined })
        })

      }
    }
  }

  render () {

    const { isCurrentUserLoaded, currentUser } = this.props
    return (
      <div>
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
            path={USERS}
            render={() => (
              <div>
                <HeaderArea />
                <UsersPage />
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

                <ForgotPasswordPage />
              </div>
            )}
          />
          <Route
            exact
            path={RESET_PASSWORD}
            render={() => (
              <div>
                <HeaderArea />
                <HomePage />
                <Footer />

                <ResetPasswordPage />
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
        {
          isCurrentUserLoaded &&
          <Drift
            appId='fxagpvvrufk4'
            userId={currentUser && currentUser.uid}
            attributes={{
              email: currentUser && currentUser.email,
              avatar_url: currentUser && currentUser.photoURL,
              displayName: currentUser && currentUser.displayName
            }}
            // config={{
            //   enableCampaigns: false
            // }}
          />
        }
      </div>
    )
  }
}

App.propTypes = {
  fetchCurrentUser: PropTypes.func.isRequired,
  currentUser: PropTypes.object,
  isCurrentUserLoaded: PropTypes.bool.isRequired
}

const mapDispatchToProps = {
  fetchCurrentUser: fetchCurrentUserAction
}

const mapStateToProps = ({ currentUser: { currentUser, isCurrentUserLoaded } }) => {
  return {
    isCurrentUserLoaded,
    currentUser
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App)
