import 'firebase/auth'
import firebase from 'firebase'
import React, { Component } from 'react'
import { Link, withRouter } from 'react-router-dom'
import $ from 'jquery'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import Profile from './Profile'
import Button from '@material-ui/core/Button'
import { FORGOT_PASSWORD, JOIN, MY_PROFILE, RESET_PASSWORD, ROOT, SIGN_IN } from '../urls'

class HeaderArea extends Component {

  evalNavbarFixed () {
    const nav_offset_top = $('.header_area').height() + 50

    const scroll = $(window).scrollTop()
    if (scroll >= nav_offset_top) {
      $('.header_area').addClass('navbar_fixed')
    } else {
      $('.header_area').removeClass('navbar_fixed')
    }
  }


  checkIsFixed (pathname) {
    console.log('checkIsFixed:', pathname)
    if (
      pathname !== ROOT &&
      pathname !== SIGN_IN &&
      pathname !== FORGOT_PASSWORD &&
      pathname !== RESET_PASSWORD
    ) {
      $('.header_area').addClass('navbar_fixed')
      $('.header_area').addClass('navbar_fixed_not_root')
      return true
    } else {
      $('.header_area').removeClass('navbar_fixed_not_root')
      this.evalNavbarFixed()
      return false
    }
  }

  componentDidMount () {
    const navbarFixed = () => {
      if ($('.header_area').length) {
        if (this.checkIsFixed()) {
          return
        }

        $(window).scroll(() => {
          if (this.checkIsFixed()) {
            return
          }
          this.evalNavbarFixed()
        })
      }

    }

    navbarFixed()
  }

  componentDidUpdate (prevProps) {
    if (prevProps.location.pathname.trim() !== this.props.location.pathname.trim()) {
      this.checkIsFixed()
    }

  }

  render () {
    const { isCurrentUserLoaded, currentUser } = this.props
    let totalNavItems = 0
    const isSignedOut = isCurrentUserLoaded && !currentUser && (totalNavItems += 2)
    const isSignedIn = isCurrentUserLoaded && currentUser && (totalNavItems += 3)

    return (
      <header className='header_area'>
        <div className='main_menu'>
          <nav className='navbar navbar-expand-lg navbar-light'>
            <div className='container box_1620'>
              <Link className='navbar-brand logo_h' to={ROOT}><img src="img/logo.png" alt='' /></Link>
              <button className='navbar-toggler' type='button' data-toggle='collapse'
                      data-target='#navbarSupportedContent' aria-controls='navbarSupportedContent'
                      aria-expanded='false' aria-label='Toggle navigation'>
                <span className='icon-bar' />
                <span className='icon-bar' />
                <span className='icon-bar' />
              </button>
              <div className='collapse navbar-collapse offset' id='navbarSupportedContent'
                   style={{ maxHeight: 10 + 41 * totalNavItems }}>
                <ul className='nav navbar-nav menu_nav ml-auto'>
                  <li className='nav-item' data-toggle='collapse' data-target='#navbarSupportedContent'>
                    {
                      isSignedIn &&
                      <Link to={ROOT} className='nav-link'>
                        Home
                      </Link>
                    }
                    {
                      isSignedIn &&
                      <Link to={MY_PROFILE} className='nav-link'>
                        My profile
                      </Link>

                    }
                    {
                      isSignedIn &&
                      <Link to={ROOT} className='nav-link'
                            onClick={() => firebase.auth().signOut()}>
                        Sign out
                      </Link>
                    }
                    {
                      isSignedOut &&
                      <Link to={SIGN_IN} className='nav-link'>
                        Sign in
                      </Link>
                    }
                    {
                      isSignedOut &&
                      <Link to={{
                        pathname: JOIN,
                        state: { steps: undefined }
                      }} className='nav-link'>
                        Join Us
                      </Link>
                    }
                  </li>
                  {/*<li className='nav-item submenu dropdown'>*/}
                  {/*<a href='#' className='nav-link dropdown-toggle' data-toggle='dropdown' role='button'*/}
                  {/*   aria-haspopup='true' aria-expanded='false'>Pages</a>*/}
                  {/*<ul className='dropdown-menu'>*/}
                  {/*  <li className='nav-item'>*/}
                  {/*    <a className='nav-link' href='schedule.html'>Schedule</a>*/}
                  {/*    <li className='nav-item'>*/}
                  {/*      <a className='nav-link' href='venue.html'>Venue</a>*/}
                  {/*      <li className='nav-item'>*/}
                  {/*        <a className='nav-link' href='price.html'>Pricing</a>*/}
                  {/*        <li className='nav-item'>*/}
                  {/*          <a className='nav-link' href='elements.html'>Elements</a>*/}
                  {/*        </li>*/}
                  {/*      </li>*/}
                  {/*    </li>*/}
                  {/*  </li>*/}
                  {/*</ul>*/}
                  {/*</li>*/}
                  {/*<li className='nav-item submenu dropdown'>*/}
                  {/*<a href='#' className='nav-link dropdown-toggle' data-toggle='dropdown' role='button'*/}
                  {/*   aria-haspopup='true' aria-expanded='false'>Blog</a>*/}
                  {/*<ul className='dropdown-menu'>*/}
                  {/*  <li className='nav-item'><a className='nav-link' href='blog.html'>Blog</a></li>*/}
                  {/*  <li className='nav-item'><a className='nav-link' href='single-blog.html'>Blog Details</a></li>*/}
                  {/*</ul>*/}
                  {/*</li>*/}
                  {/*<li className='nav-item'>*/}
                  {/*<a className='nav-link' href='contact.html'>Contact</a>*/}
                  {/*</li>*/}
                </ul>
                <ul className='nav navbar-nav navbar-right mt-3 mb-3'>
                  {/*<li className='nav-item'><a href='#' className='tickets_btn'>Get Tickets</a></li>*/}
                  {/*<li className='nav-item'>*/}
                  {/*  <a href='#' className='search'>*/}
                  {/*    <i className='lnr lnr-magnifier' />*/}
                  {/*  </a>*/}
                  {/*</li>*/}
                  {
                    isCurrentUserLoaded && currentUser &&
                    <li className='nav-item'>
                      <Profile />
                    </li>
                  }
                  {
                    isCurrentUserLoaded && !currentUser &&
                    <li className='nav-item'>
                      <Link to={SIGN_IN} className='signin-btn text-white'>
                        <Button className='text-white'>
                          Sign in
                        </Button>
                      </Link>
                    </li>
                  }
                  {
                    isCurrentUserLoaded && !currentUser && this.props.location.pathname.trim() !== JOIN &&
                    <li className='nav-item'>
                      <Link to={{
                        pathname: JOIN,
                        state: { steps: undefined }
                      }}>
                        <Button variant='contained' color='primary'>
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

HeaderArea.propTypes = {
  isCurrentUserLoaded: PropTypes.bool.isRequired,
  currentUser: PropTypes.object,
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired
  }).isRequired
}

const mapStateToProps = ({ currentUser: { isCurrentUserLoaded, currentUser, permissions } }) => {
  return {
    isCurrentUserLoaded,
    currentUser
  }
}

export default connect(mapStateToProps)(withRouter(HeaderArea))
