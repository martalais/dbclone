const _ = require('lodash');
const MongoClient = require('mongodb').MongoClient;

/** * 
 * For now using shared sockets seems to make enough sense.
 * If performance becomes an issue look into pooling multiple connections.
 */
let MongoClientInstance;
let MongoDBInstance;

/**
 * Establish a connection.
 *
 * @param {string} host MongoDB host
 * @param {string} db Database name
 * @param {callback} cb Function with signature of (err, db)
 */
function dbConnectionOpen(host, db, cb) {
  if (MongoDBInstance) {
    return cb(null, MongoDBInstance); // check if it's null.
  }

  const url = host.startsWith('mongodb://') ? host : `mongodb://${host}`; // changes the url.

  return MongoClient.connect(url, (err, client) => {
    if (err || !client) {
      const errorMsg = `Couldn't connect to Mongo at ${url}`;
      console.error(errorMsg, err);
      return cb(err || errorMsg);
    }

    console.log(`Host:        ${host}`);
    console.log(`Selected DB: ${db}`);
    MongoClientInstance = client;
    MongoDBInstance = client.db(db);
    return cb(null, MongoDBInstance);
  });
}

/**
 * Closes a connection.
 */
function dbConnectionClose() {
  MongoDBInstance = null; //check if it's null.
  if (MongoClientInstance) {
    MongoClientInstance.close(); //closes the connection.
  }
}

/**
 * List of database collections.
 * 
 * @param {*} connDb Db Connection.
 * @param {*} callback Function with signature of (err, Collections)
 */
function listCollections(connDb, callback) {
  console.log('(Scanning Mongo...)\n');

  return connDb.listCollections().toArray((listErr, listData) => {
    const allCollections = _.map(listData, 'name');
    return callback(null, allCollections);
  });
}

const mongoBackend = {
  _socketHost: MongoClientInstance,
  _socketDatabase: MongoDBInstance,

  open: dbConnectionOpen,
  close: dbConnectionClose,
  listCollections
  // dropCollection
  // dropDatabase
  // findDocument
  // countDocuments
  // insertDocument
  // removeDocument
};

module.exports = mongoBackend;
