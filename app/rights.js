const {isUp, createRole, addField} = require('./es')
const {ES_INDEX} = require('./constants')

async function app() {
  const ok = await isUp()
  if(ok) {
    await addField('emails', 'owner', 'test')
    
    await createRole('emails', 'registered_user', {
      'owner': '{{_user.username}}',
    })    
    
    return Promise.resolve()
  }
  return Promise.reject('Failed to connect to Elasticsearch')
}

app()
.catch(err => {
  console.error('App error:', err, (err.meta||{}).body)
})

