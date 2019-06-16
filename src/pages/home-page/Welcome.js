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
                <h3>Welcome to Belmont Runners</h3>
                <p>
                  We are a casual group of runners looking to build a community of friendly,
                  active locals who enjoy fitness and the great outdoors. Join us for regular group events as we
                  take advantage of our great local trails and roads.
                </p>
                <p>
                  We welcome runners of all abilities by hosting training events ranging from 2 miles to
                  10k and beyond.
                </p>
                <p>
                  Our events are usually held in Belmont every Saturday morning at 8:30 am, with a special “Run of
                  the Month” held in a neighboring community (San Carlos, San Mateo, Redwood City, and even beyond). We
                  also host weekday night events in Belmont at 6 pm on Tuesdays and Thursdays.
                </p>
                <p className="font-weight-bold">
                  Stay tuned for more information by signing up for our email updates!
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