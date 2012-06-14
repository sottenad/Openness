/*global vars*/
var isDrawerOpen = false;
var debug = true;
var _source;
var _oldPage = '';
var _page;
var _section;
var _article;
var _currXML;
var _showPanelAnimation = true;
var _panelsCurrentlyAnimating = false;
var _currentVideoId = '';

var homeurl = "http://www.microsoft.com/en-us/openness/#home";

$(function(){
	
	$('#silverlightControlHost').click(function() {
		alert('Handler for .click() called.');
	});

	$("#animation").opennessbanner({
        items: 9,
        itemsHeight: "60px",
        spriteSheet: "images/openness-banner-sprite.png"
    });
	
	loadSource();
	initAddress();
	assignPanelNavHandler();
	assignAsideHandlers();
	makeCollapsableFooterMenu()
	getTwitterFeed();
	populateBlogExcerpt(); /*In includes.js*/
	
});

function loadSource(){
	$.ajax({
		type: "GET",
		url: 'home.xml',
		dataType: "xml",
		success: function(xml) {
			_source = xml;
		},error: function(jqXHR, textStatus, errorThrown){
			window.location = homeurl;
		}
	});
}

/*	This grabs the twitter feed from a proxy page we've created to prevent thrttling. It 
just provides caching for us so that users from the same IP dont get shut off after 150 requests*/
function getTwitterFeed(){
	if ($('#tweet').length > 0) {
		$("#tweet").tweet({
			username: 'openatmicrosoft',
			count: 1,
			loading_text: ""
		});
	}	
}

function makeCollapsableFooterMenu(){
	$('#resources ul').find('li span').live('click', function(){
		//console.log('on');
		$(this).parent().children('ul').slideToggle();
	});
}



/*Wires up the metro panel navigation, assigns animations, history, and content population*/
function assignPanelNavHandler(){
	$('#banner aside').live('click', function(){
		var location = $(this).attr('data-location');
		var hash = $(this).attr('data-hash');
		if( String(location).toLowerCase() == 'page'){
			if(!_panelsCurrentlyAnimating){
				hidePanels(hash);
			}
		} else if ( String(location).toLowerCase() == 'newpage') {
				window.open( $(this).attr('data-source') );
		} else {
			var file = $(this).attr('data-source');
		}
	});	
}

