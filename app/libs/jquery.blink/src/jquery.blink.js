(function ($) {

    $.fn.blink = function (options) {

        if (typeof options === 'undefined') {
            options = {};
        }

        return this.each(function (index, element) {

            // create element-specific configuration object to allow for element-specific
            // configuration via data-attribute.
            var elementOptions = options;

            // Check for data-attributes for configuring per-item.
            // $.fn.html5data is declared in bower dependency jquery-html5data.
            // Used to avoid polluting global data-attribute namespace.
            elementOptions = $.extend(
                $(element).html5data('blink'),
                elementOptions
            );

            var settings = $.extend(
                {
                    delay: 500
                },
                elementOptions
            );

            setInterval(function () {
                if ($(element).css('visibility') === 'visible') {
                    $(element).css('visibility', 'hidden');
                }
                else {
                    $(element).css('visibility', 'visible');
                }
            }, settings.delay);

        });

    };

}(jQuery));
