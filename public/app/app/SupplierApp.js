var app = app || { models: {}, collections: {}, views: {} };

(function () {

    //if (!app.Class) app.Class = {};
    //app.Control.Products = {};

    app.initSupplier = function () {
        console.log('initSupplier');

        var supplierCollection = new app.collections.SupplierCollection([new app.models.SupplierModel()]);
        var CreateProduct = new app.views.SupplierCreate({ collection: supplierCollection });

        var editSupplierCollection = new app.collections.SupplierCollection();
        var supplierEditView = new app.views.SupplierEdit({ collection: editSupplierCollection });

        var curTab = 'createSupplier';
        var updateView = function () {

            if (curTab == 'editSupplier') {
                console.log('updateView editNav');

                supplierEditView.search();
            }
        }

        $(".ui-page-active [data-role='header'] li a").click(function () {
            //curTab = $(this).text();//.text();
            curTab = $(this).jqmData('value');

            $('.Nav').hide();
            $('#' + curTab).show();

            updateView();
        });

    };

})();
