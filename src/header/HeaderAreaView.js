import React, { Component } from 'react'
import { Link } from "react-router-dom"
import 'firebase/auth'
import $ from 'jquery'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { signIn as signInAction, signOut as signOutAction } from '../identity/identityActions'
import Profile from './Profile'
import Button from '@material-ui/core/Button'

class HeaderAreaView extends Component {
  componentDidMount () {
    const nav_offset_top = $('.header_area').height() + 50
    console.log('nav_offset_top:', nav_offset_top)

    function navbarFixed () {
      if ($('.header_area').length) {
        $(window).scroll(function () {
          const scroll = $(window).scrollTop()
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
                <span className="icon-bar" />
                <span className="icon-bar" />
                <span className="icon-bar" />
              </button>
              <div className="collapse navbar-collapse offset" id="navbarSupportedContent">
                <ul className="nav navbar-nav menu_nav ml-auto">
                  <li className="nav-item active">
                    <a className="nav-link" href="/">Home</a>
                  </li>
                  {
                    // TODO: uncomment
                    // currentUser && currentUser.permissions && currentUser.permissions.usersList &&
                    // <li className="nav-item">
                    // <a className="nav-link" href="/members">Members</a>
                    // </li>
                  }
                  <li className="nav-item">
                    {
                      currentUser &&
                      <a className='nav-link sign-out-link' href='#' rel="noopener noreferrer"
                         onClick={() => this.props.signOut()}>
                        Sign out
                      </a>
                    }
                    {
                      !currentUser &&
                      <a className='nav-link sign-in-link' href='#' rel="noopener noreferrer"
                         onClick={() => this.props.signIn()}>
                        Sign in
                      </a>
                    }
                  </li>
                  {/*<li className="nav-item submenu dropdown">*/}
                  {/*<a href="#" className="nav-link dropdown-toggle" data-toggle="dropdown" role="button"*/}
                  {/*   aria-haspopup="true" aria-expanded="false">Pages</a>*/}
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
                  {/*</li>*/}
                  {/*<li className="nav-item submenu dropdown">*/}
                  {/*<a href="#" className="nav-link dropdown-toggle" data-toggle="dropdown" role="button"*/}
                  {/*   aria-haspopup="true" aria-expanded="false">Blog</a>*/}
                  {/*<ul className="dropdown-menu">*/}
                  {/*  <li className="nav-item"><a className="nav-link" href="blog.html">Blog</a></li>*/}
                  {/*  <li className="nav-item"><a className="nav-link" href="single-blog.html">Blog Details</a></li>*/}
                  {/*</ul>*/}
                  {/*</li>*/}
                  {/*<li className="nav-item">*/}
                  {/*<a className="nav-link" href="contact.html">Contact</a>*/}
                  {/*</li>*/}
                </ul>
                <ul className="nav navbar-nav navbar-right mt-3 mb-3">
                  {/*<li className="nav-item"><a href="#" className="tickets_btn">Get Tickets</a></li>*/}
                  {/*<li className="nav-item">*/}
                  {/*  <a href="#" className="search">*/}
                  {/*    <i className="lnr lnr-magnifier" />*/}
                  {/*  </a>*/}
                  {/*</li>*/}
                  {
                    currentUser &&
                    <li className="nav-item">
                      <Profile />
                    </li>
                  }
                  {
                    !currentUser &&
                    <li className="nav-item">
                      <Link to="/signin" className='signin-btn text-white'>
                        <Button className='text-white'>
                          Log in
                        </Button>
                      </Link>
                    </li>
                  }
                  {
                    !currentUser &&
                    <li className="nav-item">
                      <Link to="/join">
                        <Button variant="contained" color="primary">
                          Join Us
                        </Button>
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
  currentUser: PropTypes.object,
  signIn: PropTypes.func.isRequired,
  signOut: PropTypes.func.isRequired
}

const mapDispatchToProps = {
  signIn: signInAction,
  signOut: signOutAction
}

const mapStateToProps = (state) => {
  return {
    currentUser: state.currentUser.get('data')
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(HeaderAreaView)
