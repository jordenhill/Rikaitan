/*
	Rikaitan
	Copyright (C) 2014 Jorden Hill

	---

	Originally based on Rikaikun
	Copyright (C) 2010 Erek Speed
	http://code.google.com/p/rikaikun/
	
	---

	Originally based on Rikaichan 1.07
	by Jonathan Zarate
	http://www.polarcloud.com/

	---

	Originally based on RikaiXUL 0.4 by Todd Rudick
	http://www.rikai.com/
	http://rikaixul.mozdev.org/

	---

	This program is free software; you can redistribute it and/or modify
	it under the terms of the GNU General Public License as published by
	the Free Software Foundation; either version 2 of the License, or
	(at your option) any later version.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU General Public License for more details.

	You should have received a copy of the GNU General Public License
	along with this program; if not, write to the Free Software
	Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA

	---

	Please do not change or remove any of the copyrights or links to web pages
	when modifying any of the files. - Jon

*/

"use strict";

var rcxContent = {
	altView: 0,
	defaultDict: 2,
	dictCount: 3,
	sameDict: 0,
	forceKanji: 0,
	hideInStickyMode: false,
	inlineNames: {
		// text node
		'#text': true,

		// font style
		'FONT': true,
		'TT': true,
		'I' : true,
		'B' : true,
		'BIG' : true,
		'SMALL' : true,
		//deprecated
		'STRIKE': true,
		'S': true,
		'U': true,

		// phrase
		'EM': true,
		'STRONG': true,
		'DFN': true,
		'CODE': true,
		'SAMP': true,
		'KBD': true,
		'VAR': true,
		'CITE': true,
		'ABBR': true,
		'ACRONYM': true,

		// special, not included IMG, OBJECT, BR, SCRIPT, MAP, BDO
		'A': true,
		'Q': true,
		'SUB': true,
		'SUP': true,
		'SPAN': true,
		'WBR': true,

		// ruby
		'RUBY': true,
		'RBC': true,
		'RTC': true,
		'RB': true,
		'RT': true,
		'RP': true
	},
	kanjiN: 1,
	lastFound: null,	
	lastRo: 0,
	lastSelEnd: [],
	mDown: false,
	namesN: 2,
	nextDict: 3,
	showInStickyMode: false,
	showingMinihelp: false,
	startElementExpr: 'boolean(parent::rp or ancestor::rt)',
	superStickyMode: false,
	textNodeExpr: 'descendant-or-self::text()[not(parent::rp) and not(ancestor::rt)]',
}	

var dictionary = {
	// katakana -> hiragana conversion tables
	ch:[0x3092,0x3041,0x3043,0x3045,0x3047,0x3049,0x3083,0x3085,0x3087,0x3063,
		0x30FC,0x3042,0x3044,0x3046,0x3048,0x304A,0x304B,0x304D,0x304F,0x3051,
		0x3053,0x3055,0x3057,0x3059,0x305B,0x305D,0x305F,0x3061,0x3064,0x3066,
		0x3068,0x306A,0x306B,0x306C,0x306D,0x306E,0x306F,0x3072,0x3075,0x3078,
		0x307B,0x307E,0x307F,0x3080,0x3081,0x3082,0x3084,0x3086,0x3088,0x3089,
		0x308A,0x308B,0x308C,0x308D,0x308F,0x3093],
	config: {},
	cs:[0x3071,0x3074,0x3077,0x307A,0x307D],
	cv:[0x30F4,0xFF74,0xFF75,0x304C,0x304E,0x3050,0x3052,0x3054,0x3056,0x3058,
		0x305A,0x305C,0x305E,0x3060,0x3062,0x3065,0x3067,0x3069,0xFF85,0xFF86,
		0xFF87,0xFF88,0xFF89,0x3070,0x3073,0x3076,0x3079,0x307C],
	numList: [
		'H',	'Halpern',
		'L',	'Heisig',
		'E',	'Henshall',
		'DK',	'Kanji Learners Dictionary',
		'N',	'Nelson',
		'V',	'New Nelson',
		'Y',	'PinYin',
		'P',	'Skip Pattern',
		'IN',	'Tuttle Kanji &amp; Kana',
		'I',	'Tuttle Kanji Dictionary',
		'U',	'Unicode'
	],
};