/*Takes a xml file and the name you want in the hash, and builds out the panels for that location*/
function buildPage(override){
	var showHome = false;

			if(_showPanelAnimation || override){
				xml = $(_source).find('#'+_page);
				if (debug) console.log('BUILDPAGE() -- '+_page);
				/*Build Video Panel - Selext a random video from the list.*/
				var numOfVids = $(xml).find('video').length;
				if(numOfVids > 1 && _page != "home"){
					var selectedVideoNum = Math.floor(Math.random()*numOfVids);
				}else{
					var selectedVideoNum = 0;
				}
				var sv = $(xml).find('video').eq(selectedVideoNum);
				var videoid = $(sv).attr('id');
				var thumb = $(sv).find('thumb').text();
				var poster = $(sv).find('poster').text();
				var smallposter = $(sv).find('smallposter').text();
				var title = $(sv).find('title').text();
				var description = $(sv).find('description').text();
				if(_page != 'home'){
					var markup = '<div id="breadcrumb"></div>';
					markup += '<div data-videoid="'+videoid+'" id="vidHolder" class="videoholder"><span class="playicon"></span> <img src="video/'+smallposter+'" /> <small>'+title+'</small> </div>';
				}else{
					
					var markup = '<div data-videoid="'+videoid+'" id="vidHolder" class="homevideoholder"><span class="playicon"></span><img src="video/'+poster+'" /> <small>'+title+'</small> </div>';
					showHome = true;
				}
				$('#banner figure').html(markup);
				
				buildVideoDrawer(_source, videoid);
				
				$('#vidHolder').live('click', function(){
					//_section = 'videos';
					//_article = $(this).attr('data-videoid');
					//updateHash();
					//window.location.hash = _page+'/'+_section+'/'+_article;
				});
				
				
				/*Build Panels*/
				$(xml).find('tile').each(function(index){
					var id = $(this).attr('id');
					var location = $(this).find('location').text();
					var source = $(this).find('source').text();
					var content = $(this).find('content').text();
					var color = $(this).find('color').text();					
					var markup = '<aside class="'+color+'" data-source="'+source+'" data-location="'+location+'" data-hash="'+id+'" id="banner'+Number(index+1)+'">'+content+'</aside>';
					$(markup).css({'display':'none'});
					$('#banner').append(markup);
				});
				
				
				/*Fill Factoids - Anywhere you use <tile id="factoid"> in the markup, it will generate a factoid there*/
				var factoidNodes = [];
				factoidNodes = $(xml).find('#factoid');
				var selectedFactoid = Math.floor(Math.random()*factoidNodes.length);
				var factoid = factoidNodes[selectedFactoid];
				
				if ( $(factoid).find('poster').text() != '' ) {
					var fImg = $(factoid).find('poster').text();
					var fmarkup = '<div class="factoid"><img src="images/factoids/'+fImg+'" alt=""></div>';
				} else {
					var fhighlight =  $(factoid).find('highlight').text();
					var fmessage = $(factoid).find('message').text();
					var fmarkup = '<div class="factoid"><strong>'+fhighlight+'</strong><small>'+fmessage+'</small></div>';
				}
				
				$('[data-hash="factoid"]').append(fmarkup);
				
				showPanels(showHome);
			}
			
			/*Last Step: check for a section variable, if so, pop that open*/	
			if(  typeof(_section) != 'undefined'){
				if(_section == 'videos'){
					if(typeof(_article) !='undefined'){
						buildVideoDrawer(_page, _article, true);
					}else{			
						buildVideoDrawer(_page, null, true);
					}
				}else{
					var file = $(xml).find('[id="'+_section+'"]').find('source').text();
					buildSection(file);
				}
			}
}

