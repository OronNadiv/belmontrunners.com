import React, { useEffect, useState } from 'react'
import { makeStyles } from '@material-ui/core'

const ig = require('instagram-scraping')

interface ISource {
  src: string
}

interface IMedia {
  media_id: string
  thumbnail_resource: ISource[]
  text: string
}

interface IFeed {
  medias: IMedia[]
}

const initialFeed: IFeed | undefined = undefined

function Footer() {
  const useStyles = makeStyles(() => ({
    i: {
      color: 'red'
    }
  }))
  const classes = useStyles()

  const [feed, setFeed] = useState(initialFeed)

  useEffect(() => {
    ig.scrapeUserPage('belmontrunners').then((result: any) => {
      setFeed(result)
    })
  }, [])

  const getRssFeed = () => {
    if (!feed) {
      return null
    }
    const getImage = (media: IMedia) => {
      return (
        <li key={media.media_id}>
          <a
            href="https://www.instagram.com/belmontrunners/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              style={{ height: 58, width: 58 }}
              src={media.thumbnail_resource[0].src}
              alt={media.text}
            />
          </a>
        </li>
      )
    }
    return (
      <div className="single-footer-widget instafeed">
        <h6 className="footer_title text-center">Instagram Feed</h6>
        <ul className="list instafeed d-flex flex-wrap justify-content-center">
          {feed.medias.slice(0, 4).map(media => {
            return getImage(media)
          })}
        </ul>
        <ul className="list instafeed d-flex flex-wrap justify-content-center">
          {feed.medias.slice(4, 8).map(media => {
            return getImage(media)
          })}
        </ul>
      </div>
    )
  }

  return (
    <footer className="footer-area pad_btm">
      <div className="container">
        <div className="row footer-bottom d-flex justify-content-between text-center align-items-center">
          <div className="col-lg-4 col-md-12 footer-social">
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
              href="https://blog.belmontrunners.com"
            >
              <i className="fas fa-blog" />
            </a>
          </div>
          <div className="col-lg-4 col-md-12 my-md-4">{getRssFeed()}</div>
          <p className="col-lg-4 col-md-12 footer-text ">
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
