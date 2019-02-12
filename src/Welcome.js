import React, { Component } from 'react'

class Welcome extends Component {
  render () {
    return (
      <section className="welcome_area p_120">
        <div className="container">
          <div className="welcome_inner row">
            <div className="col-lg-5">
              <div className="welcome_img">
                <img className="img-fluid rounded" src="img/runners-on-trail.png" alt="" />
              </div>
            </div>
            <div className="col-lg-6 offset-lg-1">
              <div className="welcome_text">
                <h3>Welcome to Belmont Runners Club</h3>
                <p>We are a casual group of runners and walkers looking to build a community of friendly,
                  active locals who enjoy fitness and the great outdoors. Join us for regular group events as we
                  take advantage of our great local trails and roads.
                  We welcome runners and walkers of all abilities.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }
}

export default Welcome