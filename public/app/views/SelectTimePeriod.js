/// <reference path="../../lib/underscore/underscore.js" />
/// <reference path="../../lib/jquery/jquery-2.1.1.js" />
/*global Backbone, jQuery, _, ENTER_KEY */
var app = app || { models: {}, collections: {}, views: {} };

(function ($) {
    'use strict';

    $(function () {
        function addHours(date, hours) {
            var result = new Date(date);
            result.setHours(result.getHours() + hours);
            return result;
        }
        function addDays(date, days) {
            var result = new Date(date);
            result.setDate(result.getDate() + days);
            return result;
        }
        function addMonths(date, months) {
            var result = new Date(date);
            result.setMonth(result.getMonth() + months);
            return result;
        }
        function addYears(date, years) {
            var result = new Date(date);
            result.setFullYear(result.getFullYear() + years);
            return result;
        }
        function removeTimezoneOffset(now) {
            return addHours(now, -now.getTimezoneOffset() / 60);
        }
        function addTimezoneOffset(now) {
            return addHours(now, now.getTimezoneOffset() / 60);
        }
        function pad10(n) {
            return (n < 10) ? ("0" + n) : n;
        }
        var lastOption = {
            oneDay: 'หนึ่งวัน',
            sevenDay: 'หนึ่งสัปดาห์',
            oneMonth: 'หนึ่งเดื่อน',
            oneYear: 'หนึ่งปี'
        };

        app.views.SelectTimePeriod = Backbone.View.extend({

            // Instead of generating a new element, bind to the existing skeleton of
            // the App already present in the HTML.
            //el: '#showProductNav',

            // Delegated events for creating new items, and clearing completed ones.
            events: {
                'change select.select-time-type': 'selectTimeTypeChange',
                'change select.select-time': 'selectTimeChange',
                'change input': 'inputChange'
            },

            initialize: function () {
                var self = this;
                //this.stockSelected = this.model.get('stockModel');
                this.$el.find('input').datebox({
                    mode: "calbox",
                    useFocus: true,
                    //defaultValue: new Date(),
                    showInitialValue: true,
                    //afterToday: true,
                    closeCallback: function (arg) {
                        //console.log('closeCallback', arg);
                        if (!arg.cancelClose) {
                            var $selecttimetype = self.$el.find("select.select-time-type");

                            if ($selecttimetype.val() != 'custom') {
                                $selecttimetype.val('custom');
                                $selecttimetype.trigger("change");
                                self.render();
                            }
                        }
                    }
                });

                this.render();


                var $timeStart = self.$el.find("#startTime");;
                var $timeEnd = self.$el.find("#endTime");

                self.model.set({
                    timeStart: addTimezoneOffset(new Date($timeStart.val())),
                    timeEnd: addTimezoneOffset(addDays(new Date($timeEnd.val()), 1))
                });
            },

            // Re-rendering the App just means refreshing the statistics -- the rest
            // of the app doesn't change.
            render: function () {
                var self = this;
                var $selecttimetype = self.$el.find("select.select-time-type");

                self.selectTimeTypeValue = $selecttimetype.val();

                var mapFunc = {
                    last: function () {
                        self.$el.find('div.select-time-div').show();
                        self.$el.find('select.select-time option').remove();

                        _.each(lastOption, function (item, key) {
                            self.$el.find('select.select-time').append('<option value="' + key + '" >' + item + '</option>');

                        });
                        self.$el.find('select.select-time').trigger("change");
                    },
                    oneMonthPeriod: function () {
                        self.$el.find('div.select-time-div').show();
                        self.$el.find('select.select-time option').remove();

                        var now = new Date();
                        now = removeTimezoneOffset(now);

                        for (var i = 0; i < 12; i++) {
                            var timeStr = addMonths(now, -i).toISOString().slice(0, 7);
                            self.$el.find('select.select-time').append('<option value="' + timeStr + '" >' + timeStr + '</option>');
                        }

                        self.$el.find('select.select-time').trigger("change");
                    },
                    oneYearPeriod: function () {
                        self.$el.find('div.select-time-div').show();
                        self.$el.find('select.select-time option').remove();

                        var now = new Date();
                        now = removeTimezoneOffset(now);
                        console.log(addYears(now, 0));
                        for (var i = 0; i < 4; i++) {
                            var timeStr = addYears(now, -i).toISOString().slice(0, 4);
                            self.$el.find('select.select-time').append('<option value="' + timeStr + '" >' + timeStr + '</option>');
                        }

                        self.$el.find('select.select-time').trigger("change");
                    },
                    custom: function () {
                        self.$el.find('div.select-time-div').hide();
                    }
                }
                mapFunc[self.selectTimeTypeValue]();

            },
            selectTimeTypeChange: function (ev) {
                console.log('selectTimeTypeChange');
                // var $el = $(ev.target);
                //$el.val();

                this.render();
            },
            selectTimeChange: function (ev) {
                var self = this;

                var $el = $(ev.target);
                var value = $el.val();
                var $selecttimetype = self.$el.find("select.select-time-type");
                var selectTimeTypeValue = $selecttimetype.val();

                var $timeStart = self.$el.find("#startTime");;
                var $timeEnd = self.$el.find("#endTime");

                //console.log('selectTimeChange', value);

                if (selectTimeTypeValue == 'last') {

                    var now = new Date();
                    now = removeTimezoneOffset(now);

                    var timeStart = now;

                    var mapFunc = {
                        oneDay: function () {
                            //$timeStart.val(now.toISOString().slice(0, 10));
                        },
                        sevenDay: function () {
                            timeStart = addDays(now, -7);
                        },
                        oneMonth: function () {
                            timeStart = addMonths(now, -1);
                        },
                        oneYear: function () {
                            timeStart = addYears(now, -1);
                        }
                    };
                    mapFunc[value]();

                    $timeStart.val(timeStart.toISOString().slice(0, 10));
                    $timeEnd.val(now.toISOString().slice(0, 10));

                }
                else if (selectTimeTypeValue == 'oneMonthPeriod') {
                    var timeStartStr = value + '-01';
                    var timeEndStr = addDays(addMonths(new Date(timeStartStr), 1), -1).toISOString().slice(0, 10);

                    $timeStart.val(timeStartStr);
                    $timeEnd.val(timeEndStr);

                }
                else if (selectTimeTypeValue == 'oneYearPeriod') {
                    var timeStartStr = value + '-01-01';
                    var timeEndStr = addDays(addYears(new Date(timeStartStr), 1), -1).toISOString().slice(0, 10);
                    $timeStart.val(timeStartStr);
                    $timeEnd.val(timeEndStr);
                }

                self.model.set({
                    timeStart: addTimezoneOffset(new Date($timeStart.val())),
                    timeEnd: addTimezoneOffset(addDays(new Date($timeEnd.val()), 1))
                });
            },
            inputChange: function (ev) {
                var self = this;
                //var targetElem = $(ev.target);
                //var dataType = targetElem.attr('data-type');
                //var value = targetElem.val();

                //console.log('inputChange', dataType, value);

                //this.model.set(dataType, value);
                var $timeStart = self.$el.find("#startTime");;
                var $timeEnd = self.$el.find("#endTime");

                self.model.set({
                    timeStart: addTimezoneOffset(new Date($timeStart.val())),
                    timeEnd: addTimezoneOffset(addDays(new Date($timeEnd.val()), 1))
                });

            }
        });
    });

})(jQuery);
