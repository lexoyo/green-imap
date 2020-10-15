# Green Imap tool

Understand your emails and take actions

Compatible with all email providers (use Imap protocol)

![Green Imap email tool](./screenshot.png)

## Road map

### v1

A cli tool to vizualize your mailbox

* [x] Load all emails
* [x] Group emails by to, from, subject similarity
* [x] Filter by status - seen, flagged
* [x] Visualize in kibana
* [ ] Deploy on npm

Bonus: compare email providers speed

* [ ] Gandi
* [ ] OVH
* [x] Fastmail - 20K msg/min
* [ ] Gmail
* [ ] Yahoo

### v2

A web app and electron app to vizualize and take actions on your mailbox

* [ ] Visualize and take action in the same UI
* [ ] Batch delete, flag, move
* [ ] Automatic install of ES
* [ ] Deploy as an electron app

## Run

1. [Install and start elastic search](https://www.elastic.co/guide/en/elasticsearch/reference/current/getting-started-install.html#run-elasticsearch-local) and [install and start Kibana](https://www.elastic.co/guide/en/kibana/current/install.html#_install_kibana_yourself)
2. `npm install`
3. `node app/import.js`
4. `node app/analyse.js`

