// ==UserScript==
// @name        Stig's Art Grabr
// @namespace   dk.rockland.userscript.misc.artgrab
// @description Grabbing big high resolution album cover-art from various sites
// @version     2017.11.01.0
// @author      Stig Nygaard, http://www.rockland.dk
// @homepageURL http://www.rockland.dk/userscript/misc/artgrab/
// @supportURL  http://www.rockland.dk/userscript/misc/artgrab/
// @match       *://*.allmusic.com/*
// @match       *://*.bandcamp.com/*
// @match       *://*.itunes.apple.com/*
// @match       *://*.musicdiner.com/*
// @match       *://*.fnd.io/*
// @match       *://labs.stephenou.com/itunes/*
// @match       *://*.last.fm/*
// @match       *://*.lastfm.de/*
// @match       *://*.lastfm.es/*
// @match       *://*.lastfm.fr/*
// @match       *://*.lastfm.it/*
// @match       *://*.lastfm.ja/*
// @match       *://*.lastfm.pl/*
// @match       *://*.lastfm.pt/*
// @match       *://*.lastfm.ru/*
// @match       *://*.lastfm.sv/*
// @match       *://*.lastfm.tr/*
// @match       *://*.lastfm.zh/*
// @match       *://*.musicbrainz.org/*
// @match       *://*.soundcloud.com/*
// @match       *://play.google.com/*
// @match       *://*.45cat.com/*
// @match       *://*.amazon.com/*
// @match       *://*.amazon.co.uk/*
// @match       *://*.amazon.ca/*
// @match       *://*.amazon.co.jp/*
// @match       *://*.amazon.com.au/*
// @match       *://*.amazon.com.br/*
// @match       *://*.amazon.com.mx/*
// @match       *://*.amazon.com.sa/*
// @match       *://*.amazon.cn/*
// @match       *://*.amazon.de/*
// @match       *://*.amazon.es/*
// @match       *://*.amazon.fr/*
// @match       *://*.amazon.in/*
// @match       *://*.amazon.it/*
// @match       *://*.amazon.nl/*
// @match       *://*.amazon.pk/*
// @match       *://*.cdbaby.com/*
// @match       *://*.jamendo.com/*
// @match       *://*.magnatune.com/*
// @grant       GM_registerMenuCommand
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM_getResourceURL
// @require     https://greasyfork.org/scripts/34527/code/GMCommonAPI.js?version=227517
// @resource    cmImage https://images1-focus-opensocial.googleusercontent.com/gadgets/proxy?url=http%3A%2F%2Fwww.rockland.dk%2Fimg%2FgrabrGM4.png&container=focus&resize_w=854&refresh=10000
// @noframes
// ==/UserScript==


/*
 *      Stig's Art Grabr is an userscript and/or bookmarklet for grabbing big high resolution
 *      album cover-art from various sites.
 *
 *      https://greasyfork.org/scripts/20771-stig-s-art-grabr
 *      https://github.com/StigNygaard/Stigs_Art_Grabr
 *
 *      Partly based on tips at http://wiki.musicbrainz.org/User:Nikki/CAA and on itunes tip
 *      from MusicBrainz/GitHub/GreasyFork user jesus2099 who has made a lot of userscripts
 *      (especially for MusicBrainz users): https://greasyfork.org/users/2206-jesus2099
 *
 *      To run this script as a bookmarklet (running latest GreasyFork hosted version), use:
 *      javascript:(function(){document.body.appendChild(document.createElement("script")).src="https://greasyfork.org/scripts/20771/code/StigsArtGrabr.js?t="+(new Date()).getTime();}())
 *
 *      NOTICE:
 *      1)  On iTunes Stig's Art Grabr only works when used as a userscript, not when used as
 *          a bookmarklet.
 *      2)  When using the userscript with Greasemonkey 4, you use the right-click context menu
 *          on webpage to search for big cover art. With other userscript managers, look in the
 *          dropdown menu on the managers toolbar icon.
 */

