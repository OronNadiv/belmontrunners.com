import React, { Component } from 'react'
import { Link, Route } from "react-router-dom"
import 'firebase/auth'
import SignIn from '../identity/SignIn'
import SignUp from '../identity/SignUp'
import ForgotPassword from '../identity/ForgotPassword'
import $ from 'jquery'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { signOut as signOutAction } from '../identity/identityActions'
import Profile from './Profile'

class HeaderAreaView extends Component {
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
    const currentUser = this.props.currentUser
    console.log('currentUser', currentUser)
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
                  {
                    currentUser &&
                    <li className="nav-item">
                      <Profile />
                    </li>
                  }
                  {
                    !currentUser &&
                    <li className="nav-item">
                      <Link to="/signin" style={{ marginRight: 30 }} className='signin-btn text-white'>
                        Sign in
                      </Link>
                    </li>
                  }
                  {
                    !currentUser &&
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
  }
}

HeaderAreaView.propTypes = {
  currentUser: PropTypes.object
}

const mapDispatchToProps = {
  signOut: signOutAction
}

const mapStateToProps = (state) => {
  return {
    currentUser: state.currentUser.get('data')
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(HeaderAreaView)
