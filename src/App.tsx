import firebase from 'firebase/app'
import React, { useEffect } from 'react'
import Footer from './components/Footer'
import './App.css'
import './scss/style.scss'
import * as PropTypes from 'prop-types'
import { FetchCurrentUser, fetchCurrentUser as fetchCurrentUserAction } from './reducers/currentUser'
import { connect } from 'react-redux'
import { Route, Switch } from 'react-router-dom'
import SignIn from './pages/sign-in-page/SignInPage'
import ForgotPasswordPage from './pages/authentication/ForgotPasswordPage'
import HomePage from './pages/home-page'
import Header from './components/Header'
import SignUpPage from './pages/sign-up-page/SignUpPage'
import {
  ACCOUNT,
  COMPLETE,
  CONTACTS,
  FAQ,
  FORGOT_PASSWORD,
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
import UsersPage from './pages/users-page/UsersPage'
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
import LogRocket from 'logrocket'
import FaqPage from './pages/faq-page/FaqPage'
import { CurrentUserStore } from './entities/User'

const setupLogRocketReact = require('logrocket-react')

interface WrapperProps {
  inHomePage?: boolean
  children?: any
}

function Wrapper(props: WrapperProps = {}) {
  return (
    <>
      <Header />
      {props.inHomePage && <HomePage />}
      {props.inHomePage && props.children}

      {!props.inHomePage && (
        <div className="mb-4 mx-1 mx-sm-2 mx-md-3"> {props.children} </div>
      )}
      <Footer />
    </>
  )
}

Wrapper.propTypes = {
  inHomePage: PropTypes.bool,
  children: PropTypes.element
}

interface AppProps {
  fetchCurrentUser: FetchCurrentUser
  isCurrentUserLoaded: boolean
  currentUser: firebase.User
}

function App({ fetchCurrentUser, isCurrentUserLoaded, currentUser }: AppProps) {
  useEffect(() => {
    LogRocket.init('qv4xmc/belmont-runners')
    setupLogRocketReact(LogRocket)
    fetchCurrentUser()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const prevCurrentUser = usePrevious(currentUser)
  useEffect(() => {
    if (prevCurrentUser !== currentUser) {
      console.log('currentUser is different:', currentUser)
      if (currentUser) {
        const userTraits = {
          email: currentUser.email || '',
          name: currentUser.displayName || ''
        }
        LogRocket.identify(currentUser.uid, userTraits)

        LogRocket.getSessionURL(sessionURL => {
          Sentry.configureScope(scope => {
            const user: Sentry.User = {
              id: currentUser.uid,
              email: currentUser.email || undefined,
              displayName: currentUser.displayName
            }
            scope.setUser(user)
            scope.setExtra('sessionURL', sessionURL)
          })
        })
      } else {
        LogRocket.getSessionURL(sessionURL => {
          Sentry.configureScope(scope => {
            scope.setUser({
              email: undefined,
              displayName: undefined,
              uid: undefined
            })
            scope.setExtra('sessionURL', sessionURL)
          })
        })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser])

  const enableCampaigns = window.innerHeight >= 600
  console.log(
    'enableCampaigns:',
    enableCampaigns,
    'window.innerHeight:',
    window.innerHeight
  )
  return (
    <>
      <Switch>
        <Route
          exact
          path={JOIN}
          render={() => (
            <>
              {/*
  // @ts-ignore */}
              <Wrapper>
                {/*
  // @ts-ignore */}
                <SignUpPage />
              </Wrapper>
            </>
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
              <UsersPage />
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
        {/*<Route*/}
        {/*  exact*/}
        {/*  path={GALLERY}*/}
        {/*  render={() => (*/}
        {/*    <Wrapper>*/}
        {/*      <GalleryPage />*/}
        {/*    </Wrapper>*/}
        {/*  )}*/}
        {/*/>*/}
        <Route
          exact
          path={FAQ}
          render={() => (
            <Wrapper>
              <FaqPage />
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

        <Route path={ROOT} render={() => <Wrapper inHomePage />} />
      </Switch>
      {isCurrentUserLoaded && (
        <Drift
          appId="fxagpvvrufk4"
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
      )}
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

const mapStateToProps = ({ currentUser: { currentUser, isCurrentUserLoaded } }: CurrentUserStore) => {
  return {
    isCurrentUserLoaded,
    currentUser
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
// @ts-ignore
)(App)