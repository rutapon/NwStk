/// <reference path="../../lib/underscore/underscore.js" />
/// <reference path="../../lib/jquery/jquery-2.1.1.js" />
/// <reference path="../../lib/backbone/backbone.js" />

var app = app || { models: {}, collections: {}, views: {} };

(function ($) {
    'use strict';

    // Person Model
    app.collections.products = Backbone.Collection.extend({
        model: app.models.product,
        ws_name: 'Products',

        saveObjKeyPare: {
            code: 'code',
            name: 'ชื่อ',
            unit_type: 'หน่วย',
            unit_size: 'ขนาด',
            supplier_name_default: 'ชื่อผู้ขาย',
            unit_price_default:'ราคา',
            description: 'รายละเอียด'
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

        search: function (searchText, stockSelected, cb) {
            var self = this;
            app.stockMethod.findeProductStartWith(stockSelected, searchText, 100, function (result) {
                self.reset(result);
                if (cb) cb(result);
            });
        }
    });

})(jQuery);
