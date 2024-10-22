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

var rikaitan = {
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
  lastTdata: null,
  mDown: false,
  namesN: 2,
  showPopups: true,
  nextDict: 3,
  sanseido: 0,
  sanseidoState: 0,
  showInStickyMode: false,
  showingMinihelp: false,
  startElementExpr: 'boolean(parent::rp or ancestor::rt)',
  superStickyMode: false,
  termLen: 0,
  textNodeExpr: 'descendant-or-self::text()[not(parent::rp) and not(ancestor::rt)]',
};

// Gets the messages passed from global.html
rikaitan.getMessage = function(event) {
  if(window == window.top) {
    switch(event.name) {
      case 'enable':
        rikaitan.enableTab();
        window.rikaichan.config = event.message;
        break;
      case 'disable':
        rikaitan.disableTab();
        break;
      case 'showPopup':
        rikaitan.showPopup(event.message);
        break;
      case 'processEntry':
        if (rikaitan.sanseido === 1) {
          rikaitan.sanseidoProcess(event.message);
        } else if (rikaitan.showPopups) {
          rikaitan.processEntry(event.message);
        }
        break;
      case 'processhtml':
        rikaitan.processHtml(event.message);
        break;
      case 'processtitle':
        rikaitan.processTitle(event.message);
        break;
      case 'noShow':
        rikaitan.flipNoShow();
        break;
      case 'parse':
        rikaitan.parse(event.message);
        break;
      case 'sanseido':
        if (rikaitan.sanseido == 0) {
          rikaitan.sanseido = 1;
        } else {
          rikaitan.sanseido--;
        }
        break;
    }
  }
};

// Enables the event listeners for Rikaitan
rikaitan.enableTab = function() {
  if(window.rikaichan == null) {
    window.rikaichan = {};
    window.addEventListener('mousemove', this.onMouseMove, false);
    window.addEventListener('keydown', this.onKeyDown, true);
    window.addEventListener('keyup', this.onKeyUp, true);
    window.addEventListener('mousedown', this.onMouseDown, false);
    window.addEventListener('mouseup', this.onMouseUp, false);
  }
};

// Disable the event listeners for Rikaitan
rikaitan.disableTab = function() {
  if (window.rikaichan != null) {
    var graphics;
    window.removeEventListener('mousemove', this.onMouseMove, false);
    window.removeEventListener('keydown', this.onKeyDown, true);
    window.removeEventListener('keyup', this.onKeyUp, true);
    window.removeEventListener('mousedown', this.onMouseDown, false);
    window.removeEventListener('mouseup', this.onMouseUp, false);

    graphics = document.getElementById('rikaichan-css');
    if (graphics) {
      graphics.parentNode.removeChild(graphics);
    }
    graphics = document.getElementById('rikaichan-window');
    if (graphics) {
      graphics.parentNode.removeChild(graphics);
    }
    this.clearHighlight();
    delete window.rikaichan;
  }
};

