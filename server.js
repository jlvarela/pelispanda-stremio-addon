#!/usr/bin/env node

const { serveHTTP, publishToCentral } = require("stremio-addon-sdk")
const addonInterface = require("./addon")
serveHTTP(addonInterface, { port: process.env.PORT || 50646 })