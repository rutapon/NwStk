var app=app||{models:{},collections:{},views:{}};(function(e){"use strict";app.models.AddImportProductModel=Backbone.Model.extend({defaults:{},initialize:function(){var e=this;this.attributes.stockModel.on("change:stock",this.stockChange),this.attributes.selectProductCollection.comparator=function(e){return e.get("code")},this.attributes.selectProductCollection.on("all",function(t,n){e.trigger(t+":selectProductCollection",n)}),this.attributes.importProductCollection.on("all",function(t,n){e.trigger(t+":importProductCollection",n)}),this.attributes.stockModel.on("change:stock_selected",function(e,t){})},stockChange:function(e,t){},selectImportProduct:function(){},addImportProduct:function(e){this.attributes.importProductCollection.add(e.toJSON())},clear:function(){this.attributes.importProductCollection.reset()},update:function(e){}})})(jQuery)