rikaitan.onMouseMove = function(event) {	
  var translationData = window.rikaichan;
  var range = document.caretRangeFromPoint(event.clientX, event.clientY);
  var rangeStart = range.startContainer;
  var rangeOffset = range.startOffset;

  if (translationData.timer) {
    clearTimeout(translationData.timer);
    translationData.timer = null;
  }

  // This is to account for bugs in caretRangeFromPoint
  // It includes the fact that it returns text nodes over non text 
  // nodes and also the fact that it miss the first character of 
  // inline nodes. If the range offset is equal to the node data 
  // length, then we have the second case and need to correct.
  if ((rangeStart.data) && rangeOffset == rangeStart.data.length) {
    // A special exception is the WBR tag which is inline but 
    // doesn't contain text.
    if ((rangeStart.nextSibling) && (rangeStart.nextSibling.nodeName == 'WBR')) {
      rangeStart = rangeStart.nextSibling.nextSibling;
      rangeOffset = 0;
    }

    // If we're to the right of an inline character we can use the 
    // target. However, if we're just in a blank spot don't do 
    // anything.
    else if (rikaitan.isInline(event.target)) {
      if (rangeStart.parentNode == event.target) {
        ;
      } else if (rangeStart.parentNode.innerText == event.target.value) {
        ;
      } else {
        rangeStart = event.target.firstChild;
        rangeOffset = 0;
      }
    }

    // Otherwise we're on the right and can take the next sibling 
    // of the inline element.
    else {
      rangeStart = rangeStart.parentNode.nextSibling
      rangeOffset = 0;
    }
  }

  // The case where the before div is empty so the false spot is in 
  // the parent, but we should be able to take the target. The 1 
  // seems random but it actually represents the preceding empty tag 
  // also we don't want it to mess up with our fake div. Also, form 
  // elements don't seem to fall into this case either.
  if (!('form' in event.target) && rangeStart && rangeStart.parentNode != 
    event.target && rangeOffset == 1) {
      rangeStart = rikaitan.getFirstTextChild(event.target);
      rangeOffset = 0;
  }

  // Otherwise, we're off in nowhere land and we should go home.
  // offset should be 0 or max in this case.
  else if((!(rangeStart) || ((rangeStart.parentNode != event.target)))){
    rangeStart = null;
    rangeOffset = -1;
  }
	
  translationData.prevTarget = event.target;
  translationData.prevRangeNode = rangeStart;
  translationData.prevRangeOfs = rangeOffset;
  translationData.title = null;
  translationData.uofs = 0;
  this.uofsNext = 1;

  if ((rangeStart) && (rangeStart.data) && (rangeOffset < rangeStart.data.length)) {
    rikaitan.forceKanji = event.shiftKey ? 1 : 0;
    translationData.popX = event.clientX;
    translationData.popY = event.clientY;
    translationData.timer = setTimeout( 
        function() { 
          rikaitan.show(translationData, rikaitan.forceKanji ? 
            rikaitan.forceKanji : rikaitan.defaultDict); 
        }, 1);
    return;
  }

  // For images with Japanese text
  if (event.target.nodeName == 'IMG') {
    if (event.target.alt) {
      translationData.title = event.target.alt;
    } else if (event.target.title) {
      translationData.title = event.target.title;
    }
  }

  if (translationData.title) {
    translationData.popX = event.clientX;
    translationData.popY = event.clientY;
    rikaitan.showTitle(translationData);
  } else {
    // dont close just because we moved from a valid popup slightly 
    // over to a place with nothing
    var horizontalDistance = translationData.popX - event.clientX;
    var verticalDistance = translationData.popY - event.clientY;
    var threshold = Math.sqrt(Math.pow(horizontalDistance, 2) + 
      Math.pow(verticalDistance, 2));
    
    if (threshold > 20) {
      rikaitan.clearHighlight();
      rikaitan.hidePopup();
    }
  }
};

rikaitan.onKeyDown = function(event) {
  rikaitan._onKeyDown(event)
};

rikaitan._onKeyDown = function(event) {
  if ((event.altKey) || (event.metaKey) || (event.ctrlKey)) {
    return;
  }
  if ((event.shiftKey) && (event.keyCode != 16)) {
    return;
  }
  if (!rikaitan.isVisible()) {
    return;
  }
  if (window.rikaichan.config.disablekeys == 'true' && (event.keyCode != 16)) {
    return;
  }
	
  var i;

  switch (event.keyCode) {
    case 13:	// enter - Change to a different dictionary
    case 16:	// shift - Change to a different dictionary
      this.show(event.currentTarget.rikaichan, this.nextDict);
      break;
    case 65:	// a - Alternate popup location
      this.initialStickyPopup();
      this.altView = (this.altView + 1) % 3;
      this.show(event.currentTarget.rikaichan, this.sameDict);
      break;
    case 66:	// b - Previous character
      this.initialStickyPopup();
      var offset = event.currentTarget.rikaichan.uofs;
        for (i = 50; i > 0; --i) {
          event.currentTarget.rikaichan.uofs = --offset
          if ((this.show(event.currentTarget.rikaichan, this.defaultDict) >= 0) 
            && (offset >= event.currentTarget.rikaichan.uofs)) {
              break;
          }
        }
      break;
    case 67:	// c - Copy to clip
      safari.self.tab.dispatchMessage("copyToClip", rikaitan.lastFound);
      break;
    case 68:	// d - Hide or show definitions
      this.initialStickyPopup();
      safari.self.tab.dispatchMessage("switchOnlyReading", "");
      this.show(event.currentTarget.rikaichan, this.sameDict);
      break;
    case 72:    // h - Hide or show popup
      if (this.superStickyMode) {
        this.hideInStickyMode = true;
      }
      this.hidePopup();
      this.clearHighlight();
      break;
    case 77:	// m - Next character
      this.initialStickyPopup();
      event.currentTarget.rikaichan.uofsNext = 1;
      break;
    case 78:	// n - Next word
      this.initialStickyPopup();
      for (i = 50; i > 0; --i) {
        event.currentTarget.rikaichan.uofs += event.currentTarget.rikaichan.uofsNext;
        if (this.show(event.currentTarget.rikaichan, this.defaultDict) >= 0) {
          break;
        }
      }
      break;
    case 79:   // o - Super sticky mode
      this.superSticky();
      this.initialStickyPopup();
      break;
    case 83:   // s - change dictionary between default and sanseido J-J/J-E
      safari.self.tab.dispatchMessage("changeDictLanguage", "");
      if (rikaitan.sanseido == 0) { 
        this.showPopup('Japanese-Japanese mode');
      } else {
        this.showPopup('Japanese-English mode');
      }
      break;
    case 89:   // y - Move popup down
      this.initialStickyPopup();
      this.altView = 0;
      event.currentTarget.rikaichan.popY += 20;
      this.show(event.currentTarget.rikaichan, this.sameDict);
      break;
    default:
      return;
  }

  // don't eat shift if in this mode
  if (true) {
    event.preventDefault();
  }
};
	
