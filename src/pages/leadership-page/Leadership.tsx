import React, { useEffect } from 'react'
import Board from './Board'
// import RunLeaders from './RunLeaders'

import { goToTop } from 'react-scrollable-anchor'

function Leadership() {
  useEffect(() => {
    goToTop()
  }, [])

  return (
    <div>
      <Board />
      {/*<RunLeaders />*/}
    </div>
  )
}

export default Leadership
