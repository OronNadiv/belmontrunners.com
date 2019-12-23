#!/usr/bin/env node

import GenerateICal from './generateIcal'

GenerateICal()()
  .then((res) => {
    console.info('res:', res)
    return
  })
  .catch((err) => {
    console.info('err', err)
  })