// Called when the mouse is clicked
rikaitan.onMouseDown = function(event) {
  if(event.button != 0) {
    return;	
  }

  var mDown = true;

  // If we click outside of a text bos then we set oldCaret to -1 as an
  // indicator not to restore position. Otherwise, we switch our saved
  // text area to wherever we just clicked

  if(!('form' in event.target)) {
    window.rikaichan.oldCaret = -1;
  } else {
    window.rikaichan.oldTA = ev.target;
  }
};
	
// Called when the mouse button is released
rikaitan.onMouseUp = function(event) {
  if (event.button != 0) {
    return;
  }
  var mDown = false;
};

// Called in order to clear the highlighted text when necessary
rikaitan.clearHighlight = function() {
  var translationData = window.rikaichan;

  if ((!translationData) || (!translationData.prevSelView)) {
    return;
  }
  if (translationData.prevSelView.closed) {
    translationData.prevselView = null;
    return;
  }

  var selection = translationData.prevSelView.getSelection();

  // If there is an empty selection or the slection was done by rikaitan
  // then we'll clear it.

  if ((!selection.toString()) || (translationData.selText == 
    selection.toString())) {

      // In the case of no selection we clear the oldTA. The reason for
      // this is because if there's no selection we probably clicked
      // somewhere else and we don't want to bounce back.
      if (!selection.toString()) {
        translationData.oldTA = null;
      }

      // clear all selections
      selection.removeAllRanges();

      // Text area stuff. If oldTA is still around that means we had a
      // highlighted region which we just cleared and now we're going to
      // jump back to where we were. The cursor was before our lookup if
      // oldCaret is less than 0 it means we clicked outside the box and
      // shoudln't come back.
      if (translationData.oldTA && translationData.oldCaret >= 0) {
        translationData.oldTA.selectionEnd = translationDdata.oldCaret;
        translationData.oldTA.selectionStart = translationData.oldTA.selectionEnd;
      }
  }

  translationData.prevSelView = null;
  translationData.kanjiChar = null;
  translationData.selText = null;
};

rikaitan.getTotalOffset = function(parent, tNode, offset) {
  var firstChild = parent.firstChild;
  var realOffset = offset;
  if (firstChild == tNode) {
    return offset;
  }
  do {
    var val = 0;
    if (firstChild.nodeName = "BR") {
      val = 1;
    } else {
      val = (firstChild.data ? firstChild.data.length : 0);
    }
  
    realOffset += val;
  
  } while ((firstChild = firstChild.nextSibling) != tNode);

  return realOffset;
};

rikaitan.isInline = function(node) {
  return this.inlineNames.hasOwnProperty(node.nodeName) ||
    document.defaultView.getComputedStyle(node,null).getPropertyValue('display') == 
    'inline' || document.defaultView.getComputedStyle(node,null).getPropertyValue('display') == 
    'inline-block';
};

