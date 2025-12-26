// [SCRIPT:script-1]
{"@context":"http://schema.org","@type":"WebSite","name":"
// [END SCRIPT]

// [SCRIPT:script-2]

//
// Global variables with content. "Available for Edit"
var monthFormat = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    noThumbnail = "https://4.bp.blogspot.com/-O3EpVMWcoKw/WxY6-6I4--I/AAAAAAAAB2s/KzC0FqUQtkMdw7VzT6oOR_8vbZO6EJc-ACK4BGAYYCw/w680/nth.png",
    postPerPage = 7,
    fixedSidebar = true,
    commentsSystem = "blogger",
    disqusShortname = "soratemplates";
//
// [END SCRIPT]

// [SCRIPT:script-3]

//
          (function(){
            function splitLinkAndIcon(raw){
              if(!raw) return {href:'#', icons:[]};
              var parts = raw.trim().split(/\s+/);
              if(parts.length === 1){
                var only = parts[0];
                var isUrl = /^(https?:\/\/|\/)/i.test(only);
                return {href: isUrl ? only : '#', icons: isUrl ? [] : [only]};
              }
              var href = parts.find(function(p){return /^(https?:\/\/|\/)/i.test(p);}) || '#';
              var icons = parts.filter(function(token){
                if(!token) return false;
                var value = token.trim();
                if(!value) return false;
                if(/^(fa|fi)$/i.test(value)) return true;
                if(/^fa[srbld]$/i.test(value)) return true;
                if(/^fa[-:][a-z0-9-]+$/i.test(value)) return true;
                if(/^fi[-:][a-z0-9-]+$/i.test(value)) return true;
                return false;
              });
              return {href: href, icons: icons};
            }

            function normalizeIconClasses(tokens){
              if(!tokens || !tokens.length){
                return 'fa fi fi-tr-briefcase';
              }
              var list = [];
              tokens.forEach(function(token){
                if(!token) return;
                var value = token.trim();
                if(!value) return;
                list.push(value);
              });
              if(!list.length){
                return 'fa fi fi-tr-briefcase';
              }
              var hasFaFamily = list.some(function(cls){
                return /^(fa|fas|far|fal|fab|fad|fat)$/i.test(cls);
              });
              var hasFaPrefix = list.some(function(cls){
                return /^fa([-:][a-z0-9]+)+$/i.test(cls);
              });
              if(hasFaPrefix && !hasFaFamily){
                list.unshift('fa');
                hasFaFamily = true;
              }
              var hasFiFamily = list.some(function(cls){
                return cls.toLowerCase() === 'fi';
              });
              var hasFiPrefix = list.some(function(cls){
                return /^fi[-:][a-z0-9-]+$/i.test(cls);
              });
              if(hasFiPrefix && !hasFiFamily){
                list.unshift('fi');
              }
              return list.join(' ');
            }

            function setupSubmenuToggle(cardRoot, submenu, linkEl){
              if(!cardRoot || !submenu) return;
              var info = cardRoot.querySelector('.serv-tile-box-info') || cardRoot;
              var toggle = info.querySelector('.serv-submenu-toggle');
              if(!toggle){
                toggle = document.createElement('span');
                toggle.className = 'serv-submenu-toggle';
                toggle.setAttribute('role', 'button');
                toggle.setAttribute('tabindex', '0');
                toggle.setAttribute('aria-label', 'Toggle job list');
                toggle.setAttribute('aria-expanded', 'false');
                toggle.innerHTML = '<i class="fa fa-angle-down" aria-hidden="true"></i>';
                info.appendChild(toggle);
              }

              function toggleSubmenu(evt){
                if(evt){
                  evt.preventDefault();
                  evt.stopPropagation();
                }
                var isOpen = submenu.classList.toggle('open');
                toggle.classList.toggle('open', isOpen);
                toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
              }

              toggle.addEventListener('click', toggleSubmenu);
              toggle.addEventListener('keydown', function(e){
                if(e.key === 'Enter' || e.key === ' '){
                  toggleSubmenu(e);
                }
              });

              if(!linkEl){
                cardRoot.addEventListener('click', function(e){
                  if(e.target.closest('.serv-submenu-toggle')) return;
                  toggleSubmenu(e);
                });
              }
            }

            function buildFallbackCard(widget, content){
              var linkNode = content.querySelector('a[href]');
              var img = content.querySelector('img');
              var capNode = content.querySelector('.caption, .image-caption, span');
              var captionText = capNode && capNode.textContent ? capNode.textContent.trim() : '';
              var titleNode = widget.querySelector('.title, .widget-title, h2.title');
              var titleText = titleNode && titleNode.textContent ? titleNode.textContent.trim() : '';
              var rawHref = linkNode ? (linkNode.getAttribute('href') || '') : '';
              var linkTarget = linkNode ? (linkNode.getAttribute('target') || '') : '';
              var linkRel = linkNode ? (linkNode.getAttribute('rel') || '') : '';
              var parsed = splitLinkAndIcon(rawHref);
              var iconClasses = parsed.icons && parsed.icons.length ? parsed.icons : [];
              var href = linkNode ? (parsed.href || '#') : '';
              var imgAlt = img ? (img.getAttribute('alt') || '').trim() : '';

              if(!titleText) titleText = imgAlt;
              if(titleNode && titleNode.style){ titleNode.style.display = 'none'; }

              // Remove default markup to avoid duplicate remnants.
              content.innerHTML = '';

              var cardRoot;
              if(linkNode){
                cardRoot = document.createElement('a');
                cardRoot.className = 'serv-tile-box-link';
                cardRoot.href = href || '#';
                if(linkTarget) cardRoot.setAttribute('target', linkTarget);
                if(linkRel) cardRoot.setAttribute('rel', linkRel);
              } else {
                cardRoot = document.createElement('div');
                cardRoot.className = 'serv-tile-box-static';
              }

              var avatar = document.createElement('div');
              avatar.className = 'serv-tile-box-avatar';
              var hasImage = img && (img.getAttribute('src') || '').trim().length;

              if(hasImage){
                if(titleText && !imgAlt) img.setAttribute('alt', titleText);
                avatar.appendChild(img);
              } else {
                var iconEl = document.createElement('i');
                iconEl.className = iconClasses.length ? normalizeIconClasses(iconClasses) : 'fa fi fi-tr-briefcase';
                avatar.appendChild(iconEl);
              }

              var info = document.createElement('div');
              info.className = 'serv-tile-box-info';

              var heading = document.createElement('h3');
              heading.className = 'serv-tile-box-title';
              heading.textContent = titleText || 'Item';
              info.appendChild(heading);

              if(captionText){
                var meta = document.createElement('p');
                meta.className = 'serv-tile-box-meta';
                meta.textContent = captionText;
                info.appendChild(meta);
              }

              cardRoot.appendChild(avatar);
              cardRoot.appendChild(info);
              content.appendChild(cardRoot);

              return cardRoot;
            }

            function initServTiles(){
              var section = document.getElementById('serv-tile');
              if(!section) return;
              var widgets = section.querySelectorAll('.widget');
              widgets.forEach(function(widget){
                var content = widget.querySelector('.widget-content');
                if(!content) return;

                var linkEl = content.querySelector('.serv-tile-box-link');
                var staticEl = content.querySelector('.serv-tile-box-static');
                var cardRoot = linkEl || staticEl;
                if(!cardRoot){ cardRoot = buildFallbackCard(widget, content); linkEl = content.querySelector('.serv-tile-box-link'); }

                // Normalize link + icon combo if present
                if(linkEl){
                  var rawHref = linkEl.getAttribute('href') || '';
                  var li = splitLinkAndIcon(rawHref);
                  linkEl.setAttribute('href', li.href || '#');
                  if(li.icons && li.icons.length){
                    var iconEl = content.querySelector('.serv-tile-box-avatar i');
                    if(iconEl){ iconEl.className = normalizeIconClasses(li.icons); }
                  }
                }

                Array.from(content.children).forEach(function(child){
                  if(child === cardRoot) return;
                  if(child.tagName && child.tagName.toLowerCase() === 'style') return;
                  if(child.classList && child.classList.contains('serv-submenu')) return;
                  child.parentNode.removeChild(child);
                });

                // Submenu from caption with pattern: "sub: Title|URL|icon; Title2|URL2|icon2"
                var meta = content.querySelector('.serv-tile-box-meta');
                if(meta){
                  var txt = (meta.textContent||'').trim();
                  if(/^sub:/i.test(txt)){
                    var data = txt.replace(/^sub:/i,'').trim();
                    var items = [];
                    data.split(/\s*;\s*/).forEach(function(chunk){
                      if(!chunk) return;
                      var p = chunk.split(/\s*\|\s*/);
                      var title = p[0] || '';
                      var url = p[1] || '#';
                      var icon = p[2] || '';
                      items.push({title:title, url:url, icon:icon});
                    });
                    if(items.length){
                      meta.style.display = 'none';
                      var submenu = document.createElement('div');
                      submenu.className = 'serv-submenu';
                      items.forEach(function(it){
                        var a = document.createElement('a');
                        a.className = 'serv-subitem';
                        a.href = it.url || '#';
                        a.innerHTML = (it.icon ? '<i class="fa '+it.icon+'"></i>' : '') + '<span class="serv-subitem-title">'+it.title+'</span>';
                        submenu.appendChild(a);
                      });
                      content.appendChild(submenu);
                      setupSubmenuToggle(cardRoot, submenu, linkEl);
                    }
                  }
                }
              });
            }

            if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initServTiles);
            else initServTiles();
          })();
//
        
// [END SCRIPT]

// [SCRIPT:script-4]
var year = new Date();document.write(year.getFullYear());
// [END SCRIPT]

// [SCRIPT:script-5]

//
/*
     _ _      _       _
 ___| (_) ___| | __  (_)___
/ __| | |/ __| |/ /  | / __|
\__ \ | | (__|   < _ | \__ \
|___/_|_|\___|_|\_(_)/ |___/
                   |__/

 Version: 1.9.0
  Author: Ken Wheeler
 Website: http://kenwheeler.github.io
    Docs: http://kenwheeler.github.io/slick
    Repo: http://github.com/kenwheeler/slick
  Issues: http://github.com/kenwheeler/slick/issues

 */
