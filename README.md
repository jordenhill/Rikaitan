Rikaitan (v. 1.8.3)
==========

About
----------

This is a version of the rikai (rikaichan, rikaisama, rikaikun) Japanese translation extension, which has been created for the Safari browser. When activated, simply place your cursor over Japanese words to display their dictionary definitions in a popup.

![Rikaitan Example Shot](https://github.com/jordenhill/Rikaitan/blob/master/Example%20Shot.png)


Download and Installation
----------

You can download and install the latest version of the extension from Apple's Safari extension page, or you can download the extension [here](https://github.com/jordenhill/Rikaitan/releases/download/v1.8/rikaitan.safariextz).

When clicking this the extension should be downloaded to the folder where you keep your safari downloads. From there click the extension and it should install.



Change Log
----------
**Version 1.8.3:** Fixed misspelled initialStickyPopup for 'b' key case, causing b key to not function properly.


**Version 1.8.2 (11/17/2014):** More console console error messages reported, removed messages for user version to prevent intrusiveness.

**Version 1.8.1 (11/4/2014):** Had some console messages that weren't removed, which could be an annoyance to users who see the console. I've removed them.

**Version 1.8 (9/6/2014):** Added a feature to display the frequency of a word. Based on a word frequency database obtained from Rikaisama, by Christopher Brochtrup. Green is very common, gold is common, orange is uncommon, and pink is rare.

**Version 1.70.8 (9/3/2014):** Issued a fix to the extension not disabling when toolbar button is clicked.

Issues or Suggestions
----------
If you run into any problems with the extension, or would like to suggest a new idea or improvement, please add to the list of issues [here](http://github.com/jordenhill/Rikaitan/issues), or email me at jhill4756@gmail.com.

Files
----------

The css folder contains the css files that alter the appearance of the popup boxess and the text within.They currently come in black, blue, light blue, translucent black, white, and yellow. 

global.html is the global page of the extension. It is primarily the "back end" of the extension, loading to and from the dictionaries and settings, determining if the extension was activated or deactivated, if the user changed tabs in their browser, etc., and sending messages to rikaitan.js accordingly.

rikaitan.js is primarily the "front end" of the extension, taking the data as the user gets them, sending it to global.html, and processing it in a visual form for the user. 

The data folder contains database files for kanji, words, names, etc.

License
----------
Rikaitan
Copyright (C) 2014 Jorden Hill

Based on Rikaikun  <br />
Copyright (C) 2010 Erek Speed <br />
http://code.google.com/p/rikaikun/ <br />

Uses concepts and data from Rikaisama <br />
Christopher Brochtrup <br />
cb4960@gmail.com <br />
http://rikaisama.sourceforge.net/ <br />

Originally based on Rikaichan 1.07 <br />
by Jonathan Zarate <br />
http://www.polarcloud.com/ <br />

Originally based on RikaiXUL 0.4 by Todd Rudick <br />
http://www.rikai.com/ <br />
http://rikaixul.mozdev.org/ <br />

This program is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation; either version 2 of the License, or
(at your option) any later version.
This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.
You should have received a copy of the GNU General Public License
along with this program; if not, write to the Free Software
Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA

Please do not change or remove any of the copyrights or links to web pages
when modifying any of the files. - Jon
