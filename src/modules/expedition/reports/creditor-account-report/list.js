import { inject } from 'aurelia-framework';
import moment from 'moment';
import numeral from 'numeral';
import XLSX from 'xlsx';
import { Service } from './service';
const SupplierLoader = require('../../../../loader/supplier-loader');

@inject(Service)
export class List {
    itemYears = [];
    controlOptions = {
        label: {
            length: 4,
        },
        control: {
            length: 4,
        },
    };

    tableOptions = {
        showColumns: false,
        search: false,
        showToggle: false,
        sortable: false
    };

    constructor(service) {
        this.service = service;
        this.info = {};
        this.error = {};
        this.data = [];
        this.isEmpty = true;
        this.currency = '';
        this.mutation = 0;
        this.closingBalance = 0;
        this.itemMonths = [
            { text: 'January', value: 1 },
            { text: 'February', value: 2 },
            { text: 'March', value: 3 },
            { text: 'April', value: 4 },
            { text: 'May', value: 5 },
            { text: 'June', value: 6 },
            { text: 'July', value: 7 },
            { text: 'August', value: 8 },
            { text: 'September', value: 9 },
            { text: 'October', value: 10 },
            { text: 'November', value: 11 },
            { text: 'Desember', value: 12 }
        ];
        this.currentYear = moment().format('YYYY');

        for (var i = parseInt(this.currentYear); i >= 2018; i--) {
            this.itemYears.push(i.toString());
        }
    }

    supplierView = (supplier) => {
        return supplier.name;
    }

    async search() {
        if (this.info.supplier && this.info.supplier.name)
            this.info.name = this.info.supplier.name;

        let validationError = false;

        if (this.info && (!this.info.supplier || this.info.supplier.name == null)) {
            this.error.supplier = "Supplier harus diisi";
            validationError = true;
        }
        if (!validationError) {
            this.error = {};
            // this.flag = true;
            // this.tableList.refresh();

            let params = {
                supplierName: this.info.name,
                month: this.info.month.value,
                year: this.info.year,
            }
            
            this.data = await this.service.search(params)
                .then((result) => {
                    if(result.data.length == 0)
                        this.isEmpty = true;
                    else
                        this.isEmpty = false;
                    
                    var newDatas =[];
                    for(var item of result.data){
                        if(item.Date){
                            var newData = {
                                Date: item.Date ? moment(item.Date).format('DD-MMM-YYYY') : null,
                                UnitReceiptNoteNo : item.UnitReceiptNoteNo,
                                BankExpenditureNoteNo : item.BankExpenditureNoteNo,
                                MemoNo : item.MemoNo,
                                InvoiceNo : item.InvoiceNo,
                                DPP : item.DPP ? numeral(item.DPP).format('0,000') : 0,
                                PPN : item.PPN ?  numeral(item.PPN).format('0,000') : 0,
                                Total : item.Total ?  numeral(item.Total).format('0,000') : 0,
                                Mutation : item.Mutation ?  numeral(item.Mutation).format('0,000') : 0,
                                FinalBalance : item.FinalBalance ?  numeral(item.FinalBalance).format('0,000') : null
                            }
                        }else{
                            var newData = {
                                Date:  null,
                                InvoiceNo : item.InvoiceNo,
                                DPP :null,
                                Mutation : item.Mutation ?  numeral(item.Mutation).format('0,000') : 0,
                                FinalBalance : item.FinalBalance ?  numeral(item.FinalBalance).format('0,000') : null
                            }
                        }
                        this.currency = item.Currency;
                        newDatas.push(newData);
                    }
                    this.closingBalance = numeral(result.finalBalance).format('0,000');
                    this.mutation = numeral(result.finalBalance).format('0,000');
                    
                    return newDatas;
                });
            //console.log(this.data);
        }
    }

    excel() {
        if (this.info.supplier && this.info.supplier.name)
            this.info.supplierName = this.info.supplier.name;

        let validationError = false;

        if (this.info && (!this.info.supplier || this.info.supplier.name == null)) {
            this.error.supplier = "Supplier harus diisi";
            validationError = true;
        }

        if (!validationError) {
            this.error = {};
            // this.flag = true;
            // this.tableList.refresh();

            let params = {
                supplierName: this.info.supplierName,
                month: this.info.month.value,
                year: this.info.year,
            }

            this.service.getXls(params)
        }
        // this.getExcelData();
    }

    reset() {
        this.error = {};
        this.isEmpty = true;
        // this.flag = false;
        this.info.supplier = undefined;
        this.info.supplierName = "";
        this.currency = '';
        this.closingBalance = 0;
        this.mutation = 0;
        this.data = [];
        // this.tableList.refresh();
        this.info.year = moment().format("YYYY");
        this.info.month = { text: 'January', value: 1 };
    }

    get supplierLoader() {
        return SupplierLoader;
    }
}

export class KeysValueConverter {
    toView(obj) {
        return Reflect.ownKeys(obj);
    }
}