/* https://github.com/stuartpwilding/carousel v2.0 */

(function ($) {
  $.fn.carousel = function(options) {
    defaults = {
      indicate   : true,
      autoplay   : false,
      responsive : false,
      speed      : 500,
      delay      : 7000
    };
    var options = $.extend(defaults, options);
    return this.each(function() {
      var $this = $(this);
      var $wrapper = $this.find('div.wrapper');
      var $slider = $wrapper.find('div.slider');
      var $items = $slider.find('div.item');
      var current_page = 1;

      if (options.responsive) {
        $items.css('width', $wrapper.outerWidth());
        if ($items.length <= 1) { return false; }
        var resizeDelay;
        $(window).resize(function() {
          clearTimeout(resizeDelay);
          resizeDelay = setTimeout(function() {
            item_width = $wrapper.outerWidth();
            $items.css('width', item_width);
            $wrapper.scrollLeft(item_width * current_page);
          }, 100);
        });
      }
      
      var item_width = $items.eq(0).outerWidth();
      var visible = Math.ceil($wrapper.innerWidth() / item_width);
      var pages = Math.ceil($items.length / visible);
      if ($items.length <= visible) { return false; }

      // add empty items to last page if needed
      if ($items.length % visible) {
        var empty_items = visible - ($items.length % visible);
        for (i = 0; i < empty_items; i++) {
          $slider.append('<div class="item empty" />');
        }
        $items = $slider.find('div.item'); // update
      }

      // clone last page and insert at beginning, clone first page and insert at end
      $items.first().before($items.slice(-visible).clone()
      .addClass('clone'));
      $items.last().after($items.slice(0, visible).clone()
      .addClass('clone'));
      $items = $slider.find('div.item'); // update

      // reposition to original first page
      $wrapper.scrollLeft(item_width * visible);

      var gotoPage = function(page) {
        var dir = page < current_page ? -1 : 1;
        var pages_move = Math.abs(current_page - page);
        var distance = item_width * dir * visible * pages_move;
        $wrapper.filter(':not(:animated)').animate({
          scrollLeft:'+=' + distance
        }, options.speed, function() {
          // if at the end or beginning (one of the cloned pages), repositioned to the original page it was cloned from for infinite effect
          if (page == 0) {
            $wrapper.scrollLeft(item_width * visible * pages);
            page = pages;
          } else if (page > pages) {
            $wrapper.scrollLeft(item_width * visible);
            page = 1;
          }
          current_page = page;
          if (options.indicate) {
            $indicators.find('span.active').removeClass('active');
            $indicators.find('span').eq(page - 1).addClass('active');
          }
        });
      }

      var $controls = $('<div class="controls" />');
      var btn_prev = $('<span class="button prev" />').on('click', function() {
        gotoPage(current_page - 1);
      }).appendTo($controls);
      var btn_next = $('<span class="button next" />').on('click', function() {
        gotoPage(current_page + 1);
      }).appendTo($controls);
      $controls.appendTo($this);
      
      if (options.indicate) {
        var $indicators = $('<div class="indicators" />');
        for (i = 1; i <= pages; i++) {
          $('<span>' + i + '</span>').on('click', function() {
            gotoPage($(this).data('ref'));
          })
          .data('ref', i)
          .appendTo($indicators);
        }
        $indicators.find('span').eq(0).addClass('active');
        $indicators.appendTo($this);
      }

      if (options.autoplay) {
        $(window).load(function() {
          var play = true;
          $this.hover(
            function() {
              play = false;
            },
            function() {
              play = true;
            }
          );
          setInterval(function() {
            if (play) {
              gotoPage(current_page + 1);
            }
          }, options.delay);
        });
      }
      
      //swipe functionality - requires jQuery mobile    
      if ($.isFunction($.fn.swiperight)) {
        $slider.swiperight(function() {  
          gotoPage(current_page - 1);
        });
        $slider.swipeleft(function() {  
          gotoPage(current_page + 1); 
        });
      }
      
    });
  };
})(jQuery);