// Gets the messages passed from global.html and performs the corresponding
// function
rcxContent.getMessage = function(event) {
	if (window === window.top) {
		switch(event.name) {
		case 'enable':
			console.log('enabled');
			rcxContent.enableTab();
			window.rikaichan.config = event.message;
			break;
		case 'disable':
			rcxContent.disableTab();
			break;
		case 'showPopup':
			rcxContent.showPopup(event.message);
			break;
		case 'processentry':
			rcxContent.processEntry(event.message);
			break;
		case 'processhtml':
			rcxContent.processHtml(event.message);
			break;
		case 'processtitle':
			rcxContent.processTitle(event.message);
			break;
		}
	}
}

// Enables the event listeners for Rikaitan
rcxContent.enableTab = function() {
		if(window.rikaichan == null) {
			window.rikaichan = {};
			window.addEventListener('mousemove', this.onMouseMove, false);
			window.addEventListener('keydown', this.onKeyDown, true);
			window.addEventListener('keyup', this.onKeyUp, true);
			window.addEventListener('mousedown', this.onMouseDown, false);
			window.addEventListener('mouseup', this.onMouseUp, false);
		}
}
	
// Disable the event listeners for Rikaitan
rcxContent.disableTab = function() {
	if (window.rikaichan != null) {
		var graphics;
		window.removeEventListener('mousemove', this.onMouseMove, false);
		window.removeEventListener('keydown', this.onKeyDown, true);
		window.removeEventListener('keyup', this.onKeyUp, true);
		window.removeEventListener('mousedown', this.onMouseDown, false);
		window.removeEventListener('mouseup', this.onMouseUp, false);
		
		graphics = document.getElementById('rikaichan-css');
		if (graphics) graphics.parentNode.removeChild(graphics);
		
		graphics = document.getElementById('rikaichan-window');
		if (graphics) graphics.parentNode.removeChild(graphics);
		
		this.clearHi();
		delete window.rikaichan;
	}
}

// _onMouseMove
rcxContent.onMouseMove = function(ev) {
	if (window === window.top) {
		try {			
			var tdata = window.rikaichan;
			var range = document.caretRangeFromPoint(ev.clientX, ev.clientY);
			var rp = range.startContainer;
			var ro = range.startOffset;
			
			if (tdata.timer) {
				clearTimeout(tdata.timer);
				tdata.timer = null;
			}
			
			// This is to account for bugs in caretRangeFromPoint
			// It includes the fact that it returns text nodes over non text 
			// nodes and also the fact that it miss the first character of 
			// inline nodes. If the range offset is equal to the node data 
			// length, then we have the second case and need to correct.
			if ((rp.data) && ro == rp.data.length) {
			
				// A special exception is the WBR tag which is inline but 
				// doesn't contain text.
				if ((rp.nextSibling) && (rp.nextSibling.nodeName == 'WBR')) {
					rp = rp.nextSibling.nextSibling;
					ro = 0;
				}
			
				// If we're to the right of an inline character we can use the 
				// target. However, if we're just in a blank spot don't do 
				// anything.
				else if (rcxContent.isInline(ev.target)) {
					if (rp.parentNode == ev.target) {
						;
					}
					else if (rp.parentNode.innerText == ev.target.value) {
						;
					}
					else {
						rp = ev.target.firstChild;
						ro = 0;
					}
				}
				
				// Otherwise we're on the right and can take the next sibling 
				// of the inline element.
				else {
					rp = rp.parentNode.nextSibling
					ro = 0;
				}
			}
			
			// The case where the before div is empty so the false spot is in 
			// the parent, but we should be able to take the target. The 1 
			// seems random but it actually represents the preceding empty tag 
			// also we don't want it to mess up with our fake div. Also, form 
			// elements don't seem to fall into this case either.
			if (!('form' in ev.target) && rp && rp.parentNode != ev.target && 
					ro == 1) {
				rp = rcxContent.getFirstTextChild(ev.target);
				ro=0;
			}
					
			// Otherwise, we're off in nowhere land and we should go home.
			// offset should be 0 or max in this case.
			else if((!(rp) || ((rp.parentNode != ev.target)))){
				rp = null;
				ro = -1;
			}
			
		}
		catch(err) {
			console.log(err.message);
			return;
		}

		tdata.prevTarget = ev.target;
		tdata.prevRangeNode = rp;
		tdata.prevRangeOfs = ro;
		tdata.title = null;
		tdata.uofs = 0;
		this.uofsNext = 1;
		
		if ((rp) && (rp.data) && (ro < rp.data.length)) {
			rcxContent.forceKanji = ev.shiftKey ? 1 : 0;
			tdata.popX = ev.clientX;
			tdata.popY = ev.clientY;
			tdata.timer = setTimeout( 
					function() { 
						rcxContent.show(tdata, rcxContent.forceKanji ? 
						rcxContent.forceKanji : rcxContent.defaultDict); 
					}, 1);
		return;
		}

		// For images with Japanese text
		if (ev.target.nodeName == 'IMG') {
			console.log(ev.target)
			if (ev.target.alt) {
				tdata.title = ev.target.alt;
			}
			else if (ev.target.title) {
				tdata.title = ev.target.title;
			}
		}

		if (tdata.title) {
			tdata.popX = ev.clientX;
			tdata.popY = ev.clientY;
			rcxContent.showTitle(tdata);
		}
		else {
		
			// dont close just because we moved from a valid popup slightly 
			// over to a place with nothing
			var dx = tdata.popX - ev.clientX;
			var dy = tdata.popY - ev.clientY;
			var distance = Math.sqrt(dx * dx + dy * dy);

			if (distance > 2 && rcxContent.showingMinihelp == false) {
				console.log('here4');
				rcxContent.clearHi();
				rcxContent.hidePopup();
			}
		}
	}
}

