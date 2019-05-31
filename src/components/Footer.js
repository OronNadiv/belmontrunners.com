import React, { Component } from 'react'

class Footer extends Component {
  render () {
    return (
      <footer className='footer-area pad_btm'>
        <div className='container'>
          <div className='row footer-bottom d-flex justify-content-between align-items-center'>
            <p className='col-lg-8 col-md-8 m-0 footer-text'>
              This website was built with <i style={{ color: 'red' }}
                                             className='fas fa-heart '
                                             aria-hidden='true' /> by <a
              href='https://www.oronnadiv.com' target='_blank' rel='noopener noreferrer'>Oron
              Nadiv</a>
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