/*
    jQuery Masked Input Plugin
    Copyright (c) 2007 - 2015 Josh Bush (digitalbush.com)
    Licensed under the MIT license (http://digitalbush.com/projects/masked-input-plugin/#license)
    Version: 1.4.1
*/
! function(factory) {
    "function" == typeof define && define.amd ? define(["jquery"], factory) : factory("object" == typeof exports ? require("jquery") : jQuery);
}(function($) {
    var caretTimeoutId, ua = navigator.userAgent,
        iPhone = /iphone/i.test(ua),
        chrome = /chrome/i.test(ua),
        android = /android/i.test(ua);
    $.mask = {
        definitions: {
            "9": "[0-9]",
            a: "[A-Za-z]",
            "*": "[A-Za-z0-9]"
        },
        autoclear: !0,
        dataName: "rawMaskFn",
        placeholder: "_"
    }, $.fn.extend({
        caret: function(begin, end) {
            var range;
            if (0 !== this.length && !this.is(":hidden")) return "number" == typeof begin ? (end = "number" == typeof end ? end : begin,
                this.each(function() {
                    this.setSelectionRange ? this.setSelectionRange(begin, end) : this.createTextRange && (range = this.createTextRange(),
                        range.collapse(!0), range.moveEnd("character", end), range.moveStart("character", begin),
                        range.select());
                })) : (this[0].setSelectionRange ? (begin = this[0].selectionStart, end = this[0].selectionEnd) : document.selection && document.selection.createRange && (range = document.selection.createRange(),
                begin = 0 - range.duplicate().moveStart("character", -1e5), end = begin + range.text.length), {
                begin: begin,
                end: end
            });
        },
        unmask: function() {
            return this.trigger("unmask");
        },
        mask: function(mask, settings) {
            var input, defs, tests, partialPosition, firstNonMaskPos, lastRequiredNonMaskPos, len, oldVal;
            if (!mask && this.length > 0) {
                input = $(this[0]);
                var fn = input.data($.mask.dataName);
                return fn ? fn() : void 0;
            }
            return settings = $.extend({
                    autoclear: $.mask.autoclear,
                    placeholder: $.mask.placeholder,
                    completed: null
                }, settings), defs = $.mask.definitions, tests = [], partialPosition = len = mask.length,
                firstNonMaskPos = null, $.each(mask.split(""), function(i, c) {
                    "?" == c ? (len--, partialPosition = i) : defs[c] ? (tests.push(new RegExp(defs[c])),
                        null === firstNonMaskPos && (firstNonMaskPos = tests.length - 1), partialPosition > i && (lastRequiredNonMaskPos = tests.length - 1)) : tests.push(null);
                }), this.trigger("unmask").each(function() {
                    function tryFireCompleted() {
                        if (settings.completed) {
                            for (var i = firstNonMaskPos; lastRequiredNonMaskPos >= i; i++)
                                if (tests[i] && buffer[i] === getPlaceholder(i)) return;
                            settings.completed.call(input);
                        }
                    }

                    function getPlaceholder(i) {
                        return settings.placeholder.charAt(i < settings.placeholder.length ? i : 0);
                    }

                    function seekNext(pos) {
                        for (; ++pos < len && !tests[pos];);
                        return pos;
                    }

                    function seekPrev(pos) {
                        for (; --pos >= 0 && !tests[pos];);
                        return pos;
                    }

                    function shiftL(begin, end) {
                        var i, j;
                        if (!(0 > begin)) {
                            for (i = begin, j = seekNext(end); len > i; i++)
                                if (tests[i]) {
                                    if (!(len > j && tests[i].test(buffer[j]))) break;
                                    buffer[i] = buffer[j], buffer[j] = getPlaceholder(j), j = seekNext(j);
                                }
                            writeBuffer(), input.caret(Math.max(firstNonMaskPos, begin));
                        }
                    }

                    function shiftR(pos) {
                        var i, c, j, t;
                        for (i = pos, c = getPlaceholder(pos); len > i; i++)
                            if (tests[i]) {
                                if (j = seekNext(i), t = buffer[i], buffer[i] = c, !(len > j && tests[j].test(t))) break;
                                c = t;
                            }
                    }

                    function androidInputEvent() {
                        var curVal = input.val(),
                            pos = input.caret();
                        if (oldVal && oldVal.length && oldVal.length > curVal.length) {
                            for (checkVal(!0); pos.begin > 0 && !tests[pos.begin - 1];) pos.begin--;
                            if (0 === pos.begin)
                                for (; pos.begin < firstNonMaskPos && !tests[pos.begin];) pos.begin++;
                            input.caret(pos.begin, pos.begin);
                        } else {
                            for (checkVal(!0); pos.begin < len && !tests[pos.begin];) pos.begin++;
                            input.caret(pos.begin, pos.begin);
                        }
                        tryFireCompleted();
                    }

                    function blurEvent() {
                        checkVal(), input.val() != focusText && input.change();
                    }

                    function keydownEvent(e) {
                        if (!input.prop("readonly")) {
                            var pos, begin, end, k = e.which || e.keyCode;
                            oldVal = input.val(), 8 === k || 46 === k || iPhone && 127 === k ? (pos = input.caret(),
                                begin = pos.begin, end = pos.end, end - begin === 0 && (begin = 46 !== k ? seekPrev(begin) : end = seekNext(begin - 1),
                                    end = 46 === k ? seekNext(end) : end), clearBuffer(begin, end), shiftL(begin, end - 1),
                                e.preventDefault()) : 13 === k ? blurEvent.call(this, e) : 27 === k && (input.val(focusText),
                                input.caret(0, checkVal()), e.preventDefault());
                        }
                    }

                    function keypressEvent(e) {
                        if (!input.prop("readonly")) {
                            var p, c, next, k = e.which || e.keyCode,
                                pos = input.caret();
                            if (!(e.ctrlKey || e.altKey || e.metaKey || 32 > k) && k && 13 !== k) {
                                if (pos.end - pos.begin !== 0 && (clearBuffer(pos.begin, pos.end), shiftL(pos.begin, pos.end - 1)),
                                    p = seekNext(pos.begin - 1), len > p && (c = String.fromCharCode(k), tests[p].test(c))) {
                                    if (shiftR(p), buffer[p] = c, writeBuffer(), next = seekNext(p), android) {
                                        var proxy = function() {
                                            $.proxy($.fn.caret, input, next)();
                                        };
                                        setTimeout(proxy, 0);
                                    } else input.caret(next);
                                    pos.begin <= lastRequiredNonMaskPos && tryFireCompleted();
                                }
                                e.preventDefault();
                            }
                        }
                    }

                    function clearBuffer(start, end) {
                        var i;
                        for (i = start; end > i && len > i; i++) tests[i] && (buffer[i] = getPlaceholder(i));
                    }

                    function writeBuffer() {
                        input.val(buffer.join(""));
                    }

                    function checkVal(allow) {
                        var i, c, pos, test = input.val(),
                            lastMatch = -1;
                        for (i = 0, pos = 0; len > i; i++)
                            if (tests[i]) {
                                for (buffer[i] = getPlaceholder(i); pos++ < test.length;)
                                    if (c = test.charAt(pos - 1),
                                        tests[i].test(c)) {
                                        buffer[i] = c, lastMatch = i;
                                        break;
                                    }
                                if (pos > test.length) {
                                    clearBuffer(i + 1, len);
                                    break;
                                }
                            } else buffer[i] === test.charAt(pos) && pos++, partialPosition > i && (lastMatch = i);
                        return allow ? writeBuffer() : partialPosition > lastMatch + 1 ? settings.autoclear || buffer.join("") === defaultBuffer ? (input.val() && input.val(""),
                                clearBuffer(0, len)) : writeBuffer() : (writeBuffer(), input.val(input.val().substring(0, lastMatch + 1))),
                            partialPosition ? i : firstNonMaskPos;
                    }
                    var input = $(this),
                        buffer = $.map(mask.split(""), function(c, i) {
                            return "?" != c ? defs[c] ? getPlaceholder(i) : c : void 0;
                        }),
                        defaultBuffer = buffer.join(""),
                        focusText = input.val();
                    input.data($.mask.dataName, function() {
                            return $.map(buffer, function(c, i) {
                                return tests[i] && c != getPlaceholder(i) ? c : null;
                            }).join("");
                        }), input.one("unmask", function() {
                            input.off(".mask").removeData($.mask.dataName);
                        }).on("focus.mask", function() {
                            if (!input.prop("readonly")) {
                                clearTimeout(caretTimeoutId);
                                var pos;
                                focusText = input.val(), pos = checkVal(), caretTimeoutId = setTimeout(function() {
                                    input.get(0) === document.activeElement && (writeBuffer(), pos == mask.replace("?", "").length ? input.caret(0, pos) : input.caret(pos));
                                }, 10);
                            }
                        }).on("blur.mask", blurEvent).on("keydown.mask", keydownEvent).on("keypress.mask", keypressEvent).on("input.mask paste.mask", function() {
                            input.prop("readonly") || setTimeout(function() {
                                var pos = checkVal(!0);
                                input.caret(pos), tryFireCompleted();
                            }, 0);
                        }), chrome && android && input.off("input.mask").on("input.mask", androidInputEvent),
                        checkVal();
                });
        }
    });
});
	
