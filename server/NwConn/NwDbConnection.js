﻿/// <reference path="../../lib/NwLib.js" />
/// <reference path="../../lib/underscore/underscore.js" />

(function (context, undefined) {
    //#region requre

    if (typeof module !== "undefined") {
        NwLib = require('../../lib/NwLib.js');
        Class = NwLib.Nwjsface.Class;

        _ = require('../../lib/underscore/underscore.js');
        async = require("async");

        fs = require("fs");
        path = require('path');
        mkdirp = require('mkdirp');

        //sqlite3 = require('sqlite3').verbose();
        LinvoDB = require("linvodb3");
        {
            //console.log('You are using node-webkit!');
            // The following two lines are very important
            // Initialize the default store to Medeadown - which is a JS-only store which will work without recompiling in NW.js / Electron
            LinvoDB.defaults.store = { db: require("medeadown") }; // Comment out to use LevelDB instead of Medea
        }

        //LinvoDB.dbPath = __dirname + '/../Database/';//process.cwd();

    } else {

    }

    //function ensureExists(path, mask, cb) {
    //    if (typeof mask == 'function') { // allow the `mask` parameter to be optional
    //        cb = mask;
    //        mask = 0777;
    //    }
    //    fs.mkdir(path, mask, function (err) {
    //        if (err) {
    //            if (err.code == 'EEXIST') cb(null); // ignore the error if the folder already exists
    //            else cb(err); // something else went wrong
    //        } else cb(null); // successfully created folder
    //    });
    //}

    //#endregion
    var NwDbMgConnection = Class(function () {
        var schema = {}; // Non-strict always, can be left empty


        return {
            dbPath: '',
            allTable: {},
            constructor: function (dbPath, cb) {
                var self = this
                this.dbPath = dbPath;
                this.allTable = {};

                mkdirp(dbPath, function (err) {
                    if (err) console.error(err)
                    else if (cb) self.initDB(cb);
                });

                //ensureExists(dbPath, function () {

                //});
                //if (!fs.existsSync(dbPath)) {
                //    fs.mkdirSync(dbPath);
                //}


            },

            initDB: function (cb) {
                //LinvoDB.dbPath = this.dbPath;
                var self = this;

                fs.readdir(this.dbPath, function (err, files) {

                    files = _.map(files, function (f) {
                        return f.replace('.db', '');
                    });

                    async.eachSeries(files, function (tableName, callback) {

                        //db.ensureIndex({ fieldName: 'esearch' }, function (err) {
                        //    // If there was an error, err is not null
                        //    if (err)
                        //        console.log(err);
                        //});

                        self.allTable[tableName] = new LinvoDB(tableName, schema, { filename: path.join(self.dbPath || ".", tableName + ".db") }); // New model; Doc is the constructor

                        self.allTable[tableName].count({}, function () {
                            //alert('loadDatabase');
                            console.log('loadDatabase:', tableName);
                            callback();
                        });

                    }, function () {
                        cb();
                    });

                });
            },
            _getDB: function (tableName) {
                var self = this;
                if (!_.has(this.allTable, tableName)) {
                    //this.allTable[tableName] = new LinvoDB(tableName, schema, options); // New model; Doc is the constructor
                    self.allTable[tableName] = new LinvoDB(tableName, schema, { filename: path.join(self.dbPath || ".", tableName + ".db") }); // New model; Doc is the constructor

                }
                return this.allTable[tableName];
            },
            getAllTable: function (cb) {
                cb(_.keys(this.allTable));
            },

            getAll: function (tableName, callback) {

                var db = this._getDB(tableName);

                db.find({}, function (err, docs) {
                    if (callback) callback(docs);
                });
            },
            find: function (tableName, findObj, callback) {
                var db = this._getDB(tableName);

                //console.log(findObj);
                db.find(findObj, function (err, docs) {
                    if (callback) callback(docs);
                });

            },
            findOne: function (tableName, findObj, callback) {
                var db = this._getDB(tableName);

                //console.log(findObj);
                db.findOne(findObj, function (err, docs) {
                    if (callback) callback(docs);
                });

            },
            findLastOne: function (tableName, findObj, sortObj, callback) {
                var db = this._getDB(tableName);

                //console.log(findObj);
                db.find(findObj).sort(sortObj).limit(1).exec(function (err, docs) {
                    if (docs.lenght == 0) {
                        if (callback) callback(null);
                    }
                    else {
                        if (callback) callback(docs[0]);
                    }
                });

            },
            findLastGroup: function (tableName, findObj, groupField, sortField, callback) {
                var db = this._getDB(tableName);

                //console.log(findObj);
                db.find(findObj)
                    //.sort(sortObj)
                    //.limit(1)
                    .exec(function (err, docs) {
                        if (docs.lenght == 0) {
                            if (callback) callback(null);
                        }
                        else {
                            var result = _.chain(docs).groupBy(function (obj) {
                                return _.chain(obj).pick(groupField).values().value().join('#');
                            }).value();

                            result = _.map(result, function (val, key) {
                                //console.log(val, key);

                                if (val.length > 1) {
                                    val = _.max(val, function (v) {
                                        return sortField.split('.').reduce(function (a, b) {
                                            return a[b];
                                        }, v);
                                    });
                                    console.log(val);
                                    return val;
                                } else {
                                    return val[0];
                                }
                            });

                            if (callback) callback(result);
                        }
                    });
            },

            findLimit: function (tableName, findObj, limit, callback) {
                var db = this._getDB(tableName);

                db.find(findObj).limit(limit).exec(function (err, docs) {
                    cb(docs);
                });

            },
            findStartWith: function (tableName, findObj, limit, callback) {

                var db = this._getDB(tableName);

                var query = { $or: [] };

                for (var i in findObj) {
                    var reg = new RegExp('^' + findObj[i], 'i');
                    //query[i] = { $regex: reg };
                    var qObj = {};
                    qObj[i] = { $regex: reg };

                    query.$or.push(qObj);
                }

                db.find(query)
             //.sort({ esearch: 1 })
             .limit(limit).exec(function (err, docs) {
                 callback(docs);
             });

            },
            findInPeriod: function (tableName, findObj, timeField, timeStart, timeEnd, callback) {

                var db = this._getDB(tableName);

                findObj[timeField] = { $gte: timeStart, $lte: timeEnd };

                db.find(findObj)
                    //.limit(limit)
                    .exec(function (err, docs) {
                        callback(docs);
                    });

            },
            findInPeriodStartWithOr: function (tableName, findObj, timeField, timeStart, timeEnd, callback) {

                var db = this._getDB(tableName);

                var query = { $or: [] };
                for (var i in findObj) {
                    var reg = new RegExp('^' + findObj[i], 'i');
                    //query[i] = { $regex: reg };
                    var qObj = {};
                    qObj[i] = { $regex: reg };

                    query.$or.push(qObj);
                }

                query[timeField] = { $gte: timeStart, $lte: timeEnd };

                db.find(query)
                    //.limit(limit)
                    .exec(function (err, docs) {
                        callback(docs);
                    });

            },
            findInPeriodStartWith: function (tableName, findObj, timeField, timeStart, timeEnd, callback) {

                var db = this._getDB(tableName);

                var query = {};
                for (var i in findObj) {
                    var reg = new RegExp('^' + findObj[i], 'i');
                    query[i] = { $regex: reg };
                }

                query[timeField] = { $gte: timeStart, $lte: timeEnd };

                db.find(query)
                    //.limit(limit)
                    .exec(function (err, docs) {
                        callback(docs);
                    });

            },
            sumValue: function (tableName, findObj, sumField, callback) {
                var db = this._getDB(tableName);
                findObj[sumField] = { $exists: true };
                //console.log(findObj);
                db.find(findObj)
                    .map(function (x) {
                        return parseInt(x[sumField])
                    })
                    .reduce(function (a, b) { return a + b }, 0)
                    .exec(function (err, res) {
                        if (!res) res = 0;
                        if (callback) callback(res);
                    });
            },

            insert: function (tableName, insertObj, callback) {
                var db = this._getDB(tableName);

                db.insert(insertObj, function (err, newDoc) {
                    //console.log(newDoc._id);
                    if (callback) callback(newDoc._id, newDoc);
                });
            },
            update: function (tableName, findObj, updateObj, callback) {
                var db = this._getDB(tableName);

                db.update(findObj, { $set: updateObj }, { upsert: true }, function (err, numReplaced, upsert) {

                    if (callback) callback(numReplaced);
                    //console.log(numReplaced, upsert);
                    // numReplaced = 1, upsert = { _id: 'id5', planet: 'Pluton', inhabited: false }
                    // A new document { _id: 'id5', planet: 'Pluton', inhabited: false } has been added to the collection
                });

            },
            updateAll: function (tableName, findObj, updateObj, callback) {
                var db = this._getDB(tableName);

                db.update(findObj, { $set: updateObj }, { upsert: true, multi: true }, function (err, numReplaced, upsert) {

                    if (callback) callback(numReplaced);
                    //console.log(numReplaced, upsert);
                    // numReplaced = 1, upsert = { _id: 'id5', planet: 'Pluton', inhabited: false }
                    // A new document { _id: 'id5', planet: 'Pluton', inhabited: false } has been added to the collection
                });

            },
            updateInc: function (tableName, findObj, updateObj, callback) {
                var db = this._getDB(tableName);

                db.update(findObj, { $inc: updateObj }, { upsert: true }, function (err, numReplaced, upsert) {

                    if (callback) callback(numReplaced);
                    //console.log(numReplaced, upsert);
                    // numReplaced = 1, upsert = { _id: 'id5', planet: 'Pluton', inhabited: false }
                    // A new document { _id: 'id5', planet: 'Pluton', inhabited: false } has been added to the collection
                });

            },
            updateUnset: function (tableName, findObj, fieldName, callback) {
                var db = this._getDB(tableName);

                var unsetObj = {}; unsetObj[fieldName] = true;

                db.update(findObj, { $unset: unsetObj }, { upsert: true }, function (err, numReplaced, upsert) {

                    if (callback) callback(numReplaced);
                    //console.log(numReplaced, upsert);
                    // numReplaced = 1, upsert = { _id: 'id5', planet: 'Pluton', inhabited: false }
                    // A new document { _id: 'id5', planet: 'Pluton', inhabited: false } has been added to the collection
                });

            },

            deleteAll: function (tableName, callback) {

                var db = this._getDB(tableName);

                db.remove({}, { multi: true }, function (err, numRemoved) {
                    if (callback) callback(numRemoved);
                });
            },
            destroy: function (tableName, findObj, callback) {
                var db = this._getDB(tableName);

                db.remove(findObj, { multi: true }, function (err, numRemoved) {
                    if (callback) callback(numRemoved);
                });

            }

        };
    });

    if (typeof module !== "undefined" && module.exports) {                       // NodeJS/CommonJS
        module.exports = NwDbMgConnection;
    } else {

        context.NwDbMgConnection = NwDbMgConnection;
    }

})(this);