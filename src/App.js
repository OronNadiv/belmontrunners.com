import React, { Component } from 'react'
import Footer from './Footer'
import './App.css'
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
import { FORGOT_PASSWORD, JOIN, ROOT, SIGN_IN, USERS } from './views/urls'
import UsersPage from './users/UsersPage'
import Drift from './Drift'
import * as Sentry from '@sentry/browser'

class App extends Component {
  componentDidMount () {
    this.props.fetchCurrentUser()
  }

  componentWillReceiveProps (nextProps, nextContext) {
    if (nextProps.currentUser !== this.props.currentUser) {
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