// _onKeyDown needs this to function properly	
rcxContent.onKeyDown = function(ev) {
	rcxContent._onKeyDown(ev)
}

// Called when a key is pressed and checks for keys that activate a process or
// feature
rcxContent._onKeyDown = function(ev) {
	if ((ev.altKey) || (ev.metaKey) || (ev.ctrlKey)) {
		return;
	}
	if ((ev.shiftKey) && (ev.keyCode != 16)) {
		return;
	}
	if (!rcxContent.isVisible()) {
		return;
	}
	if (window.rikaichan.config.disablekeys == 'true' && (ev.keyCode != 16)) {
		return;
	}
	
	var i;

	switch (ev.keyCode) {
	case 13:	// enter - Change to a different dictionary
	case 16:	// shift - Change to a different dictionary
		this.show(ev.currentTarget.rikaichan, this.nextDict);
		break;
	case 27:	// esc - Remove the popup
	if (this.superStickyMode) {
		this.hideInStickyMode = true;
	}
		this.hidePopup();
		this.clearHi();
		break;
	case 65:	// a - Alternate popup location
		this.initialStickyPopup();
		this.altView = (this.altView + 1) % 3;
		this.show(ev.currentTarget.rikaichan, this.sameDict);
		break;
	case 67:	// c - Copy to clip
		safari.self.tab.dispatchMessage("copyToClip", rcxContent.lastFound);
		break;
	case 66:	// b - Previous character
		this.initalStickyPopup();
		var ofs = ev.currentTarget.rikaichan.uofs;
		for (i = 50; i > 0; --i) {
			ev.currentTarget.rikaichan.uofs = --ofs;
			if (this.show(ev.currentTarget.rikaichan, this.defaultDict) >= 0) {
				if (ofs >= ev.currentTarget.rikaichan.uofs) {
					break;
				}
			}
		}
		break;
	case 68:	// d - Hide or show definitions
		this.initialStickyPopup();
		safari.self.tab.dispatchMessage("switchOnlyReading", "");
		this.show(ev.currentTarget.rikaichan, this.sameDict);
		break;
	case 77:	// m - Next character
		this.initialStickyPopup();
		ev.currentTarget.rikaichan.uofsNext = 1;
	case 78:	// n - Next word
		this.initialStickyPopup();
		for (i = 50; i > 0; --i) {
			ev.currentTarget.rikaichan.uofs += ev.currentTarget.rikaichan.uofsNext;
			if (this.show(ev.currentTarget.rikaichan, this.defaultDict) >= 0) {
				break;
			}
		}
		break;
	case 79:   // o - Super sticky mode
		this.superSticky();
		this.initialStickyPopup();
		break;
	case 89:   // y - Move popup down
		this.initialStickyPopup();
		this.altView = 0;
		ev.currentTarget.rikaichan.popY += 20;
		this.show(ev.currentTarget.rikaichan, this.sameDict);
		break;
	default:
		return;
	}

	// don't eat shift if in this mode
	if (true) {
		ev.preventDefault();
	}
}
	
