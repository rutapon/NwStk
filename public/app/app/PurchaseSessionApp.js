var app = app || { models: {}, collections: {}, views: {} };

(function () {

    //if (!app.Class) app.Class = {};
    //app.Control.Products = {};

    app.initPurchaseSessionApp = function (listType) {
        //var stockModel = new app.models.Stock();

        //var supplierCollection = new app.collections.SupplierCollection();

        //purchaseSessionModel.setNewSessionId();

        new app.views.PurchaseSession({
            el: '.PurchaseSession',
        });


    };

})();
