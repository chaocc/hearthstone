/**
 * Express server wrapper.
 *
 * @author tim.tang
 */

// Hearthstone Rest Server Wrapper.
// --------------

"use strict";
var _ = require('underscore'),
    fs = require('fs'),
    path = require('path'),
    application_root = path.resolve(__dirname, '..'),
    config = require('../conf/hearthstone-conf').config,
    express = require('express'),
    auth = require('../middleware/authenticator'),
    handlers = require('../handler'),
    userHandler = require('../handler/userHandler'),
    app = express(),
    restAPI;

// Express router constructor.
var RESTfulServer = function RESTfulServer() {
        restAPI = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../conf/hearthstone-router.json'), 'UTF-8'));
    };


// Do express server configuration.
function doConf() {
    app.use(express.favicon());
    app.use(express.logger(config.HEARTHSTONE_ENV));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser());
    app.use(express.session({
        secret: config.session_secret
    }));
    app.use(userHandler.authenticate);
    app.use(app.router);
    app.use(express.static(path.join(application_root, config.HEARTHSTONE_PUBLIC_FOLDER)));
    app.use(express.errorHandler({
        dumpExceptions: true,
        showStack: true
    }));
}

// Register RESTful API routes.
function registerAPI(routers) {
    _.each(routers, function(router) {
        _.each(handlers, function(handler) {
            if (_.isFunction(handler[router.api]) && _.isString(router.url)) {
                console.log('Registering API-[%s] URL-[%s] METHOD-[%s]', router.api, router.url, router.method);
                var middlewares = [];
                if(router.middleware || _.isFunction(auth[router.middleware])){
                    middlewares.push(auth[router.middleware]);
                }
                switch (router.method) {

                case config.ROUTER_METHOD_POST:
                    app.post(router.url, middlewares, function(req, res, next) {
                        res.contentType(config.CONTENT_TYPE);
                        handler[router.api](req, res, next);
                    });
                    break;

                case config.ROUTER_METHOD_PUT:
                    app.put(router.url, function(req, res, next) {
                        res.contentType(config.CONTENT_TYPE);
                        handler[router.api](req, res, next);
                    });
                    break;

                case config.ROUTER_METHOD_GET:
                    app.get(router.url, middlewares, function(req, res, next) {
                        res.contentType(config.CONTENT_TYPE);
                        handler[router.api](req, res, next);
                    });
                    break;

                case config.ROUTER_METHOD_DELETE:
                    app.del(router.url, function(req, res, next) {
                        res.contentType(config.CONTENT_TYPE);
                        handler[router.api](req, res, next);
                    });
                    break;

                default:
                    console.log('The METHOD-[%s] not supported!', router.method);
                }
            } else {
               // console.log('Invalid API-[%s] or URL-[%s] in api-router.json!', router.api, router.url);
            }
        });
    });
}

_.extend(RESTfulServer.prototype, {
    // Start server option.
    startup: function() {
        doConf();
        registerAPI(restAPI.routers);
        var port = process.env.PORT || config.DEV_HEARTHSTONE_PORT;
        app.listen(port, function() {
            console.log('Hearthstone server listening on port::%s', port);
        });
    }
});

var restfulServer = new RESTfulServer();

restfulServer.startup();

// Public RESTful Server
module.exports = restfulServer;
