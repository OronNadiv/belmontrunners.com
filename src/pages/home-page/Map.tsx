import React from 'react'
import { GoogleApiWrapper, Map as GoogleMap } from 'google-maps-react'
import * as PropTypes from 'prop-types'

function Map({ google }: { google: any }) {
  return (
    <section className="home_map_area">
      <div id="mapBox2" className="mapBox2">
        {/*data-lat="37.5214784"*/}
        {/*data-lon="-122.26"*/}
        {/*data-zoom="14"*/}
        {/*data-mlat="37.5214784"*/}
        {/*data-mlon="-122.26">*/}
        <GoogleMap
          google={google}
          // @ts-ignore
          zoom={14}
          initialCenter={{
            lat: 37.5214784,
            lng: -122.26
          }}

          scrollwheel={false}
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
                <h4>
                  <a
                      href='mailto:info@belmontrunners.com'
                      target='_blank'
                      rel='noreferrer noopener'>info@belmontrunners.com</a>
                </h4>
                <p>Send us your query anytime!</p>
              </div>
            </div>
            {/*<div className="media">*/}
            {/*  <div className="d-flex">*/}
            {/*    <i className="lnr lnr-phone-handset" />*/}
            {/*  </div>*/}
            {/*  <div className="media-body">*/}
            {/*    <h4>Phone number</h4>*/}
            {/*    <p>(650) 123-4567</p>*/}
            {/*  </div>*/}
            {/*</div>*/}
          </div>
        </div>
      </div>
    </section>
  )
}

Map.propTypes = {
  google: PropTypes.object.isRequired
}

if (!process.env.REACT_APP_GOOGLE_MAPS_API_KEY) {
  console.error('Missing REACT_APP_GOOGLE_MAPS_API_KEY')
}

export default GoogleApiWrapper({
  apiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || 'KEY_NOT_FOUND'
})(Map)
