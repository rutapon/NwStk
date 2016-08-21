/// <reference path="../../lib/underscore/underscore.js" />
/// <reference path="../../lib/jquery/jquery-2.1.1.js" />
/*global Backbone, jQuery, _, ENTER_KEY */
var app = app || { models: {}, collections: {}, views: {} };

(function ($) {
    'use strict';

    function areYouSure(text1, text2, button, callback) {
        console.log('areYouSure');
        $("#sure .sure-1").text(text1);
        $("#sure .sure-2").text(text2);
        $("#sure .sure-do").text(button).on("click", function () {
            callback();
            $(this).off("click");
        });
        $("#sure").popup('open');
    }


    app.views.AddImportProduct = Backbone.View.extend({

        // Instead of generating a new element, bind to the existing skeleton of
        // the App already present in the HTML.
        //el: '#showProductNav',

        // Delegated events for creating new items, and clearing completed ones.
        events: {

            'click .SelectProductPopUpButton': 'SelectProductPopUpButtonClick',

            //'keyup .select_product_search': 'search',
            //'change .select_product_search': 'search',
            //'click .selectClick': 'selectClick',
            //'click .cancelClick': 'cancelClick',

            'click .ClearNewProductRow': 'clearNewProductRowClick',
            'click .SaveImportProduct': 'saveImportProductClick'
        },
        initialize: function () {

            var self = this;

            var importProductTable = this.$el.find('#popupImportProduct').get(0);
            var selectImportProductTable = $(".select-result");
            this.select_product_search = this.$el.find('.select_product_search');

            var stockModel = this.model.get('stockModel');
            var importProductCollection = this.importProductCollection = this.model.get('importProductCollection');

            importProductCollection.splice = hackedSplice;

            var supplyLogCollection = new app.collections.SupplyLogCollection();


            self.$el.find(".select-stock").bind("change", function (event, ui) {
                var stockSelected = self.$el.find('.select-stock option:selected').select().text();
                console.log('stock_selected', stockSelected);
                stockModel.set('stock_selected', stockSelected);
            });

            stockModel.on('change:stock', function (model, stock) {

                if (stock.length > 0) {
                    self.$el.find('.select-stock option').remove();
                    _.each(stock, function (item) {
                        self.$el.find('.select-stock').append('<option>' + item + '</option>');
                        self.$el.find('.select-stock').trigger("change");
                    });
                }
            });

            //stockModel.on('change:stock_selected', function (model, stock_selected) {
            //    //viewSelectProduct.clear();
            //});

            var importDataTable = new Handsontable(importProductTable, {
                data: importProductCollection,
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
                     data: attr('supplier_name'),
                     type: 'autocomplete',
                     source: function (query, process) {

                         var ImportProductModel = importProductCollection.at(this.row);

                         console.log(stockModel.get('stock_selected'), ImportProductModel.get('code'));

                         var code = ImportProductModel.get('code');
                         supplyLogCollection.find(code, stockModel.get('stock_selected'), function () {

                         //    process(_.uniq(supplyLogCollection.pluck('supplier_name')).reverse().splice(0,6));
                         //});

                         //supplyLogCollection.getAll(stockModel.get('stock_selected'), function () {
                             //var supplier_nameArry = _.pluck(_.filter(supplyLogCollection.toArray(), function (model) {
                             //    return model.get('product_id') == product_id;
                             //}), 'supplier_name');

                             var ModelObjArray = _.map(supplyLogCollection.toArray().reverse(), function (model) {
                                 return model.toJSON();
                             });

                             var otherSupplier_nameArry = _.chain(ModelObjArray).
                                 filter(function myfunction(modelObj) {
                                     return modelObj['code'] != code;
                                 }).pluck('supplier_name').unique().value();


                             var supplier_nameArry = _.chain(ModelObjArray).
                                 filter(function myfunction(modelObj) {
                                     return modelObj['code'] == code;
                                 }).pluck('supplier_name').unique()
                                 .union(otherSupplier_nameArry)
                                 .first(5)
                                 .value();

                             process(supplier_nameArry);
                         });

                         //process(['ร้าน a', 'ร้าน b', 'ร้าน c']);
                     },

                     filter: false

                 },
                  {
                      data: attr('unit_price'),
                      type: 'autocomplete',
                      source: function (query, process) {
                          //console.log(this.row);

                          var ImportProductModel = importProductCollection.at(this.row);

                          console.log(stockModel.get('stock_selected'), ImportProductModel.get('code'));

                          var code = ImportProductModel.get('code')
                          supplyLogCollection.findeSupplyLog(code, stockModel.get('stock_selected'), function () {

                              process(_.uniq(supplyLogCollection.pluck('unit_price')).reverse().splice(0, 6));
                          });

                          //process([10, 50, 100]);
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
                //afterChange: function (e) {
                //    console.log('afterChange', JSON.stringify(e));
                //},

                // minSpareRows: 1 //see notes on the left for `minSpareRows`
            });


            importProductCollection.on('change:supplier_name', function (model) {
                //console.log('afterChange', JSON.stringify(e));
                supplyLogCollection.findeSupplyLog(model.get('code'), stockModel.get('stock_selected'), function (result) {

                    if (result.length) {
                        var supplier = model.get('supplier_name');
                        result = result.reverse();
                        var findObj = _.find(result, function (obj) {
                            return supplier == obj.supplier_name;
                        });

                        if (findObj) {
                            model.set('unit_price', findObj.unit_price);
                        }
                    }

                });

            });

            importProductCollection.on('all', function () {
                importDataTable.render();
            }).on('add', function () {
                importDataTable.render();
            }).on('remove', function () {
                importDataTable.render();
            });


            // normally, you'd get these from the server with .fetch()
            function attr(attr) {
                // this lets us remember `attr` for when when it is get/set
                return function (m, value) {
                    if (_.isUndefined(value)) {
                        return m.get(attr);
                    } else {
                        //console.log('set', value);
                        m.set(attr, value);
                    }
                };
            }

            function hackedSplice(index, howMany /* model1, ... modelN */) {
                var args = _.toArray(arguments).slice(2).concat({ at: index }),
                  removed = this.models.slice(index, index + howMany);

                this.remove(removed).add.apply(this, args);

                return removed;
            }

        },

        // Re-rendering the App just means refreshing the statistics -- the rest
        // of the app doesn't change.
        render: function () {

        },
        SelectProductPopUpButtonClick: function () {
            $("#popupSelectProduct").popup('open', { transition: 'pop' });

            $("#popupSelectProduct .select_product_search").focus();
        },

        //search: function (ev) {
        //    var searchText = this.select_product_search.val();// $(ev.target).val();

        //    if (searchText) {
        //        var self = this;
        //        var stockSelected = this.stockModel.get('stock_selected'); //$('.select-stock  option:selected').select().text();
        //        console.log(searchText + ' product ' + stockSelected);

        //        app.stockMethod.findeProductStartWith(stockSelected, searchText, 100, function (result) {
        //            self.resetFromService(result, stockSelected);
        //        });
        //    } else {
        //        this.collection.reset();
        //    }
        //},
        clearNewProductRowClick: function () {
            this.importProductCollection.reset();
        },
        saveImportProductClick: function () {
            var self = this;
            var stockModel = this.model.get('stockModel');
            var numSave = 0;
            areYouSure("Are you sure?", "Save data to server?", "Ok", function () {
                //console.log(self.importProductCollection.toArray());
                var numSave = 0;
                async.eachSeries(self.importProductCollection.toArray(), function (model, callback) {
                    model.save(stockModel.get('stock_selected'), function () {
                        numSave++;
                        self.importProductCollection.remove(model);
                        callback();
                    });
                },
                function (err) {

                    if (err) {
                        //alert(err);
                    } else {
                        self.ClearNewProductRow();
                    }

                    alert('Data has save to stock "' + stockSelectedName + '" ' + numSave + ' row');
                });

                //self.importProductCollection.forEach(function (model) {
                //    //console.log(model.toJSON());

                //    model.save(stockModel.get('stock_selected'), function () {

                //    });

                //});
            });
        }
    });

})(jQuery);