(function(i){"use strict";"function"==typeof define&&define.amd?define(["jquery"],i):"undefined"!=typeof exports?module.exports=i(require("jquery")):i(jQuery)})(function(i){"use strict";var e=window.Slick||{};e=function(){function e(e,o){var s,n=this;n.defaults={accessibility:!0,adaptiveHeight:!1,appendArrows:i(e),appendDots:i(e),arrows:!0,asNavFor:null,prevArrow:'<button class="slick-prev" aria-label="Previous" type="button">Previous</button>',nextArrow:'<button class="slick-next" aria-label="Next" type="button">Next</button>',autoplay:!1,autoplaySpeed:3e3,centerMode:!1,centerPadding:"50px",cssEase:"ease",customPaging:function(e,t){return i('<button type="button" />').text(t+1)},dots:!1,dotsClass:"slick-dots",draggable:!0,easing:"linear",edgeFriction:.35,fade:!1,focusOnSelect:!1,focusOnChange:!1,infinite:!0,initialSlide:0,lazyLoad:"ondemand",mobileFirst:!1,pauseOnHover:!0,pauseOnFocus:!0,pauseOnDotsHover:!1,respondTo:"window",responsive:null,rows:1,rtl:!1,slide:"",slidesPerRow:1,slidesToShow:1,slidesToScroll:1,speed:500,swipe:!0,swipeToSlide:!1,touchMove:!0,touchThreshold:5,useCSS:!0,useTransform:!0,variableWidth:!1,vertical:!1,verticalSwiping:!1,waitForAnimate:!0,zIndex:1e3},n.initials={animating:!1,dragging:!1,autoPlayTimer:null,currentDirection:0,currentLeft:null,currentSlide:0,direction:1,$dots:null,listWidth:null,listHeight:null,loadIndex:0,$nextArrow:null,$prevArrow:null,scrolling:!1,slideCount:null,slideWidth:null,$slideTrack:null,$slides:null,sliding:!1,slideOffset:0,swipeLeft:null,swiping:!1,$list:null,touchObject:{},transformsEnabled:!1,unslicked:!1},i.extend(n,n.initials),n.activeBreakpoint=null,n.animType=null,n.animProp=null,n.breakpoints=[],n.breakpointSettings=[],n.cssTransitions=!1,n.focussed=!1,n.interrupted=!1,n.hidden="hidden",n.paused=!0,n.positionProp=null,n.respondTo=null,n.rowCount=1,n.shouldClick=!0,n.$slider=i(e),n.$slidesCache=null,n.transformType=null,n.transitionType=null,n.visibilityChange="visibilitychange",n.windowWidth=0,n.windowTimer=null,s=i(e).data("slick")||{},n.options=i.extend({},n.defaults,o,s),n.currentSlide=n.options.initialSlide,n.originalSettings=n.options,"undefined"!=typeof document.mozHidden?(n.hidden="mozHidden",n.visibilityChange="mozvisibilitychange"):"undefined"!=typeof document.webkitHidden&&(n.hidden="webkitHidden",n.visibilityChange="webkitvisibilitychange"),n.autoPlay=i.proxy(n.autoPlay,n),n.autoPlayClear=i.proxy(n.autoPlayClear,n),n.autoPlayIterator=i.proxy(n.autoPlayIterator,n),n.changeSlide=i.proxy(n.changeSlide,n),n.clickHandler=i.proxy(n.clickHandler,n),n.selectHandler=i.proxy(n.selectHandler,n),n.setPosition=i.proxy(n.setPosition,n),n.swipeHandler=i.proxy(n.swipeHandler,n),n.dragHandler=i.proxy(n.dragHandler,n),n.keyHandler=i.proxy(n.keyHandler,n),n.instanceUid=t++,n.htmlExpr=/^(?:\s*(<[\w\W]+>)[^>]*)$/,n.registerBreakpoints(),n.init(!0)}var t=0;return e}(),e.prototype.activateADA=function(){var i=this;i.$slideTrack.find(".slick-active").attr({"aria-hidden":"false"}).find("a, input, button, select").attr({tabindex:"0"})},e.prototype.addSlide=e.prototype.slickAdd=function(e,t,o){var s=this;if("boolean"==typeof t)o=t,t=null;else if(t<0||t>=s.slideCount)return!1;s.unload(),"number"==typeof t?0===t&&0===s.$slides.length?i(e).appendTo(s.$slideTrack):o?i(e).insertBefore(s.$slides.eq(t)):i(e).insertAfter(s.$slides.eq(t)):o===!0?i(e).prependTo(s.$slideTrack):i(e).appendTo(s.$slideTrack),s.$slides=s.$slideTrack.children(this.options.slide),s.$slideTrack.children(this.options.slide).detach(),s.$slideTrack.append(s.$slides),s.$slides.each(function(e,t){i(t).attr("data-slick-index",e)}),s.$slidesCache=s.$slides,s.reinit()},e.prototype.animateHeight=function(){var i=this;if(1===i.options.slidesToShow&&i.options.adaptiveHeight===!0&&i.options.vertical===!1){var e=i.$slides.eq(i.currentSlide).outerHeight(!0);i.$list.animate({height:e},i.options.speed)}},e.prototype.animateSlide=function(e,t){var o={},s=this;s.animateHeight(),s.options.rtl===!0&&s.options.vertical===!1&&(e=-e),s.transformsEnabled===!1?s.options.vertical===!1?s.$slideTrack.animate({left:e},s.options.speed,s.options.easing,t):s.$slideTrack.animate({top:e},s.options.speed,s.options.easing,t):s.cssTransitions===!1?(s.options.rtl===!0&&(s.currentLeft=-s.currentLeft),i({animStart:s.currentLeft}).animate({animStart:e},{duration:s.options.speed,easing:s.options.easing,step:function(i){i=Math.ceil(i),s.options.vertical===!1?(o[s.animType]="translate("+i+"px, 0px)",s.$slideTrack.css(o)):(o[s.animType]="translate(0px,"+i+"px)",s.$slideTrack.css(o))},complete:function(){t&&t.call()}})):(s.applyTransition(),e=Math.ceil(e),s.options.vertical===!1?o[s.animType]="translate3d("+e+"px, 0px, 0px)":o[s.animType]="translate3d(0px,"+e+"px, 0px)",s.$slideTrack.css(o),t&&setTimeout(function(){s.disableTransition(),t.call()},s.options.speed))},e.prototype.getNavTarget=function(){var e=this,t=e.options.asNavFor;return t&&null!==t&&(t=i(t).not(e.$slider)),t},e.prototype.asNavFor=function(e){var t=this,o=t.getNavTarget();null!==o&&"object"==typeof o&&o.each(function(){var t=i(this).slick("getSlick");t.unslicked||t.slideHandler(e,!0)})},e.prototype.applyTransition=function(i){var e=this,t={};e.options.fade===!1?t[e.transitionType]=e.transformType+" "+e.options.speed+"ms "+e.options.cssEase:t[e.transitionType]="opacity "+e.options.speed+"ms "+e.options.cssEase,e.options.fade===!1?e.$slideTrack.css(t):e.$slides.eq(i).css(t)},e.prototype.autoPlay=function(){var i=this;i.autoPlayClear(),i.slideCount>i.options.slidesToShow&&(i.autoPlayTimer=setInterval(i.autoPlayIterator,i.options.autoplaySpeed))},e.prototype.autoPlayClear=function(){var i=this;i.autoPlayTimer&&clearInterval(i.autoPlayTimer)},e.prototype.autoPlayIterator=function(){var i=this,e=i.currentSlide+i.options.slidesToScroll;i.paused||i.interrupted||i.focussed||(i.options.infinite===!1&&(1===i.direction&&i.currentSlide+1===i.slideCount-1?i.direction=0:0===i.direction&&(e=i.currentSlide-i.options.slidesToScroll,i.currentSlide-1===0&&(i.direction=1))),i.slideHandler(e))},e.prototype.buildArrows=function(){var e=this;e.options.arrows===!0&&(e.$prevArrow=i(e.options.prevArrow).addClass("slick-arrow"),e.$nextArrow=i(e.options.nextArrow).addClass("slick-arrow"),e.slideCount>e.options.slidesToShow?(e.$prevArrow.removeClass("slick-hidden").removeAttr("aria-hidden tabindex"),e.$nextArrow.removeClass("slick-hidden").removeAttr("aria-hidden tabindex"),e.htmlExpr.test(e.options.prevArrow)&&e.$prevArrow.prependTo(e.options.appendArrows),e.htmlExpr.test(e.options.nextArrow)&&e.$nextArrow.appendTo(e.options.appendArrows),e.options.infinite!==!0&&e.$prevArrow.addClass("slick-disabled").attr("aria-disabled","true")):e.$prevArrow.add(e.$nextArrow).addClass("slick-hidden").attr({"aria-disabled":"true",tabindex:"-1"}))},e.prototype.buildDots=function(){var e,t,o=this;if(o.options.dots===!0&&o.slideCount>o.options.slidesToShow){for(o.$slider.addClass("slick-dotted"),t=i("<ul />").addClass(o.options.dotsClass),e=0;e<=o.getDotCount();e+=1)t.append(i("<li />").append(o.options.customPaging.call(this,o,e)));o.$dots=t.appendTo(o.options.appendDots),o.$dots.find("li").first().addClass("slick-active")}},e.prototype.buildOut=function(){var e=this;e.$slides=e.$slider.children(e.options.slide+":not(.slick-cloned)").addClass("slick-slide"),e.slideCount=e.$slides.length,e.$slides.each(function(e,t){i(t).attr("data-slick-index",e).data("originalStyling",i(t).attr("style")||"")}),e.$slider.addClass("slick-slider"),e.$slideTrack=0===e.slideCount?i('<div class="slick-track"/>').appendTo(e.$slider):e.$slides.wrapAll('<div class="slick-track"/>').parent(),e.$list=e.$slideTrack.wrap('<div class="slick-list"/>').parent(),e.$slideTrack.css("opacity",0),e.options.centerMode!==!0&&e.options.swipeToSlide!==!0||(e.options.slidesToScroll=1),i("img[data-lazy]",e.$slider).not("[src]").addClass("slick-loading"),e.setupInfinite(),e.buildArrows(),e.buildDots(),e.updateDots(),e.setSlideClasses("number"==typeof e.currentSlide?e.currentSlide:0),e.options.draggable===!0&&e.$list.addClass("draggable")},e.prototype.buildRows=function(){var i,e,t,o,s,n,r,l=this;if(o=document.createDocumentFragment(),n=l.$slider.children(),l.options.rows>0){for(r=l.options.slidesPerRow*l.options.rows,s=Math.ceil(n.length/r),i=0;i<s;i++){var d=document.createElement("div");for(e=0;e<l.options.rows;e++){var a=document.createElement("div");for(t=0;t<l.options.slidesPerRow;t++){var c=i*r+(e*l.options.slidesPerRow+t);n.get(c)&&a.appendChild(n.get(c))}d.appendChild(a)}o.appendChild(d)}l.$slider.empty().append(o),l.$slider.children().children().children().css({width:100/l.options.slidesPerRow+"%",display:"inline-block"})}},e.prototype.checkResponsive=function(e,t){var o,s,n,r=this,l=!1,d=r.$slider.width(),a=window.innerWidth||i(window).width();if("window"===r.respondTo?n=a:"slider"===r.respondTo?n=d:"min"===r.respondTo&&(n=Math.min(a,d)),r.options.responsive&&r.options.responsive.length&&null!==r.options.responsive){s=null;for(o in r.breakpoints)r.breakpoints.hasOwnProperty(o)&&(r.originalSettings.mobileFirst===!1?n<r.breakpoints[o]&&(s=r.breakpoints[o]):n>r.breakpoints[o]&&(s=r.breakpoints[o]));null!==s?null!==r.activeBreakpoint?(s!==r.activeBreakpoint||t)&&(r.activeBreakpoint=s,"unslick"===r.breakpointSettings[s]?r.unslick(s):(r.options=i.extend({},r.originalSettings,r.breakpointSettings[s]),e===!0&&(r.currentSlide=r.options.initialSlide),r.refresh(e)),l=s):(r.activeBreakpoint=s,"unslick"===r.breakpointSettings[s]?r.unslick(s):(r.options=i.extend({},r.originalSettings,r.breakpointSettings[s]),e===!0&&(r.currentSlide=r.options.initialSlide),r.refresh(e)),l=s):null!==r.activeBreakpoint&&(r.activeBreakpoint=null,r.options=r.originalSettings,e===!0&&(r.currentSlide=r.options.initialSlide),r.refresh(e),l=s),e||l===!1||r.$slider.trigger("breakpoint",[r,l])}},e.prototype.changeSlide=function(e,t){var o,s,n,r=this,l=i(e.currentTarget);switch(l.is("a")&&e.preventDefault(),l.is("li")||(l=l.closest("li")),n=r.slideCount%r.options.slidesToScroll!==0,o=n?0:(r.slideCount-r.currentSlide)%r.options.slidesToScroll,e.data.message){case"previous":s=0===o?r.options.slidesToScroll:r.options.slidesToShow-o,r.slideCount>r.options.slidesToShow&&r.slideHandler(r.currentSlide-s,!1,t);break;case"next":s=0===o?r.options.slidesToScroll:o,r.slideCount>r.options.slidesToShow&&r.slideHandler(r.currentSlide+s,!1,t);break;case"index":var d=0===e.data.index?0:e.data.index||l.index()*r.options.slidesToScroll;r.slideHandler(r.checkNavigable(d),!1,t),l.children().trigger("focus");break;default:return}},e.prototype.checkNavigable=function(i){var e,t,o=this;if(e=o.getNavigableIndexes(),t=0,i>e[e.length-1])i=e[e.length-1];else for(var s in e){if(i<e[s]){i=t;break}t=e[s]}return i},e.prototype.cleanUpEvents=function(){var e=this;e.options.dots&&null!==e.$dots&&(i("li",e.$dots).off("click.slick",e.changeSlide).off("mouseenter.slick",i.proxy(e.interrupt,e,!0)).off("mouseleave.slick",i.proxy(e.interrupt,e,!1)),e.options.accessibility===!0&&e.$dots.off("keydown.slick",e.keyHandler)),e.$slider.off("focus.slick blur.slick"),e.options.arrows===!0&&e.slideCount>e.options.slidesToShow&&(e.$prevArrow&&e.$prevArrow.off("click.slick",e.changeSlide),e.$nextArrow&&e.$nextArrow.off("click.slick",e.changeSlide),e.options.accessibility===!0&&(e.$prevArrow&&e.$prevArrow.off("keydown.slick",e.keyHandler),e.$nextArrow&&e.$nextArrow.off("keydown.slick",e.keyHandler))),e.$list.off("touchstart.slick mousedown.slick",e.swipeHandler),e.$list.off("touchmove.slick mousemove.slick",e.swipeHandler),e.$list.off("touchend.slick mouseup.slick",e.swipeHandler),e.$list.off("touchcancel.slick mouseleave.slick",e.swipeHandler),e.$list.off("click.slick",e.clickHandler),i(document).off(e.visibilityChange,e.visibility),e.cleanUpSlideEvents(),e.options.accessibility===!0&&e.$list.off("keydown.slick",e.keyHandler),e.options.focusOnSelect===!0&&i(e.$slideTrack).children().off("click.slick",e.selectHandler),i(window).off("orientationchange.slick.slick-"+e.instanceUid,e.orientationChange),i(window).off("resize.slick.slick-"+e.instanceUid,e.resize),i("[draggable!=true]",e.$slideTrack).off("dragstart",e.preventDefault),i(window).off("load.slick.slick-"+e.instanceUid,e.setPosition)},e.prototype.cleanUpSlideEvents=function(){var e=this;e.$list.off("mouseenter.slick",i.proxy(e.interrupt,e,!0)),e.$list.off("mouseleave.slick",i.proxy(e.interrupt,e,!1))},e.prototype.cleanUpRows=function(){var i,e=this;e.options.rows>0&&(i=e.$slides.children().children(),i.removeAttr("style"),e.$slider.empty().append(i))},e.prototype.clickHandler=function(i){var e=this;e.shouldClick===!1&&(i.stopImmediatePropagation(),i.stopPropagation(),i.preventDefault())},e.prototype.destroy=function(e){var t=this;t.autoPlayClear(),t.touchObject={},t.cleanUpEvents(),i(".slick-cloned",t.$slider).detach(),t.$dots&&t.$dots.remove(),t.$prevArrow&&t.$prevArrow.length&&(t.$prevArrow.removeClass("slick-disabled slick-arrow slick-hidden").removeAttr("aria-hidden aria-disabled tabindex").css("display",""),t.htmlExpr.test(t.options.prevArrow)&&t.$prevArrow.remove()),t.$nextArrow&&t.$nextArrow.length&&(t.$nextArrow.removeClass("slick-disabled slick-arrow slick-hidden").removeAttr("aria-hidden aria-disabled tabindex").css("display",""),t.htmlExpr.test(t.options.nextArrow)&&t.$nextArrow.remove()),t.$slides&&(t.$slides.removeClass("slick-slide slick-active slick-center slick-visible slick-current").removeAttr("aria-hidden").removeAttr("data-slick-index").each(function(){i(this).attr("style",i(this).data("originalStyling"))}),t.$slideTrack.children(this.options.slide).detach(),t.$slideTrack.detach(),t.$list.detach(),t.$slider.append(t.$slides)),t.cleanUpRows(),t.$slider.removeClass("slick-slider"),t.$slider.removeClass("slick-initialized"),t.$slider.removeClass("slick-dotted"),t.unslicked=!0,e||t.$slider.trigger("destroy",[t])},e.prototype.disableTransition=function(i){var e=this,t={};t[e.transitionType]="",e.options.fade===!1?e.$slideTrack.css(t):e.$slides.eq(i).css(t)},e.prototype.fadeSlide=function(i,e){var t=this;t.cssTransitions===!1?(t.$slides.eq(i).css({zIndex:t.options.zIndex}),t.$slides.eq(i).animate({opacity:1},t.options.speed,t.options.easing,e)):(t.applyTransition(i),t.$slides.eq(i).css({opacity:1,zIndex:t.options.zIndex}),e&&setTimeout(function(){t.disableTransition(i),e.call()},t.options.speed))},e.prototype.fadeSlideOut=function(i){var e=this;e.cssTransitions===!1?e.$slides.eq(i).animate({opacity:0,zIndex:e.options.zIndex-2},e.options.speed,e.options.easing):(e.applyTransition(i),e.$slides.eq(i).css({opacity:0,zIndex:e.options.zIndex-2}))},e.prototype.filterSlides=e.prototype.slickFilter=function(i){var e=this;null!==i&&(e.$slidesCache=e.$slides,e.unload(),e.$slideTrack.children(this.options.slide).detach(),e.$slidesCache.filter(i).appendTo(e.$slideTrack),e.reinit())},e.prototype.focusHandler=function(){var e=this;e.$slider.off("focus.slick blur.slick").on("focus.slick","*",function(t){var o=i(this);setTimeout(function(){e.options.pauseOnFocus&&o.is(":focus")&&(e.focussed=!0,e.autoPlay())},0)}).on("blur.slick","*",function(t){i(this);e.options.pauseOnFocus&&(e.focussed=!1,e.autoPlay())})},e.prototype.getCurrent=e.prototype.slickCurrentSlide=function(){var i=this;return i.currentSlide},e.prototype.getDotCount=function(){var i=this,e=0,t=0,o=0;if(i.options.infinite===!0)if(i.slideCount<=i.options.slidesToShow)++o;else for(;e<i.slideCount;)++o,e=t+i.options.slidesToScroll,t+=i.options.slidesToScroll<=i.options.slidesToShow?i.options.slidesToScroll:i.options.slidesToShow;else if(i.options.centerMode===!0)o=i.slideCount;else if(i.options.asNavFor)for(;e<i.slideCount;)++o,e=t+i.options.slidesToScroll,t+=i.options.slidesToScroll<=i.options.slidesToShow?i.options.slidesToScroll:i.options.slidesToShow;else o=1+Math.ceil((i.slideCount-i.options.slidesToShow)/i.options.slidesToScroll);return o-1},e.prototype.getLeft=function(i){var e,t,o,s,n=this,r=0;return n.slideOffset=0,t=n.$slides.first().outerHeight(!0),n.options.infinite===!0?(n.slideCount>n.options.slidesToShow&&(n.slideOffset=n.slideWidth*n.options.slidesToShow*-1,s=-1,n.options.vertical===!0&&n.options.centerMode===!0&&(2===n.options.slidesToShow?s=-1.5:1===n.options.slidesToShow&&(s=-2)),r=t*n.options.slidesToShow*s),n.slideCount%n.options.slidesToScroll!==0&&i+n.options.slidesToScroll>n.slideCount&&n.slideCount>n.options.slidesToShow&&(i>n.slideCount?(n.slideOffset=(n.options.slidesToShow-(i-n.slideCount))*n.slideWidth*-1,r=(n.options.slidesToShow-(i-n.slideCount))*t*-1):(n.slideOffset=n.slideCount%n.options.slidesToScroll*n.slideWidth*-1,r=n.slideCount%n.options.slidesToScroll*t*-1))):i+n.options.slidesToShow>n.slideCount&&(n.slideOffset=(i+n.options.slidesToShow-n.slideCount)*n.slideWidth,r=(i+n.options.slidesToShow-n.slideCount)*t),n.slideCount<=n.options.slidesToShow&&(n.slideOffset=0,r=0),n.options.centerMode===!0&&n.slideCount<=n.options.slidesToShow?n.slideOffset=n.slideWidth*Math.floor(n.options.slidesToShow)/2-n.slideWidth*n.slideCount/2:n.options.centerMode===!0&&n.options.infinite===!0?n.slideOffset+=n.slideWidth*Math.floor(n.options.slidesToShow/2)-n.slideWidth:n.options.centerMode===!0&&(n.slideOffset=0,n.slideOffset+=n.slideWidth*Math.floor(n.options.slidesToShow/2)),e=n.options.vertical===!1?i*n.slideWidth*-1+n.slideOffset:i*t*-1+r,n.options.variableWidth===!0&&(o=n.slideCount<=n.options.slidesToShow||n.options.infinite===!1?n.$slideTrack.children(".slick-slide").eq(i):n.$slideTrack.children(".slick-slide").eq(i+n.options.slidesToShow),e=n.options.rtl===!0?o[0]?(n.$slideTrack.width()-o[0].offsetLeft-o.width())*-1:0:o[0]?o[0].offsetLeft*-1:0,n.options.centerMode===!0&&(o=n.slideCount<=n.options.slidesToShow||n.options.infinite===!1?n.$slideTrack.children(".slick-slide").eq(i):n.$slideTrack.children(".slick-slide").eq(i+n.options.slidesToShow+1),e=n.options.rtl===!0?o[0]?(n.$slideTrack.width()-o[0].offsetLeft-o.width())*-1:0:o[0]?o[0].offsetLeft*-1:0,e+=(n.$list.width()-o.outerWidth())/2)),e},e.prototype.getOption=e.prototype.slickGetOption=function(i){var e=this;return e.options[i]},e.prototype.getNavigableIndexes=function(){var i,e=this,t=0,o=0,s=[];for(e.options.infinite===!1?i=e.slideCount:(t=e.options.slidesToScroll*-1,o=e.options.slidesToScroll*-1,i=2*e.slideCount);t<i;)s.push(t),t=o+e.options.slidesToScroll,o+=e.options.slidesToScroll<=e.options.slidesToShow?e.options.slidesToScroll:e.options.slidesToShow;return s},e.prototype.getSlick=function(){return this},e.prototype.getSlideCount=function(){var e,t,o,s,n=this;return s=n.options.centerMode===!0?Math.floor(n.$list.width()/2):0,o=n.swipeLeft*-1+s,n.options.swipeToSlide===!0?(n.$slideTrack.find(".slick-slide").each(function(e,s){var r,l,d;if(r=i(s).outerWidth(),l=s.offsetLeft,n.options.centerMode!==!0&&(l+=r/2),d=l+r,o<d)return t=s,!1}),e=Math.abs(i(t).attr("data-slick-index")-n.currentSlide)||1):n.options.slidesToScroll},e.prototype.goTo=e.prototype.slickGoTo=function(i,e){var t=this;t.changeSlide({data:{message:"index",index:parseInt(i)}},e)},e.prototype.init=function(e){var t=this;i(t.$slider).hasClass("slick-initialized")||(i(t.$slider).addClass("slick-initialized"),t.buildRows(),t.buildOut(),t.setProps(),t.startLoad(),t.loadSlider(),t.initializeEvents(),t.updateArrows(),t.updateDots(),t.checkResponsive(!0),t.focusHandler()),e&&t.$slider.trigger("init",[t]),t.options.accessibility===!0&&t.initADA(),t.options.autoplay&&(t.paused=!1,t.autoPlay())},e.prototype.initADA=function(){var e=this,t=Math.ceil(e.slideCount/e.options.slidesToShow),o=e.getNavigableIndexes().filter(function(i){return i>=0&&i<e.slideCount});e.$slides.add(e.$slideTrack.find(".slick-cloned")).attr({"aria-hidden":"true",tabindex:"-1"}).find("a, input, button, select").attr({tabindex:"-1"}),null!==e.$dots&&(e.$slides.not(e.$slideTrack.find(".slick-cloned")).each(function(t){var s=o.indexOf(t);if(i(this).attr({role:"tabpanel",id:"slick-slide"+e.instanceUid+t,tabindex:-1}),s!==-1){var n="slick-slide-control"+e.instanceUid+s;i("#"+n).length&&i(this).attr({"aria-describedby":n})}}),e.$dots.attr("role","tablist").find("li").each(function(s){var n=o[s];i(this).attr({role:"presentation"}),i(this).find("button").first().attr({role:"tab",id:"slick-slide-control"+e.instanceUid+s,"aria-controls":"slick-slide"+e.instanceUid+n,"aria-label":s+1+" of "+t,"aria-selected":null,tabindex:"-1"})}).eq(e.currentSlide).find("button").attr({"aria-selected":"true",tabindex:"0"}).end());for(var s=e.currentSlide,n=s+e.options.slidesToShow;s<n;s++)e.options.focusOnChange?e.$slides.eq(s).attr({tabindex:"0"}):e.$slides.eq(s).removeAttr("tabindex");e.activateADA()},e.prototype.initArrowEvents=function(){var i=this;i.options.arrows===!0&&i.slideCount>i.options.slidesToShow&&(i.$prevArrow.off("click.slick").on("click.slick",{message:"previous"},i.changeSlide),i.$nextArrow.off("click.slick").on("click.slick",{message:"next"},i.changeSlide),i.options.accessibility===!0&&(i.$prevArrow.on("keydown.slick",i.keyHandler),i.$nextArrow.on("keydown.slick",i.keyHandler)))},e.prototype.initDotEvents=function(){var e=this;e.options.dots===!0&&e.slideCount>e.options.slidesToShow&&(i("li",e.$dots).on("click.slick",{message:"index"},e.changeSlide),e.options.accessibility===!0&&e.$dots.on("keydown.slick",e.keyHandler)),e.options.dots===!0&&e.options.pauseOnDotsHover===!0&&e.slideCount>e.options.slidesToShow&&i("li",e.$dots).on("mouseenter.slick",i.proxy(e.interrupt,e,!0)).on("mouseleave.slick",i.proxy(e.interrupt,e,!1))},e.prototype.initSlideEvents=function(){var e=this;e.options.pauseOnHover&&(e.$list.on("mouseenter.slick",i.proxy(e.interrupt,e,!0)),e.$list.on("mouseleave.slick",i.proxy(e.interrupt,e,!1)))},e.prototype.initializeEvents=function(){var e=this;e.initArrowEvents(),e.initDotEvents(),e.initSlideEvents(),e.$list.on("touchstart.slick mousedown.slick",{action:"start"},e.swipeHandler),e.$list.on("touchmove.slick mousemove.slick",{action:"move"},e.swipeHandler),e.$list.on("touchend.slick mouseup.slick",{action:"end"},e.swipeHandler),e.$list.on("touchcancel.slick mouseleave.slick",{action:"end"},e.swipeHandler),e.$list.on("click.slick",e.clickHandler),i(document).on(e.visibilityChange,i.proxy(e.visibility,e)),e.options.accessibility===!0&&e.$list.on("keydown.slick",e.keyHandler),e.options.focusOnSelect===!0&&i(e.$slideTrack).children().on("click.slick",e.selectHandler),i(window).on("orientationchange.slick.slick-"+e.instanceUid,i.proxy(e.orientationChange,e)),i(window).on("resize.slick.slick-"+e.instanceUid,i.proxy(e.resize,e)),i("[draggable!=true]",e.$slideTrack).on("dragstart",e.preventDefault),i(window).on("load.slick.slick-"+e.instanceUid,e.setPosition),i(e.setPosition)},e.prototype.initUI=function(){var i=this;i.options.arrows===!0&&i.slideCount>i.options.slidesToShow&&(i.$prevArrow.show(),i.$nextArrow.show()),i.options.dots===!0&&i.slideCount>i.options.slidesToShow&&i.$dots.show()},e.prototype.keyHandler=function(i){var e=this;i.target.tagName.match("TEXTAREA|INPUT|SELECT")||(37===i.keyCode&&e.options.accessibility===!0?e.changeSlide({data:{message:e.options.rtl===!0?"next":"previous"}}):39===i.keyCode&&e.options.accessibility===!0&&e.changeSlide({data:{message:e.options.rtl===!0?"previous":"next"}}))},e.prototype.lazyLoad=function(){function e(e){i("img[data-lazy]",e).each(function(){var e=i(this),t=i(this).attr("data-lazy"),o=i(this).attr("data-srcset"),s=i(this).attr("data-sizes")||r.$slider.attr("data-sizes"),n=document.createElement("img");n.onload=function(){e.animate({opacity:0},100,function(){o&&(e.attr("srcset",o),s&&e.attr("sizes",s)),e.attr("src",t).animate({opacity:1},200,function(){e.removeAttr("data-lazy data-srcset data-sizes").removeClass("slick-loading")}),r.$slider.trigger("lazyLoaded",[r,e,t])})},n.onerror=function(){e.removeAttr("data-lazy").removeClass("slick-loading").addClass("slick-lazyload-error"),r.$slider.trigger("lazyLoadError",[r,e,t])},n.src=t})}var t,o,s,n,r=this;if(r.options.centerMode===!0?r.options.infinite===!0?(s=r.currentSlide+(r.options.slidesToShow/2+1),n=s+r.options.slidesToShow+2):(s=Math.max(0,r.currentSlide-(r.options.slidesToShow/2+1)),n=2+(r.options.slidesToShow/2+1)+r.currentSlide):(s=r.options.infinite?r.options.slidesToShow+r.currentSlide:r.currentSlide,n=Math.ceil(s+r.options.slidesToShow),r.options.fade===!0&&(s>0&&s--,n<=r.slideCount&&n++)),t=r.$slider.find(".slick-slide").slice(s,n),"anticipated"===r.options.lazyLoad)for(var l=s-1,d=n,a=r.$slider.find(".slick-slide"),c=0;c<r.options.slidesToScroll;c++)l<0&&(l=r.slideCount-1),t=t.add(a.eq(l)),t=t.add(a.eq(d)),l--,d++;e(t),r.slideCount<=r.options.slidesToShow?(o=r.$slider.find(".slick-slide"),e(o)):r.currentSlide>=r.slideCount-r.options.slidesToShow?(o=r.$slider.find(".slick-cloned").slice(0,r.options.slidesToShow),e(o)):0===r.currentSlide&&(o=r.$slider.find(".slick-cloned").slice(r.options.slidesToShow*-1),e(o))},e.prototype.loadSlider=function(){var i=this;i.setPosition(),i.$slideTrack.css({opacity:1}),i.$slider.removeClass("slick-loading"),i.initUI(),"progressive"===i.options.lazyLoad&&i.progressiveLazyLoad()},e.prototype.next=e.prototype.slickNext=function(){var i=this;i.changeSlide({data:{message:"next"}})},e.prototype.orientationChange=function(){var i=this;i.checkResponsive(),i.setPosition()},e.prototype.pause=e.prototype.slickPause=function(){var i=this;i.autoPlayClear(),i.paused=!0},e.prototype.play=e.prototype.slickPlay=function(){var i=this;i.autoPlay(),i.options.autoplay=!0,i.paused=!1,i.focussed=!1,i.interrupted=!1},e.prototype.postSlide=function(e){var t=this;if(!t.unslicked&&(t.$slider.trigger("afterChange",[t,e]),t.animating=!1,t.slideCount>t.options.slidesToShow&&t.setPosition(),t.swipeLeft=null,t.options.autoplay&&t.autoPlay(),t.options.accessibility===!0&&(t.initADA(),t.options.focusOnChange))){var o=i(t.$slides.get(t.currentSlide));o.attr("tabindex",0).focus()}},e.prototype.prev=e.prototype.slickPrev=function(){var i=this;i.changeSlide({data:{message:"previous"}})},e.prototype.preventDefault=function(i){i.preventDefault()},e.prototype.progressiveLazyLoad=function(e){e=e||1;var t,o,s,n,r,l=this,d=i("img[data-lazy]",l.$slider);d.length?(t=d.first(),o=t.attr("data-lazy"),s=t.attr("data-srcset"),n=t.attr("data-sizes")||l.$slider.attr("data-sizes"),r=document.createElement("img"),r.onload=function(){s&&(t.attr("srcset",s),n&&t.attr("sizes",n)),t.attr("src",o).removeAttr("data-lazy data-srcset data-sizes").removeClass("slick-loading"),l.options.adaptiveHeight===!0&&l.setPosition(),l.$slider.trigger("lazyLoaded",[l,t,o]),l.progressiveLazyLoad()},r.onerror=function(){e<3?setTimeout(function(){l.progressiveLazyLoad(e+1)},500):(t.removeAttr("data-lazy").removeClass("slick-loading").addClass("slick-lazyload-error"),l.$slider.trigger("lazyLoadError",[l,t,o]),l.progressiveLazyLoad())},r.src=o):l.$slider.trigger("allImagesLoaded",[l])},e.prototype.refresh=function(e){var t,o,s=this;o=s.slideCount-s.options.slidesToShow,!s.options.infinite&&s.currentSlide>o&&(s.currentSlide=o),s.slideCount<=s.options.slidesToShow&&(s.currentSlide=0),t=s.currentSlide,s.destroy(!0),i.extend(s,s.initials,{currentSlide:t}),s.init(),e||s.changeSlide({data:{message:"index",index:t}},!1)},e.prototype.registerBreakpoints=function(){var e,t,o,s=this,n=s.options.responsive||null;if("array"===i.type(n)&&n.length){s.respondTo=s.options.respondTo||"window";for(e in n)if(o=s.breakpoints.length-1,n.hasOwnProperty(e)){for(t=n[e].breakpoint;o>=0;)s.breakpoints[o]&&s.breakpoints[o]===t&&s.breakpoints.splice(o,1),o--;s.breakpoints.push(t),s.breakpointSettings[t]=n[e].settings}s.breakpoints.sort(function(i,e){return s.options.mobileFirst?i-e:e-i})}},e.prototype.reinit=function(){var e=this;e.$slides=e.$slideTrack.children(e.options.slide).addClass("slick-slide"),e.slideCount=e.$slides.length,e.currentSlide>=e.slideCount&&0!==e.currentSlide&&(e.currentSlide=e.currentSlide-e.options.slidesToScroll),e.slideCount<=e.options.slidesToShow&&(e.currentSlide=0),e.registerBreakpoints(),e.setProps(),e.setupInfinite(),e.buildArrows(),e.updateArrows(),e.initArrowEvents(),e.buildDots(),e.updateDots(),e.initDotEvents(),e.cleanUpSlideEvents(),e.initSlideEvents(),e.checkResponsive(!1,!0),e.options.focusOnSelect===!0&&i(e.$slideTrack).children().on("click.slick",e.selectHandler),e.setSlideClasses("number"==typeof e.currentSlide?e.currentSlide:0),e.setPosition(),e.focusHandler(),e.paused=!e.options.autoplay,e.autoPlay(),e.$slider.trigger("reInit",[e])},e.prototype.resize=function(){var e=this;i(window).width()!==e.windowWidth&&(clearTimeout(e.windowDelay),e.windowDelay=window.setTimeout(function(){e.windowWidth=i(window).width(),e.checkResponsive(),e.unslicked||e.setPosition()},50))},e.prototype.removeSlide=e.prototype.slickRemove=function(i,e,t){var o=this;return"boolean"==typeof i?(e=i,i=e===!0?0:o.slideCount-1):i=e===!0?--i:i,!(o.slideCount<1||i<0||i>o.slideCount-1)&&(o.unload(),t===!0?o.$slideTrack.children().remove():o.$slideTrack.children(this.options.slide).eq(i).remove(),o.$slides=o.$slideTrack.children(this.options.slide),o.$slideTrack.children(this.options.slide).detach(),o.$slideTrack.append(o.$slides),o.$slidesCache=o.$slides,void o.reinit())},e.prototype.setCSS=function(i){var e,t,o=this,s={};o.options.rtl===!0&&(i=-i),e="left"==o.positionProp?Math.ceil(i)+"px":"0px",t="top"==o.positionProp?Math.ceil(i)+"px":"0px",s[o.positionProp]=i,o.transformsEnabled===!1?o.$slideTrack.css(s):(s={},o.cssTransitions===!1?(s[o.animType]="translate("+e+", "+t+")",o.$slideTrack.css(s)):(s[o.animType]="translate3d("+e+", "+t+", 0px)",o.$slideTrack.css(s)))},e.prototype.setDimensions=function(){var i=this;i.options.vertical===!1?i.options.centerMode===!0&&i.$list.css({padding:"0px "+i.options.centerPadding}):(i.$list.height(i.$slides.first().outerHeight(!0)*i.options.slidesToShow),i.options.centerMode===!0&&i.$list.css({padding:i.options.centerPadding+" 0px"})),i.listWidth=i.$list.width(),i.listHeight=i.$list.height(),i.options.vertical===!1&&i.options.variableWidth===!1?(i.slideWidth=Math.ceil(i.listWidth/i.options.slidesToShow),i.$slideTrack.width(Math.ceil(i.slideWidth*i.$slideTrack.children(".slick-slide").length))):i.options.variableWidth===!0?i.$slideTrack.width(5e3*i.slideCount):(i.slideWidth=Math.ceil(i.listWidth),i.$slideTrack.height(Math.ceil(i.$slides.first().outerHeight(!0)*i.$slideTrack.children(".slick-slide").length)));var e=i.$slides.first().outerWidth(!0)-i.$slides.first().width();i.options.variableWidth===!1&&i.$slideTrack.children(".slick-slide").width(i.slideWidth-e)},e.prototype.setFade=function(){var e,t=this;t.$slides.each(function(o,s){e=t.slideWidth*o*-1,t.options.rtl===!0?i(s).css({position:"relative",right:e,top:0,zIndex:t.options.zIndex-2,opacity:0}):i(s).css({position:"relative",left:e,top:0,zIndex:t.options.zIndex-2,opacity:0})}),t.$slides.eq(t.currentSlide).css({zIndex:t.options.zIndex-1,opacity:1})},e.prototype.setHeight=function(){var i=this;if(1===i.options.slidesToShow&&i.options.adaptiveHeight===!0&&i.options.vertical===!1){var e=i.$slides.eq(i.currentSlide).outerHeight(!0);i.$list.css("height",e)}},e.prototype.setOption=e.prototype.slickSetOption=function(){var e,t,o,s,n,r=this,l=!1;if("object"===i.type(arguments[0])?(o=arguments[0],l=arguments[1],n="multiple"):"string"===i.type(arguments[0])&&(o=arguments[0],s=arguments[1],l=arguments[2],"responsive"===arguments[0]&&"array"===i.type(arguments[1])?n="responsive":"undefined"!=typeof arguments[1]&&(n="single")),"single"===n)r.options[o]=s;else if("multiple"===n)i.each(o,function(i,e){r.options[i]=e});else if("responsive"===n)for(t in s)if("array"!==i.type(r.options.responsive))r.options.responsive=[s[t]];else{for(e=r.options.responsive.length-1;e>=0;)r.options.responsive[e].breakpoint===s[t].breakpoint&&r.options.responsive.splice(e,1),e--;r.options.responsive.push(s[t])}l&&(r.unload(),r.reinit())},e.prototype.setPosition=function(){var i=this;i.setDimensions(),i.setHeight(),i.options.fade===!1?i.setCSS(i.getLeft(i.currentSlide)):i.setFade(),i.$slider.trigger("setPosition",[i])},e.prototype.setProps=function(){var i=this,e=document.body.style;i.positionProp=i.options.vertical===!0?"top":"left",
"top"===i.positionProp?i.$slider.addClass("slick-vertical"):i.$slider.removeClass("slick-vertical"),void 0===e.WebkitTransition&&void 0===e.MozTransition&&void 0===e.msTransition||i.options.useCSS===!0&&(i.cssTransitions=!0),i.options.fade&&("number"==typeof i.options.zIndex?i.options.zIndex<3&&(i.options.zIndex=3):i.options.zIndex=i.defaults.zIndex),void 0!==e.OTransform&&(i.animType="OTransform",i.transformType="-o-transform",i.transitionType="OTransition",void 0===e.perspectiveProperty&&void 0===e.webkitPerspective&&(i.animType=!1)),void 0!==e.MozTransform&&(i.animType="MozTransform",i.transformType="-moz-transform",i.transitionType="MozTransition",void 0===e.perspectiveProperty&&void 0===e.MozPerspective&&(i.animType=!1)),void 0!==e.webkitTransform&&(i.animType="webkitTransform",i.transformType="-webkit-transform",i.transitionType="webkitTransition",void 0===e.perspectiveProperty&&void 0===e.webkitPerspective&&(i.animType=!1)),void 0!==e.msTransform&&(i.animType="msTransform",i.transformType="-ms-transform",i.transitionType="msTransition",void 0===e.msTransform&&(i.animType=!1)),void 0!==e.transform&&i.animType!==!1&&(i.animType="transform",i.transformType="transform",i.transitionType="transition"),i.transformsEnabled=i.options.useTransform&&null!==i.animType&&i.animType!==!1},e.prototype.setSlideClasses=function(i){var e,t,o,s,n=this;if(t=n.$slider.find(".slick-slide").removeClass("slick-active slick-center slick-current").attr("aria-hidden","true"),n.$slides.eq(i).addClass("slick-current"),n.options.centerMode===!0){var r=n.options.slidesToShow%2===0?1:0;e=Math.floor(n.options.slidesToShow/2),n.options.infinite===!0&&(i>=e&&i<=n.slideCount-1-e?n.$slides.slice(i-e+r,i+e+1).addClass("slick-active").attr("aria-hidden","false"):(o=n.options.slidesToShow+i,t.slice(o-e+1+r,o+e+2).addClass("slick-active").attr("aria-hidden","false")),0===i?t.eq(t.length-1-n.options.slidesToShow).addClass("slick-center"):i===n.slideCount-1&&t.eq(n.options.slidesToShow).addClass("slick-center")),n.$slides.eq(i).addClass("slick-center")}else i>=0&&i<=n.slideCount-n.options.slidesToShow?n.$slides.slice(i,i+n.options.slidesToShow).addClass("slick-active").attr("aria-hidden","false"):t.length<=n.options.slidesToShow?t.addClass("slick-active").attr("aria-hidden","false"):(s=n.slideCount%n.options.slidesToShow,o=n.options.infinite===!0?n.options.slidesToShow+i:i,n.options.slidesToShow==n.options.slidesToScroll&&n.slideCount-i<n.options.slidesToShow?t.slice(o-(n.options.slidesToShow-s),o+s).addClass("slick-active").attr("aria-hidden","false"):t.slice(o,o+n.options.slidesToShow).addClass("slick-active").attr("aria-hidden","false"));"ondemand"!==n.options.lazyLoad&&"anticipated"!==n.options.lazyLoad||n.lazyLoad()},e.prototype.setupInfinite=function(){var e,t,o,s=this;if(s.options.fade===!0&&(s.options.centerMode=!1),s.options.infinite===!0&&s.options.fade===!1&&(t=null,s.slideCount>s.options.slidesToShow)){for(o=s.options.centerMode===!0?s.options.slidesToShow+1:s.options.slidesToShow,e=s.slideCount;e>s.slideCount-o;e-=1)t=e-1,i(s.$slides[t]).clone(!0).attr("id","").attr("data-slick-index",t-s.slideCount).prependTo(s.$slideTrack).addClass("slick-cloned");for(e=0;e<o+s.slideCount;e+=1)t=e,i(s.$slides[t]).clone(!0).attr("id","").attr("data-slick-index",t+s.slideCount).appendTo(s.$slideTrack).addClass("slick-cloned");s.$slideTrack.find(".slick-cloned").find("[id]").each(function(){i(this).attr("id","")})}},e.prototype.interrupt=function(i){var e=this;i||e.autoPlay(),e.interrupted=i},e.prototype.selectHandler=function(e){var t=this,o=i(e.target).is(".slick-slide")?i(e.target):i(e.target).parents(".slick-slide"),s=parseInt(o.attr("data-slick-index"));return s||(s=0),t.slideCount<=t.options.slidesToShow?void t.slideHandler(s,!1,!0):void t.slideHandler(s)},e.prototype.slideHandler=function(i,e,t){var o,s,n,r,l,d=null,a=this;if(e=e||!1,!(a.animating===!0&&a.options.waitForAnimate===!0||a.options.fade===!0&&a.currentSlide===i))return e===!1&&a.asNavFor(i),o=i,d=a.getLeft(o),r=a.getLeft(a.currentSlide),a.currentLeft=null===a.swipeLeft?r:a.swipeLeft,a.options.infinite===!1&&a.options.centerMode===!1&&(i<0||i>a.getDotCount()*a.options.slidesToScroll)?void(a.options.fade===!1&&(o=a.currentSlide,t!==!0&&a.slideCount>a.options.slidesToShow?a.animateSlide(r,function(){a.postSlide(o)}):a.postSlide(o))):a.options.infinite===!1&&a.options.centerMode===!0&&(i<0||i>a.slideCount-a.options.slidesToScroll)?void(a.options.fade===!1&&(o=a.currentSlide,t!==!0&&a.slideCount>a.options.slidesToShow?a.animateSlide(r,function(){a.postSlide(o)}):a.postSlide(o))):(a.options.autoplay&&clearInterval(a.autoPlayTimer),s=o<0?a.slideCount%a.options.slidesToScroll!==0?a.slideCount-a.slideCount%a.options.slidesToScroll:a.slideCount+o:o>=a.slideCount?a.slideCount%a.options.slidesToScroll!==0?0:o-a.slideCount:o,a.animating=!0,a.$slider.trigger("beforeChange",[a,a.currentSlide,s]),n=a.currentSlide,a.currentSlide=s,a.setSlideClasses(a.currentSlide),a.options.asNavFor&&(l=a.getNavTarget(),l=l.slick("getSlick"),l.slideCount<=l.options.slidesToShow&&l.setSlideClasses(a.currentSlide)),a.updateDots(),a.updateArrows(),a.options.fade===!0?(t!==!0?(a.fadeSlideOut(n),a.fadeSlide(s,function(){a.postSlide(s)})):a.postSlide(s),void a.animateHeight()):void(t!==!0&&a.slideCount>a.options.slidesToShow?a.animateSlide(d,function(){a.postSlide(s)}):a.postSlide(s)))},e.prototype.startLoad=function(){var i=this;i.options.arrows===!0&&i.slideCount>i.options.slidesToShow&&(i.$prevArrow.hide(),i.$nextArrow.hide()),i.options.dots===!0&&i.slideCount>i.options.slidesToShow&&i.$dots.hide(),i.$slider.addClass("slick-loading")},e.prototype.swipeDirection=function(){var i,e,t,o,s=this;return i=s.touchObject.startX-s.touchObject.curX,e=s.touchObject.startY-s.touchObject.curY,t=Math.atan2(e,i),o=Math.round(180*t/Math.PI),o<0&&(o=360-Math.abs(o)),o<=45&&o>=0?s.options.rtl===!1?"left":"right":o<=360&&o>=315?s.options.rtl===!1?"left":"right":o>=135&&o<=225?s.options.rtl===!1?"right":"left":s.options.verticalSwiping===!0?o>=35&&o<=135?"down":"up":"vertical"},e.prototype.swipeEnd=function(i){var e,t,o=this;if(o.dragging=!1,o.swiping=!1,o.scrolling)return o.scrolling=!1,!1;if(o.interrupted=!1,o.shouldClick=!(o.touchObject.swipeLength>10),void 0===o.touchObject.curX)return!1;if(o.touchObject.edgeHit===!0&&o.$slider.trigger("edge",[o,o.swipeDirection()]),o.touchObject.swipeLength>=o.touchObject.minSwipe){switch(t=o.swipeDirection()){case"left":case"down":e=o.options.swipeToSlide?o.checkNavigable(o.currentSlide+o.getSlideCount()):o.currentSlide+o.getSlideCount(),o.currentDirection=0;break;case"right":case"up":e=o.options.swipeToSlide?o.checkNavigable(o.currentSlide-o.getSlideCount()):o.currentSlide-o.getSlideCount(),o.currentDirection=1}"vertical"!=t&&(o.slideHandler(e),o.touchObject={},o.$slider.trigger("swipe",[o,t]))}else o.touchObject.startX!==o.touchObject.curX&&(o.slideHandler(o.currentSlide),o.touchObject={})},e.prototype.swipeHandler=function(i){var e=this;if(!(e.options.swipe===!1||"ontouchend"in document&&e.options.swipe===!1||e.options.draggable===!1&&i.type.indexOf("mouse")!==-1))switch(e.touchObject.fingerCount=i.originalEvent&&void 0!==i.originalEvent.touches?i.originalEvent.touches.length:1,e.touchObject.minSwipe=e.listWidth/e.options.touchThreshold,e.options.verticalSwiping===!0&&(e.touchObject.minSwipe=e.listHeight/e.options.touchThreshold),i.data.action){case"start":e.swipeStart(i);break;case"move":e.swipeMove(i);break;case"end":e.swipeEnd(i)}},e.prototype.swipeMove=function(i){var e,t,o,s,n,r,l=this;return n=void 0!==i.originalEvent?i.originalEvent.touches:null,!(!l.dragging||l.scrolling||n&&1!==n.length)&&(e=l.getLeft(l.currentSlide),l.touchObject.curX=void 0!==n?n[0].pageX:i.clientX,l.touchObject.curY=void 0!==n?n[0].pageY:i.clientY,l.touchObject.swipeLength=Math.round(Math.sqrt(Math.pow(l.touchObject.curX-l.touchObject.startX,2))),r=Math.round(Math.sqrt(Math.pow(l.touchObject.curY-l.touchObject.startY,2))),!l.options.verticalSwiping&&!l.swiping&&r>4?(l.scrolling=!0,!1):(l.options.verticalSwiping===!0&&(l.touchObject.swipeLength=r),t=l.swipeDirection(),void 0!==i.originalEvent&&l.touchObject.swipeLength>4&&(l.swiping=!0,i.preventDefault()),s=(l.options.rtl===!1?1:-1)*(l.touchObject.curX>l.touchObject.startX?1:-1),l.options.verticalSwiping===!0&&(s=l.touchObject.curY>l.touchObject.startY?1:-1),o=l.touchObject.swipeLength,l.touchObject.edgeHit=!1,l.options.infinite===!1&&(0===l.currentSlide&&"right"===t||l.currentSlide>=l.getDotCount()&&"left"===t)&&(o=l.touchObject.swipeLength*l.options.edgeFriction,l.touchObject.edgeHit=!0),l.options.vertical===!1?l.swipeLeft=e+o*s:l.swipeLeft=e+o*(l.$list.height()/l.listWidth)*s,l.options.verticalSwiping===!0&&(l.swipeLeft=e+o*s),l.options.fade!==!0&&l.options.touchMove!==!1&&(l.animating===!0?(l.swipeLeft=null,!1):void l.setCSS(l.swipeLeft))))},e.prototype.swipeStart=function(i){var e,t=this;return t.interrupted=!0,1!==t.touchObject.fingerCount||t.slideCount<=t.options.slidesToShow?(t.touchObject={},!1):(void 0!==i.originalEvent&&void 0!==i.originalEvent.touches&&(e=i.originalEvent.touches[0]),t.touchObject.startX=t.touchObject.curX=void 0!==e?e.pageX:i.clientX,t.touchObject.startY=t.touchObject.curY=void 0!==e?e.pageY:i.clientY,void(t.dragging=!0))},e.prototype.unfilterSlides=e.prototype.slickUnfilter=function(){var i=this;null!==i.$slidesCache&&(i.unload(),i.$slideTrack.children(this.options.slide).detach(),i.$slidesCache.appendTo(i.$slideTrack),i.reinit())},e.prototype.unload=function(){var e=this;i(".slick-cloned",e.$slider).remove(),e.$dots&&e.$dots.remove(),e.$prevArrow&&e.htmlExpr.test(e.options.prevArrow)&&e.$prevArrow.remove(),e.$nextArrow&&e.htmlExpr.test(e.options.nextArrow)&&e.$nextArrow.remove(),e.$slides.removeClass("slick-slide slick-active slick-visible slick-current").attr("aria-hidden","true").css("width","")},e.prototype.unslick=function(i){var e=this;e.$slider.trigger("unslick",[e,i]),e.destroy()},e.prototype.updateArrows=function(){var i,e=this;i=Math.floor(e.options.slidesToShow/2),e.options.arrows===!0&&e.slideCount>e.options.slidesToShow&&!e.options.infinite&&(e.$prevArrow.removeClass("slick-disabled").attr("aria-disabled","false"),e.$nextArrow.removeClass("slick-disabled").attr("aria-disabled","false"),0===e.currentSlide?(e.$prevArrow.addClass("slick-disabled").attr("aria-disabled","true"),e.$nextArrow.removeClass("slick-disabled").attr("aria-disabled","false")):e.currentSlide>=e.slideCount-e.options.slidesToShow&&e.options.centerMode===!1?(e.$nextArrow.addClass("slick-disabled").attr("aria-disabled","true"),e.$prevArrow.removeClass("slick-disabled").attr("aria-disabled","false")):e.currentSlide>=e.slideCount-1&&e.options.centerMode===!0&&(e.$nextArrow.addClass("slick-disabled").attr("aria-disabled","true"),e.$prevArrow.removeClass("slick-disabled").attr("aria-disabled","false")))},e.prototype.updateDots=function(){var i=this;null!==i.$dots&&(i.$dots.find("li").removeClass("slick-active").end(),i.$dots.find("li").eq(Math.floor(i.currentSlide/i.options.slidesToScroll)).addClass("slick-active"))},e.prototype.visibility=function(){var i=this;i.options.autoplay&&(document[i.hidden]?i.interrupted=!0:i.interrupted=!1)},i.fn.slick=function(){var i,t,o=this,s=arguments[0],n=Array.prototype.slice.call(arguments,1),r=o.length;for(i=0;i<r;i++)if("object"==typeof s||"undefined"==typeof s?o[i].slick=new e(o[i],s):t=o[i].slick[s].apply(o[i].slick,n),"undefined"!=typeof t)return t;return o}});