/*A simple ajax call to retrieve content from an html file, the show the drawer*/
function buildSection(file){
	$('#drawer').slideUp(500, function(){
		isDrawerOpen = false;
		$.ajax({
			type: "GET",
			url: file,
			success: function(data) {
				$('#drawer').html('<div id="slides" class="clearfix">'+data+'</div>');
				openDrawer();
				
				/*Find columns, if more than 4, scroll it*/
				if($('#drawer #slides li').length >= 4){
					createDrawerSlider();
				}
			},error: function(jqXHR, textStatus, errorThrown){
				if(debug) console.log('BuildDrawer() error: '+errorThrown);
				window.location = homeurl;
			}
		});
	});
}
		
		
function createDrawerSlider(){
	$('#drawer #slides ul').jcarousel({scroll:1});
	var h = $('#drawer #slides ul').height()/2;
	$('.jcarousel-prev').css('top',h+'px');
	$('.jcarousel-next').css('top',h+'px');
}


		
/*Builds out a video gallery drawer, much different from the normal ajax call for a static drawer*/
function buildVideoDrawer(xmlfile, selected, openDrawerbool){
		xml = $(_source).find('#'+_page);
			var numOfVids = $(xml).find('video').length;
			/*Check for multiple videos, there are differences in display*/
			/*if(numOfVids > 1){*/
				var markup = '';
				var videoMarkup = '';
				$(xml).find('video').each(function(){
					var id = $(this).attr('id');
					var title = $(this).find('title').text();
					var thumb = $(this).find('thumb').text();
					var desc = $(this).find('description').text();
					var mp4url = $(this).find('mp4video').text(); 
					var webmurl = $(this).find('webmvideo').text();
					var ogvurl = $(this).find('ogvvideo').text();
					var vidposter = $(this).find('poster').text();
					var vidsmallposter = $(this).find('smallposter').text();
					var vidlabel = $(this).find('label').text();
					var vidaspect = $(this).find('aspect').text();

					if(_page == "home"){
						var vwidth = 444;
						var vheight = 270;
					}else if(vidaspect === "4:3") {
						var vwidth = 300;
						var vheight = 225;
						vidposter = vidsmallposter;
					}else{
						var vwidth = 444;
						var vheight = 225;
						vidposter = vidsmallposter;
					}
					if(id == selected){
						markup += '<li data-videoid="'+id+'" class="clearfix selectedvideothumb videothumb"><span class="thumbnail"><span class="playiconsmall"></span><img src="video/'+thumb+'" /></span><strong>'+title+'</strong><span class="desc">'+vidlabel+'</span></li>';
					}else{
						markup += '<li data-videoid="'+id+'" class="clearfix videothumb"><span class="thumbnail"><span class="playiconsmall"></span><img src="video/'+thumb+'" /></span><strong>'+title+'</strong><span class="desc">'+vidlabel+'</span></li>';
					}
					if( $(this).find('videowidth').length > 0){
						vwidth = $(this).find('videowidth').text();
					}
					if( $(this).find('videoheight').length > 0){
						vheight = $(this).find('videoheight').text();
					}
					if(id == selected){
						//console.log([id, selected])
						if(_currentVideoId != ''){

							var myPlayer = _V_(_currentVideoId);
							if( myPlayer != undefined){
								myPlayer.destroy();
							}
							//console.log('destroyed: '+_currentVideoId );
						}
					
						videoMarkup = makeVideoMarkup(id, vheight, vwidth, mp4url, webmurl, ogvurl, vidposter);
						//console.log('right after markup is added');
						$('#vidHolder').empty();
						$('#vidHolder').html(videoMarkup);
						if(_page != "home" && vidaspect === "4:3") $(".videoholder #videoplayer").css("margin-left", 72); //reposition player for 4:3 aspect ratio
						var metadata = '<h4>'+title+'</h4><p>'+desc+'</p>';
						metadata += '<div class="socialbuttons"><div id="tweetBtn"><a target="_blank" href="http://twitter.com/share" class="twitter-share-button" data-count="horizontal" data-via="openatmicrosoft">Tweet</a><script type="text/javascript" src="http://platform.twitter.com/widgets.js"></script></div><div id="facebookBtn"><script src="http://connect.facebook.net/en_US/all.js#xfbml=1"></script><fb:like href="'+window.location.href+'" layout="button_count" show_faces="false" width="55" font="segoe ui"></fb:like></div></div>';
						
						videoMarkup += metadata;
						
						_V_(id,{ "controls": true, "autoplay": false, "preload": "auto" }, function(){
					      // Player (this) is initialized and ready.
					      //console.log('Finished Loading Video.js on: '+id.toString());
					      _currentVideoId = id.toString();
					    });
					}
				});	
				
				if(_section == 'videos' && _article != '' && _article != undefined){
					var wrapper = '<div id="slides" class="clearfix"><ul>'+markup+'</ul><div class="clearfix"></div></div>';
					$('#drawer').html(wrapper);	
				}else{
					$('#drawer').slideUp(500, function(){
						var wrapper = '<div id="slides" class="clearfix"><ul>'+markup+'</ul><div class="clearfix"></div></div>';
						$('#drawer').html(wrapper);	
						if(openDrawerbool){
							openDrawer();
						}
					});
				}
			$('.playiconsmall').css('opacity',0.4);
			$('.videothumb').live('mouseover', function(){
				$(this).find('.playiconsmall').stop().fadeTo(100,1);
			});
			$('.videothumb').live('mouseout', function(){
				$(this).find('.playiconsmall').stop().fadeTo(100,.4);
			});
			if(openDrawerbool){
				openDrawer();
				assignVideoSwitcher();
			}
			
			if($(xml).find('video').length > 4){
				createDrawerSlider();
			}	
}

/*Creates the listeners to make sure the panels launch the appropriate content in the drawer*/
function assignAsideHandlers(){
	$('#banner aside').live('click', function(){
		$(this).attr('id','bannerOut');
		var panelid = $(this).attr('data-hash');
		var loc = $(this).attr('data-location');
		if(panelid=='factoid' || loc=='newpage'){
			return false;
		}
		if(loc == 'drawer'){
			_section = panelid;
			_article = undefined;
		}else{
			setPage(panelid);
			_section = undefined;
			_article = undefined;
		}
		updateHash();	
	});
	
	/*Creates listener on the logo to send you home*/
	$('header h1 a, #homelink').live('click', function(){
		goHome(false);
	});
}

