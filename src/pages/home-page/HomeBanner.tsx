import React from 'react'
import { BLOG } from '../../urls'

function HomeBanner() {
  return (
    <section className="home_banner_area">
      <div className="banner_inner">
        <div className="container">
          <div className="banner_content">
            <h2>Belmont Runners</h2>
            <p>
              Running club for Belmont, San Carlos, San Mateo,
              <br />
              Redwood City and the surrounding area
            </p>
            <a
              className="banner_btn bounce"
              href={BLOG}
            >
              Latest news
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HomeBanner
