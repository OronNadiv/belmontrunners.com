import React, { Component } from 'react'
import { GoogleApiWrapper, Map as GoogleMap } from 'google-maps-react'

class Map extends Component {
  render () {
    return (
      <section className="home_map_area">
        <div id="mapBox2" className="mapBox2">
          {/*data-lat="37.5214784"*/}
          {/*data-lon="-122.26"*/}
          {/*data-zoom="14"*/}
          {/*data-mlat="37.5214784"*/}
          {/*data-mlon="-122.26">*/}
          <GoogleMap google={this.props.google}
                     zoom={14}
                     initialCenter={{
                       lat: 37.5214784,
                       lng: -122.26
                     }}
                     scrollwheel={false}
                     navigationControl={false}
                     mapTypeControl={false}
                     scaleControl={false}
                     draggable={false}
                     streetViewControl={false}
                     zoomControl={false}
                     fullscreenControl={false}
          />
        </div>

        <div className="home_details">
          <div className="container">
            <div className="box_home_details">
              <div className="media">
                <div className="d-flex">
                  <i className="lnr lnr-envelope" />
                </div>
                <div className="media-body">
                  <h4>belmontrunners@gmail.com
                    {/*<a style="color: #222222;" href="mailto:belmontrunners@gmail.com"*/}
                    {/*target="_top">belmontrunners@gmail.com</a>*/}
                  </h4>
                  <p>Send us your query anytime!</p>
                </div>
              </div>
              <div className="media">
                <div className="d-flex">
                  <i className="lnr lnr-phone-handset" />
                </div>
                <div className="media-body">
                  <h4>Phone number</h4>
                  <p>(650) 239-6300</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }
}

export default GoogleApiWrapper({
  apiKey: 'AIzaSyBPgHuk6L4BnzuKsTuyqGEDn6_JkK7meM4'
})(Map)
