const { Client } = require('@elastic/elasticsearch')

if(!process.env.ELASTIC_ENDPOINT) throw new Error('Env var ELASTIC_ENDPOINT is required')
const client = new Client({ node: process.env.ELASTIC_ENDPOINT })

exports.health = async function() {
  return client.cluster.health()
}
exports.isUp = async function() {
  try {
    await client.ping()
    return true
  } catch(e) {
    return false
  }
}

exports.reset = async function(index) {
  return client.indices.delete({
    index,
  })
}

exports.init = async function(index) {
  try {
    await client.indices.create({
      index,
    })
  } catch(e) {
    // assume this is because the index exists
  }
  //await client.indices.close({ index })
  //await client.indices.putSettings({
  //  index,
  //  body: {
  //      "similarity": {
  //        "my_similarity": {
  //          "type": "BM25",
  //        }
  //      }
  //  },
  //})
  //await client.indices.open({ index })
  // await client.indices.putMapping({
  //   index,
  //   body: {
  //     properties: {
  //       default_similar_title: {
  //         type: 'text',
  //       },
  //       similar_title: {
  //         type: 'text',
  //         similarity: 'boolean',
  //       },
  //     },
  //   }
  // })
  await client.indices.putMapping({
    index,
    body: {
      properties: {
        //subject: { "type": "text", similarity: 'BM25' },
        subject: { "type": "keyword" },
        from: { "type": "keyword" },
        to: { "type": "keyword" },
        flags: { "type": "keyword" },
        date: { "type": "date" },
      },
    },
  })
  return Promise.resolve()
}

exports.store = async function(index, id, body, owner) {
  //console.log('store', {index, id, body})
  await client.index({
    index,
    id,
    body: {
      ...body,
      owner,
    },
  })
}

exports.search = async function(index, match) {
  return client.search({
    index,
    body: {
      query: {
        match,
      },
    },
  })
}

exports.aggregated = async function(index, filterOutSeen) {
  const query = filterOutSeen ? {
    bool: {
      filter: 
      {
        term: {
          flags: "\\Seen",
        },
      },
    }
  } : undefined
  const result = await client.search({
    index,
    body: { 
      query,
      aggregations: {
        // test: {
        //   //string_stats: {field: 'subject.keyword'},
        //   //string_stats: {field: 'from'},
        //   //avg: {field: 'uid'},
        //   //"terms" : { "field" : "from.text" },
        //   //"terms" : { "field" : "from.keyword" },
        // },
        subject_aggr: {
          "terms" : {
            "field" : "subject",
            size: 99999999,
            //"order": { "_count": "asc" },
          },
        },
        from_aggr: {
          "terms" : {
            "field" : "from",
            size: 99999999,
            //"order": { "_count": "asc" },
          },
        }
      }
    }
    // body: {
    //     "aggs" : {
    //         "dairy_prices" : {
    //             "filter" : { "term" : { "department": "Dairy" } },
    //             "aggs" : {
    //               "avg_dairy_price" : { "avg" : { "field" : "price" } }
    //             }
    //         }
    //     }
    // }
    // body: {
    //   aggs: {
    //     test: {
    //       filter: {
    //         term: {
    //           test: 'true',
    //         },
    //       },
    //       aggs: {
    //         size_avg: {
    //           avg: {
    //             field: 'modseq',
    //           },
    //         },
    //       },
    //     },
    //   },
    // },
    //body: {
    //  query: {
    //    simple_query_string: {
    //      query: 'aaa',
    //      fields: ['some_field'],
    //    },
    //  },
    //},
  })
  //return Object.keys(result.body.aggregations).map(k => result.body.aggregations[k].buckets)
  return result.body.aggregations//.hits.hits.map(h => h._source)
  //return result.body.hits.hits.map(h => h._source)
}

// add a key value to all documents source
exports.addField = async function(index, name, value) {
  return await client.updateByQuery({
    index,
    body: {
    script : `ctx._source.${name} = '${value}'`,
    },
  })
}

exports.createRole = async function(index, name, term) {
  return await client.security.putRole({
    name,
    body: {
      
          indices: [
            {
            names: [index],
            "privileges" : [ "read" ],
            query: {
              template: {
                source: {
                  term,
                }
              }
            }
            }
          ]
    }
  })
}

exports.createUser = async function(index, username, email, name) {
  return await client.security.putUser({
    username,
    body: {
      password: 'testtest',
      roles: ['registered_user'],
      full_name: name,
      email,
    },
  })
}