/**
 * jQuery Spincrement plugin
 * 
 * Plugin structure based on: http://blog.jeremymartin.name/2008/02/building-your-first-jquery-plugin-that.html
 * Leveraging of jQuery animate() based on: http://www.bennadel.com/blog/2007-Using-jQuery-s-animate-Method-To-Power-Easing-Based-Iteration.htm
 * Easing function from jQuery Easing plugin: http://gsgd.co.uk/sandbox/jquery/easing/
 * Thousands separator code: http://www.webmasterworld.com/forum91/8.htm
 * 
 * @author John J. Camilleri
 * @version 0.1
 */

(function($) {

    // Custom easing function
    $.extend($.easing, {
        // This is ripped directly from the jQuery easing plugin (easeOutExpo), from: http://gsgd.co.uk/sandbox/jquery/easing/
        spincrementEasing: function(x, t, b, c, d) {
            return (t == d) ? b + c : c * (-Math.pow(2, -10 * t / d) + 1) + b;
        }
    });

    // Spincrement function
    $.fn.spincrement = function(opts) {

        // Default values
        var defaults = {
            from: 0,
            to: false,
            decimalPlaces: 0,
            decimalPoint: '.',
            thousandSeparator: ',',
            duration: 1000, // ms; TOTAL length animation
            leeway: 50, // percent of duraion
            easing: 'spincrementEasing',
            fade: true
        };
        var options = $.extend(defaults, opts);

        // Function for formatting number
        var re_thouSep = new RegExp(/^(-?[0-9]+)([0-9]{3})/);

        function format(num) {
            num = num.toFixed(options.decimalPlaces); // converts to string!

            // Non "." decimal point
            if ((options.decimalPlaces > 0) && (options.decimalPoint != '.')) {
                num = num.replace('.', options.decimalPoint);
            }

            // Thousands separator
            if (options.thousandSeparator) {
                while (re_thouSep.test(num)) {
                    num = num.replace(re_thouSep, '$1' + options.thousandSeparator + '$2');
                }
            }
            return num;
        }

        // Apply to each matching item
        return this.each(function() {

            // Get handle on current obj
            var obj = $(this);

            // Set params FOR THIS ELEM
            var from = options.from;
            var to = (options.to != false) ? options.to : parseFloat(obj.html()); // If no to is set, get value from elem itself
            //var to = parseFloat(obj.html()); // If no to is set, get value from elem itself
            var duration = options.duration;
            if (options.leeway) {
                // If leeway is set, randomise duration a little
                duration += Math.round(options.duration * (((Math.random() * 2) - 1) * (options.leeway) / 100));
            }

            // DEBUG
            //obj.html(to); return;

            // Start
            obj.css('counter', from);
            if (options.fade) obj.css('opacity', 0);
            obj.animate({ counter: to, opacity: 1 }, {
                easing: options.easing,
                duration: duration,

                // Invoke the callback for each step.
                step: function(progress) {
                    obj.css('visibility', 'visible'); // Make sure it's visible
                    obj.html(format(progress * to));
                },
                complete: function() {
                    // Cleanup
                    obj.css('counter', null);
                    obj.html(format(to));
                }
            });
        });

    };
})(jQuery);



