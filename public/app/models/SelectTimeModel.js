/// <reference path="../../lib/underscore/underscore.js" />
/// <reference path="../../lib/jquery/jquery-2.1.1.js" />
/// <reference path="../../lib/backbone/backbone.js" />


var app = app || { models: {}, collections: {}, views: {} };

(function ($) {
    'use strict';

    // Person Model
    app.models.SelectTimeModel = Backbone.Model.extend({
        defaults: {
            timePeriod: [],
            timeSelected: ""
        },
        //,
        //removeUi: function () {
        //    alert('trigger remove');

        //    this.trigger('removeUi', this);
        //}
        
 
    });

})(jQuery);
