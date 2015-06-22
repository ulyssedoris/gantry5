"use strict";
var ready         = require('elements/domready'),
    $             = require('elements'),

    modal         = require('./modal'),
    toastr        = require('./toastr'),
    request       = require('agent'),

    getAjaxSuffix = require('../utils/get-ajax-suffix'),
    parseAjaxURI  = require('../utils/get-ajax-url').parse,
    getAjaxURL    = require('../utils/get-ajax-url').global;

var hiddens,
    toggles = function(event, element) {
        if (event.type.match(/^touch/) || event.type == 'click') { event.preventDefault(); }
        if (event.type == 'click') { return false; }
        element = $(element);
        hiddens = element.find('~~ [type=hidden]');

        if (!hiddens) return true;
        hiddens.value(hiddens.value() == '0' ? '1' : '0');

        hiddens.emit('change');
        $('body').emit('change', { target: hiddens });

        return false;
    };

ready(function() {
    var body = $('body');
    ['touchend', 'mouseup', 'click'].forEach(function(event) {
        body.delegate(event, '.enabler .toggle', toggles);
    });

    var URI = parseAjaxURI(getAjaxURL('devprod') + getAjaxSuffix());
    body.delegate('change', '[data-g-devprod] input[type="hidden"]', function(event, element) {
        var value = element.value(),
            parent = element.parent('[data-g-devprod]'),
            labels = JSON.parse(parent.data('g-devprod'));

        request('post', URI, { mode: value }, function(error, response) {
            if (!response.body.success) {
                modal.open({
                    content: response.body.html || response.body,
                    afterOpen: function(container) {
                        if (!response.body.html) { container.style({ width: '90%' }); }
                    }
                });

                element.value(!value);
            } else {
                parent.find('.devprod-mode').text(labels[response.body.mode] || 'Unknown');
                toastr.success(response.body.html, response.title);
            }
        });
    });
});

module.exports = {};
