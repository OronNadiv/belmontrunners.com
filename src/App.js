import React, { useEffect } from 'react'
import Footer from './components/Footer'
import './App.css'
import './scss/style.scss'
import * as PropTypes from 'prop-types'
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
  CONTACTS,
  FORGOT_PASSWORD,
  GALLERY,
  JOIN,
  MEMBERS,
  MY_PROFILE,
  RECOVER_EMAIL,
  RESET_PASSWORD,
  ROOT,
  SIGN_IN,
  USERS,
  VERIFY_EMAIL
} from './urls'
import UsersPage from './pages/users-page/UsersPage'
import GalleryPage from './pages/gallery-page/'
import Drift from './components/Drift'
import * as Sentry from '@sentry/browser'
import ResetPasswordPage from './pages/authentication/ResetPasswordPage'
import Complete from './pages/authentication/Complete'
import RecoverEmailPage from './pages/authentication/RecoverEmailPage'
import ContactsPage from './pages/contacts-page/ContactsPage'
import MyProfilePage from './pages/my-profile-page/MyProfilePage'
import VerifyEmailPage from './pages/authentication/VerifyEmailPage'
import MembersPage from './pages/members-page/MembersPage'
import usePrevious from './components/usePrevious'
import { DISPLAY_NAME, EMAIL, PHOTO_URL, UID } from './fields'

const pageWrapperClassNames = 'mb-4 mx-1 mx-sm-2 mx-md-3'

function App ({ fetchCurrentUser, isCurrentUserLoaded, currentUser }) {
  useEffect(fetchCurrentUser, [])

  const prevCurrentUser = usePrevious(currentUser)
  useEffect(() => {
    if (prevCurrentUser !== currentUser) {
      console.log('currentUser is different:', currentUser)
      if (currentUser) {
        Sentry.configureScope((scope) => {
          scope.setUser({
            id: currentUser[UID],
            email: currentUser[EMAIL],
            displayName: currentUser[DISPLAY_NAME]
          })
        })
      } else {
        Sentry.configureScope((scope) => {
          scope.setUser({ email: undefined, displayName: undefined, uid: undefined })
        })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser])

  const enableCampaigns = window.innerHeight >= 600
  console.log('enableCampaigns:', enableCampaigns, 'window.innerHeight:', window.innerHeight)
  return (
    <>
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
              <div className={pageWrapperClassNames}>
                <SignUpPage />
              </div>
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
              <div className={pageWrapperClassNames}>
                <MyProfilePage />
              </div>
              <Footer />
            </div>
          )}
        />
        <Route
          path={MEMBERS}
          render={() => (
            <div>
              <HeaderArea />
              <div className={pageWrapperClassNames}>
                <MembersPage />
              </div>
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
              <div className={pageWrapperClassNames}>
                <UsersPage />
              </div>
              <Footer />
            </div>
          )}
        />
        <Route
          exact
          path={CONTACTS}
          render={() => (
            <div>
              <HeaderArea />
              <div className={pageWrapperClassNames}>
                <ContactsPage />
              </div>
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
              <div className={pageWrapperClassNames}>
                <GalleryPage />
              </div>
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
          userId={currentUser ? currentUser[UID] : ''}
          attributes={{
            email: currentUser && currentUser[EMAIL],
            avatar_url: currentUser && currentUser[PHOTO_URL],
            displayName: currentUser && currentUser[DISPLAY_NAME]
          }}
          config={{
            enableCampaigns
          }}
        />
      }
    </>
  )
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
