var app=app||{models:{},collections:{},views:{}};(function(e){"use strict";e(function(){app.views.CreateProductTableTr=Backbone.View.extend({tagName:"tr",className:"CreateProductTableTr",events:{"change  input":"inputChange"},initialize:function(){this.model.on("remove",this.remove,this),this.CreateStockTableTrTemplate=_.template(e("#CreateStockTable-tr-template").html())},render:function(){return this.$el.html(this.CreateStockTableTrTemplate(this.model.toJSON())),this.$el.find("input").textinput(),this},remove:function(){this.$el.remove()},inputChange:function(t){var n=e(t.target),r=n.attr("data-type"),i=n.val();this.model.set(r,i)}})})})(jQuery)