rikaitan.isVisible = function() {
  var popup = document.getElementById('rikaichan-window');
  return (popup) && (popup.style.display != 'none');
};

rikaitan.show = function(translationData, dictOption) {
  var rangeStart = translationData.prevRangeNode;
  var rangeOffset = translationData.prevRangeOfs + translationData.uofs;
  var u;
	
  translationData.uofsNext = 1;

  if (!rangeStart && rikaitan.showingMinihelp === false) {
    this.clearHighlight();
    this.hidePopup();
    return 0;
  }

  if ((rangeOffset < 0) || (rangeOffset >= rangeStart.data.length) && 
    rikaitan.showingMinihelp === false) {
      this.clearHighlight();
      this.hidePopup();
      return 0;
  }

  // If we have '   XYZ', where whitespace is compressed, X never seems
  // to get selected
  while (((u = rangeStart.data.charCodeAt(rangeOffset)) == 32) || (u == 9) || 
    (u == 10)) {
      ++rangeOffset;
      if (rangeOffset >= rangeStart.data.length && rikaitan.showingMinihelp ===
        false) {
          this.clearHighlight();
          this.hidePopup();
          return 0;
      }
  }

  if ((isNaN(u)) || ((u != 0x25CB) && ((u < 0x3001) || (u > 0x30FF)) &&	 
    ((u < 0x3400) || (u > 0x9FFF)) && ((u < 0xF900) || (u > 0xFAFF)) &&
    ((u < 0xFF10) || (u > 0xFF9D))) && rikaitan.showingMinihelp === false) {
      this.clearHighlight();
      this.hidePopup();
      return -2;
  }

  // selection end data
  var selEndList = [];
  var text = this.getTextFromRange(rangeStart, rangeOffset, selEndList, 13);

  rikaitan.lastSelEnd = selEndList;
  rikaitan.lastRo = rangeOffset;
  rikaitan.lastTdata = translationData;

  var textData = {'text':text, 'dictOption':dictOption};
  safari.self.tab.dispatchMessage("xsearch", textData);	

  return 1; 
};

rikaitan.showTitle = function(translationData) {
  safari.self.tab.dispatchMessage("translate", translationData.title);
};

rikaitan.getContentType = function(tDoc) {
  var m = tDoc.getElementsByTagName('meta');
  for(var i in m) {
    if (m[i].httpEquiv == 'Content-Type') {
      var con = m[i].content;
      con = con.split(';');
      return con[0];
    }
  }
  return null;
};

rikaitan.showPopup = function(text, elem, x, y, looseWidth) {
  var topdoc = window.document;

  var textStr = text.toString();
  if (textStr.indexOf("Rikaitan enabled!") > -1) {
    rikaitan.showingMinihelp = true;
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
      function (event) { rikaitan.hidePopup(); event.stopPropagation(); }, true);
  }

  popup.style.width = 'auto';
  popup.style.height = 'auto';
  popup.style.maxWidth = (looseWidth ? '' : '600px');
  popup.style.opacity = window.rikaichan.config.opacity / 100;

  if (rikaitan.getContentType(topdoc) == 'text/plain') {
  var df = document.createDocumentFragment();
  df.appendChild(document.createElementNS('http://www.w3.org/1999/xhtml', 'span'));
  df.firstChild.innerHTML = text;

    while (popup.firstChild) {
      popup.removeChild(popup.firstChild);
    }
    popup.appendChild(df.firstChild);
  } else {
    popup.innerHTML = text;
  }

  if (elem) {
    popup.style.top = '-1000px';
    popup.style.left = '0px';
    popup.style.display = '';

    var bbo = window;
    var popupWidth = popup.offsetWidth;
    var popupHeight = popup.offsetHeight;

    // guess!
    if (popupWidth <= 0) {
      popupWidth = 200;
    }
    if (popupHeight <= 0) {
      popupHeight = 0;
      var j = 0;
      while ((j = text.indexOf('<br/>', j)) != -1) {
        j += 5;
        popupHeight += 22;
      }
      popupHeight += 25;
    }

    if (this.altView == 1) {
      x = window.scrollX;
      y = window.scrollY;
    } else if (this.altView == 2) {
      x = (window.innerWidth - (popupWidth + 20)) + window.scrollX;
      y = (window.innerHeight - (popupHeight + 20)) + window.scrollY;
    } else {
      // go left if necessary
      if ((x + popupWidth) > (window.innerWidth - 20)) {
        x = (window.innerWidth - popupWidth) - 20;
        if (x < 0) x = 0;
      }

      // below the mouse
      var v = 25;

      // under the popup title
      if ((elem.title) && (elem.title != '')) {
        v += 20;
      }
      // go up if necessary
      else { 
        y += v;
      }
      x += window.scrollX;
      y += window.scrollY;
    }
  } else {
    x += window.scrollX;
    y += window.scrollY;
  }

  popup.style.left = x + 'px';
  popup.style.top = y + 'px';
  popup.style.display = '';
};