// Called when the mouse is clicked
rcxContent.onMouseDown = function(ev) {
	if(ev.button != 0) {
		return;	
	}
	
	var mDown = true;
	
	// If we click outside of a text bos then we set oldCaret to -1 as an
	// indicator not to restore position. Otherwise, we switch our saved
	// text area to wherever we just clicked
	
	if(!('form' in ev.target)) {
		window.rikaichan.oldCaret = -1;
	}
	else {
		window.rikaichan.oldTA = ev.target;
	}
}
	
// Called when the mouse button is released
rcxContent.onMouseUp = function(ev) {
	if (ev.button != 0) return;
	var mDown = false;
}
	
// Called in order to clear the highlighted text when necessary
rcxContent.clearHi = function() {
	var tdata = window.rikaichan;
	
	if ((!tdata) || (!tdata.prevSelView)) {
		return;
	}
	if (tdata.prevSelView.closed) {
		tdata.prevselView = null;
		return;
	}
	
	var sel = tdata.prevSelView.getSelection();
	
	// If there is an empty selection or the slection was done by rikaitan
	// then we'll clear it.
	
	if ((!sel.toString()) || (tdata.selText == sel.toString())) {
		
		// In the case of no selection we clear the oldTA. The reason for
		// this is because if there's no selection we probably clicked
		// somewhere else and we don't want to bounce back.
		if (!sel.toString()) {
			tdata.oldTA = null;
		}
		
		// clear all selections
		sel.removeAllRanges();
		
		// Text area stuff. If oldTA is still around that means we had a
		// highlighted region which we just cleared and now we're going to
		// jump back to where we were. The cursor was before our lookup if
		// oldCaret is less than 0 it means we clicked outside the box and
		// shoudln't come back.
		if (tdata.oldTA && tdata.oldCaret >= 0) {
			tdata.oldTA.selectionStart = tdata.oldTA.selectionEnd = tdata.oldCaret;
		}
	}
	
	tdata.prevSelView = null;
	tdata.kanjiChar = null;
	tdata.selText = null;
}
	
// getTotalOffset
rcxContent.getTotalOffset = function(parent, tNode, offset) {
	var fChild = parent.firstChild;
	var realO = offset;
	if (fChild == tNode) {
		return offset;
	}
	do {
		var val = 0;
		if (fChild.nodeName = "BR") {
			val = 1;
		}
		else {
			val = (fChild.data ? fChild.data.length : 0);
		}
		realO += val;
	} while ((fChild = fChild.nextSibling) != tNode);
	
	return realO;
}

// Checks to see if portion of text is part of entire line of text	
rcxContent.isInline = function(node) {
	if (window === window.top) {
		return this.inlineNames.hasOwnProperty(node.nodeName) ||
		document.defaultView.getComputedStyle(node,null).getPropertyValue('display') ==
		 'inline' || document.defaultView.getComputedStyle(node,null).getPropertyValue('display') ==
		 'inline-block';
	}
}

// Checks to see if the popup is currently visible
rcxContent.isVisible = function() {
	var popup = document.getElementById('rikaichan-window');
	return (popup) && (popup.style.display != 'none');
}

// Gets text to prepare the translation and popup display
rcxContent.show = function(tdata, dictOption) {
	var rp = tdata.prevRangeNode;
	var ro = tdata.prevRangeOfs + tdata.uofs;
	var u;
	
	tdata.uofsNext = 1;
	
	if (!rp && rcxContent.showingMinihelp == false) {
		console.log('here1');
		this.clearHi();
		this.hidePopup();
		return 0;
	}
	
	if ((ro < 0) || (ro >= rp.data.length) && rcxContent.showingMinihelp == false) {	
		console.log('here3');
		this.clearHi();
		this.hidePopup();
		return 0;
	}
	
	// If we have '   XYZ', where whitespace is compressed, X never seems
	// to get selected
	while (((u = rp.data.charCodeAt(ro)) == 32) || (u == 9) || (u == 10)) {
		++ro;
		if (ro >= rp.data.length && rcxContent.showingMinihelp == false) {
			console.log('here2');
			this.clearHi;
			this.hidePopup();
			return 0;
		}
	}
	
	if ((isNaN(u)) ||
		((u != 0x25CB) &&
		((u < 0x3001) || (u > 0x30FF)) &&	 
		((u < 0x3400) || (u > 0x9FFF)) &&
		((u < 0xF900) || (u > 0xFAFF)) &&
		((u < 0xFF10) || (u > 0xFF9D))) && rcxContent.showingMinihelp == false) {
		this.clearHi();
		this.hidePopup();
		return -2;
	}
	
	// selection end data
	var selEndList = [];
	var text = this.getTextFromRange(rp, ro, selEndList, 13);
	
	rcxContent.lastSelEnd = selEndList;
	rcxContent.lastRo = ro;
	var textData = {'text':text, 'dictOption':dictOption};
	safari.self.tab.dispatchMessage("xsearch", textData);
	return 1;
}

