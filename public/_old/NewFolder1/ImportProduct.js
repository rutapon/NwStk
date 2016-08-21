/// <reference path="../../lib/jquery/jquery-2.1.1.js" />
/*global Backbone, jQuery, _, ENTER_KEY */
var app = app || { models: {}, collections: {}, views: {} };

(function ($) {
    'use strict';

    app.views.ImportProduct = Backbone.View.extend({

        // Instead of generating a new element, bind to the existing skeleton of
        // the App already present in the HTML.
        //el: '#showProductNav',

        // Delegated events for creating new items, and clearing completed ones.
        events: {
            'keyup .select_product_search': 'search',
            'change .select_product_search': 'search',
            'click .selectClick': 'selectClick',
            'click .cancelClick': 'cancelClick'

        },
        initialize: function () {

            var container = this.$el.get(0),

                CarModel = app.models.ImportProduct,//Backbone.Model.extend({}),
                ImportCollection,
                importCollection,
                hot;

            ImportCollection = app.collections.products.extend({
                model: CarModel,
                // Backbone.Collection doesn't support `splice`, yet! Easy to add.
                splice: hackedSplice
            });

            this.importCollection = importCollection = new ImportCollection();

            // since we're not using a server... make up some data. This will make
            // a couple CarModels from these plain old objects
            //importCollection.add({ code: '110110', name: 'น้ำมันพืช', unit_type: 'ขวด', unit_size: '1 ลิตร' });

            hot = new Handsontable(container, {
                data: importCollection,
                //stretchH: 'all',
                multiSelect: false,
                //dataSchema: makeCar,
                contextMenu: true,
                height: 400,
                columns: [
                 { readOnly: true, data: attr('code') },
                 { readOnly: true, data: attr('name') },
                 { readOnly: true, data: attr('unit_type') },
                 { readOnly: true, data: attr('unit_size') },
                 {
                     data: attr('supplyer'),
                     type: 'autocomplete',
                     source: function (query, process) {
                         console.log(this.row);
                         process(['ร้าน a', 'ร้าน b', 'ร้าน c']);
                     },
                     filter: false

                 },
                  {
                      data: attr('unit_price'),
                      type: 'autocomplete',
                      source: function (query, process) {
                          console.log(this.row);
                          process([10, 50, 100]);
                      },
                      filter: false
                  },
                  {
                      data: attr('receiveId'),
                  },

                  {
                      data: attr('in_date'),
                      type: 'date',
                      dateFormat: 'YYYY-MM-DD',
                      correctFormat: true,
                      strict: true
                  },
                  {
                      data: attr('unit'),
                      type: 'numeric',
                      //strict: true
                  },
                   {
                       data: attr('sum'),
                       type: 'numeric',
                       format: '0,0.00',
                       //strict: true
                   }
                ],
                colHeaders: [
                    'code',
                    'ชื่อ',
                    'หน่วย',
                    'ขนาด',
                    'ชื่อผู้ขาย',
                    'ราคา/หน่วย',
                    'เลขที่ใบส่งของ',
                    'วันที่เอกสาร',
                    'รับ',
                    'จำนวนเงิน'
                ]
                // minSpareRows: 1 //see notes on the left for `minSpareRows`
            });

            // this will log all the Backbone events getting fired!
            importCollection.on('all', function () {
                hot.render();
            }).on('add', function () {
                hot.render();
            }).on('remove', function () {
                hot.render();
            });

            // you'll have to make something like these until there is a better
            // way to use the string notation, i.e. "bb:make"!

            // normally, you'd get these from the server with .fetch()
            function attr(attr) {
                // this lets us remember `attr` for when when it is get/set
                return function (car, value) {
                    if (_.isUndefined(value)) {
                        return car.get(attr);
                    } else {
                        console.log('set', value);
                        car.set(attr, value);
                    }
                };
            }

            // just setting `dataSchema: CarModel` would be great, but it is non-
            // trivial to detect constructors...
            function makeCar() {
                return new CarModel();
            }

            // use the "good" Collection methods to emulate Array.splice
            function hackedSplice(index, howMany /* model1, ... modelN */) {
                var args = _.toArray(arguments).slice(2).concat({ at: index }),
                  removed = this.models.slice(index, index + howMany);

                this.remove(removed).add.apply(this, args);

                return removed;
            }
        },
        initializes: function () {

            function getCarData() {
                return [
                       ["110110", 'น้ำมันพืช', "ขวด", "1 ลิตร", 'ร้าน a', 100, '', new Date().toISOString().slice(0, 10), 0, 0]
                ];
            }

            function attrs(attr) {
                // this lets us remember `attr` for when when it is get/set
                console.log('attrs ' + attr);
                return function (model, value) {
                    console.log('data ' + attr);
                    if (_.isUndefined(value)) {
                        return model.get(attr);
                    }
                    model.set(attr, value);
                };;
            }


            var collectionTable = new app.collections.products();

            var product = new app.models.product({ code: '123', name: 'test', unit_type: 'abc', description: 'description' });


            collectionTable.add([product]);

            //var container = document.getElementById('popupImportProduct');
            var container = this.$el.get(0);// document.getElementById('example1'),

            var colHeaders = [
                    'code',
                    //'ชื่อ',
                    //'หน่วย',
                    //'รายละเอียด',
                    //'ชื่อผู้ขาย',
                    //'ราคา/หน่วย',
                    //'เลขที่ใบส่งของ',
                    //'วันที่เอกสาร',
                    //'รับ',
                    //'จำนวนเงิน'
            ];
            var columns = [
                  { readOnly: true, data: attrs('code') },
                  //{ readOnly: true, data: attrs('name') },
                  //{ readOnly: true, data: attrs('unit_type') },
                  //{ readOnly: true, data: attrs('description') },
                  //{
                  //    type: 'autocomplete',
                  //    source: function (query, process) {
                  //        console.log(this.row);
                  //        process(['ร้าน a', 'ร้าน b', 'ร้าน c']);
                  //    },
                  //    filter: false
                  //},
                  //{
                  //    type: 'autocomplete',

                  //    //source: ['10', '50', '100'],
                  //    source: function (query, process) {
                  //        console.log(this.row);
                  //        process([10, 50, 100]);
                  //    },
                  //    filter: false
                  //},
                  //{

                  //},

                  //{
                  //    type: 'date',
                  //    dateFormat: 'YYYY-MM-DD',
                  //    correctFormat: true,
                  //    strict: true
                  //},
                  //{
                  //    type: 'numeric',
                  //    //strict: true
                  //},
                  // {
                  //     type: 'numeric',
                  //     format: '0,0.00',
                  //     //strict: true
                  // }
            ];

            var hot = new Handsontable(container, {
                data: collectionTable,// getCarData(),
                //startRows: 7,
                //startCols: 40,
                //contextMenu: true,
                //stretchH: 'all',
                multiSelect: false,
                //width: 620,
                height: 400,
                dataSchema: function () {
                    return new app.collections.products();
                },
                contextMenu: true,
                colHeaders: colHeaders,
                columns: columns
                //cells: function (row, col, prop) {

                //    //console.log(row, col);

                //    if (this.type == 'dropdown') {
                //        var val = this.instance.getValue();
                //        if (typeof val != 'undefined') {
                //            //this.source.push(val); // to add to the beginning do this.source.unshift(val) instead
                //            //this.source = [];
                //            console.log(this.source);
                //        }
                //    }
                //}
            });
            //this.$el.find(".select-result").append(this.allProductTable.render().el);
        },

        // Re-rendering the App just means refreshing the statistics -- the rest
        // of the app doesn't change.
        render: function () {

        },

        selectClick: function () {
            var selectedModels = this.allProductTable.getSelectedModels();

            this.trigger('select', selectedModels);
            //console.log(selectedModels.length);
            //this.collection.saveToXlsx(this.model.stockModel.get('stock_selected') + "#" + this.$el.find('.show_product_search').val());

            this.clear();
        },
        clear: function () {
            this.importCollection.reset();
        },
        
        addProduct: function (product) {

            var ip = new app.models.ImportProduct(product.toJSON());
            //console.log(product.toJSON());
          
            this.importCollection.add(ip);
        }
    });

})(jQuery);
