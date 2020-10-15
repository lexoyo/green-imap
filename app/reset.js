const {reset} = require('./es')
const {ES_INDEX} = require('./constants')

reset(ES_INDEX)
.then(result => console.log('Done.', {result}))
.catch(err => {
  console.error('App error:', err)
})
