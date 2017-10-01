/// <reference path="../../lib/underscore/underscore.js" />
/// <reference path="../../lib/jquery/jquery-2.1.1.js" />
/// <reference path="../../lib/backbone/backbone.js" />
/// <reference path="../../../node_modules/@types/async/index.d.ts" />
/// <reference path="../../../node_modules/@types/underscore/index.d.ts" />
/// <reference path="../../../node_modules/@types/jquery/index.d.ts" />
/// <reference path="../../../node_modules/@types/backbone/index.d.ts" />


var app = app || { models: {}, collections: {}, views: {} };

(function ($) {
    'use strict';

    // Person Model
    app.models.PurchaseSessionModel = Backbone.Model.extend({
        defaults: {
            userId: null,
            stock_name: '',
            in_date: '',

            moneyAddAmount: 0,
            chqueData: '',

            sum: 0,
            payment_type:'Credit',
            
            sessionId: null,

            //inItems: [],//[{code: '',unit: 0,price:0,sum:0}] or Id ?

            // dynamic value, calculate from server.
            BF: 0,
            balance: 0,
        },
        initialize: function () {
            var self = this;
            this.on('change:moneyAddAmount', this._calBalance, this);
            this.on('change:sum', this._calBalance, this);
            this.on('change:BF', this._calBalance, this);

            if (!self.attributes.userId) {
                self.attributes.userId = app.userModel.get('user');
            }
            if (!self.attributes.in_date) {
                self.attributes.in_date = new Date().toISOString().substr(0, 10);
            }

            //self.setLastPettyCashData();
        },
        setNewSessionId: function () {
            var self = this;
            app.serviceMethod.genNewPurchaseSessionId({}, function (result) {
                self.set('sessionId', result);
            })
        },
        setLastPettyCashData: function () {
            var self = this;
            app.serviceMethod.getLastPettyCash({ userId: this.attributes.userId }, function (result) {
                var BF = result ? result.BF : 0;
                self.set('BF', BF);
                //self.clearInItem();
            });
        },
        _calBalance: function () {
            var self = this;
            self.attributes.balance = (self.attributes.BF + self.attributes.moneyAddAmount) - self.attributes.sum;
            self.trigger('updateInItem', self);
        },

        // addInItem: function (inItemObj) {

        //     this.attributes.sum += inItemObj.sum;
        //     // var obj = _.pick(inItemObj, ['code', 'stock_name', 'unit', 'unit_price', 'invoid_id', 'in_date']);
        //     // this.attributes.inItems.puch(obj);
        //     this._calBalance();
        // },

        setInItemArray: function (inItemObjArray) {

            var sum = _.reduce(inItemObjArray, function (sum, item) {
                return sum + item.sum;
            });
            if (this.attributes.sum != sum) {
                console.log('errrrrrrrrrrr this.attributes.sum != sum');
            }

            // var objArray = _.map(inItemObjArray, function (inItemObj) {
            //     return _.pick(inItemObj, ['code', 'stock_name', 'unit', 'unit_price', 'invoid_id', 'in_date']);
            // });

            //this.attributes.inItems = objArray;

            //this._calBalance();
        },
        // removeInItem: function (inItemObj) {
        //     this.trigger('updateInItem', this);

        // },
        clearInItem: function () {
            //this.attributes.inItems = [];

            this.attributes.sum = 0;
            this.attributes.moneyAddAmount = 0;
            this._calBalance();
        },

        updateSessionItem: function (stock_name) {
            // if(stock_name){
            //     self.attributes.stock_name = stock_name;
            // }
            var self = this;
            app.serviceMethod.updatePurchaseSession({ sessionId: self.attributes.sessionId },
                function (result) {

                })
        },

        save: function (stock_name, cb) {
            var self = this;
            self.attributes.stock_name = stock_name;
            var findObj = { 'sessionId':self.attributes.sessionId };
            app.serviceMethod.findPurchaseSession(findObj,
                function (result) {
                    if (result & result.length) {
                        app.serviceMethod.reCalulatePurchaseSession(findObj,
                            function (result) {
                                if (cb) cb(result);
                            });
                    } else {
                        app.serviceMethod.insertPurchaseSession(self.attributes, function (result) {
                            if (cb) cb(result);
                        })
                    }
                })


        }
    });

})(jQuery);
