import React from "react";

const History = () => {
  return (
      <section className="history_area p_120">
        <div className="container">
          <div className="main_title">
            <h2>Our History</h2>
          </div>


          <div className="row row_odd">
            <div className="ml-lg-auto col-lg-4 col-xs-12">
              <img
                  className="img-fluid rounded d-block mx-auto"
                  src="img/about-us/taco-run.png"
                  alt=""
              />
            </div>

            <div className="col-lg-5 offset-lg-1 mr-lg-auto pt-lg-3 pt-5">
              <p>
                Our club history starts in the Summer of 2018, with the
                inaugural Belmont Water Dog Run. Then Mayor, Doug Kim, had been
                working with Stephanie Davies and the Belmont Chamber of
                commerce to start this new local race.
              </p>
              <p>
                The weeks following up to the event, there were several
                “training runs” meeting at Water Dog Tavern; running up Lake
                Road Trail and ending with a social hour in the Beer Garden.
                Attendance for these events were between 20-30 people.
              </p>
            </div>
          </div>


          <div className="row row_even pad_top">
            <div
                className="ml-lg-auto col-lg-5 order-1 order-lg-0 pt-lg-3 pt-5">
              <p>
                The first Water Dog Run itself was a resounding success, with
                over 900 runners (and dogs) coming out! It was apparent that
                Belmont had a very strong running contingent, but the area
                itself did not really have a focal running club.
              </p>
              <p>
                Doug began to work with Theresa Saito at the Belmont Library to
                begin coordinating Thursday Evening Group runs as the official
                paperwork started to get filed.
              </p>
            </div>

            <div className="col-lg-4 offset-lg-1 mr-lg-auto order-0 order-lg-1">
              <img
                  className="img-fluid rounded d-block mx-auto"
                  src="img/about-us/library.png"
                  alt=""
              />
            </div>
          </div>


          <div className="row row_odd pad_top">
            <div className="ml-lg-auto col-lg-4">
              <img
                  className="img-fluid rounded d-block mx-auto"
                  src="img/about-us/trail.png"
                  alt=""
              />
            </div>

            <div className="col-lg-5 offset-lg-1 mr-lg-auto pt-lg-3 pt-5">
              <p>
                We held our first official run on December 6th as Belmont
                Runners.
              </p>
              <p>
                Over the months, we grew dramatically. The library ended its
                formal partnership with us and we looked to expand our horizons.
                Our first board formed with Doug Kim, Jon VanHorn, Kelsey Homyk,
                Oron Nadiv, Shelly Kim and Theresa Saito.
              </p>
              <p>
                The club went from meeting every other Saturday to hosting four
                runs every week. We added special event runs, beer runs, fitness
                classes – and at every turn the club was there to support us.
              </p>
            </div>
          </div>

          <div className="row row_even pad_top">
            <div
                className="ml-lg-auto col-lg-5 order-1 order-lg-0 pt-lg-3 pt-5">
              <p>
                We were looking to bigger and better things for 2020, until the
                Pandemic changed everything. As we are slowly starting to emerge
                from these challenging times, we cannot wait to share the next
                chapter of our story with you.
              </p>
              <p>
                In the end, the most important key to our success is you. We are
                incredibly thankful for the continued support we receive from
                our community. Thank you all!
              </p>
            </div>

            <div className="col-lg-4 offset-lg-1 mr-lg-auto order-0 order-lg-1">
              <img
                  className="img-fluid rounded d-block mx-auto"
                  src="img/about-us/social.png"
                  alt=""
              />
            </div>
          </div>

        </div>
      </section>
  );
};

export default History;
