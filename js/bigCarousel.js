(function($){
	
	// The actual plugin
	$.fn.bigCarousel = function(options) {
		this.each(function() {
			var curr = this;
			var containerWidth = $(this).outerWidth(true);
			var totalWidth = 0;
			
			$(this).children().each(function(){
				totalWidth += $(this).outerWidth(true);
			});
			
			var wrapper = $('<div class="bcWrap">').css('overflow','hidden');
			$(this).wrap(wrapper).before('<a id="bcPrev">Prev</a>').after('<a id="bcNext">Next</a>');
			$(this).parent().find('#bcPrev').bind('click',this.moveBackward);
			$(this).parent().find('#bcNext').click(function(){ go(curr) });
			$(this).width(this.totalWidth);
			
			var childrenLength = $(this).children().length;		
		});
	}
	
		
	function go(e){
		if(debug) console.log(e);
		if(debug) console.log(slideNumber);
	}
	
})(jQuery);