/*! Theia Sticky Sidebar | v1.7.0 - https://github.com/WeCodePixels/theia-sticky-sidebar */
(function($){$.fn.theiaStickySidebar=function(options){var defaults={'containerSelector':'','additionalMarginTop':0,'additionalMarginBottom':0,'updateSidebarHeight':true,'minWidth':0,'disableOnResponsiveLayouts':true,'sidebarBehavior':'modern','defaultPosition':'relative','namespace':'TSS'};options=$.extend(defaults,options);options.additionalMarginTop=parseInt(options.additionalMarginTop)||0;options.additionalMarginBottom=parseInt(options.additionalMarginBottom)||0;tryInitOrHookIntoEvents(options,this);function tryInitOrHookIntoEvents(options,$that){var success=tryInit(options,$that);if(!success){console.log('TSS: Body width smaller than options.minWidth. Init is delayed.');$(document).on('scroll.'+options.namespace,function(options,$that){return function(evt){var success=tryInit(options,$that);if(success){$(this).unbind(evt)}}}(options,$that));$(window).on('resize.'+options.namespace,function(options,$that){return function(evt){var success=tryInit(options,$that);if(success){$(this).unbind(evt)}}}(options,$that))}}function tryInit(options,$that){if(options.initialized===true){return true}if($('body').width()<options.minWidth){return false}init(options,$that);return true}function init(options,$that){options.initialized=true;var existingStylesheet=$('#theia-sticky-sidebar-stylesheet-'+options.namespace);if(existingStylesheet.length===0){$('head').append($('<style id="theia-sticky-sidebar-stylesheet-'+options.namespace+'">.theiaStickySidebar:after {content: ""; display: table; clear: both;}</style>'))}$that.each(function(){var o={};o.sidebar=$(this);o.options=options||{};o.container=$(o.options.containerSelector);if(o.container.length==0){o.container=o.sidebar.parent()}o.sidebar.parents().css('-webkit-transform','none');o.sidebar.css({'position':o.options.defaultPosition,'overflow':'visible','-webkit-box-sizing':'border-box','-moz-box-sizing':'border-box','box-sizing':'border-box'});o.stickySidebar=o.sidebar.find('.theiaStickySidebar');if(o.stickySidebar.length==0){var javaScriptMIMETypes=/(?:text|application)\/(?:x-)?(?:javascript|ecmascript)/i;o.sidebar.find('script').filter(function(index,script){return script.type.length===0||script.type.match(javaScriptMIMETypes)}).remove();o.stickySidebar=$('<div>').addClass('theiaStickySidebar').append(o.sidebar.children());o.sidebar.append(o.stickySidebar)}o.marginBottom=parseInt(o.sidebar.css('margin-bottom'));o.paddingTop=parseInt(o.sidebar.css('padding-top'));o.paddingBottom=parseInt(o.sidebar.css('padding-bottom'));var collapsedTopHeight=o.stickySidebar.offset().top;var collapsedBottomHeight=o.stickySidebar.outerHeight();o.stickySidebar.css('padding-top',1);o.stickySidebar.css('padding-bottom',1);collapsedTopHeight-=o.stickySidebar.offset().top;collapsedBottomHeight=o.stickySidebar.outerHeight()-collapsedBottomHeight-collapsedTopHeight;if(collapsedTopHeight==0){o.stickySidebar.css('padding-top',0);o.stickySidebarPaddingTop=0}else{o.stickySidebarPaddingTop=1}if(collapsedBottomHeight==0){o.stickySidebar.css('padding-bottom',0);o.stickySidebarPaddingBottom=0}else{o.stickySidebarPaddingBottom=1}o.previousScrollTop=null;o.fixedScrollTop=0;resetSidebar();o.onScroll=function(o){if(!o.stickySidebar.is(":visible")){return}if($('body').width()<o.options.minWidth){resetSidebar();return}if(o.options.disableOnResponsiveLayouts){var sidebarWidth=o.sidebar.outerWidth(o.sidebar.css('float')=='none');if(sidebarWidth+50>o.container.width()){resetSidebar();return}}var scrollTop=$(document).scrollTop();var position='static';if(scrollTop>=o.sidebar.offset().top+(o.paddingTop-o.options.additionalMarginTop)){var offsetTop=o.paddingTop+options.additionalMarginTop;var offsetBottom=o.paddingBottom+o.marginBottom+options.additionalMarginBottom;var containerTop=o.sidebar.offset().top;var containerBottom=o.sidebar.offset().top+getClearedHeight(o.container);var windowOffsetTop=0+options.additionalMarginTop;var windowOffsetBottom;var sidebarSmallerThanWindow=(o.stickySidebar.outerHeight()+offsetTop+offsetBottom)<$(window).height();if(sidebarSmallerThanWindow){windowOffsetBottom=windowOffsetTop+o.stickySidebar.outerHeight()}else{windowOffsetBottom=$(window).height()-o.marginBottom-o.paddingBottom-options.additionalMarginBottom}var staticLimitTop=containerTop-scrollTop+o.paddingTop;var staticLimitBottom=containerBottom-scrollTop-o.paddingBottom-o.marginBottom;var top=o.stickySidebar.offset().top-scrollTop;var scrollTopDiff=o.previousScrollTop-scrollTop;if(o.stickySidebar.css('position')=='fixed'){if(o.options.sidebarBehavior=='modern'){top+=scrollTopDiff}}if(o.options.sidebarBehavior=='stick-to-top'){top=options.additionalMarginTop}if(o.options.sidebarBehavior=='stick-to-bottom'){top=windowOffsetBottom-o.stickySidebar.outerHeight()}if(scrollTopDiff>0){top=Math.min(top,windowOffsetTop)}else{top=Math.max(top,windowOffsetBottom-o.stickySidebar.outerHeight())}top=Math.max(top,staticLimitTop);top=Math.min(top,staticLimitBottom-o.stickySidebar.outerHeight());var sidebarSameHeightAsContainer=o.container.height()==o.stickySidebar.outerHeight();if(!sidebarSameHeightAsContainer&&top==windowOffsetTop){position='fixed'}else if(!sidebarSameHeightAsContainer&&top==windowOffsetBottom-o.stickySidebar.outerHeight()){position='fixed'}else if(scrollTop+top-o.sidebar.offset().top-o.paddingTop<=options.additionalMarginTop){position='static'}else{position='absolute'}}if(position=='fixed'){var scrollLeft=$(document).scrollLeft();o.stickySidebar.css({'position':'fixed','width':getWidthForObject(o.stickySidebar)+'px','transform':'translateY('+top+'px)','left':(o.sidebar.offset().left+parseInt(o.sidebar.css('padding-left'))-scrollLeft)+'px','top':'0px'})}else if(position=='absolute'){var css={};if(o.stickySidebar.css('position')!='absolute'){css.position='absolute';css.transform='translateY('+(scrollTop+top-o.sidebar.offset().top-o.stickySidebarPaddingTop-o.stickySidebarPaddingBottom)+'px)';css.top='0px'}css.width=getWidthForObject(o.stickySidebar)+'px';css.left='';o.stickySidebar.css(css)}else if(position=='static'){resetSidebar()}if(position!='static'){if(o.options.updateSidebarHeight==true){o.sidebar.css({'min-height':o.stickySidebar.outerHeight()+o.stickySidebar.offset().top-o.sidebar.offset().top+o.paddingBottom})}}o.previousScrollTop=scrollTop};o.onScroll(o);$(document).on('scroll.'+o.options.namespace,function(o){return function(){o.onScroll(o)}}(o));$(window).on('resize.'+o.options.namespace,function(o){return function(){o.stickySidebar.css({'position':'static'});o.onScroll(o)}}(o));if(typeof ResizeSensor!=='undefined'){new ResizeSensor(o.stickySidebar[0],function(o){return function(){o.onScroll(o)}}(o))}function resetSidebar(){o.fixedScrollTop=0;o.sidebar.css({'min-height':'1px'});o.stickySidebar.css({'position':'static','width':'','transform':'none'})}function getClearedHeight(e){var height=e.height();e.children().each(function(){height=Math.max(height,$(this).height())});return height}})}function getWidthForObject(object){var width;try{width=object[0].getBoundingClientRect().width}catch(err){}if(typeof width==="undefined"){width=object.width()}return width}return this}})(jQuery);

