const {fetchMail} = require('./imap')
const {health, isUp, store, init, reset} = require('./es')
const {NUM_EMAILS, ES_INDEX, CLEAR_BEFORE_IMPORT} = require('./constants')

async function app() {
  let idx = 0
  const ok = await isUp()
  if(ok) {
    if(CLEAR_BEFORE_IMPORT) await reset(ES_INDEX)
    await init(ES_INDEX)
    await fetchMail(NUM_EMAILS, async message => {
      await store(ES_INDEX, message.uid, message, 'test2')
      console.log('MESSAGE', idx++, message.subject)
    })

    return Promise.resolve()
  }
  return Promise.reject('Failed to connect to Elasticsearch')
}

app()
.catch(err => {
  console.error('App error:', err, (err.meta||{}).body)
})
