(function() {
    "use strict";

    function DbInterface(driverObj) {
        this._driver = driverObj;
    }

    DbInterface.prototype.connect = function() {
        return this._driver.connect();
    };

    DbInterface.prototype.close = function() {
        return this._driver.close();
    };

    DbInterface.prototype.insert = function(tbl, obj) {
        return this._driver.insert(tbl, obj);
    };

    DbInterface.prototype.update = function(tbl, id, obj) {
        return this._driver.update(tbl, id, obj);
    };

    DbInterface.prototype.delete = function(tbl, id) {
        return this._driver.delete(tbl, id);
    };

    DbInterface.prototype.selectAll = function(tbl) {
        return this._driver.selectAll(tbl);
    };

    DbInterface.prototype.selectById = function(tbl, id) {
        return this._driver.selectById(tbl, id);
    };

    DbInterface.prototype.build = function() {
        return this._driver.build();
    };

    module.exports = DbInterface;
})();