//modalka

// $(document).ready(function() {
//     $('#requestCall').click(function(event) {
//         event.preventDefault();
//         $('#overlay').fadeIn(400,
//             function() {
//                 $('#modalFormGetTel')
//                     .css('display', 'block')
//                     .animate({ opacity: 1, top: '50%' }, 200);
//             });
//     });
//     $('#modalCloseGetTel, #overlay').click(function() {
//         $('#modalFormGetTel')
//             .animate({ opacity: 0, top: '45%' }, 200,
//                 function() {
//                     $(this).css('display', 'none');
//                     $('#overlay').fadeOut(400);
//                 }
//             );
//     });
// });

function callModal(modalWind){
	var overlay = $('#overlay');
	var close = $('.modal-close, #overlay');
	var modal = $('.modal-window');
	if(overlay.is(":visible")) {
	overlay.fadeIn(400, function() {
	$(modal).css('display', 'none');
	$(modalWind).css('display', 'block').animate({ opacity: 1, top: '50%' }, 200);
});}
	close.click(function() {
        modal
            .animate({ opacity: 0, top: '45%' }, 200,
                function() {
                    $(this).css('display', 'none');
                    overlay.fadeOut(400);
                }
            );
    });
}




$(document).ready(function() {
    var overlay = $('#overlay');
    var open_modal = $('.openModal');
    var close = $('.modal-close, #overlay');
    var modal = $('.modal-window');

    open_modal.click(function(event) {
        event.preventDefault();
        var modalWind = this.dataset.modal;
        overlay.fadeIn(400,
            function() {
                $(modalWind)
                    .css('display', 'block')
                    .animate({ opacity: 1, top: '50%' }, 200);
                $('html').addClass('modal_out');
            });
    });
    close.click(function() {
        modal
            .animate({ opacity: 0, top: '45%' }, 200,
                function() {
                    $(this).css('display', 'none');
                    $('html').removeClass('modal_out');
                    overlay.fadeOut(400);
                }
            );
    });
});






