import React, { Component } from 'react'
// import './HeaderArea.css'
import { Link, Route } from "react-router-dom"
import firebase from 'firebase'
import 'firebase/auth'
import Signin from './Signin'
import Signup from './Signup'
import ForgotPassword from './ForgotPassword'
import $ from 'jquery'
import Avatar from 'react-avatar'

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
    const nav_offset_top = $('.header_area').height() + 50
    console.log('nav_offset_top:', nav_offset_top)

    function navbarFixed () {
      if ($('.header_area').length) {
        $(window).scroll(function () {
          var scroll = $(window).scrollTop()
          if (scroll >= nav_offset_top) {
            $(".header_area").addClass("navbar_fixed")
          } else {
            $(".header_area").removeClass("navbar_fixed")
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
      <header className="header_area">
        <div className="main_menu">
          <nav className="navbar navbar-expand-lg navbar-light">
            <div className="container box_1620">
              <a className="navbar-brand logo_h" href="index.html"><img src="img/logo.png" alt="" />
              </a>
              <button className="navbar-toggler" type="button" data-toggle="collapse"
                      data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent"
                      aria-expanded="false" aria-label="Toggle navigation">
                <span className="icon-bar"></span>
                <span className="icon-bar"></span>
                <span className="icon-bar"></span>
              </button>
              <div className="collapse navbar-collapse offset" id="navbarSupportedContent">
                <ul className="nav navbar-nav menu_nav ml-auto">
                  <li className="nav-item active"><a className="nav-link" href="index.html">Home</a></li>
                  <li className="nav-item">
                    <a className="nav-link" href="about-us.html">About</a>
                  </li>
                  <li className="nav-item"><a className="nav-link" href="speakers.html">Speakers</a>
                  </li>
                  <li className="nav-item submenu dropdown">
                    <a href="#" className="nav-link dropdown-toggle" data-toggle="dropdown" role="button"
                       aria-haspopup="true" aria-expanded="false">Pages</a>
                    {/*<ul className="dropdown-menu">*/}
                    {/*  <li className="nav-item">*/}
                    {/*    <a className="nav-link" href="schedule.html">Schedule</a>*/}
                    {/*    <li className="nav-item">*/}
                    {/*      <a className="nav-link" href="venue.html">Venue</a>*/}
                    {/*      <li className="nav-item">*/}
                    {/*        <a className="nav-link" href="price.html">Pricing</a>*/}
                    {/*        <li className="nav-item">*/}
                    {/*          <a className="nav-link" href="elements.html">Elements</a>*/}
                    {/*        </li>*/}
                    {/*      </li>*/}
                    {/*    </li>*/}
                    {/*  </li>*/}
                    {/*</ul>*/}
                  </li>
                  <li className="nav-item submenu dropdown">
                    <a href="#" className="nav-link dropdown-toggle" data-toggle="dropdown" role="button"
                       aria-haspopup="true" aria-expanded="false">Blog</a>
                    {/*<ul className="dropdown-menu">*/}
                    {/*  <li className="nav-item"><a className="nav-link" href="blog.html">Blog</a></li>*/}
                    {/*  <li className="nav-item"><a className="nav-link" href="single-blog.html">Blog Details</a></li>*/}
                    {/*</ul>*/}
                  </li>
                  <li className="nav-item"><a className="nav-link" href="contact.html">Contact</a>
                  </li>
                </ul>
                <ul className="nav navbar-nav navbar-right">
                  {/*<li className="nav-item"><a href="#" className="tickets_btn">Get Tickets</a></li>*/}
                  {/*<li className="nav-item">*/}
                  {/*  <a href="#" className="search">*/}
                  {/*    <i className="lnr lnr-magnifier" />*/}
                  {/*  </a>*/}
                  {/*</li>*/}
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
                    this.state.user &&
                    <li className="nav-item">
                      <a className='signout-btn text-white-50' href='#'
                         onClick={() => firebase.auth().signOut()}>
                        Sign out
                      </a>
                      <span style={{
                        margin: '0 10px',
                        color: 'white'
                      }}>Hello, {this.state.user.displayName}</span>
                        <span className="dropdown-toggle">
                          <Avatar name={this.state.user.displayName} round color='#6247ea' size={40} />
                          <span className="caret" />
                        </span>
                    </li>
                  }
                  {
                    !this.state.user &&
                    <li className="nav-item">
                      <Link to="/signin" style={{ marginRight: 30 }} className='signin-btn text-white'>
                        Sign in
                      </Link>
                    </li>
                  }
                  {
                    !this.state.user &&
                    <li className="nav-item">
                      <Link to="/signup">
                        <button type="button" className="btn btn-light">Sign up</button>
                      </Link>
                    </li>

                  }
                </ul>
              </div>
            </div>
          </nav>
        </div>
      </header>
    )
    /*
    return (
      <div className="header_area">
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
     */
  }
}

export default HeaderArea
