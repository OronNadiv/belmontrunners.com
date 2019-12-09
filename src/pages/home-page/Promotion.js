import React from "react";
import Slider from "react-slick";

const Promotion = () => {
  const settings = {
    autoplay: true,
    dots: true,
    arrows: false
  };

  return (
    <section className="promotion_area pad_btm">
      <div className="container">
        <div className="main_title">
          <h2>Winter Fundraiser</h2>
        </div>
        <div className='row'>
          <div className="col-lg-6">
            <div className='text-center'>
              <Slider {...settings}>
                <div>
                  <img className='img-fluid rounded' src='/img/promotion/PO36830499-frontA.png'
                       alt="Belmont Runners Winter Fundraiser Fundraiser - unisex shirt design - front" />
                </div>
                <div>
                  <img className='img-fluid rounded' src='/img/promotion/PO36830499-frontW.png'
                       alt='Belmont Runners Winter Fundraiser Fundraiser - unisex shirt design - front' />
                </div>
                <div>
                  <img className='img-fluid rounded' src='/img/promotion/PO36830499-frontH.png'
                       alt="Belmont Runners Winter Fundraiser Fundraiser - unisex shirt design - front" />
                </div>
                <div>
                  <img className='img-fluid rounded' src='/img/promotion/PO36830499-frontL.png'
                       alt='Belmont Runners Winter Fundraiser Fundraiser - unisex shirt design - front' />
                </div>
              </Slider>
            </div>
          </div>
          <div className="col-lg-5 offset-lg-1 my-5">
            <p className='font-weight-bold'>
              Need a gift for that runner in you life?
            </p>
            <p>
              We are excited to announce our some new awesome gear with featuring the Belmont Runners logo!
            </p>
            <p>
              Orders will be available until Dec 23rd and we expect orders to arrive by Jan 8th.
            </p>
            <p>
              All of the proceeds from purchases get put right back into the run club.
            </p>
            <div className='text-center single-footer-widget mt-5'>
              <a href='https://www.customink.com/fundraising/belmont-runners'
                 target="_blank"
                 rel="noopener noreferrer"
                 className="btn sub-btn" style={{ position: "initial", color: "white" }}>Buy / Donate</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Promotion;
