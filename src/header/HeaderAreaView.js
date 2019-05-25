import React, { Component } from 'react'
import { Link, withRouter } from "react-router-dom"
import 'firebase/auth'
import firebase from 'firebase'
import $ from 'jquery'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import Profile from './Profile'
import Button from '@material-ui/core/Button'
import { JOIN, USERS, SIGN_IN } from '../views/urls'

class HeaderAreaView extends Component {
  checkIsFixed () {
    if (
      this.props.location.pathname.trim() === JOIN ||
      this.props.location.pathname.trim() === USERS
    ) {
      console.log('adding. this.props.location.pathname.trim():', this.props.location.pathname.trim())
      $(".header_area").addClass("navbar_fixed")
      $(".header_area").addClass("navbar_fixed_not_root")
      return true
    } else {
      console.log('removing. this.props.location.pathname.trim():', this.props.location.pathname.trim())

      $(".header_area").removeClass("navbar_fixed_not_root")
      return false
    }
  }

  componentDidMount () {
    const nav_offset_top = $('.header_area').height() + 50
    console.log('nav_offset_top:', nav_offset_top)
    console.log('this.props.location:', this.props.location)


    const navbarFixed = () => {
      if ($('.header_area').length) {
        if (this.checkIsFixed()) {
          return
        }

        $(window).scroll(() => {
          if (this.checkIsFixed()) {
            return
          }
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

  componentDidUpdate (prevProps) {
    this.checkIsFixed()
  }

  render () {
    const { lastChanged } = this.props
    const { currentUser } = firebase.auth()

    return (
      <header className="header_area">
        <div className="main_menu">
          <nav className="navbar navbar-expand-lg navbar-light">
            <div className="container box_1620">
              <a className="navbar-brand logo_h" href="/"><img src="img/logo.png" alt="" />
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
                  {
                    // <li className="nav-item active">
                    // <a className="nav-link" href="/">Home</a>
                    // </li>
                    // TODO: uncomment
                    // currentUser && currentUser.permissions && currentUser.permissions.usersList &&
                    // <li className="nav-item">
                    // <a className="nav-link" href="/members">Members</a>
                    // </li>
                  }
                  <li className="nav-item">
                    {
                      !!lastChanged && currentUser &&
                      <a className='nav-link sign-out-link' href='/'
                         rel="noopener noreferrer"
                         onClick={() => firebase.auth().signOut()}>
                        Sign out
                      </a>
                    }
                    {
                      !!lastChanged && !currentUser &&
                      <Link to={SIGN_IN} className='nav-link sign-in-link'>
                        Sign in
                      </Link>
                    }
                    {
                      !!lastChanged && !currentUser && this.props.location.pathname.trim() !== JOIN &&
                      <Link to={{
                        pathname: JOIN,
                        state: { steps: undefined }
                      }} className='nav-link sign-in-link'>
                        Join Us
                      </Link>
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
                {
                  // TODO: fix mobile menu height when signed in vs out.
                  // TODO: feature: add admin menu to see all users and relevant information.
                }
                <ul className="nav navbar-nav navbar-right mt-3 mb-3">
                  {/*<li className="nav-item"><a href="#" className="tickets_btn">Get Tickets</a></li>*/}
                  {/*<li className="nav-item">*/}
                  {/*  <a href="#" className="search">*/}
                  {/*    <i className="lnr lnr-magnifier" />*/}
                  {/*  </a>*/}
                  {/*</li>*/}
                  {
                    !!lastChanged && currentUser &&
                    <li className="nav-item">
                      <Profile />
                    </li>
                  }
                  {
                    !!lastChanged && !currentUser &&
                    <li className="nav-item">
                      <Link to={SIGN_IN} className='signin-btn text-white'>
                        <Button className='text-white'>
                          Sign in
                        </Button>
                      </Link>
                    </li>
                  }
                  {
                    !!lastChanged && !currentUser && this.props.location.pathname.trim() !== JOIN &&
                    <li className="nav-item">
                      <Link to={{
                        pathname: JOIN,
                        state: { steps: undefined }
                      }}>
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
  lastChanged: PropTypes.number.isRequired,
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired
  }).isRequired
}

const mapStateToProps = (state) => {
  return {
    lastChanged: state.currentUser.lastChanged
  }
}

export default connect(mapStateToProps)(withRouter(HeaderAreaView))
