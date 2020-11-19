exports.getError = function({name, message, statusCode, body, meta, headers}) {
  return {
    name,
    message,
    statusCode,
    body,
    // meta,
    // headers,
  }
}

exports.getStatus = function({statusCode}) {
  return statusCode
}