// jquery replacetext plugin https://github.com/cowboy/jquery-replacetext
(function(e){e.fn.replaceText=function(t,n,r){return this.each(function(){var i=this.firstChild,s,o,u=[];if(i){do{if(i.nodeType===3){s=i.nodeValue;o=s.replace(t,n);if(o!==s){if(!r&&/</.test(o)){e(i).before(o);u.push(i)}else{i.nodeValue=o}}}}while(i=i.nextSibling)}u.length&&e(u).remove()})}})(jQuery);

/*! Table of Contents | v0.4.0 - https://github.com/ndabas/toc */
!function(t){"use strict";var n=function(n){return this.each(function(){var e,i,a=t(this),o=a.data(),c=[a],r=this.tagName,d=0;e=t.extend({content:"body",headings:"h1,h2,h3"},{content:o.toc||void 0,headings:o.tocHeadings||void 0},n),i=e.headings.split(","),t(e.content).find(e.headings).attr("id",function(n,e){return e||function(t){0===t.length&&(t="?");for(var n=t.replace(/\s+/g,"_"),e="",i=1;null!==document.getElementById(n+e);)e="_"+i++;return n+e}(t(this).text())}).each(function(){var n=t(this),e=t.map(i,function(t,e){return n.is(t)?e:void 0})[0];if(e>d){var a=c[0].children("li:last")[0];a&&c.unshift(t("<"+r+"/>").appendTo(a))}else c.splice(0,Math.min(d-e,Math.max(c.length-1,0)));t("<li/>").appendTo(c[0]).append(t("<a/>").text(n.text()).attr("href","#"+n.attr("id"))),d=e})})},e=t.fn.toc;t.fn.toc=n,t.fn.toc.noConflict=function(){return t.fn.toc=e,this},t(function(){n.call(t("[data-toc]"))})}(window.jQuery);

