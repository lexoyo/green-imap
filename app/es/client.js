const { Client } = require('@elastic/elasticsearch')

if(!process.env.ELASTIC_ENDPOINT) throw new Error('Env var ELASTIC_ENDPOINT is required')
const client = new Client({ node: process.env.ELASTIC_ENDPOINT })

module.exports = client
