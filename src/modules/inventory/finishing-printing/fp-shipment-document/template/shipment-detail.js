import { inject, bindable, computedFrom, BindingEngine } from 'aurelia-framework';
import { BindingSignaler } from 'aurelia-templating-resources';
import { Service } from './../service';
var ProductionOrderLoader = require('../../../../../loader/production-order-loader');

@inject(Service, BindingEngine, BindingSignaler)
export class ShipmentDetail {

    constructor(service, bindingSignaler, bindingEngine) {
        this.service = service;
        this.signaler = bindingSignaler;
        this.bindingEngine = bindingEngine;
    }

    sppFilter = {};
    async activate(context) {
        this.data = context.data;
        this.error = context.error;
        this.options = context.options;
        this.context = context.context;
        this.selectedProductionOrder = this.data.ProductionOrder || undefined;
        this.selectedBuyerName = this.context.options.selectedBuyerName;
        this.selectedBuyerId = this.context.options.selectedBuyerId;
        this.selectedStorageCode = this.context.options.selectedStorageCode;
        // this.isNewStructure = this.context.options.isNewStructure;

        console.log(this.context);
        this.sppFilter = { "BuyerId": this.selectedBuyerId };

        // if (this.data.productionOrderId) {
        //     this.selectedProductionOrder = await this.service.getProductionOrderById(this.data.productionOrderId)
        // }
    }

    controlOptions = {
        control: {
            length: 12
        }
    }

    // productionOrderFields = ["_id", "orderNo", "orderType.name", "designCode", "designNumber", "details.colorType"];
    // packingReceiptFields = ["_id", "code", "storageId", "storage.code", "storage.name", "referenceNo", "referenceType", "items.product", "items.availableQuantity"];
    // productFields = ["_id", "code", "name", "properties.designCode", "properties.designNumber", "properties.length", "properties.weight"];
    // summaryFields = ["_id", "uomId", "uom", "quantity"];

    itemColumns = ["Macam Barang", "Design", "Satuan", "Kuantiti Satuan", "Panjang Satuan", "Panjang Total", "Berat Satuan", "Berat Total"];
    newItemColumns = ["Daftar Packing Receipt"];

    @bindable selectedProductionOrder;
    async selectedProductionOrderChanged(newVal, oldVal) {
        this.selectedProductionOrder = newVal;
        if (newVal) {
            this.data.ProductionOrder = newVal;

            this.data.ProductionOrderColorType = newVal.Details && newVal.Details.length > 0 ? newVal.Details[0].Color : "";
            this.data.ProductionOrderDesignCode = newVal.DesignMotive ? newVal.DesignMotive.Code : "";
            this.data.ProductionOrderDesignNumber = newVal.DesignMotive ? newVal.DesignMotive.Name : "";
            this.data.ProductionOrderId = newVal.Id;
            this.data.ProductionOrderNo = newVal.OrderNo;
            this.data.ProductionOrderType = newVal.OrderType ? newVal.OrderType.Name : "";


            //get packing receipts by buyer and production order number where stock balance is greater than 0

            var packingReceiptFilter = {
                "ProductionOrderNo": newVal.OrderNo,
                "IsVoid": false
            }

            var info = { filter: JSON.stringify(packingReceiptFilter), size: Number.MAX_SAFE_INTEGER };
            var packingReceipts = await this.service.searchPackingReceipts(info);

            if (packingReceipts.length > 0) {

                var items = [];
                for (var packingReceipt of packingReceipts) {
                    var _item = {};
                    _item.PackingReceiptId = packingReceipt.Id;
                    _item.PackingReceiptCode = packingReceipt.Code;
                    _item.StorageId = packingReceipt.Storage.Id;
                    _item.StorageCode = packingReceipt.Storage.code;
                    _item.StorageName = packingReceipt.Storage.name;
                    _item.ReferenceNo = packingReceipt.ReferenceNo;
                    _item.ReferenceType = packingReceipt.ReferenceType;
                    _item.packingReceiptItems = [];

                    //find products
                    var productList = packingReceipt.Items.map((packingReceiptItem) => packingReceiptItem.ProductId.toString());
                    // console.log(productIds);
                    // var productFilter = {
                    //     "name": {
                    //         "$in": productNames
                    //     }
                    // }
                    // var productInfo = { filter: JSON.stringify(productFilter), select: this.productFields, size: 100 };
                    var products = await this.service.searchProducts(productList);
                    console.log(products);

                    //find summaries
                    // var inventorySummariesFilter = {
                    //     // "$and": [
                    //     //     {
                    //     //         "productName": {
                    //     //             "$in": productNames
                    //     //         },
                    //     //     },
                    //     //     { "storageCode": this.selectedStorageCode }
                    //     // ]
                    // }
                    // var inventorySummariesInfo = { filter: JSON.stringify(inventorySummariesFilter), size: 100 };
                    // var inventorySummaries = await this.service.searchInventorySummaries(inventorySummariesInfo);

                    // for (var packingReceiptItem of packingReceipt.items) {
                    //     var _packingReceiptItem = {};
                    //     var product = products.find((product) => packingReceiptItem.product.toString().toLowerCase() === product.name.toString().toLowerCase());
                    //     var summary = inventorySummaries.find((inventorySummary) => inventorySummary.productName.toString().toLowerCase() === product.name.toString().toLowerCase());

                    //     if (product && summary && summary.quantity > 0) {
                    //         _packingReceiptItem.productId = product._id;
                    //         _packingReceiptItem.productCode = product.code;
                    //         _packingReceiptItem.productName = product.name;
                    //         _packingReceiptItem.designCode = product.properties.designCode;
                    //         _packingReceiptItem.designNumber = product.properties.designNumber;
                    //         _packingReceiptItem.colorType = packingReceipt.colorName;
                    //         _packingReceiptItem.uomId = summary.uomId;
                    //         _packingReceiptItem.uomUnit = summary.uom;
                    //         _packingReceiptItem.quantity = packingReceiptItem.availableQuantity;
                    //         _packingReceiptItem.length = product.properties.length;
                    //         _packingReceiptItem.weight = product.properties.weight;

                    //         _item.packingReceiptItems.push(_packingReceiptItem);
                    //     }
                    // }

                    // if (_item.packingReceiptItems.length > 0) {
                    //     items.push(_item);
                    // }

                }
                // this.data.items = items;
            } else {
                this.data.Items = [];
            }
        } else {
            this.data.ProductionOrderColorType = undefined;
            this.data.ProductionOrderDesignCode = undefined;
            this.data.ProductionOrderDesignNumber = undefined;
            this.data.ProductionOrderId = undefined;
            this.data.ProductionOrderNo = undefined;
            this.data.ProductionOrderType = undefined;
            this.data.Items = [];
        }
    }

    get productionOrderLoader() {
        return ProductionOrderLoader;
    }

    removeItems() {
        this.bind();
    }
}