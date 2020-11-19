const Imap = require('imap')
 
if(!process.env.IMAP_USER) throw new Error('Env var IMAP_USER is required')
if(!process.env.IMAP_PASSWORD) throw new Error('Env var IMAP_PASSWORD is required')
if(!process.env.IMAP_HOST) throw new Error('Env var IMAP_HOST is required')
const imap = new Imap({
  user: process.env.IMAP_USER,
  password: process.env.IMAP_PASSWORD,
  host: process.env.IMAP_HOST,
  port: process.env.IMAP_PORT || 993,
  tls: true
});

function flattenMailboxes(mailboxes, parentPath = '') {
  console.log('xxx', mailboxes, parentPath)
  const arr = Object.keys(mailboxes)
    .map(name => ({
      ...mailboxes[name],
      path: parentPath + name,
    }) )
  Object.values(mailboxes)
    .filter(box => !!box.children)
    .forEach(box => arr.push(flattenMailboxes(box.children, parentPath + box.delimiter)))
  return arr
}
function getBoxesOfInterest(mailboxes) {
  return flattenMailboxes(mailboxes)
    .filter(box => !['\\Drafts', '\\Sent', '\\Junk', '\\Trash'].includes(box.special_use_attrib))
    .map(box => box.path)
}
 
async function getBoxes() {
  return new Promise((resolve, reject) => {
    imap.getBoxes((error, mailboxes) => {
      const result = getBoxesOfInterest(mailboxes)
      console.log(error, JSON.stringify(result), mailboxes)
      resolve(result)
    })
  })
}

function openInbox(cb) {
  imap.openBox('INBOX', true, cb);
}

exports.fetchMail = async function(numMessages, onMessage) {
  return new Promise((resolve, reject) => {
    const messageQueue = new Map()
    function updateMessages(prefix, messagePartial) {
      if(!messageQueue.has(prefix)) messageQueue.set(prefix, {})
      messageQueue.set(prefix, {
        ...messageQueue.get(prefix),
        ...messagePartial,
      })
      const message = messageQueue.get(prefix)
      if(message.headerDone && message.attrsDone) {
        delete message.attrsDone
        delete message.headerDone
        messageQueue.delete(prefix)
        onMessage(message)
      }
    }

    imap.once('ready', async function() {
      const boxes = await getBoxes()
      boxes.forEach(boxName => {
        openInbox(function(err, box) {
          if (err) throw err;
          console.time(`${numMessages} messages`)
          var f = imap.seq.fetch('1:' + numMessages, {
            bodies: 'HEADER.FIELDS (FROM TO SUBJECT DATE)',
            struct: true
          });
          f.on('message', function(msg, seqno) {
            var prefix = '(#' + seqno + ') ';
            messageQueue[prefix] = { headerDone: false, attrsDone: false}
            msg.on('body', function(stream, info) {
              var buffer = '';
              const size = info.size
              stream.on('data', function(chunk) {
                buffer += chunk.toString('utf8');
              });
              stream.once('end', function() {
                const header = Imap.parseHeader(buffer)
                const subject = header.subject ? header.subject[0] : '' // no subject sometimes
                const from = header.from ? header.from[0] : ''
                const { to } = header
                updateMessages(prefix, {
                  size,
                  subject, from, to,
                  headerDone: true,
                })
              });
            });
            msg.once('attributes', function(attrs) {
              const { date, flags, uid, modseq } = attrs
              updateMessages(prefix, {
                date, flags, uid, modseq,
                attrsDone: true,
              })
            });
            // msg.once('end', function() {
            //   console.log(prefix + 'Finished');
            // });
          });
          f.once('error', function(err) {
            reject('Fetch error: ' + err);
          });
          f.once('end', function() {
            imap.end();
            console.timeEnd(`${numMessages} messages`)
            resolve()
          });
        });
      })
    });

    imap.once('error', function(err) {
      reject(err);
    });

    imap.once('end', function() {
      console.log('Connection ended');
    });

    imap.connect();

  })
}
