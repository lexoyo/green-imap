const { Client } = require('@elastic/elasticsearch')
const client = new Client({ node: 'http://localhost:9200' })

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

exports.store = async function(index, id, body) {
  //console.log('store', {index, id, body})
  await client.index({
    index,
    id,
    body,
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
