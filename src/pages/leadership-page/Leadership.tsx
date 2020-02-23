import React, { useEffect } from 'react'
import Board from './Board'
// import RunLeaders from './RunLeaders'

import { animateScroll } from 'react-scroll'

function Leadership() {
  useEffect(() => {
    animateScroll.scrollToTop({ duration: 0 })
  }, [])

  return (
    <div>
      <Board />
      {/*<RunLeaders />*/}
    </div>
  )
}

export default Leadership
