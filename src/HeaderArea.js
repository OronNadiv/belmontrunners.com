import React, { Component } from 'react'
import './HeaderArea.css'
import { Link, Route } from "react-router-dom"
import firebase from 'firebase'
import 'firebase/auth'
import Signin from './Signin'
import Signup from './Signup'
import ForgotPassword from './ForgotPassword'
import $ from 'jquery'

class HeaderArea extends Component {
  constructor () {
    super()
    this.state = {
      user: firebase.auth().currentUser
    }
    firebase.auth().onAuthStateChanged((user) => {
      this.setState({ user })
    })
  }

  componentDidMount () {
    const nav_offset_top = $('.header_area1').height() + 50
    console.log('nav_offset_top:', nav_offset_top)

    function navbarFixed () {
      if ($('.header_area1').length) {
        $(window).scroll(function () {
          var scroll = $(window).scrollTop()
          if (scroll >= nav_offset_top) {
            $(".header_area1").addClass("navbar_fixed")
          } else {
            $(".header_area1").removeClass("navbar_fixed")
          }
        })
      }

    }

    navbarFixed()
  }

  render () {
    // return (
    //   <header className="header_area">
    //     <div style={{
    //       display: 'flex',
    //       flexDirection: 'row-reverse',
    //       margin: 30
    //     }}>
    //       <Route
    //         exact
    //         path={'/signin'}
    //         render={() => <Signin />}
    //       />
    //       <Route
    //         exact
    //         path={'/signup'}
    //         render={() => <Signup />}
    //       />
    //       <Route
    //         exact
    //         path={'/forgotpassword'}
    //         render={() => <ForgotPassword />}
    //       />
    //       {
    //         this.state.user ?
    //           <div>
    //             <a className='text-white-50' style={{ margin: '0 10px' }} href='#'
    //                onClick={() => firebase.auth().signOut()}>
    //               Sign out
    //             </a>
    //             <span style={{
    //               margin: '0 10px',
    //               color: 'white'
    //             }}>Hello, {firebase.auth().currentUser.displayName}</span>
    //           </div> :
    //           <div>
    //             <Link to="/signin" style={{ marginRight: 30 }} className='text-white'>
    //               Sign in
    //             </Link>
    //             <Link to="/signup">
    //               <button type="button" className="btn btn-light">Sign up</button>
    //             </Link>
    //           </div>
    //       }
    //     </div>
    //   </header>
    // )
    return (
      <div className="header_area1">
        <div className="main_menu">
          <nav className="navbar navbar-expand-lg navbar-light">
            <div className="container-fluid box_1620 m-4 d-flex flex-row-reverse">
              <Route
                exact
                path={'/signin'}
                render={() => <Signin />}
              />
              <Route
                exact
                path={'/signup'}
                render={() => <Signup />}
              />
              <Route
                exact
                path={'/forgotpassword'}
                render={() => <ForgotPassword />}
              />
              {
                this.state.user ?
                  <div>
                    <a className='text-white-50' style={{ margin: '0 10px' }} href='#'
                       onClick={() => firebase.auth().signOut()}>
                      Sign out
                    </a>
                    <span style={{
                      margin: '0 10px',
                      color: 'white'
                    }}>Hello, {this.state.user.displayName}</span>
                  </div> :
                  <div>
                    <Link to="/signin" style={{ marginRight: 30 }} className='text-white'>
                      Sign in
                    </Link>
                    <Link to="/signup">
                      <button type="button" className="btn btn-light">Sign up</button>
                    </Link>
                  </div>
              }
            </div>
          </nav>
        </div>
      </div>
    )
  }
}

export default HeaderArea
