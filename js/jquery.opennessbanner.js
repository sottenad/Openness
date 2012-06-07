(function( $ ){


    /* Description:
     * jQuery plugin created to be a self contained banner ad.
     *
     * Depends:
     *	jQuery 1.7.x (http://jquery.com/)
     *
     * Markup to use:
     *	<div id="banner" style="position: relative; width: 960px; height: 106px;"></div>
     */

    //----------------------------------------------------------------------
    // Private Properties
    //----------------------------------------------------------------------
    var _currentIndex = 0;
    var _totalItems = 0;
    var _$animationContainer;

    //----------------------------------------------------------------------
    // jQuery Plugin
    //----------------------------------------------------------------------
    $.fn.opennessbanner = function(options)
    {
        var _element = this;
        var defaults = {
            items: 9,
            itemsHeight: "60px",
            spriteSheet: null
        };
        var options = $.extend(defaults, options);//Merge options with defaults

        _totalItems = options.items;

        var htmlSetup = "<span id='view-port' style=' position: absolute; display: block; width: 300px; height: 60px; left: 697px; top: 0px; padding-top: 28px; overflow: hidden;'>" +
                            "<ul id='animation-container' style='position: absolute; display: block; width: 300px; margin: 0; padding: 0; left: 0px; top: 29px; list-style: none;'></ul>" +
                        "</span>" +
                        "<span id='top-fadeout' style='position: absolute;display: block; width: 220px; height: 69px; left: 697px; top: -3px; background: url(" + options.spriteSheet + ") no-repeat -530px -0px;'></span>" +
                        "<span id='art-logo' style='position: absolute; display: block; width: 411px; height: 55px; background: url(" + options.spriteSheet + ") no-repeat 0px -537px; left: 38px;  top: 26px;'></span>" +
                        "<span id='microsoft' style='position: absolute; display: block; width: 211px; height: 55px; background: url(" + options.spriteSheet + ") no-repeat 0px 0px;left: 486px;top: 29px;'></span>";
 
  
 
        _element.append(htmlSetup);

        _$animationContainer = _element.find("#animation-container");

        var htmlString = "";
        for(var i=0; i < _totalItems - 1; i++)
        {
            htmlString += "<li style='background: url(" + options.spriteSheet + ") no-repeat -211px " + -60 * i + "px; position: relative; display: block; width: 300px; height: 60px; margin: 0; padding: 0;'></li>"
        }
        htmlString += "<li style='background: url(" + options.spriteSheet + ") no-repeat -211px 0px; position: relative; display: block; width: 300px; height: 60px; margin: 0; padding: 0;'></li>"
        _$animationContainer.html( htmlString );

        _animate();
    };

    //----------------------------------------------------------------------
    // Private Methods for plugin
    //----------------------------------------------------------------------
    function _animate()
    {
        _$animationContainer.delay(1500).animate({top: '-=60px'}, 500, _onAnimationComplete);
        _currentIndex++;
    }

    function _onAnimationComplete()
    {
        if(_currentIndex >= _totalItems - 1)
        {
            _currentIndex = 0;
            _$animationContainer.css("top", "29px");
        }

        _animate();
    }


})( jQuery );