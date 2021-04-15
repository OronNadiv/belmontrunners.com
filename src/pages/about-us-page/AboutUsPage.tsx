import React, { useEffect } from 'react'
import { animateScroll } from 'react-scroll'
import Leadership from "./Leadership"
import MissionStatement from "./MissionStatement";
import History from "./History";

function AboutUsPage() {
  useEffect(() => {
    animateScroll.scrollToTop({ duration: 0 })
  }, [])

  return (
    <>
      <MissionStatement />
      <Leadership />
      <History />
      {/*<RunLeaders />*/}
    </>
  )
}

export default AboutUsPage