/*!
Waypoints - 3.1.1
Copyright © 2011-2015 Caleb Troughton
Licensed under the MIT license.
https://github.com/imakewebthings/waypoints/blog/master/licenses.txt
*/
!function(){"use strict";function t(o){if(!o)throw new Error("No options passed to Waypoint constructor");if(!o.element)throw new Error("No element option passed to Waypoint constructor");if(!o.handler)throw new Error("No handler option passed to Waypoint constructor");this.key="waypoint-"+e,this.options=t.Adapter.extend({},t.defaults,o),this.element=this.options.element,this.adapter=new t.Adapter(this.element),this.callback=o.handler,this.axis=this.options.horizontal?"horizontal":"vertical",this.enabled=this.options.enabled,this.triggerPoint=null,this.group=t.Group.findOrCreate({name:this.options.group,axis:this.axis}),this.context=t.Context.findOrCreateByElement(this.options.context),t.offsetAliases[this.options.offset]&&(this.options.offset=t.offsetAliases[this.options.offset]),this.group.add(this),this.context.add(this),i[this.key]=this,e+=1}var e=0,i={};t.prototype.queueTrigger=function(t){this.group.queueTrigger(this,t)},t.prototype.trigger=function(t){this.enabled&&this.callback&&this.callback.apply(this,t)},t.prototype.destroy=function(){this.context.remove(this),this.group.remove(this),delete i[this.key]},t.prototype.disable=function(){return this.enabled=!1,this},t.prototype.enable=function(){return this.context.refresh(),this.enabled=!0,this},t.prototype.next=function(){return this.group.next(this)},t.prototype.previous=function(){return this.group.previous(this)},t.invokeAll=function(t){var e=[];for(var o in i)e.push(i[o]);for(var n=0,r=e.length;r>n;n++)e[n][t]()},t.destroyAll=function(){t.invokeAll("destroy")},t.disableAll=function(){t.invokeAll("disable")},t.enableAll=function(){t.invokeAll("enable")},t.refreshAll=function(){t.Context.refreshAll()},t.viewportHeight=function(){return window.innerHeight||document.documentElement.clientHeight},t.viewportWidth=function(){return document.documentElement.clientWidth},t.adapters=[],t.defaults={context:window,continuous:!0,enabled:!0,group:"default",horizontal:!1,offset:0},t.offsetAliases={"bottom-in-view":function(){return this.context.innerHeight()-this.adapter.outerHeight()},"right-in-view":function(){return this.context.innerWidth()-this.adapter.outerWidth()}},window.Waypoint=t}(),function(){"use strict";function t(t){window.setTimeout(t,1e3/60)}function e(t){this.element=t,this.Adapter=n.Adapter,this.adapter=new this.Adapter(t),this.key="waypoint-context-"+i,this.didScroll=!1,this.didResize=!1,this.oldScroll={x:this.adapter.scrollLeft(),y:this.adapter.scrollTop()},this.waypoints={vertical:{},horizontal:{}},t.waypointContextKey=this.key,o[t.waypointContextKey]=this,i+=1,this.createThrottledScrollHandler(),this.createThrottledResizeHandler()}var i=0,o={},n=window.Waypoint,r=window.onload;e.prototype.add=function(t){var e=t.options.horizontal?"horizontal":"vertical";this.waypoints[e][t.key]=t,this.refresh()},e.prototype.checkEmpty=function(){var t=this.Adapter.isEmptyObject(this.waypoints.horizontal),e=this.Adapter.isEmptyObject(this.waypoints.vertical);t&&e&&(this.adapter.off(".waypoints"),delete o[this.key])},e.prototype.createThrottledResizeHandler=function(){function t(){e.handleResize(),e.didResize=!1}var e=this;this.adapter.on("resize.waypoints",function(){e.didResize||(e.didResize=!0,n.requestAnimationFrame(t))})},e.prototype.createThrottledScrollHandler=function(){function t(){e.handleScroll(),e.didScroll=!1}var e=this;this.adapter.on("scroll.waypoints",function(){(!e.didScroll||n.isTouch)&&(e.didScroll=!0,n.requestAnimationFrame(t))})},e.prototype.handleResize=function(){n.Context.refreshAll()},e.prototype.handleScroll=function(){var t={},e={horizontal:{newScroll:this.adapter.scrollLeft(),oldScroll:this.oldScroll.x,forward:"right",backward:"left"},vertical:{newScroll:this.adapter.scrollTop(),oldScroll:this.oldScroll.y,forward:"down",backward:"up"}};for(var i in e){var o=e[i],n=o.newScroll>o.oldScroll,r=n?o.forward:o.backward;for(var s in this.waypoints[i]){var a=this.waypoints[i][s],l=o.oldScroll<a.triggerPoint,h=o.newScroll>=a.triggerPoint,p=l&&h,u=!l&&!h;(p||u)&&(a.queueTrigger(r),t[a.group.id]=a.group)}}for(var c in t)t[c].flushTriggers();this.oldScroll={x:e.horizontal.newScroll,y:e.vertical.newScroll}},e.prototype.innerHeight=function(){return this.element==this.element.window?n.viewportHeight():this.adapter.innerHeight()},e.prototype.remove=function(t){delete this.waypoints[t.axis][t.key],this.checkEmpty()},e.prototype.innerWidth=function(){return this.element==this.element.window?n.viewportWidth():this.adapter.innerWidth()},e.prototype.destroy=function(){var t=[];for(var e in this.waypoints)for(var i in this.waypoints[e])t.push(this.waypoints[e][i]);for(var o=0,n=t.length;n>o;o++)t[o].destroy()},e.prototype.refresh=function(){var t,e=this.element==this.element.window,i=this.adapter.offset(),o={};this.handleScroll(),t={horizontal:{contextOffset:e?0:i.left,contextScroll:e?0:this.oldScroll.x,contextDimension:this.innerWidth(),oldScroll:this.oldScroll.x,forward:"right",backward:"left",offsetProp:"left"},vertical:{contextOffset:e?0:i.top,contextScroll:e?0:this.oldScroll.y,contextDimension:this.innerHeight(),oldScroll:this.oldScroll.y,forward:"down",backward:"up",offsetProp:"top"}};for(var n in t){var r=t[n];for(var s in this.waypoints[n]){var a,l,h,p,u,c=this.waypoints[n][s],d=c.options.offset,f=c.triggerPoint,w=0,y=null==f;c.element!==c.element.window&&(w=c.adapter.offset()[r.offsetProp]),"function"==typeof d?d=d.apply(c):"string"==typeof d&&(d=parseFloat(d),c.options.offset.indexOf("%")>-1&&(d=Math.ceil(r.contextDimension*d/100))),a=r.contextScroll-r.contextOffset,c.triggerPoint=w+a-d,l=f<r.oldScroll,h=c.triggerPoint>=r.oldScroll,p=l&&h,u=!l&&!h,!y&&p?(c.queueTrigger(r.backward),o[c.group.id]=c.group):!y&&u?(c.queueTrigger(r.forward),o[c.group.id]=c.group):y&&r.oldScroll>=c.triggerPoint&&(c.queueTrigger(r.forward),o[c.group.id]=c.group)}}for(var g in o)o[g].flushTriggers();return this},e.findOrCreateByElement=function(t){return e.findByElement(t)||new e(t)},e.refreshAll=function(){for(var t in o)o[t].refresh()},e.findByElement=function(t){return o[t.waypointContextKey]},window.onload=function(){r&&r(),e.refreshAll()},n.requestAnimationFrame=function(e){var i=window.requestAnimationFrame||window.mozRequestAnimationFrame||window.webkitRequestAnimationFrame||t;i.call(window,e)},n.Context=e}(),function(){"use strict";function t(t,e){return t.triggerPoint-e.triggerPoint}function e(t,e){return e.triggerPoint-t.triggerPoint}function i(t){this.name=t.name,this.axis=t.axis,this.id=this.name+"-"+this.axis,this.waypoints=[],this.clearTriggerQueues(),o[this.axis][this.name]=this}var o={vertical:{},horizontal:{}},n=window.Waypoint;i.prototype.add=function(t){this.waypoints.push(t)},i.prototype.clearTriggerQueues=function(){this.triggerQueues={up:[],down:[],left:[],right:[]}},i.prototype.flushTriggers=function(){for(var i in this.triggerQueues){var o=this.triggerQueues[i],n="up"===i||"left"===i;o.sort(n?e:t);for(var r=0,s=o.length;s>r;r+=1){var a=o[r];(a.options.continuous||r===o.length-1)&&a.trigger([i])}}this.clearTriggerQueues()},i.prototype.next=function(e){this.waypoints.sort(t);var i=n.Adapter.inArray(e,this.waypoints),o=i===this.waypoints.length-1;return o?null:this.waypoints[i+1]},i.prototype.previous=function(e){this.waypoints.sort(t);var i=n.Adapter.inArray(e,this.waypoints);return i?this.waypoints[i-1]:null},i.prototype.queueTrigger=function(t,e){this.triggerQueues[e].push(t)},i.prototype.remove=function(t){var e=n.Adapter.inArray(t,this.waypoints);e>-1&&this.waypoints.splice(e,1)},i.prototype.first=function(){return this.waypoints[0]},i.prototype.last=function(){return this.waypoints[this.waypoints.length-1]},i.findOrCreate=function(t){return o[t.axis][t.name]||new i(t)},n.Group=i}(),function(){"use strict";function t(t){this.$element=e(t)}var e=window.jQuery,i=window.Waypoint;e.each(["innerHeight","innerWidth","off","offset","on","outerHeight","outerWidth","scrollLeft","scrollTop"],function(e,i){t.prototype[i]=function(){var t=Array.prototype.slice.call(arguments);return this.$element[i].apply(this.$element,t)}}),e.each(["extend","inArray","isEmptyObject"],function(i,o){t[o]=e[o]}),i.adapters.push({name:"jquery",Adapter:t}),i.Adapter=t}(),function(){"use strict";function t(t){return function(){var i=[],o=arguments[0];return t.isFunction(arguments[0])&&(o=t.extend({},arguments[1]),o.handler=arguments[0]),this.each(function(){var n=t.extend({},o,{element:this});"string"==typeof n.context&&(n.context=t(this).closest(n.context)[0]),i.push(new e(n))}),i}}var e=window.Waypoint;window.jQuery&&(window.jQuery.fn.waypoint=t(window.jQuery)),window.Zepto&&(window.Zepto.fn.waypoint=t(window.Zepto))}();