function goHome(override){
	
		if(_page != 'home' && !_panelsCurrentlyAnimating){
			$('[data-hash="home"]').attr('id','bannerOut');
			var panelid = 'home';
			var loc = $(this).attr('data-location');
			setPage(panelid);
			_section = undefined;
			_article = undefined;
			hidePanels(panelid);
			updateHash();	
		}
}


/*Creates the listeners and logic to run the drawer-based video gallery*/
function assignVideoSwitcher(){
	$('.videothumb').live('click', function(){	
		_article = $(this).attr('data-videoid');
		updateHash();
	});
}

/*Handles Animation of the panels in, different styles for the home page with
  its uniformly shaped panels, as opposed to an inner page with a home button*/
function showPanels(home){
	var speed = 150;
	//if(debug) console.log('showpanelanimation: '+_showPanelAnimation);
	if(home){
		//Show the Home Panels, a bit different measurements than others.
		$('#banner #banner4').addClass('homeButton');
		$('#bannerOut').animate({'width':'0px'},100, 'easeOutExpo', function(){
			$(this).fadeOut(100);
		});
		var figureAtts = {'top':'12px','left':'0px','height':'270px','width':'444px'},
		banner1Atts = {'top':'12px', 'left':'449px', 'height':'103px', 'width':'235px'},
		banner2Atts = {'top':'12px', 'left':'708px', 'height':'103px', 'width':'235px'},
		banner3Atts = {'top':'150px', 'left':'449px', 'height':'103px', 'width':'235px'},
		banner4Atts = {'top':'150px', 'left':'708px', 'height':'103px', 'width':'235px'};
		
		$('#banner figure').fadeIn(speed).animate(figureAtts, speed, 'easeOutExpo');
		$('#banner #banner1').delay(100).fadeIn(speed).animate(banner1Atts, speed,'easeOutExpo').removeClass().addClass('red');
		$('#banner #banner2').delay(200).fadeIn(speed).animate(banner2Atts, speed,'easeOutExpo').removeClass().addClass('blue');
		$('#banner #banner3').delay(300).fadeIn(speed).css(banner3Atts).removeClass().addClass('orange');
		$('#banner #banner4').css(banner4Atts).removeClass().addClass('green').delay(400).fadeIn(speed, function(){
			_panelsCurrentlyAnimating = false;
		});
	}else{
		/*Show All other panels - home button is smaller*/
		$('#bannerOut').fadeOut(100);
		$('#banner #banner4').addClass('homeButton');
		var figureAtts = {'top':'12px', 'left':'0px', 'height':'270px', 'width':'444px'},
		banner1Atts = {'top':'12px', 'left':'449px', 'height':'103px', 'width':'234px'},
		banner2Atts = {'top':'12px', 'left':'708px', 'height':'103px', 'width':'235px' },
		banner3Atts = {'top':'150px', 'left':'449px', 'height':'103px', 'width':'104px' },
		banner4Atts = {'top':'150px', 'left':'578px', 'height':'103px', 'width':'364px' };
		
		$('#banner figure').fadeIn(speed).animate(figureAtts,speed,'easeOutExpo');
		$('#banner #banner1').delay(100).fadeIn(speed).animate(banner1Atts,speed,'easeOutExpo').removeClass().addClass('green');
		$('#banner #banner2').delay(200).fadeIn(speed).animate(banner2Atts,speed,'easeOutExpo').removeClass().addClass('blue');
		$('#banner #banner3').delay(300).fadeIn(speed).css(banner3Atts).removeClass().addClass('orange');
		$('#banner #banner4').css(banner4Atts).removeClass().addClass('red').delay(400).fadeIn(speed, function(){
			_panelsCurrentlyAnimating = false;
		});
	}
	_showPanelAnimation = false;
}

/*Opens the content Drawer - status stored in global var*/
function openDrawer(){
	$('#drawer').slideDown(500, function(){
		isDrawerOpen = true;
	});
}

