import React, { Component } from 'react'
import HeaderArea from './header/HeaderAreaView'
import HomeBanner from './HomeBanner'
import Welcome from './Welcome'
import EventSchedule from './EventSchedule'
import Subscribe from './Subscribe'
import Team from './Team'
import Map from './Map'
import Footer from './Footer'
import './App.css'
import firebase from 'firebase'
import 'firebase/auth'
import './scss/style.scss'
import PropTypes from 'prop-types'
import { fetchCurrentUser as fetchCurrentUserAction } from './reducers/currentUser'
import { connect } from 'react-redux'
import { Route } from 'react-router-dom'
import SignIn from './identity/SignIn'
import SignUp from './identity/SignUp'
import ForgotPassword from './identity/ForgotPassword'

class App extends Component {
  componentDidMount () {
    this.props.fetchCurrentUser()
  }

  render () {
    console.log('firebase.auth().currentUser:', firebase.auth().currentUser)
    return (
      <div>
        <Route
          exact
          path={'/signin'}
          render={() => <SignIn />}
        />
        <Route
          exact
          path={'/signup'}
          render={() => <SignUp />}
        />
        <Route
          exact
          path={'/forgotpassword'}
          render={() => <ForgotPassword />}
        />

        <HeaderArea />
        <HomeBanner />
        <Welcome />
        <EventSchedule />
        <Subscribe />
        <Team />
        {/*<Partners />*/}
        <Map />
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
