module.exports = {
    'new': {
        pass: '123',
        type: 'admin',
        lng: 'Th',
        //permission: {
        //    'Supplier': { 'createNav': true, 'editNav': true },
        //    'Product': { 'createProdut': true, 'showProduct': true, 'editProduct': true },
        //    'Stock-In': { 'importProduct': true, 'editImportProduct': true },
        //    'Stock-Out': { 'exportProduct': true, 'editExportProduct': true },
        //    'Stock-Checking': { 'checkProduct': true, 'editCheckProduct': true },
        //    'Report': { 'ReportStockCard': true, 'ReportStockLasting': true, 'ReportCheckProduct': true, 'ReportPurchaseSupplier': true, 'ReportPurchaseProduct': true }
        //}
    },
    'admin': {
        pass: 'admin',
        type: 'admin',
        lng: 'Th',
        //permission: {
        //    'Supplier': { 'createNav': true, 'editNav': true },
        //    'Product': { 'createProdut': true, 'showProduct': true, 'editProduct': true },
        //    'Stock-In': { 'importProduct': true, 'editImportProduct': true },
        //    'Stock-Out': { 'exportProduct': true, 'editExportProduct': true },
        //    'Stock-Checking': { 'checkProduct': true, 'editCheckProduct': true },
        //    'Report': { 'ReportStockCard': true, 'ReportStockLasting': true, 'ReportCheckProduct': true, 'ReportPurchaseSupplier': true, 'ReportPurchaseProduct': true }
        //}
    },
    'staff1': {
        pass: '123',
        dpm: ['resort'],
        type: 'staff_main',
        storeAccess: { 'resort': ['Store-Main', 'Store-Engineer', 'Store-HK'] },
        lng: 'Th',
        permission: {
            'Supplier': { 'createSupplier': true, 'editSupplier': true },
            'Product': { 'createProdut': true, 'showProduct': true, 'editProduct': true },
            'Stock-In': { 'importProduct': true, 'editImportProduct': true },
            'Stock-Out': { 'exportProduct': true, 'editExportProduct': true },
            'Stock-Checking': { 'checkProduct': true, 'editCheckProduct': true },
            'Report': { 'ReportStockCard': true, 'ReportStockLasting': true, 'ReportCheckProduct': true, 'ReportPurchaseSupplier': true, 'ReportPurchaseProduct': true }
        }
    },

    'staff2': {
        pass: '123',
        dpm: ['shop'],
        type: 'staff_main',
        storeAccess: { 'shop': ['Store-Main'] },
        lng: 'Th',
        permission: {
            'Supplier': { 'createSupplier': true, 'editSupplier': true },
            'Product': { 'createProdut': true, 'showProduct': true, 'editProduct': true },
            'Stock-In': { 'importProduct': true, 'editImportProduct': true },
            'Stock-Out': { 'exportProduct': true, 'editExportProduct': true },
            'Stock-Checking': { 'checkProduct': true, 'editCheckProduct': true },
            'Report': { 'ReportStockCard': true, 'ReportStockLasting': true, 'ReportCheckProduct': true }
        }
    },
    'staff3': {
        pass: '123',
        dpm: ['resort'],
        type: 'staff_main',
        storeAccess: 'all',
        lng: 'Th',
        permission: {

            'Report': { 'ReportStockCard': true, 'ReportStockLasting': true, 'ReportCheckProduct': true, 'ReportPurchaseSupplier': true, 'ReportPurchaseProduct': true }
        }
    },
    'support1': {
        pass: '123',
        dpm: ['resort'],
        type: 'staff_support',
        lng: 'En',
        storeAccess: { 'resort': ['Store-Main'] },
        permission: {

            'Stock-In': { 'importProduct': true, 'editImportProduct': true },
            'Stock-Out': { 'exportProduct': true, 'editExportProduct': true },
            'Stock-Checking': { 'checkProduct': true, 'editCheckProduct': true },
            'Report': { 'ReportStockCard': true, 'ReportStockLasting': true, 'ReportCheckProduct': true }
        }
    },
    'test': {
        pass: '123',
        dpm: ['resort'],
        type: 'staff_support',
        lng: 'En',
        storeAccess: { 'resort': ['Store-Test'] },
        permission: {

            'Stock-In': { 'importProduct': true, 'editImportProduct': true },
            'Stock-Out': { 'exportProduct': true, 'editExportProduct': true },
            'Stock-Checking': { 'checkProduct': true, 'editCheckProduct': true },
            'Report': { 'ReportStockCard': true, 'ReportStockLasting': true, 'ReportCheckProduct': true }
        }
    }
};