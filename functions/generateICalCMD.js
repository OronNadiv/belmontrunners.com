#!/usr/bin/env node

const generateICal = require('./generateICal')

generateICal()().then(console.info).catch(console.error)
