var app = app || { models: {}, collections: {}, views: {} };

(function () {

    app.initReport = function () {
        console.log('app.initReport');
        var stockModel = new app.models.Stock();

        var selectTimePeriodModel = new Backbone.Model();

        var selectTimePeriodView = new app.views.SelectTimePeriod({
            el: '.SelectTimePeriod',
            model: selectTimePeriodModel
        });

        var reportStockCardView = new app.views.ReportStockCard({
            el: '.ReportStockCard',
            model: { stockModel: stockModel, selectTimePeriodModel: selectTimePeriodModel }
        });

        var reportStockLastingView = new app.views.ReportStockLasting({
            el: '.ReportStockLasting',
            model: { stockModel: stockModel }
        });

        var reportPurchaseSupplierView = new app.views.ReportPurchaseSupplier({
            el: '.ReportPurchaseSupplier',
            model: { stockModel: stockModel, selectTimePeriodModel: selectTimePeriodModel }
        });

        var reportPurchaseProductView = new app.views.ReportPurchaseProduct({
            el: '.ReportPurchaseProduct',
            model: { stockModel: stockModel, selectTimePeriodModel: selectTimePeriodModel }
        });

        var reportCheckProductView = new app.views.ReportCheckProduct({
            el: '.ReportCheckProduct',
            model: { stockModel: stockModel }
        });

        var viewSelectProduct = new app.views.SelectProduct2({
            el: '#popupSelectProduct',
            model: { stockModel: stockModel }
        });

        viewSelectProduct.on('select', function (selectedModels) {
            //console.log('viewSelectProduct',selectedModels);
            if (selectedModels.length > 0) {
                //$("#popupSelectProduct").popup('close', { transition: 'flow' });

                var selectProduct = selectedModels[0];

                if (curTab == 'ReportStockCard') {
                    $('.SelectTimePeriod').show();
                    reportStockCardView.search(selectedModels);
                    reportStockCardView.render();
                }
                else if (curTab == 'ReportPurchaseProduct') {
                    $('.SelectTimePeriod').show();
                    reportPurchaseProductView.search(selectedModels);
                    reportPurchaseProductView.render();
                }
            }
            //for (var i in selectedModels) {
            //    var product = selectedModels[i];
            //    //this.model.addImportProduct(product);
            //    console.log(product.toJSON());
            //}
        })

        var curTab = 'ReportStockCard';
        var updateView = function () {

            if (curTab == 'ReportStockCard') {
                $('.SelectTimePeriod').show();
                reportStockCardView.search();
            } else if (curTab == 'ReportStockLasting') {
                $('.SelectTimePeriod').hide();
                reportStockLastingView.search();
            } else if (curTab == 'ReportPurchaseSupplier') {
                $('.SelectTimePeriod').show();
                reportPurchaseSupplierView.search();
            }
            else if (curTab == 'ReportPurchaseProduct') {
                $('.SelectTimePeriod').show();
            }
            else if (curTab == 'ReportCheckProduct') {
                //$('.ReportCheckProduct').show();
                $('.SelectTimePeriod').hide();
                reportCheckProductView.search();
            }
        };

        $(".ui-page-active [data-role='header'] li a").click(function () {
            //curTab = $(this).text();//.text();
            curTab = $(this).jqmData('value');

            $('.reportNav').hide();
            $('.' + curTab).show();
            updateView();
        });

        stockModel.on('change:stock_selected', function (model, stock_selected) {
            console.log('change:stock_selected');
            updateView();
        });

        stockModel.set('stock', []);
        stockModel.update();
    }
})();
