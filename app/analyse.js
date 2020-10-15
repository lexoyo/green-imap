const {fetchMail} = require('./imap')
const {init, isUp, store, aggregated, search} = require('./es')
const {ES_INDEX} = require('./constants')

async function app() {

  const ok = await isUp()
  if(ok) {
    await init(ES_INDEX)

    const MAX_ELEMENTS = 20
    const messages = await aggregated(ES_INDEX, true)
    const byFromPromises = messages.from_aggr.buckets
      .sort((b1, b2) => b2.doc_count - b1.doc_count)
      .filter((b, idx) => idx < MAX_ELEMENTS)
      .map(b => b.key)
      .map(from => search(ES_INDEX, {from}))

    const byFrom = (await Promise.all(byFromPromises))
      .map(r => r.body.hits)
      .map(item => ({
        ...item,
        name: item.hits[0]._source.from,
        size:  item.hits.reduce((size, hit) => size + hit._source.size, 0),
      }))
    
    const bySubjectPromises = messages.subject_aggr.buckets
      .sort((b1, b2) => b2.doc_count - b1.doc_count)
      .filter((b, idx) => idx < MAX_ELEMENTS)
      .map(b => b.key)
      .map(subject => search(ES_INDEX, {subject}))
    
    const bySubject = (await Promise.all(bySubjectPromises))
      .map(r => r.body.hits)
      .map(item => ({
        ...item,
        name: item.hits[0]._source.subject,
        size:  item.hits.reduce((size, hit) => size + hit._source.size, 0),
        source:  item.hits.map(hit => JSON.stringify(hit._source)),
      }))
 
    //console.log('Messages from ES:', byFrom, bySubject)
    display('Top senders', byFrom)
    display('Top subjects', bySubject)

    return Promise.resolve()
  }
  return Promise.reject('Failed to connect to Elasticsearch')
}
function display(title, items) {
  console.log(`\n=== ${title} ===\n`)
  items.forEach(item => console.log(`${item.total.value} mails \t|\t${item.size}K \t|\t${item.name}`))
}

app()
.catch(err => {
  console.error('App error:', err, (err.meta||{}).body)
})
