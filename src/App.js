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
  ACCOUNT,
  COMPLETE,
  CONTACTS,
  FORGOT_PASSWORD,
  GALLERY,
  JOIN,
  MEMBERS,
  PROFILE,
  RECOVER_EMAIL,
  RESET_PASSWORD,
  ROOT,
  SIGN_IN,
  USERS,
  VERIFY_EMAIL
} from './urls'
import UsersPage2 from './pages/users-page2/UsersPage'
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
import AccountPage from './pages/account-page/AccountPage'

function Wrapper (props = {}) {

  return (
    <>
      <HeaderArea />
      {props.inHomePage && <HomePage />}
      {props.inHomePage && props.children}

      {!props.inHomePage && <div className='mb-4 mx-1 mx-sm-2 mx-md-3'> {props.children} </div>}
      <Footer />
    </>
  )
}

Wrapper.propTypes = {
  inHomePage: PropTypes.bool,
  children: PropTypes.element
}

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
          path={JOIN}
          render={() => (
            <Wrapper>
              <SignUpPage />
            </Wrapper>
          )}
        />
        <Route
          exact
          path={PROFILE}
          render={() => (
            <Wrapper>
              <MyProfilePage />
            </Wrapper>
          )}
        />
        <Route
          exact
          path={ACCOUNT}
          render={() => (
            <Wrapper>
              <AccountPage />
            </Wrapper>
          )}
        />
        <Route
          path={MEMBERS}
          render={() => (
            <Wrapper>
              <MembersPage />
            </Wrapper>
          )}
        />
        <Route
          exact
          path={USERS}
          render={() => (
            <Wrapper>
              <UsersPage2 />
            </Wrapper>
          )}
        />
        <Route
          exact
          path={CONTACTS}
          render={() => (
            <Wrapper>
              <ContactsPage />
            </Wrapper>
          )}
        />
        <Route
          exact
          path={GALLERY}
          render={() => (
            <Wrapper>
              <GalleryPage />
            </Wrapper>
          )}
        />
        <Route
          exact
          path={SIGN_IN}
          render={() => (
            <Wrapper inHomePage>
              <SignIn />
            </Wrapper>
          )}
        />
        <Route
          exact
          path={FORGOT_PASSWORD}
          render={() => (
            <Wrapper inHomePage>
              <ForgotPasswordPage />
            </Wrapper>
          )}
        />
        <Route
          exact
          path={COMPLETE}
          render={() => (
            <Wrapper inHomePage>
              <Complete />
            </Wrapper>
          )}
        />
        <Route
          exact
          path={RESET_PASSWORD}
          render={() => (
            <Wrapper inHomePage>
              <ResetPasswordPage />
            </Wrapper>
          )}
        />
        <Route
          exact
          path={RECOVER_EMAIL}
          render={() => (
            <Wrapper inHomePage>
              <RecoverEmailPage />
            </Wrapper>
          )}
        />
        <Route
          exact
          path={VERIFY_EMAIL}
          render={() => (
            <Wrapper inHomePage>
              <VerifyEmailPage />
            </Wrapper>
          )}
        />

        <Route
          path={ROOT}
          render={() => <Wrapper inHomePage />}
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
