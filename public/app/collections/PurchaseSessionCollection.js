/// <reference path="../../lib/underscore/underscore.js" />
/// <reference path="../../lib/jquery/jquery-2.1.1.js" />
/// <reference path="../../lib/backbone/backbone.js" />


var app = app || { models: {}, collections: {}, views: {} };

(function ($) {
    'use strict';

    app.collections.PurchaseSessionCollection = Backbone.Collection.extend({
        model: app.models.PurchaseSessionModel,


        getInPeriod: function (stock_selected, timeStart, timeEnd, cb) {

            var self = this;

            app.serviceMethod.getPurchaseSessionInPeriod({ timeStart: timeStart, timeEnd: timeEnd }, function (result) {

                // var sessionIds = _.chain(result).pluck('sessionId').value();
                // console.log(sessionIds);
                result = result.reverse()
                self.reset(result);

                if (cb) cb(result);
            });
        
        },


    });


})(jQuery);