// Sends a message to global.html to translate title text	
rcxContent.showTitle = function(tdata) {
	safari.self.tab.dispatchMessage("translate", tdata.title);
}

// Checks the content type of data contained in tDoc
rcxContent.getContentType = function(tDoc) {
	var m = tDoc.getElementsByTagName('meta');
	for(var i in m) {
		if (m[i].httpEquiv == 'Content-Type') {
			var con = m[i].content;
			con = con.split(';');
			return con[0];
		}
	}
	return null;
}

// Displays the popup containing the information
rcxContent.showPopup = function(text, elem, x, y, looseWidth) {
	var topdoc = window.document;
	
	var textStr = text.toString();
	if (textStr.indexOf("Rikaitan enabled!") > -1) {
		rcxContent.showingMinihelp = true;
		console.log('got it');
	}
	
	if ((isNaN(x)) || (isNaN(y))) {
		x = y = 0;
	}
	
	var popup = topdoc.getElementById('rikaichan-window');
	if (!popup) {
		var css = topdoc.createElementNS('http://www.w3.org/1999/xhtml', 'link');
		var cssdoc = window.rikaichan.config.css;
		
		css.setAttribute('rel', 'stylesheet');
		css.setAttribute('type', 'text/css');
		css.setAttribute('href', (safari.extension.baseURI + ('css/popup-' + 
																cssdoc + '.css')));
		css.setAttribute('id', 'rikaichan-css');
		topdoc.getElementsByTagName('head')[0].appendChild(css);
		popup = topdoc.createElementNS('http://www.w3.org/1999/xhtml', 'div');
		popup.setAttribute('id', 'rikaichan-window');
		topdoc.documentElement.appendChild(popup);

		popup.addEventListener('dblclick',
 			function (ev) { rcxContent.hidePopup(); ev.stopPropagation(); }, true);
	}

	popup.style.width = 'auto';
	popup.style.height = 'auto';
	popup.style.maxWidth = (looseWidth ? '' : '600px');
	popup.style.opacity = window.rikaichan.config.opacity / 100;

	if (rcxContent.getContentType(topdoc) == 'text/plain') {
		var df = document.createDocumentFragment();
		df.appendChild(document.createElementNS('http://www.w3.org/1999/xhtml', 'span'));
		df.firstChild.innerHTML = text;

		while (popup.firstChild) {
			popup.removeChild(popup.firstChild);
		}
		popup.appendChild(df.firstChild);
	}
	else {
		popup.innerHTML = text;
	}

	if (elem) {
		popup.style.top = '-1000px';
		popup.style.left = '0px';
		popup.style.display = '';

		var bbo = window;
		var pW = popup.offsetWidth;
		var pH = popup.offsetHeight;

		// guess!
		if (pW <= 0) {
			pW = 200;
		}
		if (pH <= 0) {
			pH = 0;
			var j = 0;
			while ((j = text.indexOf('<br/>', j)) != -1) {
				j += 5;
				pH += 22;
			}
			pH += 25;
		}

		if (this.altView == 1) {
			x = window.scrollX;
			y = window.scrollY;
		}
		else if (this.altView == 2) {
			x = (window.innerWidth - (pW + 20)) + window.scrollX;
			y = (window.innerHeight - (pH + 20)) + window.scrollY;
		}
		
		else {

			// go left if necessary
			if ((x + pW) > (window.innerWidth - 20)) {
				x = (window.innerWidth - pW) - 20;
				if (x < 0) x = 0;
			}

			// below the mouse
			var v = 25;

			// under the popup title
			if ((elem.title) && (elem.title != '')) v += 20;

			// go up if necessary
			else y += v;
				

			x += window.scrollX;
			y += window.scrollY;
		}
	}
	else {
		x += window.scrollX;
		y += window.scrollY;
	}

	popup.style.left = x + 'px';
	popup.style.top = y + 'px';
	popup.style.display = '';
}