/*Closes the content Drawer - status stored in global var*/
function closeDrawer(){
	$('#drawer').slideUp(500, function(){
		isDrawerOpen = false;
	});
}


function setPage(value){
	_oldPage = _page;
	if(_oldPage == value){
		_showPanelAnimation = false;
	}else{
		_showPanelAnimation = true;
	}
	_page = value;	
}

/*Checks all the global hash vars for undefined before setting them. Simply set the
  segment of the url you want to change, then call updateHash(). */
function updateHash(){	
	if( typeof(_page) != 'undefined' && typeof(_section) != 'undefined' && typeof(_article) != 'undefined'){
		window.location.hash = _page+'/'+_section+'/'+_article;
	}else if(typeof(_page) != 'undefined' && typeof(_section) != 'undefined'){
		window.location.hash = _page+'/'+_section
	}else if(typeof(_page) != 'undefined'){
		window.location.hash = _page
	}else{
		
	}
}

/*Function that initiates the hashchange listeners*/
function initAddress(){  
  $(window).bind('hashchange', function () {

	//if(debug) console.log(window.location.hash);
    if (window.location.hash && window.location.hash != "#"){
		hash = window.location.hash;
	}else{
		hash = 'home';
	}
    
	/* So, we are going to get the hash in the location bar, and parse
	it into its individual segments. Each segment represents a peice of the
	navigation path to get back to that information if the user decides to 
	deep link to a video or something, we can recreate that configuration
	on initial load. We will also use this mechanism for internal navigation
	around the site. EX, when you click a link, it should just change the hash
	and let this function figure out what it needs to delegate where.*/
	
    var cleanHash = hash.replace('#', '');
    window.location.hash = hash;	
	
	/* Web Trends */
	var wtTitle = 'Microsoft Openness - ' + cleanHash.replace(/\//g, ' ').replace(/^\w/, function($0) { return $0.toUpperCase(); })
	dcsMultiTrack('DCS.dcssip', window.location.hostname, 'DCS.dcsuri', window.location.pathname + hash, 'WT.ti', wtTitle);
	
	//if(debug) console.log(hash);
	
	var oldpage = _page;
	
	/*Parse hash*/
	var hashArr = cleanHash.split('/');
	_page = hashArr[0];
	_section = hashArr[1];
	_article = hashArr[2];
	
	console.log([_page, oldpage]);
	if(_page == 'home' && oldpage != 'home' && oldpage != undefined){
		$('[data-hash="home"]').attr('id','bannerOut');
		hidePanels('home');
	}

	setTimeout(function() { 
		//Add a `true` parameter to the buildPage() call to override
		console.log('build:: '+_page);
		buildPage(true);
		$('#breadcrumb').html('<a id="homelink">back</a>' + '<span class="currPage">' + $(_source).find('#'+_page).find('name').eq(0).text() + '</span>');
	}, 700);
       
  });
  
  $(window).trigger( "hashchange" );
}


/*The function that will animate the metro panels out. Make sure to call showPanels() after this is done*/
function hidePanels(selected){
	_panelsCurrentlyAnimating = true;
	//if(debug) console.log(selected);
	closeDrawer();
	var count = 0;
	$('#banner aside').each(function(){
		if($(this).attr('data-hash') != selected){
			$(this).delay(100*count).fadeOut(200,'easeOutExpo', function(){ $(this).remove() });
			count++;
		}else{
			/*Be sure to account for padding on the aside elements*/
			//if(debug) console.log('matched');
			$(this).delay(350).animate({
				'top':'12px',
				'left':'0px',
				'height':'242px',
				'width':'930px',
				'padding-top':'4px',
				'padding-left':'5px'
			},500, 'easeOutExpo', function(){
				/*Mark selected panel for deletion with 'bannerOut' id*/
				var location = $(this).attr('data-destination');
				var hash = $(this).attr('data-hash');
				$(this).attr('id','bannerOut')
				window.location.hash = hash;
			});
		}	
	});
	$('#banner figure').delay(200).fadeOut(200);
}