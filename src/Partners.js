import React, { Component } from 'react'
import { shuffle } from './Random'

class Partners extends Component {
  render () {
    return (
      <section className="team_area pad_btm">
        <div className="container">
          <div className="main_title">
            <h2>Partners & Sponsors</h2>
          </div>
          <div className="row team_inner" style={{ justifyContent: "center" }}>
            {
              shuffle([
                <div className="col-lg-3 col-sm-6" key={0}>
                  <div className="team_item">
                    <div className="team_img">
                      <img className="img-fluid" src="img/partners/smclibraries2.png" alt="" />
                      <div className="hover">
                        <a target="_blank" rel="noopener noreferrer" href="https://www.facebook.com/SMCLibraries">
                          <i className="fa fa-facebook" />
                        </a>
                        <a target="_blank" rel="noopener noreferrer" href="https://twitter.com/SMCLibraries">
                          <i className="fa fa-twitter" />
                        </a>
                        <a target="_blank" rel="noopener noreferrer"
                           href="https://www.linkedin.com/company/san-mateo-county-library">
                          <i className="fa fa-linkedin" />
                        </a>
                      </div>
                    </div>
                    <div className="team_name">
                      <h4>San Mateo County Libraries</h4>
                    </div>
                  </div>
                </div>,
                <div className="col-lg-3 col-sm-6" key={1}>
                  <div className="team_item">
                    <div className="team_img">
                      <img className="img-fluid" src="img/partners/belmont2.png" alt="" />
                      <div className="hover">
                        <a target="_blank" rel="noopener noreferrer"
                           href="https://www.facebook.com/places/Things-to-do-in-Belmont-California/108517932506370">
                          <i className="fa fa-facebook" />
                        </a>
                        <a target="_blank" rel="noopener noreferrer" href="https://twitter.com/mybelmont">
                          <i className="fa fa-twitter" />
                        </a>
                      </div>
                    </div>
                    <div className="team_name">
                      <h4>City of Belmont</h4>
                    </div>
                  </div>
                </div>
              ])
            }
          </div>
        </div>
      </section>
    )
  }
}

export default Partners