/*!
* jquery.counterup.js 1.0
*
* Copyright 2013, Benjamin Intal http://gambit.ph @bfintal
* Released under the GPL v2 License
*
* Date: Nov 26, 2013
*/
(function($){"use strict";$.fn.counterUp=function(options){var settings=$.extend({'time':400,'delay':10},options);return this.each(function(){var $this=$(this);var $settings=settings;var counterUpper=function(){var nums=[];var divisions=$settings.time / $settings.delay;var num=$this.text();var isComma=/[0-9]+,[0-9]+/.test(num);num=num.replace(/,/g,'');var isInt=/^[0-9]+$/.test(num);var isFloat=/^[0-9]+\.[0-9]+$/.test(num);var decimalPlaces=isFloat?(num.split('.')[1]||[]).length:0;for(var i=divisions;i>=1;i--){var newNum=parseInt(num / divisions*i);if(isFloat){newNum=parseFloat(num / divisions*i).toFixed(decimalPlaces);}
if(isComma){while(/(\d+)(\d{3})/.test(newNum.toString())){newNum=newNum.toString().replace(/(\d+)(\d{3})/,'$1'+','+'$2');}}
nums.unshift(newNum);}
$this.data('counterup-nums',nums);$this.text('0');var f=function(){$this.text($this.data('counterup-nums').shift());if($this.data('counterup-nums').length){setTimeout($this.data('counterup-func'),$settings.delay);}else{delete $this.data('counterup-nums');$this.data('counterup-nums',null);$this.data('counterup-func',null);}};$this.data('counterup-func',f);setTimeout($this.data('counterup-func'),$settings.delay);};$this.waypoint(function(direction){counterUpper();this.destroy();},{offset:'100%'});});};})(jQuery);
//
// [END SCRIPT]

// [SCRIPT:script-6]

//
! function(o) {
    o.fn.lazyyard = function(n) {
        return n = o.extend({
            onScroll: !0
        }, n), this.each(function(t, c, e) {
            var r = o(this),
                l = o(window),
                a = r.attr("src"),
                h = "w" + Math.round(r.width() + r.width() / 10) + "-h" + Math.round(r.height() + r.height() / 10) + "-p-k-no-nu";

            function s() {
                var o = new Image;
                o.onload = function() {
                    r.attr('src', '' + this.src + '').addClass("lazy-yard")
                }, o.src = t
            }
            a.match("resources.blogblog.com") && (a = "undefined" != typeof noThumbnail ? noThumbnail : "//1.bp.blogspot.com/-rI4UCIrwEI4/YN3nGkf0nCI/AAAAAAAAAD0/DQ6fW7eCps8NL7S0oh374KFg1MsWUf2GQCLcBGAsYHQ/s72-c/ptb-nth.png"), a.match("blogger.googleusercontent.com") && a.match("=") && (e = a.split("="), a = e[1] && "" != e[1].trim() ? e[0] + "=w72-h72-p-k-no-nu" : a), a.match("blogger.googleusercontent.com") && !a.match("=") && (a += "=w72-h72-p-k-no-nu"), t = a.match("/s72-c") ? a.replace("/s72-c", "/" + h) : a.match("/w72-h") ? a.replace("/w72-h72-p-k-no-nu", "/" + h) : a.match("=w72-h") ? a.replace("=w72-h72-p-k-no-nu", "=" + h) : a, 1 == n.onScroll ? l.on("load resize scroll", function o() {
                l.scrollTop() + l.height() >= r.offset().top && (l.off("load resize scroll", o), s())
            }).trigger("scroll") : l.on("load", function o() {
                l.off("load", o), s()
            }).trigger("load")
        })
    }
}(jQuery);
$(function() {
$('.index-post .post-image-link .post-thumb, .PopularPosts .post-image-link .post-thumb, .FeaturedPost .post-image-link .post-thumb').lazyyard();
    $('#main-menu').each(function() {
        var iTms = $(this).find('.LinkList ul > li').children('a'),
            iLen = iTms.length;
        for (var i = 0; i < iLen; i++) {
            var i1 = iTms.eq(i),
                t1 = i1.text();
            if (t1.charAt(0) !== '_') {
                var i2 = iTms.eq(i + 1),
                    t2 = i2.text();
                if (t2.charAt(0) === '_') {
                    var l1 = i1.parent();
                    l1.append('<ul class="sub-menu m-sub"/>');
                }
            }
            if (t1.charAt(0) === '_') {
                i1.text(t1.replace('_', ''));
                i1.parent().appendTo(l1.children('.sub-menu'));
            }
        }
        for (var i = 0; i < iLen; i++) {
            var i3 = iTms.eq(i),
                t3 = i3.text();
            if (t3.charAt(0) !== '_') {
                var i4 = iTms.eq(i + 1),
                    t4 = i4.text();
                if (t4.charAt(0) === '_') {
                    var l2 = i3.parent();
                    l2.append('<ul class="sub-menu2 m-sub"/>');
                }
            }
            if (t3.charAt(0) === '_') {
                i3.text(t3.replace('_', ''));
                i3.parent().appendTo(l2.children('.sub-menu2'));
            }
        }
        $('#main-menu ul li ul').parent('li').addClass('has-sub');
        $('#main-menu .widget').addClass('show-menu');
    });
    var $menuSource = $('#main-menu-nav');
    if (!$menuSource.length || !$menuSource.children().length) {
        $menuSource = $('#main-menu').find('ul[role="menubar"]').first();
    }
    if ($menuSource.length) {
        var $mobileMenu = $menuSource.clone();
        $mobileMenu.removeAttr('id');
        $('.mobile-menu').empty().append($mobileMenu);
        $('.mobile-menu .has-sub').append('<span class="submenu-toggle" role="button" tabindex="0" aria-expanded="false" aria-label="Toggle submenu"></span>');
        $('.mobile-menu .m-sub').attr('aria-hidden', 'true');
        $('.mobile-menu li.has-sub > a').attr('aria-expanded', 'false');
    }
    $('.mobile-menu ul > li a').each(function() {
        var $this = $(this),
            text = $this.attr('href').trim(),
            type = text.toLowerCase(),
            map = text.split('/'),
            label = map[0];
        if (type.match('mega-menu')) {
            $this.attr('href', '/search/label/' + label + '?&max-results=' + postPerPage);
        }
    });
    var $body = $('body');
    var $overlay = $('.overlay');
    function collapseAllSubmenus(){
        $('.mobile-menu li.has-sub.show').each(function(){
            var $item = $(this);
            $item.removeClass('show');
            $item.children('.m-sub').stop(true, true).slideUp(0).attr('aria-hidden', 'true');
            $item.children('.submenu-toggle').attr('aria-expanded', 'false');
            $item.children('a').attr('aria-expanded', 'false');
        });
    }
    function closeMobileMenu(){
        $body.removeClass('nav-active');
        $('.mobile-menu-toggle').attr('aria-expanded', 'false');
        collapseAllSubmenus();
    }
    $('.mobile-menu-toggle')
    .attr({'aria-expanded':'false','aria-label':'Toggle mobile menu','role':'button','tabindex':'0'})
    .on('keydown', function(event){
        if(event.key === ' ' || event.key === 'Enter'){
            event.preventDefault();
            $(this).trigger('click');
        }
    })
    .on('click', function() {
        var willOpen = !$body.hasClass('nav-active');
        $body.toggleClass('nav-active', willOpen);
        $(this).attr('aria-expanded', willOpen ? 'true' : 'false');
        if(!willOpen){
            collapseAllSubmenus();
        }
    });
    $overlay.on('click', closeMobileMenu);
    $(window).on('resize.mobileMenu', function(){
        if(window.innerWidth > 1024){
            closeMobileMenu();
        }
    });
    $('.mobile-menu').on('keydown', '.submenu-toggle', function(event){
        if(event.key === ' ' || event.key === 'Enter'){
            event.preventDefault();
            $(this).trigger('click');
        }
    });
    $('.mobile-menu').on('click', '.submenu-toggle', function(event) {
        var $item = $(this).parent('li.has-sub');
        if (!$item.length) return;
        var $submenu = $item.children('.m-sub');
        if (!$submenu.length) return;
        event.preventDefault();
        var willOpen = !$item.hasClass('show');
        if(willOpen){
            var $siblings = $item.siblings('.has-sub.show');
            $siblings.removeClass('show');
            $siblings.children('.m-sub').stop(true, true).slideUp(170).attr('aria-hidden', 'true');
            $siblings.children('.submenu-toggle').attr('aria-expanded', 'false');
            $siblings.children('a').attr('aria-expanded', 'false');
        }
        $item.toggleClass('show', willOpen);
        $submenu.stop(true, true)[willOpen ? 'slideDown' : 'slideUp'](170).attr('aria-hidden', willOpen ? 'false' : 'true');
        $(this).attr('aria-expanded', willOpen ? 'true' : 'false');
        $item.children('a').attr('aria-expanded', willOpen ? 'true' : 'false');
    });
    $('.mobile-menu').on('click', 'li.has-sub > a', function(event) {
        var $item = $(this).parent('li.has-sub');
        if (!$item.length) return;
        var $submenu = $item.children('.m-sub');
        if (!$submenu.length) return;
        if (!$item.hasClass('show')) {
            event.preventDefault();
            $item.children('.submenu-toggle').trigger('click');
        } else {
            var href = $(this).attr('href');
            if (!href || href === '#' || href.toLowerCase() === 'javascript:void(0)') {
                event.preventDefault();
            }
        }
    });
    $(document).on('keyup.mobileMenu', function(event){
        if(event.key === 'Escape'){
            closeMobileMenu();
        }
    });
    function labelFromUrl(url){
        if(!url) return '';
        var clean = (url || '').trim();
        if(!clean || clean === '#'){
            return '';
        }
        if((clean.indexOf('http://') === 0 || clean.indexOf('https://') === 0) && typeof URL === 'function'){
            try{
                var parsed = new URL(clean);
                if(parsed.hostname){
                    return parsed.hostname.replace(/^www\./, '');
                }
            }catch(err){}
        }
        var chunk = clean.split('/').pop();
        if(!chunk) return '';
        chunk = chunk.split('?')[0];
        chunk = chunk.replace(/\.[a-z0-9]+$/i, '').replace(/[-_]+/g, ' ').trim();
        return chunk;
    }
    function shuffle(array){
        for(var i = array.length - 1; i > 0; i--){
            var j = Math.floor(Math.random() * (i + 1));
            var temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
        return array;
    }
    function initLogoCarousel(){
        var wrap = document.getElementById('brand-services-wrap');
        if(!wrap) return;
        var source = wrap.querySelector('.logo-source-list');
        if(!source) return;
        var items = source.querySelectorAll('li');
        var logos = [];
        Array.prototype.slice.call(items).forEach(function(item, idx){
            var img = item.querySelector('img');
            if(!img) return;
            var link = item.querySelector('a');
            var src = img.getAttribute('src');
            if(!src) return;
            var href = link ? link.getAttribute('href') : '';
            var caption = (img.getAttribute('data-caption') || '').trim();
            logos.push({
                src: src,
                href: href,
                target: link ? link.getAttribute('target') : '',
                label: caption || labelFromUrl(href) || labelFromUrl(src) || ('Logo ' + (idx + 1))
            });
        });
        var extraImgs = source.querySelectorAll('img');
        Array.prototype.slice.call(extraImgs).forEach(function(img, idx){
            if(img.closest('li')) return; // already handled above
            var parentLink = img.closest('a');
            var src = img.getAttribute('src');
            if(!src) return;
            var href = parentLink ? parentLink.getAttribute('href') : '';
            var caption = (img.getAttribute('data-caption') || '').trim();
            logos.push({
                src: src,
                href: href,
                target: parentLink ? parentLink.getAttribute('target') : '',
                label: caption || labelFromUrl(href) || labelFromUrl(src) || ('Logo ' + (logos.length + 1))
            });
        });
        
        if(!logos.length) return;
        if(!logos.length) return;
        var carousel = document.createElement('div');
        carousel.id = 'logo-carousel';
        carousel.className = 'carousel';
        shuffle(logos).forEach(function(logo){
            var cell = document.createElement('div');
            cell.className = 'carousel-cell';
            var card = document.createElement('div');
            card.className = 'logo-card';
            var wrapper;
            if(logo.href && logo.href !== '#'){
                wrapper = document.createElement('a');
                wrapper.href = logo.href;
                wrapper.target = logo.target || '_blank';
                wrapper.rel = 'noopener';
            } else {
                wrapper = document.createElement('div');
            }
            var image = document.createElement('img');
            image.src = logo.src;
            image.alt = logo.label;
            wrapper.appendChild(image);
            card.appendChild(wrapper);
            if(logo.label){
                var caption = document.createElement('div');
                caption.className = 'logo-name';
                caption.textContent = logo.label;
                card.appendChild(caption);
            }
            cell.appendChild(card);
            carousel.appendChild(cell);
        });
        source.parentNode.insertBefore(carousel, source);
        source.style.display = 'none';
        if(typeof Flickity === 'function'){
            new Flickity(carousel, {
                wrapAround: true,
                autoPlay: 2500,
                pauseAutoPlayOnHover: true,
                cellAlign: 'left',
                contain: true,
                pageDots: false,
                imagesLoaded: true
            });
        }
    }
    initLogoCarousel();
    function initHeroSlider(){
        var slider = document.getElementById('hero-slider');
        if(!slider) return;
        var sourceWrapper = slider.querySelector('.hero-slider-source');
        if(!sourceWrapper){
            slider.classList.add('hero-slider--empty');
            return;
        }
        var swiperEl = slider.querySelector('.hero-slider-swiper');
        var swiperWrapper = slider.querySelector('.hero-slider-wrapper');
        var paginationEl = slider.querySelector('.hero-slider-pagination');
        var prevButton = slider.querySelector('.swiper-button-prev');
        var nextButton = slider.querySelector('.swiper-button-next');
        if(!swiperEl || !swiperWrapper || !paginationEl || !prevButton || !nextButton){
            slider.classList.add('hero-slider--empty');
            return;
        }
        swiperWrapper.innerHTML = '';

        function parseCaption(raw){
            if(!raw) return {body:'', button:''};
            var text = raw.replace(/\r/g, '').trim();
            if(!text) return {body:'', button:''};
            if(text.indexOf('||') !== -1){
                var chunks = text.split('||');
                var button = chunks.slice(1).join('||').trim();
                return {body:chunks[0].trim(), button:button};
            }
            var lines = text.split('\n').map(function(line){
                return line.trim();
            }).filter(Boolean);
            if(lines.length > 1){
                return {body:lines[0], button:lines[1]};
            }
            return {body:text, button:''};
        }

        var widgets = sourceWrapper.querySelectorAll('.widget');
        var slidesCreated = 0;

        widgets.forEach(function(widget){
            var img = widget.querySelector('img');
            var src = img ? (img.getAttribute('data-src') || img.getAttribute('src')) : '';
            if(!src) return;

            var titleNode = widget.querySelector('.title, .widget-title, h3.title, h2.title');
            var titleText = titleNode && titleNode.textContent ? titleNode.textContent.trim() : '';

            var captionNode = widget.querySelector('.caption, .image-caption, span');
            var captionText = captionNode && captionNode.textContent ? captionNode.textContent.trim() : '';
            var captionData = parseCaption(captionText);

            var linkNode = widget.querySelector('.widget-content a[href], a[href]');
            var href = '';
            var target = '';
            var rel = '';
            if(linkNode){
                href = (linkNode.getAttribute('href') || '').trim();
                target = (linkNode.getAttribute('target') || '').trim();
                rel = (linkNode.getAttribute('rel') || '').trim();
                if(href === '#') href = '';
            }

            var slide = document.createElement('div');
            slide.className = 'swiper-slide';

            var card = document.createElement('div');
            card.className = 'hero-slider-card';

            var media = document.createElement('div');
            media.className = 'hero-slider-card-bg';
            media.style.backgroundImage = 'url(' + src + ')';
            card.appendChild(media);

            var content = document.createElement('div');
            content.className = 'hero-slider-card-content';

            if(titleText){
                var heading = document.createElement('h3');
                heading.className = 'hero-slider-title';
                heading.textContent = titleText;
                content.appendChild(heading);
            }

            if(captionData.body){
                var paragraph = document.createElement('p');
                paragraph.className = 'hero-slider-text';
                paragraph.textContent = captionData.body;
                content.appendChild(paragraph);
            }

            if(href){
                var buttonEl = document.createElement('a');
                buttonEl.className = 'hero-slider-button';
                buttonEl.textContent = captionData.button || 'Learn More';
                buttonEl.href = href;
                buttonEl.rel = rel || 'noopener';
                if(target) buttonEl.target = target;
                content.appendChild(buttonEl);
            }

            card.appendChild(content);
            slide.appendChild(card);
            swiperWrapper.appendChild(slide);
            slidesCreated += 1;
        });

        if(!slidesCreated){
            slider.classList.add('hero-slider--empty');
            return;
        }

        if(typeof Swiper !== 'function'){
            slider.classList.add('hero-slider--empty');
            return;
        }

        new Swiper(swiperEl, {
            loop: slidesCreated > 1,
            // Slow down fade transition for slide change
            speed: 1500,
            grabCursor: true,
            watchSlidesProgress: true,
            effect: 'fade',
            fadeEffect: {
                crossFade: true
            },
            autoplay: slidesCreated > 1 ? {
                delay: 6500,
                disableOnInteraction: false,
                pauseOnMouseEnter: true
            } : false,
            pagination: {
                el: paginationEl,
                clickable: true
            },
            navigation: {
                nextEl: nextButton,
                prevEl: prevButton
            },
            keyboard: {
                enabled: true
            }
        });
    }
    initHeroSlider();
$('#testimonial').slick({
  slidesToShow: 1,
  slidesToScroll: 1,
  autoplay: true,
  autoplaySpeed: 0,
        infinite: true,
  speed: 8000,
  pauseOnHover: true,
  cssEase: 'linear' });
if( jQuery(".toggle .toggle-title").hasClass('active') ){
  jQuery(".toggle .toggle-title.active").closest('.toggle').find('.toggle-inner').show();
 }
 jQuery(".toggle .toggle-title").click(function(){
  if( jQuery(this).hasClass('active') ){
   jQuery(this).removeClass("active").closest('.toggle').find('.toggle-inner').slideUp(200);
  }
  else{ jQuery(this).addClass("active").closest('.toggle').find('.toggle-inner').slideDown(200);
  }
 });
    $('.social-toggle').on('click', function() {
        $('body').toggleClass('social-active');
        $('#social-menu').fadeToggle(170);
    });
    $('.show-search').on('click', function() {
        $('#nav-search, .mobile-search-form').fadeIn(250).find('input').focus();
    });
    $('.hide-search').on('click', function() {
        $('#nav-search, .mobile-search-form').fadeOut(250).find('input').blur();
    });
    $('.Label a, a.b-label, a.post-tag').attr('href', function($this, href) {
        return href.replace(href, href + '?&max-results=' + postPerPage);
    });
    $('.avatar-image-container img').attr('src', function($this, i) {
        i = i.replace('/s35-c/', '/s45-c/');
        i = i.replace('//img1.blogblog.com/img/blank.gif', '//4.bp.blogspot.com/-uCjYgVFIh70/VuOLn-mL7PI/AAAAAAAADUs/Kcu9wJbv790hIo83rI_s7lLW3zkLY01EA/s55-r/avatar.png');
        return i;
    });
    $('.emoji-toggle').on('click', function() {
        $('#emoji-box').slideToggle(170);
    });
     $('.counter-info .counter-title').counterUp({
                delay: 10,
                time: 3000
            });
    $('.comment-content').each(function() {
        var $t = $(this);
        $t.replaceText("(y)", "<span class='sora-moji mj-0'/>");
        $t.replaceText(":)", "<span class='sora-moji mj-1'/>");
        $t.replaceText(":(", "<span class='sora-moji mj-2'/>");
        $t.replaceText("hihi", "<span class='sora-moji mj-3'/>");
        $t.replaceText(":-)", "<span class='sora-moji mj-4'/>");
        $t.replaceText(":D", "<span class='sora-moji mj-5'/>");
        $t.replaceText("=D", "<span class='sora-moji mj-6'/>");
        $t.replaceText(":-d", "<span class='sora-moji mj-7'/>");
        $t.replaceText(";(", "<span class='sora-moji mj-8'/>");
        $t.replaceText(";-(", "<span class='sora-moji mj-9'/>");
        $t.replaceText("@-)", "<span class='sora-moji mj-10'/>");
        $t.replaceText(":P", "<span class='sora-moji mj-11'/>");
        $t.replaceText(":o", "<span class='sora-moji mj-12'/>");
        $t.replaceText(":>)", "<span class='sora-moji mj-13'/>");
        $t.replaceText("(o)", "<span class='sora-moji mj-14'/>");
        $t.replaceText(":p", "<span class='sora-moji mj-15'/>");
        $t.replaceText("(p)", "<span class='sora-moji mj-16'/>");
        $t.replaceText(":-s", "<span class='sora-moji mj-17'/>");
        $t.replaceText("(m)", "<span class='sora-moji mj-18'/>");
        $t.replaceText("8-)", "<span class='sora-moji mj-19'/>");
        $t.replaceText(":-t", "<span class='sora-moji mj-20'/>");
        $t.replaceText(":-b", "<span class='sora-moji mj-21'/>");
        $t.replaceText("b-(", "<span class='sora-moji mj-22'/>");
        $t.replaceText(":-#", "<span class='sora-moji mj-23'/>");
        $t.replaceText("=p~", "<span class='sora-moji mj-24'/>");
        $t.replaceText("x-)", "<span class='sora-moji mj-25'/>");
        $t.replaceText("(k)", "<span class='sora-moji mj-26'/>");
    });
    $('.author-description a').each(function() {
        $(this).attr('target', '_blank');
    });
    $('.post-nav').each(function() {
        var getURL_prev = $('a.prev-post-link').attr('href'),
            getURL_next = $('a.next-post-link').attr('href');
        $.ajax({
            url: getURL_prev,
            type: 'get',
            success: function(prev) {
                var title = $(prev).find('.blog-post h1.post-title').text();
                $('.post-prev a .post-nav-inner p').text(title);
            }
        });
        $.ajax({
            url: getURL_next,
            type: 'get',
            success: function(next) {
                var title = $(next).find('.blog-post h1.post-title').text();
                $('.post-next a .post-nav-inner p').text(title);
            }
        });
    });
    $('.post-body strike').each(function() {
        var $this = $(this),
            type = $this.text();
        if (type.match('left-sidebar')) {
            $this.replaceWith('<style>.item #main-wrapper{float:right}.item #sidebar-wrapper{float:left}</style>');
        }
        if (type.match('right-sidebar')) {
            $this.replaceWith('<style>.item #main-wrapper{float:left}.item #sidebar-wrapper{float:right}</style>');
        }
        if (type.match('full-width')) {
            $this.replaceWith('<style>.item #main-wrapper{width:100%}.item #sidebar-wrapper{display:none}</style>');
        }
    });
    $('#main-wrapper, #sidebar-wrapper').each(function() {
        if (fixedSidebar == true) {
            $(this).theiaStickySidebar({
                additionalMarginTop: 30,
                additionalMarginBottom: 30
            });
        }
    });
    $('.back-top').each(function() {
        var $this = $(this);
        $(window).on('scroll', function() {
            $(this).scrollTop() >= 100 ? $this.fadeIn(250) : $this.fadeOut(250)
        }), $this.click(function() {
            $('html, body').animate({
                scrollTop: 0
            }, 500)
        });
    });
$('#hot-section .widget-content').each(function() {
        var $this = $(this),
            text = $this.text().trim(),
            type = text.toLowerCase(),
            map = text.split('/'),
            label = map[0];
        ajaxPosts($this, type, 4, label);
    });
    $('.common-widget .widget-content').each(function() {
        var $this = $(this),
            text = $this.text().trim(),
            type = text.toLowerCase(),
            map = text.split('/'),
            num = map[0],
            label = map[1];
        ajaxPosts($this, type, num, label);
    });
    $('.related-ready').each(function() {
        var $this = $(this),
            label = $this.find('.related-tag').data('label');
        ajaxPosts($this, 'related', 3, label);
    });

    function post_link(feed, i) {
        for (var x = 0; x < feed[i].link.length; x++)
            if (feed[i].link[x].rel == 'alternate') {
                var link = feed[i].link[x].href;
                break
            }
        return link;
    }

    function post_title(feed, i, link) {
        var n = feed[i].title.$t,
            code = '<a href="' + link + '">' + n + '</a>';
        return code;
    }

 function post_author(feed, i) {
        var n = feed[i].author[0].name.$t,
            code = '<span class="post-author">' + n + '</span>';
        return code;
    }

    function post_date(feed, i) {
        var c = feed[i].published.$t,
            d = c.substring(0, 4),
            f = c.substring(5, 7),
            m = c.substring(8, 10),
            h = monthFormat[parseInt(f, 10) - 1] + ' ' + m + ', ' + d,
            code = '<span class="post-date">' + h + '</span>';
        return code;
    }

   function postThumb($c, img) {
	var $h = $('<div>').html($c),
		$t = $h.find('img:first').attr('src'),
		$a = $t.lastIndexOf('/') || 0,
		$b = $t.lastIndexOf('/', $a - 1) || 0,
		$p0 = $t.substring(0, $b),
		$p1 = $t.substring($b, $a),
		$p2 = $t.substring($a);
	if($p1.match(/\/s[0-9]+/g) || $p1.match(/\/w[0-9]+/g) || $p1 == '/d') {
		$p1 = '/w72-h72-p-k-no-nu'
	}
	img = $p0 + $p1 + $p2;
	return img
}

function FeatImage(feed, i, img) {
	var $c = feed[i].content.$t;
	if(feed[i].media$thumbnail) {
		var src = feed[i].media$thumbnail.url
	} else {
		src = noThumbnail;
	}
	if($c.indexOf($c.match(/<iframe(?:.+)?src=(?:.+)?(?:www.youtube.com)/g)) > -1) {
		if($c.indexOf('<img') > -1) {
			if($c.indexOf($c.match(/<iframe(?:.+)?src=(?:.+)?(?:www.youtube.com)/g)) < $c.indexOf('<img')) {
				img = src.replace('/default.', '/0.')
			} else {
				img = postThumb($c)
			}
		} else {
			img = src.replace('/default.', '/0.')
		}
	} else if($c.indexOf('<img') > -1) {
		img = postThumb($c)
	} else {
		img = noThumbnail;
	}
     var code = '<img class="post-thumb" alt="" src="' + img + '"/>';
        return code;
}

 function post_label(feed, i) {
        if (feed[i].category != undefined) {
            var tag = feed[i].category[0].term,
                code = '<span class="post-tag">' + tag + '</span>';
        } else {
            code = '';
        }
        return code;
    }

    function ajaxPosts($this, type, num, label) {
        if (type.match('hot-posts') || type.match('post-list') || type.match('related')) {
            var url = '';
            if (label == 'recent') {
                url = '/feeds/posts/default?alt=json-in-script&max-results=' + num;
            } else if (label == 'random') {
                var index = Math.floor(Math.random() * num) + 1;
                url = '/feeds/posts/default?max-results=' + num + '&start-index=' + index + '&alt=json-in-script';
            } else {
                url = '/feeds/posts/default/-/' + label + '?alt=json-in-script&max-results=' + num;
            }
            $.ajax({
                url: url,
                type: 'get',
                dataType: 'jsonp',
                beforeSend: function() {
                    if (type.match('hot-posts')) {
                        $this.html('<div class="hot-loader"/>').parent().addClass('show-hot');
                    }
                },
                success: function(json) {
                     if (type.match('hot-posts')) {
                        var kode = '<ul class="hot-posts">';
                    }  else if (type.match('post-list')) {
                        var kode = '<ul class="custom-widget">';
                    } else if (type.match('related')) {
                        var kode = '<ul class="related-posts">';
                    }
                    var entry = json.feed.entry;
                    if (entry != undefined) {
                        for (var i = 0, feed = entry; i < feed.length; i++) {
                            var link = post_link(feed, i),
                                title = post_title(feed, i, link),
                                image = FeatImage(feed, i, link),
                                tag = post_label(feed, i),
                                author = post_author(feed, i),
                                date = post_date(feed, i);
                            var kontent = '';
                             if (type.match('hot-posts')) {
                                    kontent += '<li class="hot-item item-' + i + '"><div class="hot-item-inner"><a class="post-image-link" href="' + link + '">' + image + '</a><div class="post-info-wrap"><div class="post-info">' + tag + '<h2 class="post-title">' + title + '</h2><div class="post-meta">' + author + date + '</div></div></div></div></li>';
                            } else if (type.match('post-list')) {
                                kontent += '<li class="item-' + i + '"><a class="post-image-link" href="' + link + '">' + image + '</a><div class="post-info"><h2 class="post-title">' + title + '</h2></div></div></li>';
                            } else if (type.match('related')) {
                                kontent += '<li class="related-item item-' + i + '"><a class="post-image-link" href="' + link + '">' + image + '</a><h2 class="post-title">' + title + '</h2></li>';
                            }
                            kode += kontent;
                        }
                        kode += '</ul>';
                    } else {
                        kode = '<ul class="no-posts">Error: No Posts Found <i class="fa fa-frown"/></ul>';
                    } if (type.match('hot-posts')) {
                        $this.html(kode).parent().addClass('show-hot');
                    } else {
                        $this.html(kode);
                    }      
$this.find('.post-thumb').lazyyard();
                }
            });
        }
    }
    $('.blog-post-comments').each(function() {
        var system = commentsSystem,
            disqus_url = disqus_blogger_current_url,
            disqus = '<div id="disqus_thread"/>',
            current_url = $(location).attr('href'),
            facebook = '<div class="fb-comments" data-width="100%" data-href="' + current_url + '" data-numposts="5"></div>',
            sClass = 'comments-system-' + system;
        if (system == 'blogger') {
            $(this).addClass(sClass).show();
        } else if (system == 'disqus') {
            (function() {
                var dsq = document.createElement('script');
                dsq.type = 'text/javascript';
                dsq.async = true;
                dsq.src = '//' + disqusShortname + '.disqus.com/embed.js';
                (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(dsq);
            })();
            $('#comments, #gpluscomments').remove();
            $(this).append(disqus).addClass(sClass).show();
        } else if (system == 'facebook') {
            $('#comments, #gpluscomments').remove();
            $(this).append(facebook).addClass(sClass).show();
        } else if (system == 'hide') {
            $(this).hide();
        } else {
            $(this).addClass('comments-system-default').show();
        }
    });
});
function shortCodeIfy(e, t, a) {
	for(var s = e.split("$"), i = /[^{\}]+(?=})/g, r = 0; r < s.length; r++) {
		var o = s[r].split("=");
		if(o[0].trim() == t) return null != (a = o[1]).match(i) && String(a.match(i)).trim()
	}
	return !1
}
$(".post-body a").each(function() {
	var e = $(this),
		t = e.html(),
		a = t.toLowerCase(),
		s = shortCodeIfy(t, "text"),
		i = shortCodeIfy(t, "icon"),
		r = shortCodeIfy(t, "color");
	a.match("getbutton") && 0 != s && (e.addClass("button btn").text(s), 0 != i && e.addClass(i), 0 != r && e.addClass("colored-button").attr("style", "background-color:" + r + ";"))
}),$(".post-body b").each(function() {
	var e = $(this),
		t = e.text(),
		a = t.toLowerCase().trim();
	a.match("{tocify}") && (t = 0 != shortCodeIfy(t, "title") ? shortCodeIfy(t, "title") : "Table of Contents", e.replaceWith('<div class="tocify-wrap"><div class="tocify-inner"><a href="javascript:;" class="tocify-title" role="button" title="' + t + '"><span class="tocify-title-text">' + t + '</span></a><ol id="tocify"></ol></div></div>'), $(".tocify-title").each(function(e) {
		(e = $(this)).on("click", function() {
			e.toggleClass("is-expanded"), $("#tocify").slideToggle(170)
		})
	}), $("#tocify").toc({
		content: "#post-body",
		headings: "h2,h3,h4"
	}), $("#tocify li a").each(function(e) {
		(e = $(this)).click(function() {
			return $("html,body").animate({
				scrollTop: ($(e.attr("href")).offset().top) - 20
			}, 500), !1
		})
	})), a.match("{contactform}") && (e.replaceWith('<div class="contact-form"/>'), $(".contact-form").append($("#ContactForm1")))
}), $(".post-body blockquote").each(function() {
	var e = $(this),
		t = e.text().toLowerCase().trim(),
		a = e.html();
	if(t.match("{alertsuccess}")) {
		const t = a.replace("{alertSuccess}", "");
		e.replaceWith('<div class="alert-message alert-success">' + t + "</div>")
	}
	if(t.match("{alertinfo}")) {
		const t = a.replace("{alertInfo}", "");
		e.replaceWith('<div class="alert-message alert-info">' + t + "</div>")
	}
	if(t.match("{alertwarning}")) {
		const t = a.replace("{alertWarning}", "");
		e.replaceWith('<div class="alert-message alert-warning">' + t + "</div>")
	}
	if(t.match("{alerterror}")) {
		const t = a.replace("{alertError}", "");
		e.replaceWith('<div class="alert-message alert-error">' + t + "</div>")
	}
	if(t.match("{codebox}")) {
		const t = a.replace("{codeBox}", "");
		e.replaceWith('<pre class="code-box">' + t + "</pre>")
	}
}), $("#post-body iframe").each(function() {
		var e = $(this);
		e.attr("src").match("www.youtube.com") && e.wrap('<div class="responsive-video-wrap"/>')
	})
//
// [END SCRIPT]

// [SCRIPT:script-7]

//
(function(d, s, id) {
  var js, fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) return;
  js = d.createElement(s); js.id = id;
  js.src = 'https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v3.0';
  fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));