// CHANGELOG - The most important updates/versions:
let changelog = [
    {version: '2017.11.01.0', description: 'Run-once info for Firefox users about the right-click context menu and Greasemonkey 4.'},
    {version: '2017.10.29.0', description: 'Using my new GM Common API for Greasemonkey 4 WebExtension compatibility (For setting menu-items).'},
    {version: '2017.10.14.0', description: 'Fix for iTunes. Optimizing HTML5 contextmenu (Currently only supported in Firefox). Also adding changelog to menu.'},
    {version: '2017.10.09.0', description: 'Adding HTML5 contextmenu (Currently only supported in Firefox). Handy for the upcoming new Greasemonkey 4 WebExtension which probably won\'t support the normal userscript commands menu.'},
    {version: '2017.08.01.1', description: 'Nothing new. Just moving development source to a GitHub repository: https://github.com/StigNygaard/Stigs_Art_Grabr'},
    {version: '2017.06.26.1', description: 'Currently grabbing covers directly from the iTunes website doesn\'t work when using Stig\'s Art Grabr as a *bookmarklet*. It does however still works with script installed and used as a *userscript*. Also grabbing iTunes covers indirectly via musicdiner.com, fnd.io and labs.stephenou.com/itunes should work both ways.'},
    {version: '2017.06.23.0', description: 'Once again adapting to iTunes site changes. But fnd.io, stephenou.com/itunes and musicdiner.com also works for itunes cover art...'},
    {version: '2016.11.21.0', description: 'Quick fix to adapt to iTunes changes. Will try to fix fnd.io, stephenou.com and musicdiner.com later...'},
    {version: '2016.09.25.0', description: 'Better last.fm support (Some image files was not converted before but are now).'},
    {version: '2016.07.01.0', description: 'Improved itunes support (most often higher resolution), thanks to tip from jesus2099. Also similar improved support for itunes searchengines on fnd.io, musicdiner.com and labs.stephenou.com/itunes.'},
    {version: '2016.06.22.1', description: 'Re-adding musicdiner.com (service wasn\'t actually gone as I thought).'},
    {version: '2016.06.21.6', description: 'Preparing it to be able to run as a bookmarklet too...'},
    {version: '2016.06.20.0', description: '1st official release version.'},
    {version: '2016.06.19.1', description: 'Updated/fixed support for last.fm and bandcamp. Musicdiner is gone, but support for fnd.io and labs.stephenou.com/itunes added instead.'},
    {version: '2016.06.19.0', description: 'First userscript version (Converted from my old BCA bookmarklet).'}
];

