/// <reference path="../../lib/underscore/underscore.js" />
/// <reference path="../../lib/jquery/jquery-2.1.1.js" />
/// <reference path="../../lib/backbone/backbone.js" />
/// <reference path="../../lib/lokijs/lokijs.js" />

var app = app || { models: {}, collections: {}, views: {} };

(function ($) {
    'use strict';

    // Person Model
    app.collections.products = Backbone.Collection.extend({
        model: app.models.product,
        ws_name: 'Products',

        saveObjKeyPare: {
            code: 'code',
            nameTh: 'nameTh',
            nameEn: 'nameEn',
            unit_type: 'unit type',
            //unit_size: 'ขนาด',
            'supplier1': 'supplier 1',
            'unit_price1': 'price 1',
            'supplier2': 'supplier 2',
            'unit_price2': 'price 2',
            'supplier3': 'supplier 3',
            'unit_price3': 'price 3',

            description: 'remark'
        },

        initialize: function () {
            this.localData = null;

        },
        importXlsxObj: function (xlsxObj) {
            var self = this;
            var saveObjKeyPare = this.saveObjKeyPare;
            _.each(xlsxObj[this.ws_name], function (obj) {

                var dataObj = {};

                for (var key in saveObjKeyPare) {
                    dataObj[key] = obj[saveObjKeyPare[key]]
                }

                self.add(dataObj);
            });
        },
        saveToXlsx: function (serchText) {
            //console.log(this.toJSON());

            var ws_name = this.ws_name;
            var saveObjKeyPare = this.saveObjKeyPare;

            serchText = serchText ? serchText + '_' : '';

            var fileName = ws_name + '_' + serchText + new Date().toISOString()

            var dataObjArray = [];//_.pluck(stooges, ['code', 'name']);

            _.each(this.toJSON(), function (dataObj) {
                var savaDataObj = {};

                for (var key in saveObjKeyPare) {
                    savaDataObj[saveObjKeyPare[key]] = dataObj[key];
                }

                dataObjArray.push(savaDataObj);
            })

            SaveXlsx(dataObjArray, ws_name, fileName);
        },

        setLocalData: function (stockSelected, cb) {
            var self = this;
            //console.log('setLocalData');
            app.serviceMethod.getAllProducts(stockSelected, function (result) {
                // _.each(result, function (item) {
                //     item['stock_name'] = stockSelected;
                // });

                self.setLocalDatabase(stockSelected, result);

                if (cb) cb(result);
            });
        },

        setLocalDatabase: function (stockSelected, result) {
            var self = this;
            if (!self.localData) {
                self.localData = (new loki('test', { env: 'BROWSER' })).addCollection('localData');
            } else {
                self.localData.clear();
            }

            if (result.length > 0) {
               
                self.localData.insert(result);
            }
        },

        clearLocalData: function () {
            this.localData = null;
        },
        getAll: function (stockSelected, cb, supplierSelected) {
            console.log('getAll');
            var self = this;
            if (this.localData) {
                var result = this.localData.find({});
                //console.log(result);

                if (supplierSelected) {
                    result = _.filter(result, function (model) {
                        return model["supplier1"] == supplierSelected ||
                            model["supplier2"] == supplierSelected ||
                            model["supplier3"] == supplierSelected;
                    });

                }

                self.reset(result);

                if (cb) cb(result);
            }
            else {
                app.serviceMethod.getAllProducts(stockSelected, function (result) {
                    //console.log(result);
                    // _.each(result, function (item) {
                    //     item['stock_name'] = stockSelected;
                    // });

                    self.setLocalDatabase(stockSelected, result);

                    if (supplierSelected) {
                        result = _.filter(result, function (model) {
                            return model["supplier1"] == supplierSelected ||
                                model["supplier2"] == supplierSelected ||
                                model["supplier3"] == supplierSelected;
                        });

                    }
                    self.reset(result);

                    if (cb) cb(result);
                });
            }
        },
        search: function (searchText, stockSelected, cb, supplierSelected) {
            var self = this;

            if (this.localData) {
                var findObj = { code: searchText, name: searchText };
                var query = { $or: [] };

                for (var i in findObj) {
                    var reg = new RegExp('^' + findObj[i], 'i');
                    //query[i] = { $regex: reg };
                    var qObj = {};
                    qObj[i] = { $regex: reg };

                    query.$or.push(qObj);
                }

                //var reg = new RegExp('^' + searchText, 'i');
                //var query = { esearch: { $regex: reg } };

                var result = this.localData.chain()
                      .find(query)
                      .simplesort("code")
                      //.limit(15)
                      .data();

                if (supplierSelected) {
                    result = _.filter(result, function (model) {
                        return model["supplier1"] == supplierSelected ||
                            model["supplier2"] == supplierSelected ||
                            model["supplier3"] == supplierSelected;
                    });

                }

                self.reset(result);
                if (cb) cb(result);

            }
            else {
                app.serviceMethod.findeProductStartWith(stockSelected, searchText, 100, function (result) {

                    if (supplierSelected) {
                        result = _.filter(result, function (model) {
                            return model["supplier1"] == supplierSelected ||
                                model["supplier2"] == supplierSelected ||
                                model["supplier3"] == supplierSelected;
                        });

                    }
                    self.reset(result);
                    if (cb) cb(result);
                });
            }
        }
    });

})(jQuery);
