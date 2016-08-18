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

                'change  input': 'inputChange'
            },

            initialize: function () {
                //this.model.on('change', this.render, this);
                //this.model.on('destroy', this.remove, this);
                //this.model.on('removeUi', this.remove, this);
                this.model.on('remove', this.remove, this);
                this.CreateStockTableTrTemplate = _.template($('#CreateStockTable-tr-template').html());

            },

            // Re-rendering the App just means refreshing the statistics -- the rest
            // of the app doesn't change.
            render: function () {
                this.$el.html(this.CreateStockTableTrTemplate(this.model.toJSON()));
                this.$el.find('input').textinput();
                return this;
            },

            remove: function () {
                this.$el.remove();
            },

            //removeProduct: function () {
            //    this.model.destroy();
            //},

            inputChange: function (ev) {
                var targetElem = $(ev.target);
                var dataType = targetElem.attr('data-type');
                var value = targetElem.val();

                this.model.set(dataType, value);
            }
        });
    });
})(jQuery);