//
// [END SCRIPT]

// [SCRIPT:script-8]

//
// Job Carousel Initialization
(function() {
  function initJobCarousels() {
    if (typeof Swiper === 'undefined' || typeof $ === 'undefined') {
      return;
    }
    
    var carousels = document.querySelectorAll('.job-carousel-swiper');
    if (!carousels.length) return;
    
    carousels.forEach(function(swiperEl) {
      var labelFilter = swiperEl.getAttribute('data-label-filter');
      if (!labelFilter) return;
      
      var wrapper = swiperEl.querySelector('.job-carousel-wrapper');
      if (!wrapper) return;
      
      // Encode label for URL - Blogger format (spaces to +)
      var labelUrl = labelFilter.replace(/\s+/g, '+');
      var feedUrl = '/feeds/posts/default/-/' + labelUrl + '?alt=json-in-script&max-results=10';
      
      // Debug logging
      console.log('Carousel Label:', labelFilter);
      console.log('Feed URL:', feedUrl);
      
      // Fetch posts
      $.ajax({
        url: feedUrl,
        type: 'get',
        dataType: 'jsonp',
        success: function(json) {
          console.log('Feed response:', json);
          
          if (!json || !json.feed || !json.feed.entry) {
            console.log('No feed entry found');
            wrapper.innerHTML = '<div class="job-carousel-empty" style="text-align:center;padding:40px;color:#999;">No jobs available</div>';
            return;
          }
          
          var posts = json.feed.entry;
          console.log('Posts found:', posts ? posts.length : 0);
          
          if (!posts || !posts.length) {
            console.log('No posts in feed');
            wrapper.innerHTML = '<div class="job-carousel-empty" style="text-align:center;padding:40px;color:#999;">No jobs available</div>';
            return;
          }
          
          wrapper.innerHTML = '';
          
          posts.forEach(function(post) {
            var entry = post;
            var title = entry.title ? (entry.title.$t || entry.title) : 'Untitled';
            var url = '';
            var image = 'https://4.bp.blogspot.com/-O3EpVMWcoKw/WxY6-6I4--I/AAAAAAAAB2s/KzC0FqUQtkMdw7VzT6oOR_8vbZO6EJc-ACK4BGAYYCw/w680/nth.png';
            var author = '';
            var description = '';
            
            // Get post URL
            entry.link.forEach(function(link) {
              if (link.rel === 'alternate') {
                url = link.href;
              }
            });
            
            // Get featured image - better quality
            if (entry.media$thumbnail) {
              image = entry.media$thumbnail.url.replace(/\/s\d+-c/, '/s400-c');
            } else if (entry['media$thumbnail']) {
              image = entry['media$thumbnail'].url.replace(/\/s\d+-c/, '/s400-c');
            }
            
            // Get description - only 4-5 words (always show something)
            if (entry.content && entry.content.$t) {
              var text = entry.content.$t.replace(/<[^>]*>/g, '').trim();
              if (text && text.length > 0) {
                var words = text.split(/\s+/).slice(0, 5);
                description = words.join(' ');
              }
            }
            if (!description && entry.summary && entry.summary.$t) {
              var text = entry.summary.$t.replace(/<[^>]*>/g, '').trim();
              if (text && text.length > 0) {
                var words = text.split(/\s+/).slice(0, 5);
                description = words.join(' ');
              }
            }
            // Always show description (fallback if empty)
            if (!description || description.trim() === '') {
              description = 'Job opportunity available';
            }
            
            // Get author
            if (entry.author && entry.author[0] && entry.author[0].name) {
              author = entry.author[0].name.$t || entry.author[0].name;
            }
            
            // Create slide
            var slide = document.createElement('div');
            slide.className = 'swiper-slide job-card';
            
            var cardLink = document.createElement('a');
            cardLink.className = 'job-card-link';
            cardLink.href = url;
            
            var cardImage = document.createElement('div');
            cardImage.className = 'job-card-image';
            var img = document.createElement('img');
            img.className = 'job-card-logo';
            img.src = image;
            img.alt = title;
            cardImage.appendChild(img);
            
            var cardContent = document.createElement('div');
            cardContent.className = 'job-card-content';
            
            // Order: Title → Description → Company (optional)
            var cardTitle = document.createElement('h3');
            cardTitle.className = 'job-card-title';
            cardTitle.textContent = title;
            cardContent.appendChild(cardTitle);
            
            // Always add description (4-5 words) right after title
            var cardDescription = document.createElement('p');
            cardDescription.className = 'job-card-description';
            cardDescription.textContent = description;
            // Inline styles for visibility
            cardDescription.style.cssText = 'font-size: 13px !important; color: #555 !important; line-height: 1.5 !important; margin: 10px 0 8px !important; display: block !important; visibility: visible !important; opacity: 1 !important; font-weight: 400 !important;';
            cardContent.appendChild(cardDescription);
            
            // Company optional (only if author exists)
            if (author) {
              var cardCompany = document.createElement('div');
              cardCompany.className = 'job-card-company';
              var companyName = document.createElement('span');
              companyName.className = 'job-card-company-name';
              companyName.textContent = author;
              cardCompany.appendChild(companyName);
              cardContent.appendChild(cardCompany);
            }
            
            cardLink.appendChild(cardImage);
            cardLink.appendChild(cardContent);
            slide.appendChild(cardLink);
            wrapper.appendChild(slide);
          });
          
          // Initialize Swiper after posts are added
          if (wrapper.children.length > 0) {
            // Destroy existing Swiper instance if any
            if (swiperEl.swiper) {
              swiperEl.swiper.destroy(true, true);
            }
            
            // Initialize new Swiper
            var swiperInstance = new Swiper(swiperEl, {
              slidesPerView: 'auto',
              spaceBetween: 15,
              navigation: {
                nextEl: swiperEl.querySelector('.job-carousel-next'),
                prevEl: swiperEl.querySelector('.job-carousel-prev'),
              },
              breakpoints: {
                320: {
                  slidesPerView: 1.5,
                  spaceBetween: 10,
                },
                480: {
                  slidesPerView: 2,
                  spaceBetween: 12,
                },
                768: {
                  slidesPerView: 3,
                  spaceBetween: 15,
                },
                1024: {
                  slidesPerView: 4,
                  spaceBetween: 15,
                },
              },
            });
            
            console.log('Swiper initialized with', wrapper.children.length, 'slides');
          } else {
            console.log('No slides to show');
            wrapper.innerHTML = '<div class="job-carousel-empty" style="text-align:center;padding:40px;color:#999;">No jobs available</div>';
          }
        },
        error: function(xhr, status, error) {
          console.log('Feed error:', status, error);
          wrapper.innerHTML = '<div class="job-carousel-empty" style="text-align:center;padding:40px;color:#999;">Unable to load jobs</div>';
        }
      });
    });
  }
  
  // Apply comprehensive section styles directly via JavaScript (inline styles)
  function applySectionStyles() {
    // Inject style tag for ::after pseudo-element (arrow icons)
    if (!document.getElementById('job-carousel-arrow-styles')) {
      var style = document.createElement('style');
      style.id = 'job-carousel-arrow-styles';
      style.textContent = '.job-carousel-prev::after, .job-carousel-next::after { font-size: 12px !important; }';
      document.head.appendChild(style);
    }
    
    // Apply section spacing
    var premiumSection = document.getElementById('premium-jobs-section');
    if (premiumSection) {
      premiumSection.style.cssText += 'margin-top: 50px !important; margin-bottom: 50px !important; padding-top: 30px !important; padding-bottom: 30px !important;';
    }
    var seniorSection = document.getElementById('senior-jobs-section');
    if (seniorSection) {
      seniorSection.style.cssText += 'margin-top: 50px !important; margin-bottom: 50px !important; padding-top: 30px !important; padding-bottom: 30px !important;';
    }
    
    // Premium section - Complete inline styles
    var premiumContainers = document.querySelectorAll('.job-carousel-container.premium-jobs');
    premiumContainers.forEach(function(container) {
      // Container styles
      container.style.cssText += 'background: linear-gradient(135deg, #f0fdfa 0%, #ffffff 50%, #f8fffe 100%) !important; border-left: 5px solid #14b8a6 !important; border-top: 1px solid #e6fffa !important; border-right: 1px solid #ebebf3 !important; border-bottom: 1px solid #ebebf3 !important; border-radius: 12px !important; box-shadow: 0 6px 25px rgba(20, 184, 166, 0.12) !important; padding: 35px 30px !important; max-width: 1200px !important; margin: 0 auto !important; display: block !important; visibility: visible !important; opacity: 1 !important;';
      
      // Header styles
      var header = container.querySelector('.job-carousel-header');
      if (header) {
        header.style.cssText += 'display: flex !important; justify-content: space-between !important; align-items: center !important; margin-bottom: 30px !important; padding-bottom: 15px !important; border-bottom: 1px solid #e6fffa !important;';
      }
      
      // Title styles - Show title with proper styling
      var title = container.querySelector('.job-carousel-title');
      if (title) {
        title.style.cssText += 'font-size: 26px !important; font-weight: 700 !important; margin: 0 !important; color: #0f766e !important; letter-spacing: -0.5px !important; display: block !important; visibility: visible !important; opacity: 1 !important;';
      }
      
      // Hide section title (outside title)
      var section = container.closest('section[id*="premium"], section[id*="senior"]');
      if (!section) {
        section = container.closest('[id*="premium-jobs-section"], [id*="senior-jobs-section"]');
      }
      if (section) {
        var sectionTitle = section.querySelector('.widget-title, h2.widget-title, h3.widget-title');
        if (sectionTitle) {
          sectionTitle.style.cssText += 'display: none !important; visibility: hidden !important; opacity: 0 !important; height: 0 !important; margin: 0 !important; padding: 0 !important;';
        }
      }
      
      // View All button styles
      var viewAll = container.querySelector('.job-carousel-view-all');
      if (viewAll) {
        viewAll.style.cssText += 'font-size: 14px !important; font-weight: 600 !important; text-decoration: none !important; padding: 8px 16px !important; border-radius: 6px !important; color: #14b8a6 !important; border: 2px solid #14b8a6 !important; background: rgba(20, 184, 166, 0.05) !important; transition: all 0.3s ease !important;';
      }
      
      // Card styles
      var cards = container.querySelectorAll('.job-card');
      cards.forEach(function(card) {
        card.style.cssText += 'width: 220px !important; flex-shrink: 0 !important; background: #fff !important; border: 1px solid #d1fae5 !important; border-radius: 10px !important; overflow: hidden !important; box-shadow: 0 3px 10px rgba(20, 184, 166, 0.08) !important; transition: all 0.3s ease !important;';
      });
      
      // Arrow styles - Premium (balanced size)
      var prevArrow = container.querySelector('.job-carousel-prev');
      var nextArrow = container.querySelector('.job-carousel-next');
      if (prevArrow) {
        prevArrow.style.cssText += 'width: 36px !important; height: 36px !important; background: #ffffff !important; border: 2px solid #14b8a6 !important; border-radius: 50% !important; color: #14b8a6 !important; position: absolute !important; left: 5px !important; top: 50% !important; transform: translateY(-50%) !important; z-index: 15 !important; display: flex !important; align-items: center !important; justify-content: center !important; cursor: pointer !important; box-shadow: 0 3px 10px rgba(20, 184, 166, 0.25) !important; visibility: visible !important; opacity: 1 !important; font-size: 12px !important;';
        prevArrow.setAttribute('data-arrow-size', '12px');
      }
      if (nextArrow) {
        nextArrow.style.cssText += 'width: 36px !important; height: 36px !important; background: #ffffff !important; border: 2px solid #14b8a6 !important; border-radius: 50% !important; color: #14b8a6 !important; position: absolute !important; right: 5px !important; top: 50% !important; transform: translateY(-50%) !important; z-index: 15 !important; display: flex !important; align-items: center !important; justify-content: center !important; cursor: pointer !important; box-shadow: 0 3px 10px rgba(20, 184, 166, 0.25) !important; visibility: visible !important; opacity: 1 !important; font-size: 12px !important;';
        nextArrow.setAttribute('data-arrow-size', '12px');
      }
    });
    
    // Senior section - Complete inline styles
    var seniorContainers = document.querySelectorAll('.job-carousel-container.senior-jobs');
    seniorContainers.forEach(function(container) {
      // Container styles
      container.style.cssText += 'background: linear-gradient(135deg, #faf5ff 0%, #ffffff 50%, #fef3ff 100%) !important; border-left: 5px solid #8b5cf6 !important; border-top: 1px solid #f3e8ff !important; border-right: 1px solid #ebebf3 !important; border-bottom: 1px solid #ebebf3 !important; border-radius: 12px !important; box-shadow: 0 6px 25px rgba(139, 92, 246, 0.12) !important; padding: 35px 30px !important; max-width: 1200px !important; margin: 0 auto !important; display: block !important; visibility: visible !important; opacity: 1 !important;';
      
      // Header styles
      var header = container.querySelector('.job-carousel-header');
      if (header) {
        header.style.cssText += 'display: flex !important; justify-content: space-between !important; align-items: center !important; margin-bottom: 30px !important; padding-bottom: 15px !important; border-bottom: 1px solid #f3e8ff !important;';
      }
      
      // Title styles - Show title with proper styling
      var title = container.querySelector('.job-carousel-title');
      if (title) {
        title.style.cssText += 'font-size: 26px !important; font-weight: 700 !important; margin: 0 !important; color: #6d28d9 !important; letter-spacing: -0.5px !important; display: block !important; visibility: visible !important; opacity: 1 !important;';
      }
      
      // Hide section title (outside title)
      var section = container.closest('section[id*="premium"], section[id*="senior"]');
      if (!section) {
        section = container.closest('[id*="premium-jobs-section"], [id*="senior-jobs-section"]');
      }
      if (section) {
        var sectionTitle = section.querySelector('.widget-title, h2.widget-title, h3.widget-title');
        if (sectionTitle) {
          sectionTitle.style.cssText += 'display: none !important; visibility: hidden !important; opacity: 0 !important; height: 0 !important; margin: 0 !important; padding: 0 !important;';
        }
      }
      
      // View All button styles
      var viewAll = container.querySelector('.job-carousel-view-all');
      if (viewAll) {
        viewAll.style.cssText += 'font-size: 14px !important; font-weight: 600 !important; text-decoration: none !important; padding: 8px 16px !important; border-radius: 6px !important; color: #8b5cf6 !important; border: 2px solid #8b5cf6 !important; background: rgba(139, 92, 246, 0.05) !important; transition: all 0.3s ease !important;';
      }
      
      // Card styles
      var cards = container.querySelectorAll('.job-card');
      cards.forEach(function(card) {
        card.style.cssText += 'width: 220px !important; flex-shrink: 0 !important; background: #fff !important; border: 1px solid #e9d5ff !important; border-radius: 10px !important; overflow: hidden !important; box-shadow: 0 3px 10px rgba(139, 92, 246, 0.08) !important; transition: all 0.3s ease !important;';
      });
      
      // Arrow styles - Senior (balanced size)
      var prevArrow = container.querySelector('.job-carousel-prev');
      var nextArrow = container.querySelector('.job-carousel-next');
      if (prevArrow) {
        prevArrow.style.cssText += 'width: 36px !important; height: 36px !important; background: #ffffff !important; border: 2px solid #8b5cf6 !important; border-radius: 50% !important; color: #8b5cf6 !important; position: absolute !important; left: 5px !important; top: 50% !important; transform: translateY(-50%) !important; z-index: 15 !important; display: flex !important; align-items: center !important; justify-content: center !important; cursor: pointer !important; box-shadow: 0 3px 10px rgba(139, 92, 246, 0.25) !important; visibility: visible !important; opacity: 1 !important; font-size: 12px !important;';
        prevArrow.setAttribute('data-arrow-size', '12px');
      }
      if (nextArrow) {
        nextArrow.style.cssText += 'width: 36px !important; height: 36px !important; background: #ffffff !important; border: 2px solid #8b5cf6 !important; border-radius: 50% !important; color: #8b5cf6 !important; position: absolute !important; right: 5px !important; top: 50% !important; transform: translateY(-50%) !important; z-index: 15 !important; display: flex !important; align-items: center !important; justify-content: center !important; cursor: pointer !important; box-shadow: 0 3px 10px rgba(139, 92, 246, 0.25) !important; visibility: visible !important; opacity: 1 !important; font-size: 12px !important;';
        nextArrow.setAttribute('data-arrow-size', '12px');
      }
    });
    
    // Apply card content styles
    var allCards = document.querySelectorAll('.job-card');
    allCards.forEach(function(card) {
      var cardImage = card.querySelector('.job-card-image');
      if (cardImage) {
        cardImage.style.cssText += 'width: 100% !important; height: 160px !important; display: flex !important; align-items: center !important; justify-content: center !important; background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%) !important; padding: 20px !important; border-bottom: 1px solid #f0f0f0 !important;';
      }
      
      var cardContent = card.querySelector('.job-card-content');
      if (cardContent) {
        cardContent.style.cssText += 'padding: 18px !important;';
      }
      
      var cardTitle = card.querySelector('.job-card-title');
      if (cardTitle) {
        cardTitle.style.cssText += 'font-size: 16px !important; font-weight: 600 !important; margin: 0 0 10px !important; color: #333 !important; line-height: 1.4 !important;';
      }
      
      var cardDesc = card.querySelector('.job-card-description');
      if (cardDesc) {
        cardDesc.style.cssText += 'font-size: 13px !important; color: #555 !important; line-height: 1.5 !important; margin: 10px 0 8px !important; display: block !important; visibility: visible !important; opacity: 1 !important; font-weight: 400 !important;';
      }
    });
  }
  
  // Multiple initialization attempts for better reliability
  function tryInit() {
    if (typeof Swiper === 'undefined' || typeof $ === 'undefined') {
      console.log('Waiting for Swiper/jQuery...');
      setTimeout(tryInit, 100);
      return;
    }
    // Apply section styles first
    applySectionStyles();
    // Then initialize carousels
    initJobCarousels();
    // Re-apply styles multiple times to ensure they stick
    setTimeout(applySectionStyles, 500);
    setTimeout(applySectionStyles, 1000);
    setTimeout(applySectionStyles, 2000);
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      setTimeout(tryInit, 500);
    });
  } else {
    setTimeout(tryInit, 500);
  }
  
  // Also apply styles on window load and after content loads
  window.addEventListener('load', function() {
    setTimeout(applySectionStyles, 500);
    setTimeout(applySectionStyles, 1500);
  });
  
  // Apply styles when DOM changes (MutationObserver)
  if (window.MutationObserver) {
    var observer = new MutationObserver(function(mutations) {
      applySectionStyles();
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
})();
//
// [END SCRIPT]