rikaitan.hidePopup = function() {
  if (!this.superStickyMode || this.hideInStickyMode) {
    this.hideInStickyMode = false;
    var popup = document.getElementById('rikaichan-window');
    if (popup) {
      popup.style.display = 'none';
      popup.innerHTML = '';
    }
    this.title = null;
  }
};

rikaitan.unicodeInfo = function(c) {
  hex = '0123456789ABCDEF';
  u = c.charCodeAt(0);
  return c + 'U' + hex[(u >>> 12) & 15] + hex[(u >>> 8) & 15] + 
    hex[(u >>> 4) & 15] + hex[(u & 15)];
};

rikaitan.getInlineText = function(node, selEndList, maxLength, xpathExpr) {
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
};

rikaitan.getNext = function(node) {
  var nextNode;

  if ((nextNode = node.nextSibling) != null) {
    return nextNode;
  }
  if (((nextNode = node.parentNode) != null) && this.isInline(nextNode)) {
    return this.getNext(nextNode);
  }
  return null;
};

rikaitan.getTextFromRange = function(rangeParent, offset, selEndList, maxLength) {
  if(rangeParent.nodeName == 'textarea' || rangeParent.nodeName == 'INPUT') {
    var endIndex = Math.min(rangeParent.data.length, offset + maxLength);
    return rangeParent.nodeValue.substring(offset, endIndex);
  }

  var text = '';

  var xpathExpr = rangeParent.ownerDocument.createExpression(rikaitan.textNodeExpr, null);

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
};

rikaitan.sanseidoProcess = function(entry) {
  rikaitan.lastFound = [entry];
  rikaitan.sanseidoSearch();
}

rikaitan.processEntry = function(entry) {
  var translationData = window.rikaichan;
  var rangeOffset = rikaitan.lastRo;
  var selEndList = rikaitan.lastSelEnd;

  if (!entry && rikaitan.showingMinihelp == false) {
    rikaitan.clearHighlight();
    rikaitan.hidePopup();
    return -1;
  }

  if (entry && (translationData.uofsNext !== 'undefined')) {
    if (!entry.matchLen) {
      entry.matchLen = 1;
    }
    translationData.uofsNext = entry.matchLen;
    translationData.uofs = (rangeOffset - translationData.prevRangeOfs);
    var rp = translationData.prevRangeNode;

    // don't try to highlight form elements
    if ((rp) && ((translationData.config.highlight == 'true' && !this.mDown && 
      !('form' in translationData.prevTarget))  ||  
      (('form' in translationData.prevTarget) && translationData.config.textboxhl 
      == 'true'))) {
        var doc = rp.ownerDocument;

        if (!doc && rikaitan.showingMinihelp == false) {
          rikaitan.clearHighlight();
          rikaitan.hidePopup();
          return 0;
        }
        rikaitan.highlightMatch(doc, rp, rangeOffset, entry.matchLen, selEndList, 
          translationData);
        translationData.prevSelView = doc.defaultView;
    }

    safari.self.tab.dispatchMessage("makehtml", entry);
  }
};

rikaitan.processHtml = function(html) {
  if (window === window.top) {
    if (!this.superStickyMode || this.showInStickyMode) {
      var translationData = window.rikaichan;
      this.showInStickyMode = false;
      rikaitan.showPopup(html, translationData.prevTarget, translationData.popX, 
        translationData.popY, false);
      return 1;
    }
  }
};

