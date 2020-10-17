const {isUp, health, reset, init, store, list, addField, createRole} = require('./es')
const {ES_INDEX} = require('./constants')

async function app() {
//  //await reset(ES_INDEX)
//  await init(ES_INDEX)
//  await store(ES_INDEX, 'id1', {
//    some_field: 'test of text'
//  })
//  await store(ES_INDEX, 'id2', {
//    some_field: 'test of text 2'
//  })
//  const result = await list(ES_INDEX)
//  console.log('RESULT', {result})
  console.log(await isUp())
  //return addField('emails', 'owner', 'lexoyo')
  return createRole('emails', 'user-role', {
    'owner': '{{_user.username}}',
  })
}

app()
.catch(err => {
  console.error('App error:', err, (err.meta||{}).body)
})
