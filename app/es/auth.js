const client = require('./client')

module.exports = async function({username, password}) {
  console.log('xx', username, password)
  const result = await client.security.get_token({
    body: {
      grant_type: 'password',
      username,
      password,
    }
  })
  return result.body
}

