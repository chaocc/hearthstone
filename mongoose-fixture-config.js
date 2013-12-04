/*
 *  mongoose-fixture-config.js.js
 *  Type: Config
 *  Generated by mongoose-fixture (v0.3.0)
 *
 *  Generic configuration
 *  Please customize your mongodb, pathing, and FixtureListing
 *
 */

// Load the default object that helps manage a FixtureConfig
var FixtureConfig = require('mongoose-fixture').FixtureConfig;

// Create our fixture config with defined
// mongo-connection and file paths
var url = require('url'),
    mongoUrl = process.env.MONGOHQ_URL,
    host,
    port,
    dbname;

if(mongoUrl){
    var mongoProdConf = url.parse(mongoUrl);
    host = mongoProdConf.auth+'@'+mongoProdConf.hostname;
    port = mongoProdConf.port;
    dbname = mongoProdConf.path;
}

var fixtureConfig = new FixtureConfig({
    mongoConnection: {
        'host': host || 'localhost',
        'port': port || '27017',
        'dbname': dbname || 'hearthstone_dev'
    },
    paths: {
        schemaPath: __dirname + '/model/',
        dataFixturePath: __dirname + '/fixtures/'
    }
});


// Create a Listing of fixtures
var initFixtures = [{
    // general name used in output log
    itemName: 'user',
    // name of the schema file (without the .js)
    schema: 'user',
    // name of the data-fixture file (without the .js)
    data: 'users',
    // collection name in for removal process
    collection: 'users'
}, {
    itemName: 'card',
    schema: 'card',
    data: 'cards',
    collection: 'cards'
}, {
    itemName: 'version',
    schema: 'version',
    data: 'versions',
    collection: 'versions'
}];

// load fixture listings
fixtureConfig.fixtureListings.set('init', initFixtures);

// export the config
module.exports = fixtureConfig;
