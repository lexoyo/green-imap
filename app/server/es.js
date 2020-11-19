const fs = require('fs')
const proxy = require('express-http-proxy')
const router = require('express').Router()

router.get('/*', proxy(process.env.ELASTIC_ENDPOINT, {
  preserveHostHdr: true,
  //https: false,
  //changeOrigin: true,
  // target: 'http://localhost:3000',
  // userResHeaderDecorator(headers, userReq, userRes, proxyReq, proxyRes) {
  //       // recieves an Object of headers, returns an Object of headers.
  //   console.log({headers})
  //   return headers;
  // },
  userResDecorator: function(proxyRes, proxyResData, userReq, userRes) {
    data = JSON.parse(proxyResData.toString('utf8'));
    console.log({data})
    return JSON.stringify(data);
  },
  proxyReqOptDecorator: function(proxyReqOpts, srcReq) {
    console.log('headers:', proxyReqOpts, srcReq )
    proxyReqOpts.rejectUnauthorized = false
    proxyReqOpts.headers = {
      ...proxyReqOpts.headers,
      grant_type: 'password',
      username: 'test',
      password: 'testtest',
    }

    return proxyReqOpts
  },
  proxyReqPathResolver: function (req) {
    return req.url
  },
}))

module.exports = router