function runGrabr() {
    let DEBUG = false;
    let log = function(s) {
        if (DEBUG && window.console) {
            window.console.log(s);
        }
    };
    // [ page pattern, search for img patterns, replace this, with this ]
    let a = [[/45cat\./, /-s\.jpg/i, /-s\.jpg/gi, ".jpg"],
        [/45cat\./, /-s\.png/i, /-s\.png/gi, ".png"],
        [/allmusic\./, /\/JPG_\d{3}\//i, /\/JPG_\d{3}\//gi, "/JPG_1080/"],
        [/amazon\./, /\._[A-Z]{2}\d{3}_[\w_,-]*\.jpg/i, /\._[A-Z]{2}\d{3}_[\w_,-]*\.jpg/gi, ".jpg"],
        [/amazon\./, /\._[A-Z]{2}\d{3}_[\w_,-]*\.png/i, /\._[A-Z]{2}\d{3}_[\w_,-]*\.png/gi, ".png"],
        [/bandcamp\./, /_\d{1,2}\.jpg/i, /_\d{1,2}\.jpg/gi, "_0.jpg"],
        [/bandcamp\./, /_\d{1,2}\.png/i, /_\d{1,2}\.png/gi, "_0.png"],
        [/cdbaby\./, /images\..*_small\.[jpgn]{3}/i, /_small\./gi, "."],
        [/cdbaby\./, /images\..*\.jpg/i, /\.jpg/gi, "_large.jpg"],
        [/cdbaby\./, /images\..*\.png/i, /\.png/gi, "_large.png"],
        [/fnd\.io/, /\/\d{2,}x\d{2,}bb/i, /\/\d{2,}x\d{2,}bb/gi, "/999999x999999bb-100"],
        //[/itunes\.apple\./, /1\d0x1\d0\./i, /^(.*\/\/)\w+(\d+.mzstatic.com)\/\w+\/\w+\/(\w+\/\w+\/\w+\/\w+\/\w+\/[\w-]+)\/cover\d+x\d+.jpeg$/i, "$1is$2/image/thumb/$3/source/999999x999999bb-100.jpg"], // replace regexp from jesus2099
        //[/itunes\.apple\./, /1\d0x1\d0bb\.jpg/i, /\/source\/\d+x\d+bb\.jpg/i, "/source/999999x999999bb-100.jpg"], // fix 2016-11-21
        //[/itunes\.apple\./, /\d{2,}x\d+\w+\.jpe?g/i, /\/source\/\d+x\d+\w+\.jpe?g/i, "/source/999999x999999bb-100.jpg"], // fix 2017-06-23
        [/itunes\.apple\./, /\/\d+x\d+w?\.jpe?g$/i, /\/\d+x\d+w?\.jpe?g$/i, "/999999x999999bb-100.jpg"], // fix 2017-10-14
        [/jamendo\./, /1\.\d00\.jpg/i, /1\.\d00\.jpg/gi, "1.0.jpg"],
        [/jamendo\./, /1\.\d00\.png/i, /1\.\d00\.png/gi, "1.0.png"],
        [/labs\.stephenou\.com/, /\/\d{2,3}x\d{2,3}bb/i, /\/\d{2,3}x\d{2,3}bb/gi, "/999999x999999bb-100"],
        [/last(fm)?\.[a-z]{2,3}/, /\.lst\.fm\/i\/u\/[a-zA-Z]*\d{2,}\w*\//i, /\.lst\.fm\/i\/u\/[a-z]*\d{2,}\w*\//gi, ".lst.fm/i/u/"],
        [/last(fm)?\.[a-z]{2,3}/, /\.akamaized\.net\/i\/u\/[a-zA-Z]*\d{2,}\w*\//i, /\.akamaized\.net\/i\/u\/[a-z]*\d{2,}\w*\//gi, ".akamaized.net/i/u/"],
        [/magnatune\./, /cover_\d{2,3}\./i, /cover_\d{2,3}\./gi, "cover."],
        [/musicbrainz\.org/, /_thumb\d{3}\./i, /_thumb\d{3}\./gi, "."],
        [/musicbrainz\.org/, /-\d{3}\.jpg/i, /-\d{3}\.jpg/gi, ".jpg"],
        [/musicbrainz\.org/, /-\d{3}\.png/i, /-\d{3}\.png/gi, ".png"],
        [/musicdiner\./, /\/\d{2,3}x\d{2,3}bb/i, /\/\d{2,3}x\d{2,3}bb/gi, "/999999x999999bb-100"],
        [/soundcloud\./, /t\d\d0x\d\d0\./i, /t\d\d0x\d\d0\./gi, "original."],
        [/play\.google\.com/, /googleusercontent\.com.*\=w\d{3}/, /\=w\d{3}$/, "=w1200"]];
        /* https://affiliate.itunes.apple.com/resources/documentation/itunes-store-web-service-search-api/ */
    let aEv = function (e,ev,f,c) {
        c=(c)?c:false;
        if(e.addEventListener) {
            e.addEventListener(ev,f,c);
        } else if(e.attachEvent) {
            e.attachEvent("on"+ev,f);
        } else {
            e["on"+ev]=f;
        }
    };
    let w = null, n = 0, m = 20, d = document, i=0;
    // soundcloud pre-burner
    if (d.location.hostname.search(/soundcloud\./) > -1) {
        spans = document.querySelectorAll("span[style*=background-image]");
        for (i = 0; i < spans.length; i++) {
            if (spans[i].style.backgroundImage) {
                imgsrc = spans[i].style.backgroundImage.match(/url[\(\"\u0027]+([^\"\u0027\)]*)[\)\"\u0027]+/)[1];
                if ((spans[i].getElementsByTagName("img").length === 0) && (imgsrc.match(/t[\d]{3}x[\d]{3}\./) !== null)) {
                    spans[i].innerHTML = "<img src=\u0027" + imgsrc + "\u0027 alt=\u0027\u0027 style=\u0027width:200px;height:200px;border:none\u0027 />";
                }
            }
        }
    }
    // itunes (apple music) pre-burner
    if (d.location.hostname.search(/itunes\.apple\./) > -1) {
        imgs = document.querySelectorAll("picture>img");
        for (i = 0; i < imgs.length; i++) {
            imgs[i].style.maxWidth="300px";
            imgs[i].style.maxHeight="300px";
            imgs[i].parentNode.parentNode.replaceChild(imgs[i], imgs[i].parentNode);
        }
    }
    log('Activated while on ' + d.location.hostname);
    o:
    for (let v = 0; v < a.length; v++) {
        if (d.location.hostname.search(a[v][0]) > -1) {
            log('Running on ' + d.location.hostname);
            w = a[v];
            let l = d.getElementsByTagName("img");
            if (l) {
                log('Found ' + l.length + ' image tags');
                for (i = 0; i < l.length; i++) {
                    if ((l[i].src).search(w[1]) > -1) {
                        l[i].style.border = "1px #FB0 solid";
                        if (l[i].naturalWidth) {
                            l[i].onmouseover = function () {
                                this.title = "" + this.naturalWidth + "x" + this.naturalHeight;
                            };
                        }
                        aEv(l[i], "load", function () {
                            if (this.style) {
                                this.style.borderColor = "#F00";
                                if (this.naturalWidth && this.naturalWidth > 999) {
                                    this.style.borderWidth = "2px";
                                }
                            }
                        });
                        aEv(l[i], "click", function () {
                            if (this.src) {
                                window.location = this.src;
                            }
                        });
                        l[i].src = l[i].src.replace(w[2], w[3]);
                        n++;
                        if (n === m) {
                            if (confirm("" + n + " images requested. Continue?")) {
                                m = m + 20;
                            } else {
                                break o;
                            }
                        }
                    }
                }
            }
        }
    }
    if (w === null) {
        log('No hits found...');
    }
    return void(0);
}

function runOnceFirefox() {
    if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1 && GM_setValue && GM_getValue) { // Firefox med GM3 (On purpose using legacy GM_ functions here)
        if (!GM_getValue('shownGM4',false)) {
            let infobox = '<div id="infobox" style="position:fixed;left:0;right:0;top:8em;z-index:3000009;margin-left:auto;margin-right:auto;min-height:8em;width:50%;background-color:#fff;color:#111;border:3px #D00 solid;border-radius:5px;display:none;padding:1em"><b style="color:#D00"><em>Stig\'s Art Grabr</em> information - This is only shown once</b><div style="padding:1em 0 0 0"></div></div>';
            document.body.insertAdjacentHTML('beforeend', infobox);
            document.getElementById('infobox').addEventListener('click', function () {
                this.style.display = 'none';
                return false;
            }, false);
            let content = document.querySelector('div#infobox div');
            let info = '<p>In Firefox you can now access Art Grabr commands via the webpage\'s <em>context-menu</em> (right-click on the page).</p><p>If you are a Greasemonkey user, this will be the <em>only way</em> to access the Art Grabr commands from Greasemonkey <em>version 4</em>, which is expected to be released here in early November.</p><img style="max-width:100%;width:auto;height:auto" src="'+GM_getResourceURL('cmImage')+'" />';
            content.insertAdjacentHTML('beforeend', info);
            document.getElementById('infobox').style.display = 'block';
            GM_setValue('shownGM4',true);
        }
    }
}

function showGrabrLog() {
    document.getElementById('grabrlog').style.display = 'block';
}

if (typeof GM_info === 'object' || (typeof GM === 'object' && typeof GM.info === 'object')) {
    // Running as a userscript - setting up menu items...
    if (!document.getElementById('grabrlog')) {
        let gmw = '<div id="grabrlog" style="position:fixed;left:0;right:0;top:10em;z-index:3000009;margin-left:auto;margin-right:auto;min-height:8em;width:50%;background-color:#eee;color:#111;border-radius:5px;display:none;padding:1em"><b>Stig\'s Art Grabr changelog</b><ul></ul></div>';
        document.body.insertAdjacentHTML('beforeend',gmw);
        document.getElementById('grabrlog').addEventListener('click',function(){this.style.display = 'none';return false;}, false);
        let list = document.querySelector('div#grabrlog ul');
        let lcontent = '';
        for (i=0; i<Math.min(8,changelog.length); i++) {
            lcontent += '<li><i>'+changelog[i].version+'</i> - '+changelog[i].description+'</li>';
        }
        list.insertAdjacentHTML('beforeend', lcontent);
    }
    GMC.registerMenuCommand("Search big size cover art", runGrabr, "a");
    GMC.registerMenuCommand("Changelog", showGrabrLog, "l");

    runOnceFirefox(); // Temp! - For Firefox users likely using Greasemonkey 3.x
} else {
    // Started from bookmarklet!
    runGrabr();
}