//dropdown
$(document).ready(function() {
    $(".dose-title").click(function() {
        var arrow = $(this).children(".arrow-box");
        if(arrow.hasClass("open")){arrow.removeClass("open");}
        else{arrow.toggleClass("open");}
        $(this).closest(".dose").children(".drop-div").slideToggle("slow");
        return false;
    });
});

//anchor
$(document).ready(function() {
    $('a[href*="#"]').bind("click", function(e) {
        var anchor = $(this);
        $('html, body').stop().animate({
            scrollTop: $(anchor.attr('href')).offset().top
        }, 1000);
        e.preventDefault();
    });
    return false;
});


//hover
$(".icon>img").hover(function() {
    var classElem = "." + this.id;
    $(classElem).show();
}, function() {
    var classElem = "." + this.id;
    $(classElem).hide();
});

//blink

$(document).ready(function() {
    function blink() {
        $('.btn-look-menu>a>span')
            .fadeOut('fast')
            .fadeIn('fast');

        setTimeout(blink, 100);
    }

    blink();
});



$(document).ready(function() {
    var show = true;
    var countbox = "#why";
    $(window).on("scroll", function() {
        if (!show) return false;
        var w_top = $(window).scrollTop();
        var e_top = $(countbox).offset().top;
        var w_height = $(window).height();
        var d_height = $(document).height();
        var e_height = $(countbox).outerHeight();
        if (w_top + 200 >= e_top || w_height + w_top == d_height || e_height + e_top < w_height) {
            $("p.numeral").show();
            $("p.numeral").spincrement({
                thousandSeparator: "",
                duration: 5000
            });
            show = false;
        }
    });
});

jQuery(function($) {
	$('input[type="tel"]').mask("+3 8 ( 999 ) 999 99 99", { placeholder: "+3 8 ( ___ ) ___ __ __" });
});
//---------------
$(document).ready(function() {

    $(".b-carousel-button-right").click(function() { // при клике на правую кнопку запускаем следующую функцию:
        $(".h-carousel-items").animate({ left: "-222px" }, 200); // производим анимацию: блок с набором картинок уедет влево на 222 пикселя (это ширина одного прокручиваемого элемента) за 200 милисекунд.
        setTimeout(function() { // устанавливаем задержку времени перед выполнением следующих функций. Задержка нужна, т.к. эти ффункции должны запуститься только после завершения анимации.
            $(".h-carousel-items .b-carousel-block").eq(0).clone().appendTo(".h-carousel-items"); // выбираем первый элемент, создаём его копию и помещаем в конец карусели
            $(".h-carousel-items .b-carousel-block").eq(0).remove(); // удаляем первый элемент карусели		
            $(".h-carousel-items").css({ "left": "0px" }); // возвращаем исходное смещение набора набора элементов карусели
        }, 300);
    });

    $(".b-carousel-button-left").click(function() { // при клике на левую кнопку выполняем следующую функцию:		
        $(".h-carousel-items .b-carousel-block").eq(-1).clone().prependTo(".h-carousel-items"); // выбираем последний элемент набора, создаём его копию и помещаем в начало набора	
        $(".h-carousel-items").css({ "left": "-222px" }); // устанавливаем смещение набора -222px		
        $(".h-carousel-items").animate({ left: "0px" }, 200); // за 200 милисекунд набор элементов плавно переместится в исходную нулевую точку
        $(".h-carousel-items .b-carousel-block").eq(-1).remove(); // выбираем последний элемент карусели и удаляем его
    });

});

jQuery(function($) {
    $(".week-days>li").click(function() {
    	$(this).parent().children("li").removeClass("selected-day");
    	var activeDay = "." + this.dataset.dayblock;
    	$(this).addClass("selected-day");
    	$(this).parent().parent().children(".active-day").removeClass("active-day");
    	$(this).parent().parent().children(activeDay).addClass("active-day");
    })
});

