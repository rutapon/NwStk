/// <reference path="../../lib/underscore/underscore.js" />
/// <reference path="../../lib/jquery/jquery-2.1.1.js" />
/// <reference path="../../lib/backbone/backbone.js" />


var app = app || { models: {}, collections: {}, views: {} };

(function ($) {
    'use strict';

    // Person Model
    app.models.AddImportProductModel = Backbone.Model.extend({
        defaults: {

        },
        initialize: function () {
            var self = this;
            this.attributes.stockModel.on('change:stock', this.stockChange);
            //this.ImportProductCollection.on('',this.);
          
            this.attributes.selectProductCollection.comparator = function (model) {
                return model.get('code');
            };
            this.attributes.selectProductCollection.on('all', function (eventName, ev) {
                self.trigger(eventName + ':selectProductCollection', ev);
            });
            this.attributes.importProductCollection.on('all', function (eventName, ev) {
                self.trigger(eventName + ':importProductCollection', ev);
            });


            this.attributes.stockModel.on('change:stock_selected', function (model, stock_selected) {
                //viewSelectProduct.clear();
            });
        },
        stockChange:function (model, stock) {
    
        },

        selectImportProduct:function () {
            //var selectedModels = this.allProductTable.getSelectedModels();

            //this.trigger('select', selectedModels);
            ////console.log(selectedModels.length);
            ////this.collection.saveToXlsx(this.model.stockModel.get('stock_selected') + "#" + this.$el.find('.show_product_search').val());

            //this.clear();
        },
        addImportProduct: function (product) {

            //var ip = new app.models.ImportProductModel(product.toJSON());
            //console.log(ip.toJSON());
            this.attributes.importProductCollection.add(product.toJSON());
        },
        clear: function () {
            this.attributes.importProductCollection.reset();
        },
        update: function (cb) {
     
        }
    });

})(jQuery);
