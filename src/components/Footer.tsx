import React from 'react'
import { makeStyles } from '@material-ui/core'
import { BLOG } from '../urls'

function Footer() {
  const useStyles = makeStyles(() => ({
    i: {
      color: 'red'
    }
  }))
  const classes = useStyles()

  return (
    <footer className="footer-area pad_btm">
      <div className="container">
        <div className="row footer-bottom d-flex justify-content-between text-center align-items-center">
          <div className="col-lg-4 col-12 mb-lg-0 mb-4 footer-social">
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://www.facebook.com/belmontrunnersclub/"
            >
              <i className="fab fa-facebook-f" />
            </a>
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://www.instagram.com/belmontrunners/"
            >
              <i className="fab fa-instagram" />
            </a>
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://www.strava.com/clubs/505246"
            >
              <i className="fab fa-strava" />
            </a>
            <a
              target="_blank"
              rel="noopener noreferrer"
              href={BLOG}
            >
              <i className="fas fa-blog" />
            </a>
          </div>
          <p className="col-lg-4 col-12 footer-text ">
            This website was built with{' '}
            <i className={`${classes.i} fas fa-heart`} aria-hidden="true" /> by{' '}
            <a
              href="https://www.oronnadiv.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              Oron Nadiv
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
