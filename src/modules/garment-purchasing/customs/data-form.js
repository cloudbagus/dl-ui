import { bindable, inject, containerless, computedFrom, BindingEngine } from "aurelia-framework";
import { BindingSignaler } from 'aurelia-templating-resources';
import { Service } from "./service";
import moment from 'moment';
var SupplierLoader = require('../../../loader/garment-supplier-loader');
var CurrencyLoader = require('../../../loader/garment-currencies-by-date-loader');
var CustomsLoader = require('../../../loader/garment-customs-by-no-loader');

@containerless()
@inject(Service, BindingSignaler, BindingEngine)
export class DataForm {
    @bindable readOnly = false;
    @bindable readOnlyBCDL = true;
    @bindable readOnlyNoBCDL=false;
    @bindable options = { readOnly: false };
    @bindable hasView = false;
    @bindable data = {};
    @bindable title;
    @bindable amount;
    @bindable item;
    @bindable beacukai;
    typeCustoms = ["","BC 262", "BC 23","BC 40", "BC 27"]

    constructor(service, bindingSignaler, bindingEngine) {
        this.service = service;
        this.signaler = bindingSignaler;
        this.bindingEngine = bindingEngine;
    }
    @computedFrom("data.Id")
    get isEdit() {
        return false;
    }
    controlOptions = {
        label: {
            length: 4
        },
        control: {
            length: 5
        }
    }

    get dataAmount(){
        this.amount = this.amount || 0;
        return this.amount;
    }
    async beacukaiChanged(newValue, oldValue) {
        var selectedBeacukai = newValue;
       
        if (selectedBeacukai) {
            if (selectedBeacukai.BonNo) {
                this.data.beacukaiNo = selectedBeacukai.BCNo;
                this.data.beacukaiDate = selectedBeacukai.BCDate;
                this.data.customType = selectedBeacukai.BCType;
                this.data.billNo=selectedBeacukai.BonNo;
                this.context.beacukaiAU.editorValue="";
                console.log(selectedBeacukai);
            }else {
                this.data.beacukaiDate = null;
                this.data.beacukaiNo = null;
                this.data.customType=null;
                this.data.billNo="";
                console.log("dsdsds");
            }
        //     if (oldValue) {
        //         this.data.beacukaiDate = null;
        //         this.data.beacukaiNo = null;
        //         this.data.customType=null;
        //         this.data.billNo="";
        //         console.log(oldValue);
        //     }
        // } else {
        //     this.data.beacukaiDate = null;
        //     this.data.beacukaiNo = null;
        //     this.data.customType=null;
        //     this.data.billNo="";
        //     console.log("dsdsds");
        }
    }
    isBCDLChanged(e) {
        var selectedisBCDL = e.srcElement.checked || false;
      
       if(selectedisBCDL == true)
       {
         
            this.beacukai={};
            this.readOnlyBCDL=false;
            this.readOnlyNoBCDL=true;
            this.data.beacukaiDate = undefined;
            this.data.beacukaiNo = undefined;
            this.data.customType=undefined;
       }else
       {
            this.beacukai={};
            this.readOnlyBCDL=true;
            this.readOnlyNoBCDL=false;
            this.data.beacukaiDate = undefined;
            this.data.beacukaiNo = undefined;
            this.data.customType=undefined;
       }
    }
    bind(context) {
        console.log(this.data.billNo);
        this.context = context;
        this.data = this.context.data;
        this.error = this.context.error;
        this.hasView = this.context.hasView ? this.context.hasView : false;
        this.deliveryOrderColumns = this.hasView ? [
            
            { header: "No Surat Jalan", value: "no" },
            { header: "Tanggal Surat Jalan", value: "supplierDate" },
            { header: "Tanggal Datang Barang", value: "date" },
            { header: "Total Jumlah", value: "quantity" },
            { header: "Total Harga", value: "price" }
        ] : [
            { header: "", value: "selected" },
            { header: "No Surat Jalan", value: "no" },
            { header: "Tanggal Surat Jalan", value: "supplierDate" },
            { header: "Tanggal Datang Barang", value: "date" },
            { header: "Total Jumlah", value: "quantity" },
            { header: "Total Harga", value: "price" }
        ]
      
        if(this.data.Id)
        {
           
            var a;
            for(var i of this.data.deliveryOrders)
            {
                a=i.isView;break;
            }
           
            if(a===true)
            {
                this.options.hasView=true;
            }else
            {

                this.options.hasView=false;
            }
            if(this.data.billNo.includes("BP"))
            { this.data.isBCDL=false;
                this.readOnlyBCDL=true;
                
            }
            else
            {
                this.showCustoms=false;
                this.readOnlyBCDL=false;
                this.data.isBCDL=true; 
            }
        }else
        {
            this.options.hasView=true;
            this.showCustoms=true;
        }
    }
    @computedFrom("data.Id")
    get isEdit() {
        return (this.data.Id || '').toString() != '';
    }
    deliveryOrderColumns = [] 

    get supplierLoader(){
        return SupplierLoader;
    }

    get currencyLoader(){
        return CurrencyLoader;
    }
    get customsLoader(){
        return CustomsLoader;
    }


    get isSupplier(){
        return this.data && this.data.supplierId && this.data.supplierId !== '';
    }

    valueChange(e){
        console.log(e);
    }
    customsView = (customs) => {
       if(customs.BCNo)
       return `${customs.BCNo} - ${customs.BCType}- ${customs.BCDate}`;
    }
    currencyView = (currency) => {
        if(this.data.Id)
        {
            return currency.Code
        }else
        {
            return currency.code
        }
    }
    supplierView = (supplier) => {
        if(this.data.Id)
        {
            return `${supplier.Code} - ${supplier.Name}`
        }else
        {
            return `${supplier.code} - ${supplier.name}`
        }
    }

    supplierChange(e) {
        if (this.data.supplier && this.data.supplier._id){
            this.data.supplierId = this.data.supplier._id;
        }
        else{
            delete this.data.supplierId;
        }
        this.data.deliveryOrders = [];
        delete this.data.currencyId;
        this.data.currency = {};
    }

    async currencyChange(e){
        this.data.deliveryOrders = [];
      
        if (this.data.currency && this.data.currency.Id){
            this.data.currencyId = this.data.currency.Id;
            if(!this.hasView){
                var result = await this.service.searchDeliveryOrder({ "supplier" : `${this.data.supplier.Id}`, "currency" : `${this.data.currency.code}` });
                var dataDelivery = [];
              
                for(var a of result.data){
                    var data = a;
                    data["selected"] = false;
                    data["doNo"]=a.doNo;
                    data["doId"]=a.Id;
                    data["doDate"]=a.doDate;
                    data["arrivalDate"]=a.arrivalDate;
                    
                    data["isView"] = !this.hasView ? true : false
                    var quantity = 0;
                    var totPrice = 0;
                    for(var b of a.items){
                        for(var c of b.fulfillments){
                            quantity += c.doQuantity;
                            var priceTemp = c.doQuantity * c.pricePerDealUnit;
                            totPrice += priceTemp;
                        }
                    }
                    data["quantity"] = quantity;
                    data["price"] = totPrice.toFixed(3);
                    dataDelivery.push(data);
                }
                this.data.deliveryOrders = dataDelivery;
            }
        }
        else{
            delete this.data.currencyId;
        }
    }
}