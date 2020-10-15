const {reset, init, store, list} = require('./es')
const {ES_INDEX} = require('./constants')

;(async function app() {
  //await reset(ES_INDEX)
  await init(ES_INDEX)
  await store(ES_INDEX, 'id1', {
    some_field: 'test of text'
  })
  await store(ES_INDEX, 'id2', {
    some_field: 'test of text 2'
  })
  const result = await list(ES_INDEX)
  console.log('RESULT', {result})
})()