// Hides the popup
rcxContent.hidePopup = function() {
	if (!this.superStickyMode || this.hideInStickyMode) {
		this.hideInStickyMode = false;
		var popup = document.getElementById('rikaichan-window');
		if (popup) {
			popup.style.display = 'none';
			popup.innerHTML = '';
		}
		this.title = null;
	}
}

// Assigns unicode information
rcxContent.unicodeInfo = function(c) {
	hex = '0123456789ABCDEF';
	u = c.charCodeAt(0);
	return c + 'U' + hex[(u >>> 12) & 15] + hex[(u >>> 8) & 15] + hex[(u >>> 4) & 15] + hex[(u & 15)];
}

// Gets the string of text
rcxContent.getInlineText = function(node, selEndList, maxLength, xpathExpr) {
	var text = '';
	var endIndex;
	
	if (node.nodeName == '#text') {
		endIndex = Math.min(maxLength, node.data.length);
		selEndList.push({node: node, offset: endIndex});
		return node.data.substring(0, endIndex);
	}
	
	var result = xpathExpr.evaluate(node, XPathResult.ORDERED_NODE_ITERATOR_TYPE, 
		null);
	
	while ((text.length < maxLength) && (node = result.iterateNext())) {
		endIndex = Math.min(node.data.length, maxLength - text.length);
		text += node.data.substring(0, endIndex);
		selEndList.push({node: node, offset: endIndex});
	}
	
	return text;
}

// Gets the next node
rcxContent.getNext = function(node) {
	var nextNode;
	
	if ((nextNode = node.nextSibling) != null) {
		return nextNode;
	}
	if (((nextNode = node.parentNode) != null) && this.isInline(nextNode)) {
		return this.getNext(nextNode);
	}
	return null;
}

// Gets the text from within the corresponding range
rcxContent.getTextFromRange = function(rangeParent, offset, selEndList, maxLength) {
	if(rangeParent.nodeName == 'textarea' || rangeParent.nodeName == 'INPUT') {
		var endIndex = Math.min(rangeParent.data.length, offset + maxLength);
		return rangeParent.nodeValue.substring(offset, endIndex);
	}

	var text = '';

	var xpathExpr = rangeParent.ownerDocument.createExpression(rcxContent.textNodeExpr, null);

	if (rangeParent.ownerDocument.evaluate(this.startElementExpr, rangeParent, 
			null, XPathResult.BOOLEAN_TYPE, null).booleanValue) {
		return '';
	}
	if (rangeParent.nodeType != Node.TEXT_NODE) {
		return '';
	}
	
	var endIndex = Math.min(rangeParent.data.length, offset + maxLength);
	text += rangeParent.data.substring(offset, endIndex);
	selEndList.push({'node':rangeParent, 'offset':endIndex});

	var nextNode = rangeParent;
	while (((nextNode = this.getNext(nextNode)) != null) && 
			(this.isInline(nextNode)) && (text.length < maxLength)) {
		text += this.getInlineText(nextNode, selEndList, maxLength - 
			text.length, xpathExpr);
	}
	return text;
}

// Processes the translation data
rcxContent.processEntry = function(e) {
	var tdata = window.rikaichan;
	var ro = rcxContent.lastRo;
	var selEndList = rcxContent.lastSelEnd;

	if (!e && rcxContent.showingMinihelp == false) {
		console.log('here6');
		rcxContent.clearHi();
		rcxContent.hidePopup();
		return -1;
	}
	rcxContent.lastFound = [e];

	if (!e.matchLen) {
		e.matchLen = 1;
	}
	tdata.uofsNext = e.matchLen;
	tdata.uofs = (ro - tdata.prevRangeOfs);
	var rp = tdata.prevRangeNode;
	
	// don't try to highlight form elements
	if ((rp) && ((tdata.config.highlight == 'true' && !this.mDown && 
				!('form' in tdata.prevTarget))  || 
				(('form' in tdata.prevTarget) && tdata.config.textboxhl == 'true'))) {
		var doc = rp.ownerDocument;
		
		if (!doc && rcxContent.showingMinihelp == false) {
			console.log('here7');
			rcxContent.clearHi();
			rcxContent.hidePopup();
			return 0;
		}
		rcxContent.highlightMatch(doc, rp, ro, e.matchLen, selEndList, tdata);
		tdata.prevSelView = doc.defaultView;
	}
	
	safari.self.tab.dispatchMessage("makehtml", e);
}