rikaitan.highlightMatch = function(doc, rp, ro, matchLen, selEndList, tdata) {
  var sel = doc.defaultView.getSelection();

  // If selEndList is empty then we're dealing with a textarea/input situation
  if (selEndList.length === 0) { 
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
};

rikaitan.processTitle = function(e) {
  var tdata = window.rikaichan;
  if (!e) {
    rikaitan.hidePopup();
    return;
  }
  e.title = tdata.title.substr(0, e.textLen).replace(/[\x00-\xff]/g, 
    function (c) { 
      return '&#' + c.charCodeAt(0) + ';' 
    } 
  );
  if (tdata.title.length > e.textLen) {
    e.title += '...';
  }

  this.lastFound = [e];

  safari.self.tab.dispatchMessage("makehtml", e);
};

rikaitan.getFirstTextChild = function(node) {
	return document.evaluate('descendant::text()[not(parent::rp) and not(ancestor::rt)]',
						node, null, XPathResult.ANY_TYPE, null).iterateNext();
};

rikaitan.superSticky = function() {
  this.superStickyMode = !this.superStickyMode;
  if (this.superStickyMode == true) {
    this.showPopup("Super-sticky mode enabled");
  } else {
    this.showPopup("Super-sticky mode disabled");
  }
};

rikaitan.initialStickyPopup = function() {
  if (this.superStickyMode) {
    this.showInStickyMode = true;
  }
};

//function to flip the boolean showPopups variable so the extension will or 
//won't display popups
rikaitan.flipNoShow = function() {
  if (this.showPopups) {
    this.showPopups = false;
  } else {
    this.showPopups = true;
  }
};

rikaitan.sanseidoSearch = function() {
  var searchTerm;

  if (this.sanseidoState == 0) {
    searchTerm = this.getSearchTerm(false);
  } else if (this.sanseidoState == 1) {
    searchTerm = this.getSearchTerm(true);
  }

  if (!searchTerm) {
    return;
  }

  if ((this.sanseidoState == 0) && !this.containsKanji(searchTerm)) {
    this.sanseidoState = 1;
  }
  
  if (this.lastTdata != null && this.lastFound != null) {
    rikaitan.showPopup("Searching...", null, this.lastTdata.popX, 
      this.lastTdata.popY, false);

    safari.self.tab.dispatchMessage("searchReq", searchTerm);
  }
};

rikaitan.getSearchTerm = function(getReading) {
  var entry = this.lastFound;
  var searchTerm = "";

  if ((!entry) || (entry.length == 0)) {
    return null;
  }

  if (entry[0] && entry[0].kanji && entry[0].onkun) {
    searchTerm = entry[0].kanji;
  } else if (entry[0] && entry[0].data[0]) {
    var entryData = entry[0].data[0][0].match(/^(.+?)\s+(?:\[(.*?)\])?\s*\/(.+)\//);
    if (getReading) {
      if (entryData[1]) {
        searchTerm = entryData[1];
        this.termLen = searchTerm.length;
      } else {
        searchTerm = entryData[2];
        this.termLen = searchTerm.length;
      }
    } else {
      if (entryData[2] && !this.containsKanji(entry[0].data[0][0])) {
        searchTerm = entryData[2];
        this.termLen = searchTerm.length;
      } else {
        searchTerm = entryData[1];
        this.termLen = searchTerm.length;
      }
    }
  } else {
    return null;
  }

  return searchTerm;
};

rikaitan.parse = function(entryPageText) {
  var domPars = rikaitan.parseHtml(entryPageText);
  var divList = domPars.getElementsByTagName("div");
  var entryFound = false;

  if (rikaitan.lastFound == null) {
    return;
  }

  for (divIdx = 0; divIdx < divList.length; divIdx++) {
    if (divList[divIdx].className == "NetDicBody") {
      entryFound = true;

      var defText = "";
      var childList = divList[divIdx].childNodes;
      var defFinished = false;
      for (nodeIdx = 0; nodeIdx < childList.length && !defFinished; nodeIdx++) {
        if (childList[nodeIdx].nodeName === "b") {
          if (childList[nodeIdx].childNodes.length == 1) {
            var defNum = childList[nodeIdx].childNodes[0].nodeValue.match(
              /［([１２３４５６７８９０])］+/);
            if (defNum !== null) {
              defText += "<br/>" + RegExp.$1;
            } else {
            var subDefNum = childList[nodeIdx].childNodes[0].nodeValue.match(
                /（[１２３４５６７８９０]）+/);
              if (subDefNum) {
                defText += this.convertIntegerToCircledNumStr(
                  rikaitan.convertJpNumtoInt(subDefNum[0]));
              }
            }
          } else {
            for (bIdx = 0; bIdx < childList[nodeIdx].childNodes.length; bIdx++) {
              if (childList[nodeIdx].childNodes[bIdx].nodeName == "span") {
                defFinished = true;
              }
            }
          }
        }

        if (defFinished) {
          break;
        }

        if ((childList[nodeIdx].nodeName == "#text") && 
        (this.trim(childList[nodeIdx].nodeValue) != "")) {
          defText += childList[nodeIdx].nodeValue;
        }
      }

      if (defText.length == 0) {
        this.sanseidoState = 1;
        entryFound = false;
        break;
      }

      var jdicCode = "";
      var code = rikaitan.lastFound[0].data[0][0].match(/\/(\(.+?\)).+\//);

      if (RegExp.$1) {
        jdicCode = RegExp.$1;
      }
      rikaitan.lastFound[0].data[0][0] = rikaitan.lastFound[0].data[0][0]
        .replace(/\/.+\//g, "/" + jdicCode + defText + "/");
      rikaitan.lastFound[0].data = [rikaitan.lastFound[0].data[0]];
      rikaitan.lastFound[0].more = false;

      if (rikaitan.lastTdata !== null) {
        var rp = rikaitan.lastTdata.prevRangeNode;
        var doc = rp.ownerDocument;
        var ro = this.lastRo;
        var selEndList = rikaitan.lastSelEnd;
        rikaitan.highlightMatch(doc, rp, ro, this.termLen, selEndList,
          this.lastTdata);
        safari.self.tab.dispatchMessage("sanseidohtml", rikaitan.lastFound[0]);

        break;
      }
    }
  }
  
  if (!entryFound) {
    this.sanseidoState++;

    if (this.sanseidoState < 2) {
      window.setTimeout (
        function() {
          rikaitan.sanseidoSearch();
        }, 10); 
    } else {
      this.sanseidoState = 0;
      safari.self.tab.dispatchMessage("makehtml", rikaitan.lastFound[0]);
    }
  }
}

rikaitan.parseHtml = function(htmlString) {
  var html = document.implementation.createDocument("http://www.w3.org/1999/xhtml",
    "html", null);
  var body = document.createElementNS("http://www.w3.org/1999/xhtml", "body");
  var parser = new DOMParser();
  var stuff = parser.parseFromString(htmlString, "text/html");

  html.documentElement.appendChild(body);
  body.appendChild(stuff.body);

  return body;
};

rikaitan.convertIntegerToCircledNumStr = function(num) {
  var circledNumStr = "(" + num + ")";

  if (num == 0) {
    circledNumStr = "⓪";
  } else if ((num >= 1) && (num <= 20)) {
    circledNumStr = String.fromCharCode(("①".charCodeAt(0) - 1) + num);
  } else if ((num >= 21) && (num <= 35)) {
    circledNumStr = String.fromCharCode(("㉑".charCodeAt(0) - 1) + num);
  } else if ((num >= 36) && (num <= 50)) {
    circledNumStr = String.fromCharCode(("㊱".charCodeAt(0) - 1) + num);
  }

  return circledNumStr;
};

rikaitan.convertJpNumtoInt = function(jpNum) {
  var numStr = "";
  for (i = 0; i < jpNum.length; i++) {
    if ((jpNum[i] >= "０") && (jpNum[i] <= "９")) {
      var convertedNum = (jpNum[i].charCodeAt(0) - "０".charCodeAt(0));
      numStr += convertedNum;
    } 
  }
  return Number(numStr);
};

rikaitan.trim = function(text) {
	return text.replace(/^\s\s*/, "").replace(/\s\s*$/, "");
};

rikaitan.trimEnd = function(text) {
	return text.replace(/\s\s*$/, "");
};

rikaitan.containsKanji = function(text) {
  for (i = 0; i < text.length; i++) {
    if ((text[i] >= '\u4E00') && (text[i] <= '\u9FBF')) {
      return true;
    }
  }
}

safari.self.addEventListener("message", rikaitan.getMessage, false);