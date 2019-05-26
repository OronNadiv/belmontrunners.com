import 'firebase/firestore'
import 'firebase/auth'
import firebase from 'firebase'
import React, { Component } from 'react'
import { Link, withRouter } from 'react-router-dom'
import $ from 'jquery'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import Profile from './Profile'
import Button from '@material-ui/core/Button'
import { JOIN, SIGN_IN, USERS } from '../views/urls'
import Promise from 'bluebird'

class HeaderAreaView extends Component {

  constructor (props) {
    super(props)
    this.state = {}
  }

  loadPermissions () {
    if (!firebase.auth().currentUser) {
      return
    }
    const usersWriteRef = firebase.firestore().doc('permissions/usersWrite')
    const usersReadRef = firebase.firestore().doc('permissions/usersRead')
    Promise.all([usersWriteRef.get(), usersReadRef.get()])
      .spread((docWrite, docRead) => {
        const dataWrite = docWrite.data()
        const dataRead = docRead.data()
        this.setState({
          allowUsersPage: !!dataRead[firebase.auth().currentUser.uid] || !!dataWrite[firebase.auth().currentUser.uid]
        })
      })
  }

  checkIsFixed () {
    if (
      this.props.location.pathname.trim() === JOIN ||
      this.props.location.pathname.trim() === USERS
    ) {
      console.log('adding. this.props.location.pathname.trim():', this.props.location.pathname.trim())
      $('.header_area').addClass('navbar_fixed')
      $('.header_area').addClass('navbar_fixed_not_root')
      return true
    } else {
      console.log('removing. this.props.location.pathname.trim():', this.props.location.pathname.trim())

      $('.header_area').removeClass('navbar_fixed_not_root')
      return false
    }
  }

  componentDidMount () {
    this.loadPermissions()
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
            $('.header_area').addClass('navbar_fixed')
          } else {
            $('.header_area').removeClass('navbar_fixed')
          }
        })
      }

    }

    navbarFixed()
  }

  componentDidUpdate (prevProps) {
    prevProps.lastChanged !== this.props.lastChanged && this.loadPermissions()
    this.checkIsFixed()
  }

  render () {
    const { lastChanged } = this.props
    const { currentUser } = firebase.auth()
    let totalNavItems = 0
    this.state.allowUsersPage && (totalNavItems += 1)
    const isSignedOut = !!lastChanged && !currentUser && (totalNavItems += 2)
    const isSignedIn = !!lastChanged && currentUser && (totalNavItems += 1)

    return (
      <header className='header_area'>
        <div className='main_menu'>
          <nav className='navbar navbar-expand-lg navbar-light'>
            <div className='container box_1620'>
              <a className='navbar-brand logo_h' href='/'><img src='img/logo.png' alt='' />
              </a>
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
                  {
                    (this.state.allowUsersPage) &&
                    <li className='nav-item'>
                      <a className='nav-link' href={USERS}>
                        Users
                      </a>
                    </li>
                  }
                  <li className='nav-item'>
                    {
                      isSignedIn &&
                      <a className='nav-link' href='/'
                         rel='noopener noreferrer'
                         onClick={() => firebase.auth().signOut()}>
                        Sign out
                      </a>
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
                    !!lastChanged && currentUser &&
                    <li className='nav-item'>
                      <Profile />
                    </li>
                  }
                  {
                    !!lastChanged && !currentUser &&
                    <li className='nav-item'>
                      <Link to={SIGN_IN} className='signin-btn text-white'>
                        <Button className='text-white'>
                          Sign in
                        </Button>
                      </Link>
                    </li>
                  }
                  {
                    !!lastChanged && !currentUser && this.props.location.pathname.trim() !== JOIN &&
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
