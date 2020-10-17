const {isUp, createUser, addField} = require('./es')
const {ES_INDEX} = require('./constants')

async function app() {
  const ok = await isUp()
  if(ok) {
    await createUser(ES_INDEX, 'test2', 'test2@lexoyo.me', 'test2')
   
    return Promise.resolve()
  }
  return Promise.reject('Failed to connect to Elasticsearch')
}

app()
.catch(err => {
  console.error('App error:', err, (err.meta||{}).body)
})

