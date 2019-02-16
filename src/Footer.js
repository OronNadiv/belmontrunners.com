import React, { Component } from 'react'

class Footer extends Component {
  render () {
    return (
      <footer className='footer-area pad_btm'>
        <div className='container'>
          <div className='row footer-bottom d-flex justify-content-between align-items-center'>
            <p className='col-lg-8 col-md-8 footer-text m-0'>
              Copyright &copy;{new Date().getFullYear()} All rights reserved | This template is made with <i
              className='far fa-heart'
              aria-hidden='true' /> by <a
              href='https://colorlib.com' target='_blank' rel='noopener noreferrer'>Colorlib</a>
            </p>
            <div className='col-lg-4 col-md-4 footer-social'>
              <a target='_blank' rel='noopener noreferrer' href='https://www.facebook.com/belmontrunnersclub/'>
                <i className='fab fa-facebook-f' />
              </a>
              <a target='_blank' rel='noopener noreferrer' href='https://www.instagram.com/belmontrunners/'>
                <i className='fab fa-instagram' />
              </a>
              <a target='_blank' rel='noopener noreferrer' href='https://www.strava.com/clubs/505246'>
                <i className='fab fa-strava' />
              </a>
            </div>
          </div>
        </div>
      </footer>
    )
  }
}

export default Footer