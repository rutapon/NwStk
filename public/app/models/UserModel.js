/// <reference path="../../lib/underscore/underscore.js" />
/// <reference path="../../lib/jquery/jquery-2.1.1.js" />
/// <reference path="../../lib/backbone/backbone.js" />


var app = app || { models: {}, collections: {}, views: {} };

(function ($) {
    'use strict';

    // Person Model
    app.models.UserModel = Backbone.Model.extend({
        defaults: {
            user: '',
            pass: '',
            dpm: '',
            type: '',//'admin' || 'staff_main' || 'staff_support'|| 'viewer'
            permission: {},
            listAccessPermission: []
        },

        //initialize: function () {
        //    console.log(this.attributes);             
        //},

        validate: function (attrs, options) {

            if (!attrs.user || !attrs.pass || attrs.type) {

                //alert(" ข้อมูลไม่ครบหรือผิดพลาด \n To err is human, but so, too, is to repent for those mistakes and learn from them.");
                alert("validate false");

                return "false";
            }
        },
        getUserObj: function () {
            return _.pick(this.attributes, ['user', 'pass', 'dpm', 'type']);
        },
        login: function (cb) {
            var self = this;
            app.serviceMethod.login(this.getUserObj(), function (result) {

                self.attributes['type'] = result['type'];
                self.attributes['permission'] = result['permission'];
                self.attributes['listAccessPermission'] = result['listAccessPermission'];

                if (cb) cb(result);
            });
        },
        save: function (cb) {
            //var self = this;
            app.serviceMethod.insertUser({ attributes: this.attributes }, function (result) {
                if (cb) cb(result);
            });
        },
        update: function (cb) {
            //var self = this;
            //console.log('updateUser');
            app.serviceMethod.updateUser({ attributes: this.attributes }, function (result) {
                if (cb) cb(result);
            });
        },
        destroy: function (cb) {
            var self = this;
            app.serviceMethod.deleteUser({ attributes: self.attributes }, function (result) {
                if (cb) cb(result);
            });
        },
        getListsName: function (listType) {
            console.log(this.attributes.listAccessPermission);
            if (listType == 'All') {
                return this.attributes.listAccessPermission;
            }
            else {
                var result = _.filter(this.attributes.listAccessPermission, function (item) {
                    return item.split('-')[0] == listType;
                })
                return result;
            }
        },
        isEmty: function () {
            var attrs = this.attributes;
            return !(attrs.user || attrs.pass || attrs.type);
        }
        //,
        //removeUi: function () {
        //    alert('trigger remove');

        //    this.trigger('removeUi', this);
        //}
    });

})(jQuery);
