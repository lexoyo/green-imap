# Green Imap tool

## Road map

Alpha 1

A cli

* [x] Load all emails
* [x] Group emails by to, from, subject similarity
* [x] Filter by status - seen, flagged
* [ ] Sort by size, date
* [ ] Batch delete, flag, move

Bonus: compare email providers speed

* [ ] Gandi
* [ ] OVH
* [x] Fastmail - 20K msg/min
* [ ] Gmail
* [ ] Yahoo

## Run

1. [Install and start elastic search](https://www.elastic.co/guide/en/elasticsearch/reference/current/getting-started-install.html#run-elasticsearch-local)
2. `npm install`
3. `node app/import.js`
4. `node app/analyse.js`

