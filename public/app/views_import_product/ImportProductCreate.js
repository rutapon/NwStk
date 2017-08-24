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

    app.views.ImportProductCreate = Backbone.View.extend({

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
            'change select.select-supplier-in': 'supplierChange',
            'click .ClearNewProductRow': 'clearNewProductRow',
            'click .SaveImportProduct': 'saveImportProduct'
        },
        initialize: function () {

            var self = this;

            this.importProductTable = this.$el.find('#popupImportProduct').get(0);
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

            //var supplierCollection = new app.collections.SupplierCollection();
            //supplierCollection.getAll();


            this.supplierCollection = new app.collections.SupplierCollection();
            this.supplierCollection.getAll();


            if (app.userModel.get('type') == 'staff_support') {
                self.$el.find('.div-select-supplier-in').remove();//select-supplier-in
            }
            else {

                this.supplierCollection.on('reset', function () {

                    self.$el.find('.select-supplier-in option').remove();
                    self.supplierCollection.each(function (model) {
                        var code = model.get('code');
                        var name = code + ' (' + model.get('name') + ')';

                        self.$el.find('.select-supplier-in').append('<option value="' + code + '">' + name + '</option>');
                    });

                    self.$el.find('.select-supplier-in').trigger("change");
                });
            }

            this.initTable();
        },

        initTable: function () {
            //var importDataTable;
            var self = this;
            var importProductTable = self.importProductTable;

            var importProductCollection = self.importProductCollection;
            var columns;
            var colHeaders;

            if (app.userModel.get('type') == 'staff_support') {
                $('#sum-amount-label').hide();
                columns = [
                  { readOnly: true, data: attr('code') },
                  { readOnly: true, data: attr('name') },
                  { readOnly: true, data: attr('unit_type') },


                   {
                       data: attr('invoid_id'),
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
                       format: '0,0.00',
                       //strict: true
                   }

                ];

                colHeaders = [
                        'code',
                        'Description',
                        'UnitType',
                        //'ขนาด',
                        //'ผู้ขาย',
                        'W/H Receive No.',
                        'Bill Date',
                        'Unit-In'
                ];
            }
            else {
                if (app.userModel.get('type') == 'staff_main') {

                    columns = [
                   { readOnly: true, data: attr('code') },
                   { readOnly: true, data: attr('name') },
                   { readOnly: true, data: attr('unit_type') },
                   //{ readOnly: true, data: attr('unit_size') },

                   /*{
                       data: attr('supplier_code'),
                       //type: 'autocomplete',
                       type: 'dropdown',
                       strict: true,
                       allowInvalid: false,
                       source: function (query, process) {
                           process(supplierCollection.pluck("code"));
    
                           //console.log(this.row);
                           //var ImportProductModel = importProductCollection.at(this.row);
    
                           //console.log(stockModel.get('stock_selected'), ImportProductModel.get('code'));
    
                           //var code = ImportProductModel.get('code');
    
                           //supplyLogCollection.find(code, stockModel.get('stock_selected'), function () {
    
                           //    //    process(_.uniq(supplyLogCollection.pluck('supplier_name')).reverse().splice(0,6));
                           //    //});
    
                           //    //supplyLogCollection.getAll(stockModel.get('stock_selected'), function () {
                           //    //var supplier_nameArry = _.pluck(_.filter(supplyLogCollection.toArray(), function (model) {
                           //    //    return model.get('product_id') == product_id;
                           //    //}), 'supplier_name');
    
                           //    var ModelObjArray = _.map(supplyLogCollection.toArray().reverse(), function (model) {
                           //        return model.toJSON();
                           //    });
    
                           //    var otherSupplier_nameArry = _.chain(ModelObjArray).
                           //        filter(function myfunction(modelObj) {
                           //            return modelObj['code'] != code;
                           //        }).pluck('supplier_code').unique().value();
    
    
                           //    var supplier_nameArry = _.chain(ModelObjArray).
                           //        filter(function myfunction(modelObj) {
                           //            return modelObj['code'] == code;
                           //        }).pluck('supplier_code').unique()
                           //        .union(otherSupplier_nameArry)
                           //        .first(5)
                           //        .value();
    
                           //    process(supplier_nameArry);
                           //});
    
                           //process(['ร้าน a', 'ร้าน b', 'ร้าน c']);
                       },
                       filter: false
                   },*/

                    {
                        //readOnly: true,
                        data: attr('unit_price'),
                        //type: 'autocomplete',
                        type: 'dropdown',
                        allowInvalid: false,
                        strict: true,
                        source: function (query, process) {
                            //    //console.log(this.row);

                            var ImportProductModel = importProductCollection.at(this.row);

                            var priceArr = [];

                            for (var i = 1; i <= 3; i++) {
                                if (ImportProductModel.get('unit_price' + i)) {
                                    priceArr.push(ImportProductModel.get('unit_price' + i));
                                }
                            }


                            //    console.log(stockModel.get('stock_selected'), ImportProductModel.get('code'));

                            //    var code = ImportProductModel.get('code')
                            //    supplyLogCollection.findeSupplyLog(code, stockModel.get('stock_selected'), function () {

                            //        process(_.uniq(supplyLogCollection.pluck('unit_price')).reverse().splice(0, 6));
                            //    });
                            process(priceArr);
                            //    //process([10, 50, 100]);

                        },
                        //filter: false
                    },
                    {
                        data: attr('invoid_id'),
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
                        format: '0,0.00',
                        //strict: true
                    },
                     {
                         data: attr('sum'),
                         readOnly: true,
                         type: 'numeric',
                         format: '0,0.00',
                         //strict: true
                     }
                    ];

                    colHeaders = [
                      'code',
                      'Description',
                      'UnitType',
                      //'ขนาด',
                      //'ผู้ขาย',
                      'Price/Unit',
                      'Bill Number',
                      'Bill Date',
                      'Unit-In',
                      'Amount'
                    ];
                }
                else {

                    columns = [
                 { readOnly: true, data: attr('code') },
                 { readOnly: true, data: attr('nameTh') },
                 { readOnly: true, data: attr('nameEn') },
                 { readOnly: true, data: attr('unit_type') },
                 {
                     //readOnly: true,
                     data: attr('unit_price'),
                     //type: 'autocomplete',
                     type: 'dropdown',
                     allowInvalid: false,
                     strict: true,
                     source: function (query, process) {
                         //    //console.log(this.row);

                         var ImportProductModel = importProductCollection.at(this.row);

                         var priceArr = [];

                         for (var i = 1; i <= 3; i++) {
                             if (ImportProductModel.get('unit_price' + i)) {
                                 priceArr.push(ImportProductModel.get('unit_price' + i));
                             }
                         }


                         //    console.log(stockModel.get('stock_selected'), ImportProductModel.get('code'));

                         //    var code = ImportProductModel.get('code')
                         //    supplyLogCollection.findeSupplyLog(code, stockModel.get('stock_selected'), function () {

                         //        process(_.uniq(supplyLogCollection.pluck('unit_price')).reverse().splice(0, 6));
                         //    });
                         process(priceArr);
                         //    //process([10, 50, 100]);

                     },
                     //filter: false
                 },
                  {
                      data: attr('invoid_id'),
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
                      format: '0,0.00',
                      //strict: true
                  },
                   {
                       data: attr('sum'),
                       readOnly: true,
                       type: 'numeric',
                       format: '0,0.00',
                       //strict: true
                   }];

                    colHeaders = [
                      'code',
                      'DescriptionTh',
                      'DescriptionEn',
                      'UnitType',
                      //'ขนาด',
                      //'ผู้ขาย',
                      'Price/Unit',
                      'Bill Number',
                      'Bill Date',
                      'Unit-In',
                      'Amount'
                    ];
                }

                importProductCollection.on('change:sum', function (model) {

                    var sumAmount = 0;
                    importProductCollection.forEach(function (modelEach, index) {
                        sumAmount += modelEach.attributes['sum'];
                    });

                    if (self.pettyCashModel) {
                        self.pettyCashModel.set('sum', sumAmount)
                    }

                    $('#sum-amount-label').text('All Amount: ' + sumAmount + '฿');

                });
            }

            //columns[4]= {
            //    data: attr('unit_price'),
            //    type: 'numeric',
            //    format: '0,0.00',
            //    //strict: true
            //};

            var importDataTable = new Handsontable(importProductTable, {
                data: importProductCollection,
                //stretchH: 'all',
                multiSelect: false,
                //dataSchema: makeCar,
                //contextMenu: ['remove_row'],
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
                            var ProductModel = importProductCollection.at(options.start.row);
                            importProductCollection.remove(ProductModel);
                        }
                    },
                    items: {
                        "delete": { name: 'Remove this row' }
                    }
                }
            })
            //importProductCollection.on('change:supplier_code', function (model) {
            //    //console.log('afterChange', JSON.stringify(e));
            //    //supplyLogCollection.findeSupplyLog(model.get('code'), stockModel.get('stock_selected'), function (result) {

            //    //    if (result.length) {
            //    //        var supplier = model.get('supplier_name');
            //    //        result = result.reverse();
            //    //        var findObj = _.find(result, function (obj) {
            //    //            return supplier == obj.supplier_name;
            //    //        });

            //    //        if (findObj) {
            //    //            model.set('unit_price', findObj.unit_price);
            //    //        }
            //    //    }

            //    //});

            //    //console.log(model.get('code'), model.get('supplier_code'), stockModel.get('stock_selected'));

            //    //var code = model.get('code');
            //    //var supplier_code = model.get('supplier_code');
            //    //var stock_selected = stockModel.get('stock_selected');

            //    //supplyLogCollection.getLastSupplyLog(code, supplier_code, stock_selected, function (supplyLogModel) {
            //    //    var unit_price = '';
            //    //    if (supplyLogModel) {
            //    //        unit_price = supplyLogModel.get('unit_price');
            //    //    }
            //    //    model.set('unit_price', unit_price);
            //    //});

            //});

            self.invoid_id_last = null;

            importProductCollection.on('change:invoid_id', function (model) {
                self.invoid_id_last = model.get('invoid_id');
                //console.log('change:invoid_id',invoid_id);
                importProductCollection.forEach(function (modelEach, index) {
                    if (!modelEach.attributes['invoid_id'] && model.cid != modelEach.cid) {
                        modelEach.attributes['invoid_id'] = self.invoid_id_last;
                    }
                });

            });
            importProductCollection.on('change:in_date', function (model) {
                var in_date = model.get('in_date');
                //console.log('change:invoid_id',invoid_id);
                importProductCollection.forEach(function (modelEach, index) {
                    if (model.cid != modelEach.cid) {
                        modelEach.attributes['in_date'] = in_date;
                    }
                });

            });

            importProductCollection.on('all', function () {
                importDataTable.render();
            }).on('add', function (model) {

                var supplierSelected = self.$el.find('select.select-supplier-in').val(); // self.supplierSelected;

                //var foundSupplier = false;
                for (var i = 1; i <= 3; i++) {
                    if (model.get('supplier' + i) == supplierSelected) {
                        model.set('unit_price', model.get('unit_price' + i));
                        break;
                    }
                }
                //if (!foundSupplier) {
                //    model.set('unit_price', model.get());
                //}

                if (self.invoid_id_last) {
                    model.attributes['invoid_id'] = self.invoid_id_last;
                }

                importDataTable.render();
            }).on('remove', function () {
                importDataTable.render();
            });
        },
        // Re-rendering the App just means refreshing the statistics -- the rest
        // of the app doesn't change.
        render: function () {

        },
        setPettyCashModel: function (model) {
            this.pettyCashModel = model;
        },

        SelectProductPopUpButtonClick: function () {
            $("#popupSelectProduct").popup('open', { transition: 'pop' });
            $("#popupSelectProduct .select_product_search").focus();
        },
        supplierChange: function (ev) {

            //console.log('supplierChange');
            //var $el = $(ev.target);
            //var value = $el.val();

            //this.supplierSelected = value;

            //this.editingModel.set('supplier_default', value);
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
            this.importProductCollection.reset();
            if (this.pettyCashModel) {
                this.pettyCashModel.set('sum', 0)
            }
            $('#sum-amount-label').text('All Amount: ' + 0 + '฿');
        },
        saveImportProduct: function () {
            var self = this;

            areYouSure("Are you sure?", "Save data to server?", "Ok", function () {
                var stockModel = self.model.get('stockModel');
                var stock_selected = stockModel.get('stock_selected');
                //console.log(self.importProductCollection.toArray());


                var supplierSelected = self.$el.find('select.select-supplier-in').val(); // self.supplierSelected;

                var isAllValid = true;



                self.importProductCollection.each(function (model) {

                    if (app.userModel.get('type') != 'staff_support') {
                        model.attributes['supplier_code'] = supplierSelected;
                    } else {
                        model.attributes['supplier_code'] = 'undefinded'
                    }

                    if (isAllValid && !model.isValid()) {
                        isAllValid = false;
                    }

                });

                if (isAllValid) {
                    self.importProductCollection.saveToServer(stock_selected, function (err, numSave) {
                        if (err) {
                            setTimeout(function () {
                                alert(err);
                            }, 10);

                        } else {
                            setTimeout(function () {
                                alert('Data has save to stock "' + stock_selected + '" ' + numSave + ' row');
                            }, 1);

                            self.invoid_id_last = null;

                            if (self.pettyCashModel) {
                                self.pettyCashModel.setInItemArray(self.importProductCollection.toJSON());
                                self.pettyCashModel.save(stock_selected, function () {
                                    self.clearNewProductRow();
                                });
                            } else {
                                self.clearNewProductRow();
                            }


                        }

                    });
                }

                //self.importProductCollection.forEach(function (model) {
                //    //console.log(model.toJSON());

                //    model.save(stockModel.get('stock_selected'), function () {

                //    });

                //});
            });
        }
    });

})(jQuery);
