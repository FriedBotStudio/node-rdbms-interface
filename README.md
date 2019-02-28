# node-rdbms-interface
An interface library for Node JS that can be used to abstract RDBMS level SQL queries with promise based interface.

### An Example Code 'app.js'

```js
// Required Components
var DbInterface = require ('node-rdbms-interface');
var MySqlDriver = require('node-rdbms-interface/mysql/mysql-driver');
var config = {
  host: "127.0.0.1",
  user: "root",
  password: "root",
  database: "test"
};

// Instantiate
var Db = new DbInterface(new MySqlDriver(config));

// Select All Entries from a table 'campaign'
Db.selectAll('campaign')
  .then(function(dataAarray) {
    // Do something with data here
    console.log(dataArray);
  }).catch(function(err) {
    // Log error on console
    console.error(err);
  });

// Select an entry by id from 'campaign'
var id = 10;
Db.selectById('campaign', id)
  .then(function(dataObj) {
    // Do something with data here
    console.log(dataObj);
  }).catch(function(err) {
    // Log error on console
    console.error(err);
  });

// Build a Complex Query Using QueryBuilder
var selector = {
  "campaign.id": "id",
  "campaign.campaign_name": "campaign_name",
  "advertiser.name": "advertiser",
  "status.name": "status",
};

Db.build()
  .select(selector, true)
  .from('campaign')
  .join('advertiser', { "advertiser.id": "campaign.advertiser_id" })
  .join("status", { "status.id": "campaign.status" })
  .where({ "campaign.id": id })
  .compile()
  .exec()
  .then(function(dataArray) {
    // Do something with data here
    console.log(dataArray);
  })
  .catch(function(err) {
    // Log error on console
    console.error(err);
  });

```

<p align="center">
<b>**** DOCUMENTATION PENDING ****</b>
</p>
