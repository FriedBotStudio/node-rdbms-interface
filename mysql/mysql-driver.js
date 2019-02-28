(function() {
    "use strict";
    var mysql = require("mysql");
    var QueryBuilder = require("./query-builder");
    var _root = "";

    var errHandler = function(err, reject) {
        if (err.fatal) _root.connect();
        reject(err);
    };

    var sysHandler = function(resolve, reject) {
        return function(err, result) {
            if (err) errHandler(err, reject);
            else resolve(result);
        };
    };

    function MySQLDriver(config) {
        _root = this;

        this.conn = mysql.createConnection(config);
        this._retObj = {
            connect: _root.connect,
            close: _root.close,
            insert: _root.insert,
            delete: _root.delete,
            selectAll: _root.selectAll,
            selectById: _root.selectById,
            build: _root.build
        };

        return this._retObj;
    }

    MySQLDriver.prototype.connect = function() {
        return new Promise(function(resolve, reject) {
            _root.conn.connect(function(err) {
                if (err) reject(err);
                else resolve();
            });
        });
    };

    MySQLDriver.prototype.close = function() {
        return new Promise(function(resolve, reject) {
            _root.conn.end(resolve);
        });
    };

    MySQLDriver.prototype.insert = function(tbl, dataToInsert) {
        return new Promise(function(resolve, reject) {
            _root.conn.query("INSERT INTO `" + tbl + "` SET ?", dataToInsert, sysHandler(resolve, reject));
        });
    };

    MySQLDriver.prototype.update = function(tbl, id, dataToUpdate) {
        return new Promise(function(resolve, reject) {
            _root.conn.query("UPDATE `" + tbl + "` SET ? WHERE `id`=" + _root.conn.escape(id), dataToUpdate, sysHandler(resolve, reject));
        });
    };

    MySQLDriver.prototype.delete = function(tbl, id) {
        return new Promise(function(resolve, reject) {
            _root.conn.query("DELETE FROM `" + tbl + "` WHERE `id`=" + _root.conn.escape(id), sysHandler(resolve, reject));
        });
    };

    MySQLDriver.prototype.selectAll = function(tbl) {
        return new Promise(function(resolve, reject) {
            _root.conn.query("SELECT * FROM `" + tbl + "`", sysHandler(resolve, reject));
        });
    };

    MySQLDriver.prototype.selectById = function(tbl, id) {
        return new Promise(function(resolve, reject) {
            _root.conn.query("SELECT * FROM `" + tbl + "` WHERE `id`=" + _root.conn.escape(id), sysHandler(function(d) {
                if (d.length > 0)
                    resolve(d[0]);
                else
                    resolve({});
            }, reject));
        });
    };

    MySQLDriver.prototype.query = function(statement) {
        return new Promise(function(resolve, reject) {
            _root.conn.query(statement, sysHandler(resolve, reject));
        });
    };

    MySQLDriver.prototype.build = function() {
        return new QueryBuilder(_root);
    };

    module.exports = MySQLDriver;

})();