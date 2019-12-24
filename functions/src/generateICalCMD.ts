#!/usr/bin/env node

import GenerateICal from './generateICal'

GenerateICal()()
  .then((res) => {
    console.info('res:', res)
    return
  })
  .catch((err) => {
    console.info('err', err)
  })
