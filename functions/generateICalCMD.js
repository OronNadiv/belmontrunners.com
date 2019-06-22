#!/usr/bin/env node

const generateICal = require('./generateICal')

const run = async () => {
  const res = await generateICal()()
  console.info(res)
}
run()
