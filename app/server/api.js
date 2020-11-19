const router = require('express').Router()
const auth = require('../es/auth')
const {getStatus, getError } = require('../es/error')

router.post('/login', async function(req, res, next) {
  try {
    const result = await auth(req.body)
    res.json(result)
  } catch(e) {
    res.status(getStatus(e)).json(getError(e))
  }
})

module.exports = router
