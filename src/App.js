import React, { Component } from 'react'
import Footer from './components/Footer'
import './App.css'
import './scss/style.scss'
import PropTypes from 'prop-types'
import { fetchCurrentUser as fetchCurrentUserAction } from './reducers/currentUser'
import { connect } from 'react-redux'
import { Route, Switch } from 'react-router-dom'
import SignIn from './pages/sign-in-page/SignInPage'
import ForgotPasswordPage from './pages/authentication/ForgotPasswordPage'
import HomePage from './pages/home-page'
import HeaderArea from './components/HeaderArea'
import SignUpPage from './pages/sign-up-page/SignUpPage'
import {
  COMPLETE,
  FORGOT_PASSWORD,
  GALLERY,
  JOIN,
  MY_PROFILE,
  RECOVER_EMAIL,
  RESET_PASSWORD,
  ROOT,
  SIGN_IN,
  SUBSCRIBERS,
  USERS,
  VERIFY_EMAIL
} from './urls'
import UsersPage from './pages/users-page/UsersPage'
import GalleryPage from './pages/gallery-page/'
import Drift from './components/Drift'
import * as Sentry from '@sentry/browser'
import ResetPasswordPage from './pages/authentication/actions/ResetPasswordPage'
import Complete from './pages/authentication/actions/Complete'
import RecoverEmailPage from './pages/authentication/actions/RecoverEmailPage'
import SubscribersPage from './pages/subscribers-page/SubscribersPage'
import MyProfilePage from './pages/my-profile-page/MyProfilePage'
import VerifyEmailPage from './pages/authentication/actions/VerifyEmailPage'

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
            path={MY_PROFILE}
            render={() => (
              <div>
                <HeaderArea />
                <MyProfilePage />
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
            path={SUBSCRIBERS}
            render={() => (
              <div>
                <HeaderArea />
                <SubscribersPage />
                <Footer />
              </div>
            )}
          />
          <Route
            exact
            path={GALLERY}
            render={() => (
              <div>
                <HeaderArea />
                <GalleryPage />
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
            path={COMPLETE}
            render={() => (
              <div>
                <HeaderArea />
                <HomePage />
                <Footer />

                <Complete />
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
            path={RECOVER_EMAIL}
            render={() => (
              <div>
                <HeaderArea />
                <HomePage />
                <Footer />

                <RecoverEmailPage />
              </div>
            )}
          />
          <Route
            exact
            path={VERIFY_EMAIL}
            render={() => (
              <div>
                <HeaderArea />
                <HomePage />
                <Footer />

                <VerifyEmailPage />
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