// Processes the HTML translation data
rcxContent.processHtml = function(html) {
	if (window === window.top) {
		if (!this.superStickyMode || this.showInStickyMode) {
			var tdata = window.rikaichan;
			this.showInStickyMode = false;
			rcxContent.showPopup(html, tdata.prevTarget, tdata.popX, tdata.popY, false);
			return 1;
		}
	}
}

// Highlight the text that will be translated
rcxContent.highlightMatch = function(doc, rp, ro, matchLen, selEndList, tdata) {
	var sel = doc.defaultView.getSelection();
	
	// If selEndList is empty then we're dealing with a textarea/input situation
	if (selEndList.length === 0) { 
	    try {
			if(rp.nodeName == '#text' || rp.nodeName == 'INPUT') {
				// If there is already a selected region not caused by
				// rikaitan, leave it alone
				if((sel.toString()) && (tdata.selText != sel.toString())) {
					return;
				}
				
				// If there is no selected region and the saved
				// textbox is the same as the current one
				// then save the current cursor position
				// The second half of the condition let's us place the
				// cursor in another text box without having it jump back
				if(!sel.toString() && tdata.oldTA == rp) {
					tdata.oldCaret = rp.selectionStart;
					tdata.oldTA = rp;
				}
				rp.selectionStart = ro;
				rp.selectionEnd = matchLen + ro;
				
				tdata.selText = rp.nodeValue.substring(ro, matchLen+ro);
			}
	    }
	    catch(err) {
			
			// If there is an error it is probably caused by the input type
			// being not text.  This is the most general way to deal with
			// arbitrary types.
			
			// we set oldTA to null because we don't want to do weird stuf
			// with buttons
	        tdata.oldTA = null;
	        console.log(err.message);
	    }
		return;
	}
	
	// Special case for leaving a text box to an outside japanese
	// Even if we're not currently in a text area we should save
	// the last one we were in.
	if(tdata.oldTA && !sel.toString() && tdata.oldCaret >= 0){
		tdata.oldCaret = tdata.oldTA.selectionStart;   
	}
	
	var offset = matchLen + ro;
	for (var i = 0; i < selEndList.length; i++) {
		var selEnd = selEndList[i]
		if (offset <= selEnd.offset) {
			break;
		}
		offset -= selEnd.offset;
	}

	var range = doc.createRange();
	range.setStart(rp, ro);
	range.setEnd(selEnd.node, offset);

	if ((sel.toString()) && (tdata.selText != sel.toString())) {
		return;
	}
	sel.removeAllRanges();
	sel.addRange(range);
	tdata.selText = sel.toString();
}

// Process the title text of an image
rcxContent.processTitle = function(e) {
	var tdata = window.rikaichan;
	if (!e) {
		rcxContent.hidePopup();
		return;
	}
	e.title = tdata.title.substr(0, e.textLen).replace(/[\x00-\xff]/g, function (c) { return '&#' + c.charCodeAt(0) + ';' } );
	if (tdata.title.length > e.textLen) {
		e.title += '...';
	}
	
	this.lastFound = [e];
	
	safari.self.tab.dispatchMessage("makehtml", e);
}

//getFirstTextChild
rcxContent.getFirstTextChild = function(node) {
	return document.evaluate('descendant::text()[not(parent::rp) and not(ancestor::rt)]',
						node, null, XPathResult.ANY_TYPE, null).iterateNext();
		//
}

//method to toggle Super-sticky mode, which keeps the popup until dismissed
rcxContent.superSticky = function() {
	this.superStickyMode = !this.superStickyMode;
	if (this.superStickyMode == true) {
		this.showPopup("Super-sticky mode enabled");
	}
	else {
		this.showPopup("Super-sticky mode disabled");
	}
}

rcxContent.initialStickyPopup = function() {
	if (this.superStickyMode) {
		this.showInStickyMode = true;
	}
}

safari.self.addEventListener("message", rcxContent.getMessage, false);