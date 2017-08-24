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

    app.views.ExportProductCreate = Backbone.View.extend({

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

            'click .ClearNewProductRow': 'clearNewProductRow',
            'click .SaveExportProduct': 'saveExportProduct'
        },

        initialize: function () {

            var self = this;

            var exportProductTable = this.$el.find('#popupExportProduct').get(0);
            var selectexportProductTable = $(".select-result");
            this.select_product_search = this.$el.find('.select_product_search');

            var stockModel = this.model.get('stockModel');
            var exportProductCollection = this.exportProductCollection = this.model.get('importProductCollection');

            exportProductCollection.splice = hackedSplice;

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
                        self.$el.find('.select-stock').append('<option value="' + item + '">' + item + '</option>');
                        self.$el.find('.select-stock').trigger("change");
                    });
                }
            });
            stockModel.on('change:stock_selected', function (model, stock_selected) {

                //self.$el.find('.select-stock select').val(stock_selected).trigger("change");
                var stockSelectedInner = self.$el.find('.select-stock option:selected').select().text();

                if (stock_selected != stockSelectedInner) {
                    //console.log('change:stock_selected iner');
                    self.$el.find('.select-stock option[value=' + stock_selected + ']').prop('selected', true).trigger("change");;
                }
            });
            //stockModel.on('change:stock_selected', function (model, stock_selected) {
            //    //viewSelectProduct.clear();
            //});

            var supplierCollection = new app.collections.SupplierCollection();
            supplierCollection.getAll();

            var columns = null;
            var colHeaders = null;

            if (app.userModel.get('type') == 'admin') {
                columns = [
                     { readOnly: true, data: attr('code') },
                     { readOnly: true, data: attr('nameTh') },
                     { readOnly: true, data: attr('nameEn') },
                     { readOnly: true, data: attr('unit_type') },

                      {
                          data: attr('requisition_id'),
                      },

                      {
                          data: attr('out_date'),
                          type: 'date',
                          dateFormat: 'YYYY-MM-DD',
                          correctFormat: true,
                          strict: true
                      },
                      {
                          data: attr('unit'),
                          type: 'numeric',
                          format: '0,0.00'
                          //strict: true
                      },
                       {
                           data: attr('job'),
                       }
                ];

                colHeaders = [
                        'code',
                        'DescriptionTh',
                        'DescriptionEn',
                        'UnitType',
                        //'ขนาด',
                        //'ผู้ขาย',
                        //'ราคา/หน่วย',
                        'Doc Number',
                        'Doc Date',
                        'Unit-Out',
                        'Dept.'
                ];
            }
            else {
                columns = [
                     { readOnly: true, data: attr('code') },
                     { readOnly: true, data: attr('name') },
                     { readOnly: true, data: attr('unit_type') },

                      {
                          data: attr('requisition_id'),
                      },

                      {
                          data: attr('out_date'),
                          type: 'date',
                          dateFormat: 'YYYY-MM-DD',
                          correctFormat: true,
                          strict: true
                      },
                      {
                          data: attr('unit'),
                          type: 'numeric',
                          format: '0,0.00'
                          //strict: true
                      },
                       {
                           data: attr('job'),
                       }
                ];

                colHeaders = [
                        'code',
                        'Description',
                        'UnitType',
                        //'ขนาด',
                        //'ผู้ขาย',
                        //'ราคา/หน่วย',
                        'Doc Number',
                        'Doc Date',
                        'Unit-Out',
                        'Dept.'
                ];
            }

            var importDataTable = new Handsontable(exportProductTable, {
                data: exportProductCollection,
                //stretchH: 'all',
                multiSelect: false,
                //dataSchema: makeCar,
                //contextMenu: true,
                height: 400,
                columns: columns,
                colHeaders: colHeaders
                //afterChange: function (e) {
                //    console.log('afterChange', JSON.stringify(e));
                //},

                // minSpareRows: 1 //see notes on the left for `minSpareRows`
            });
            importDataTable.updateSettings({
                contextMenu: {
                    callback: function (key, options) {
                        if (key === 'delete') {
                            //console.log(options.start.row);
                            var ProductModel = exportProductCollection.at(options.start.row);
                            exportProductCollection.remove(ProductModel);
                        }
                    },
                    items: {
                        "delete": { name: 'Remove this row' }
                    }
                }
            })
            exportProductCollection.on('change:supplier_code', function (model) {
                //console.log('afterChange', JSON.stringify(e));
                //supplyLogCollection.findeSupplyLog(model.get('code'), stockModel.get('stock_selected'), function (result) {

                //    if (result.length) {
                //        var supplier = model.get('supplier_name');
                //        result = result.reverse();
                //        var findObj = _.find(result, function (obj) {
                //            return supplier == obj.supplier_name;
                //        });

                //        if (findObj) {
                //            model.set('unit_price', findObj.unit_price);
                //        }
                //    }

                //});

                //console.log(model.get('code'), model.get('supplier_code'), stockModel.get('stock_selected'));
                var code = model.get('code');
                var supplier_code = model.get('supplier_code');
                var stock_selected = stockModel.get('stock_selected');

                supplyLogCollection.getLastSupplyLog(code, supplier_code, stock_selected, function (supplyLogModel) {
                    var unit_price = '';
                    if (supplyLogModel) {
                        unit_price = supplyLogModel.get('unit_price');
                    }
                    model.set('unit_price', unit_price);
                });

            });

            self.requisition_id_last = null;
            exportProductCollection.on('change:requisition_id', function (model) {
                self.requisition_id_last = model.get('requisition_id');

                exportProductCollection.forEach(function (modelEach, index) {
                    if (!modelEach.attributes['requisition_id'] && model.cid != modelEach.cid) {
                        modelEach.attributes['requisition_id'] = self.requisition_id_last;
                    }
                });

            });

            exportProductCollection.on('change:out_date', function (model) {
                var out_date = model.get('out_date');
                //console.log('change:invoid_id',invoid_id);
                exportProductCollection.forEach(function (modelEach, index) {
                    if (model.cid != modelEach.cid) {
                        modelEach.attributes['out_date'] = out_date;
                    }
                });

            });

            exportProductCollection.on('change:job', function (model) {
                var invoid_id = model.get('job');

                exportProductCollection.forEach(function (modelEach, index) {
                    if (!modelEach.attributes['job'] && model.cid != modelEach.cid) {
                        modelEach.attributes['job'] = invoid_id;
                    }
                });

            });

            exportProductCollection.on('all', function () {
                importDataTable.render();
            }).on('add', function (model) {

                if (self.requisition_id_last) {
                    model.attributes['requisition_id'] = self.requisition_id_last;
                }

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

        //        app.serviceMethod.findeProductStartWith(stockSelected, searchText, 100, function (result) {
        //            self.resetFromService(result, stockSelected);
        //        });
        //    } else {
        //        this.collection.reset();
        //    }
        //},
        clearNewProductRow: function () {
            this.exportProductCollection.reset();
        },
        saveExportProduct: function () {
            var self = this;

            areYouSure("Are you sure?", "Save data to server?", "Ok", function () {
                var stockModel = self.model.get('stockModel');
                var stock_selected = stockModel.get('stock_selected');
                //console.log(self.exportProductCollection.toArray());

                var isAllValid = true;
                self.exportProductCollection.each(function (model) {

                    if (isAllValid && !model.isValid()) {
                        isAllValid = false;
                    }

                });
                if (isAllValid) {
                    self.exportProductCollection.saveToServer(stock_selected, function (err, numSave) {
                        if (err) {
                            setTimeout(function () {
                                alert(err);
                            }, 10);

                        } else {

                            self.requisition_id_last = null;
                            self.clearNewProductRow();

                            setTimeout(function () {
                                alert('Data has save to stock "' + stock_selected + '" ' + numSave + ' row');
                            }, 1);
                        }

                    });
                }
                //self.exportProductCollection.forEach(function (model) {
                //    //console.log(model.toJSON());

                //    model.save(stockModel.get('stock_selected'), function () {

                //    });

                //});
            });
        }
    });

})(jQuery);
