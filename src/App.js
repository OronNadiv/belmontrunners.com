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
import SignIn from './identity/SignIn'
import SignUp from './identity/SignUp'
import ForgotPassword from './identity/ForgotPassword'
import HomePage from './home-page'

class App extends Component {
  componentDidMount () {
    this.props.fetchCurrentUser()
  }

  render () {
    console.log('firebase.auth().currentUser:', firebase.auth().currentUser)
    return (
      <div>
        {/*
        //TODO: uncomment
        <HeaderArea />
        */}
        <Switch>
          <Route
            exact
            path={'/signin'}
            render={() => <SignIn />}
          />
          <Route
            exact
            path={'/join'}
            render={() => <SignUp />}
          />
          <Route
            exact
            path={'/forgotpassword'}
            render={() => <ForgotPassword />}
          />

          <Route
            exact
            path={'/'}
            render={() => <HomePage />}
          />
        </Switch>

        <Footer />
      </div>
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
