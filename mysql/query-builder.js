(function() {
    "use strict";
    var _root = null;

    var getMappableObjToString = function(obj, noescape) {
        var retStr = "";
        noescape = noescape || false;

        if (typeof obj === "string") {
            return obj;
        } else if (typeof obj.length === "number") {
            obj.forEach(function(k) {
                if (noescape)
                    retStr += k + ", ";
                else
                    retStr += "`" + k + "`, ";
            });
        } else {
            Object.keys(obj).forEach(function(k) {
                if (noescape)
                    retStr += k + " AS `" + obj[k] + "`, ";
                else
                    retStr += "`" + k + "` AS `" + obj[k] + "`, ";
            });
        }
        return retStr.trim().replace(/(^,)|(,$)/g, "").trim() || "*";
    };

    var getAssignableObjToString = function(obj, noescape) {
        var retStr = "";
        noescape = noescape || false;

        if (typeof obj === "string") {
            return obj;
        } else if (typeof obj.length === "number") {
            return undefined;
        } else {
            Object.keys(obj).forEach(function(k) {
                if (noescape)
                    retStr += "`" + k + "`=" + obj[k] + ", ";
                else
                    retStr += "`" + k + "`='" + obj[k] + "', ";
            });
        }
        return retStr.trim().replace(/(^,)|(,$)/g, "").trim() || "*";
    };

    var getFilterChainObjToString = function(obj, joiner, noescape, noescapef) {
        var retStr = "";
        noescape = noescape || false;
        noescapef = noescapef || false;
        joiner = (joiner || "AND").toUpperCase();

        if (typeof obj === "string") {
            return obj;
        } else {
            var expCheck = /[<>!]{1}=|=|<|>$/;
            var invalidCheck = /[<>!]{2,}|=[<>!]+|={2,}|![^=]*$/;

            Object.keys(obj).forEach(function(k) {
                var comparator = "=";
                if (invalidCheck.test(k)) return;
                if (expCheck.test(k)) {
                    comparator = expCheck.exec(k)[0];
                }
                k.replace(expCheck);
                if (noescape && !noescapef)
                    retStr += "`" + k + "`" + comparator + "" + obj[k] + " " + joiner + " ";
                else if (noescape && noescapef)
                    retStr += k + comparator + "" + obj[k] + " " + joiner + " ";
                else if (!noescape && noescapef)
                    retStr += k + comparator + "'" + obj[k] + "' " + joiner + " ";
                else
                    retStr += "`" + k + "`" + comparator + "'" + obj[k] + "' " + joiner + " ";
            });
        }
        return retStr.trim().replace(new RegExp(joiner + "$"), "").trim();
    };

    var getLikeFilterChainObjToString = function(obj, mode, joiner) {
        var retStr = "";
        joiner = (joiner || "AND").toUpperCase();
        mode = (mode || "both").toLowerCase();

        if (typeof obj === "string") {
            return obj;
        } else {
            var expCheck = /[<>!]{1}=|=|<|>$/;
            var invalidCheck = /[<>!]{2,}|=[<>!]+|={2,}|![^=]*$/;

            Object.keys(obj).forEach(function(k) {
                var comparator = "LIKE";
                if (invalidCheck.test(k) || expCheck.test(k)) return;
                retStr += "`" + k + "` " + comparator + " '" + ((mode == "both" || mode == "left") ? "%" : "") + obj[k] + ((mode == "both" || mode == "right") ? "%" : "") + "' " + joiner + " ";
            });
        }
        return retStr.trim().replace(new RegExp(joiner + "$"), "").trim();
    };

    var setCUOp = function(tbl, fields, noescape) {
        noescape = noescape || false;
        if (typeof tbl === "string") _root.builderBlocks.table = "`" + tbl + "`";
        else _root.builderBlocks.table = undefined;
        _root.builderBlocks.fields = getAssignableObjToString(fields, noescape) || undefined;
    };

    function QueryBuilder(connection) {
        _root = this;
        this.conn = connection;
        this.lastQuery = "";
        this.builderBlocks = {};
    }

    QueryBuilder.prototype.select = function(fields, noescape) {
        noescape = noescape || false;
        _root.builderBlocks.queryType = "SELECT";
        _root.builderBlocks.fields = getMappableObjToString(fields, noescape) || undefined;
        return _root;
    };

    QueryBuilder.prototype.insert = function(tbl, fields, noescape) {
        noescape = noescape || false;
        _root.builderBlocks.queryType = "INSERT";
        setCUOp(tbl, fields, noescape);
        return _root;
    };

    QueryBuilder.prototype.update = function(tbl, fields, noescape) {
        noescape = noescape || false;
        _root.builderBlocks.queryType = "UPDATE";
        setCUOp(tbl, fields, noescape);
        return _root;
    };

    QueryBuilder.prototype.from = function(tbl) {
        _root.builderBlocks.table = getMappableObjToString(tbl) || undefined;
        return _root;
    };

    QueryBuilder.prototype.where = function(obj, noescape, noescapef) {
        noescape = noescape || false;
        noescapef = noescapef || false;
        if (typeof _root.builderBlocks.whereBlock === "undefined" || _root.builderBlocks.whereBlock === "") _root.builderBlocks.whereBlock = "";
        else _root.builderBlocks.whereBlock += (_root.builderBlocks.whereBlock.slice(-1) == "(" ? "" : " AND ");
        _root.builderBlocks.whereBlock += getFilterChainObjToString(obj, "AND", noescape, noescapef) || "";
        return _root;
    };

    QueryBuilder.prototype.orWhere = function(obj, noescape) {
        noescape = noescape || false;
        if (typeof _root.builderBlocks.whereBlock === "undefined" || _root.builderBlocks.whereBlock === "") _root.builderBlocks.whereBlock = "";
        else _root.builderBlocks.whereBlock += (_root.builderBlocks.whereBlock.slice(-1) == "(" ? "" : " OR ");
        _root.builderBlocks.whereBlock += getFilterChainObjToString(obj, "OR", noescape) || "";
        return _root;
    };

    QueryBuilder.prototype.likeWhere = function(obj, mode) {
        if (typeof _root.builderBlocks.whereBlock === "undefined" || _root.builderBlocks.whereBlock === "") _root.builderBlocks.whereBlock = "";
        else _root.builderBlocks.whereBlock += (_root.builderBlocks.whereBlock.slice(-1) == "(" ? "" : " AND ");
        _root.builderBlocks.whereBlock += getLikeFilterChainObjToString(obj, mode, "AND") || "";
        return _root;
    };

    QueryBuilder.prototype.orLikeWhere = function(obj, mode) {
        if (typeof _root.builderBlocks.whereBlock === "undefined" || _root.builderBlocks.whereBlock === "") _root.builderBlocks.whereBlock = "";
        else _root.builderBlocks.whereBlock += (_root.builderBlocks.whereBlock.slice(-1) == "(" ? "" : " OR ");
        _root.builderBlocks.whereBlock += getLikeFilterChainObjToString(obj, mode, "OR") || "";
        return _root;
    };

    QueryBuilder.prototype.groupStart = function(mode) {
        mode = mode.toUpperCase() || "AND";
        if (typeof _root.builderBlocks.whereBlock === "undefined" || _root.builderBlocks.whereBlock === "") _root.builderBlocks.whereBlock = "";
        if (typeof _root.builderBlocks.groupInit === "undefined") _root.builderBlocks.groupInit = 0;
        _root.builderBlocks.whereBlock += " " + mode + " (";
        _root.builderBlocks.groupInit += 1;
        return _root;
    };

    QueryBuilder.prototype.groupEnd = function() {
        if (typeof _root.builderBlocks.whereBlock === "undefined" || _root.builderBlocks.whereBlock === "") return _root;
        if (typeof _root.builderBlocks.groupInit !== "undefined") {
            _root.builderBlocks.whereBlock += ")";
            _root.builderBlocks.groupInit -= 1;
            if (_root.builderBlocks.groupInit == 0) _root.builderBlocks.groupInit = undefined;
        }
        return _root;
    };

    QueryBuilder.prototype.join = function(tbl, on) {
        if (typeof _root.builderBlocks.joins === "undefined") _root.builderBlocks.joins = [];
        _root.builderBlocks.joins.push("JOIN `" + tbl + "` ON " + getFilterChainObjToString(on, null, true, true));
        return _root;
    };

    QueryBuilder.prototype.compile = function() {
        _root.statement = undefined;

        if (typeof _root.builderBlocks.table === "undefined" ||
            typeof _root.builderBlocks.queryType === "undefined" ||
            typeof _root.builderBlocks.groupInit !== "undefined") return _root;

        _root.statement = _root.builderBlocks.queryType;

        switch (_root.builderBlocks.queryType) {
            case "SELECT":
                _root.statement += " " + (_root.builderBlocks.fields || "*") + " FROM " + _root.builderBlocks.table;
                if (typeof _root.builderBlocks.joins !== "undefined") {
                    _root.builderBlocks.joins.forEach(function(stmt) {
                        _root.statement += " " + stmt;
                    });
                }
                break;
            case "UPDATE":
                _root.statement += " " + _root.builderBlocks.table + " SET " + _root.builderBlocks.fields;
                break;
            case "INSERT":
                _root.statement += " INTO " + _root.builderBlocks.table + " SET " + _root.builderBlocks.fields;
                break;
            case "DELETE":
                _root.statement += " FROM " + _root.builderBlocks.table;
                break;
        }
        if (_root.builderBlocks.queryType !== "INSERT")
            _root.statement += " WHERE " + (_root.builderBlocks.whereBlock || "1");

        return _root;
    };

    QueryBuilder.prototype.toString = function() {
        return _root.statement;
    };

    QueryBuilder.prototype.exec = function() {
        if (typeof _root.statement === "undefined") return new Promise(function(resolve, reject) { reject("Failed to compile"); });
        return _root.conn.query(_root.statement);
    };

    module.exports = QueryBuilder;
})();