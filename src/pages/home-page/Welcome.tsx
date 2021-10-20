import React from 'react'
import {EVENTS_HASH, ROOT, SUBSCRIBE_HASH} from '../../urls';
import {Link} from 'react-router-dom'

function Welcome() {
  return (
    <section className="welcome_area p_120">
      <div className="container">
        <div className="welcome_inner row">
          <div className="col-lg-5">
            <div className="welcome_img">
              <img
                  className="img-fluid rounded shadow"
                  src="img/welcome.png"
                  alt=""
              />
            </div>
          </div>
          <div className="col-lg-6 offset-lg-1">
            <div className="welcome_text">
              <h3>Welcome to Belmont Runners</h3>
              <p>
                The Belmont Runners are a casual group of runners looking to
                build a community of friendly, active locals who enjoy fitness
                and the great outdoors. Join us for regular group events as we
                take advantage of our great local trails and roads.
              </p>
              <p>
                We welcome runners of any ability to join our <Link
                  to={`${ROOT}${EVENTS_HASH}`}>events</Link>, which usually
                range between 5k to 10k.
              </p>
              <p>
                Our club offers multiple runs per week in various locations on
                the Peninsula. We will also have special &quotmembers only&quot
                events throughout the year.
              </p>
              <p className="font-weight-bold">
                Stay tuned for more information by <Link
                  to={`${ROOT}${SUBSCRIBE_HASH}`}>signing up</Link> for our
                email updates!
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Welcome
