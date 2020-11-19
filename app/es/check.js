const client = require('./client')

module.exports = async function() {
  try {
    await client.ping()
    //await client.cluster.health()
    return true
  } catch(e) {
    return false
  }
}


