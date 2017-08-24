/// <reference path="../../lib/jquery/jquery-2.1.1.js" />
/*global Backbone, jQuery, _, ENTER_KEY */
var app = app || { models: {}, collections: {}, views: {} };

(function ($) {
    'use strict';

    $(function () {
        app.views.CreateProductTableTr = Backbone.View.extend({

            tagName: 'tr',
            className: 'CreateProductTableTr',

            events: {

                'change  input': 'inputChange',
                'change select': 'supplierChange'
            },

            initialize: function () {
                //this.model.on('change', this.render, this);
                //this.model.on('destroy', this.remove, this);
                //this.model.on('removeUi', this.remove, this);

                this.collection.on('reset', this.render, this);

                this.model.on('remove', this.destroy_view, this);
                this.CreateStockTableTrTemplate = _.template($('#CreateStockTable-tr-template').html());
            },

            // Re-rendering the App just means refreshing the statistics -- the rest
            // of the app doesn't change.
            render: function () {

                var tempObj = { p: this.model.toJSON(), s: this.collection.pluck("code") };
                this.$el.html(this.CreateStockTableTrTemplate(tempObj));
                this.$el.find('input').textinput();

                if (this.model.get('supplier_default')) {
                    this.$el.find('select').removeClass('not_chosen');
                }
                var allSelectEl = this.$el.find('select.select-supplier');

                _.each(allSelectEl, function myfunction(el, index) {
                    var $el = allSelectEl.eq(index);
                    var value = $el.val();

                    if (value) {
                        $el.removeClass('not_chosen');
                    } else {
                        $el.addClass('not_chosen');
                    }
                });

                return this;
            },

            destroy_view: function () {

                // COMPLETELY UNBIND THE VIEW
                this.undelegateEvents();

                this.$el.removeData().unbind();

                // Remove view from DOM
                this.remove();
                Backbone.View.prototype.remove.call(this);
            },

            //removeProduct: function () {
            //    this.model.destroy();
            //},

            inputChange: function (ev) {
                var targetElem = $(ev.target);
                var dataType = targetElem.attr('data-type');
                var value = targetElem.val();

                this.model.set(dataType, value);
            },
            supplierChange: function (ev) {
                var $el = $(ev.target);
                var value = $el.val();

                var name = $el.attr("name");

                //alert(name);
                if (value) {
                    $el.removeClass('not_chosen');
                } else {
                    $el.addClass('not_chosen');
                }

                this.model.set(name, value);
            }
        });
    });
})(jQuery);
