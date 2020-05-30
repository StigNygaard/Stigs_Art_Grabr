// ==UserScript==
// @name        Stig's Art Grabr
// @namespace   dk.rockland.userscript.misc.artgrab
// @description Grabbing big high resolution album cover-art from various sites
// @version     2020.05.30.0
// @author      Stig Nygaard, https://www.rockland.dk
// @homepageURL https://www.rockland.dk/userscript/misc/artgrab/
// @supportURL  https://www.rockland.dk/userscript/misc/artgrab/
// @match       *://*.allmusic.com/*
// @match       *://*.bandcamp.com/*
// @match       *://*.music.apple.com/*
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
// @match       *://*.deezer.com/*
// @match       *://*.qobuz.com/*
// @match       *://*.trackitdown.net/*
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
// @match       *://open.spotify.com/*
// @grant       GM_registerMenuCommand
// @require     https://greasyfork.org/scripts/34527/code/GMCommonAPI.js?version=237846
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
 *      Should work with all popular browsers and userscript managers. Compatibility with the new
 *      Greasemonkey 4 WebExtension and Firefox 57+ is done with the help of GM Common API:
 *
 *      https://github.com/StigNygaard/GMCommonAPI.js
 *      https://greasyfork.org/scripts/34527-gmcommonapi-js
 *
 *      To run this script as a bookmarklet (running latest GreasyFork hosted version), use:
 *      javascript:(function(){document.body.appendChild(document.createElement("script")).src="https://greasyfork.org/scripts/20771/code/StigsArtGrabr.js?t="+Date.now();}())
 *
 *      NOTICE:
 *      1)  On iTunes Stig's Art Grabr will with most webbrowsers only work when used as a
 *          userscript, and NOT when used as a bookmarklet (CSP restriction).
 *      2)  When using the userscript with Greasemonkey 4, you use the right-click context menu
 *          on webpage to search for big cover art. With other userscript managers, look in the
 *          dropdown menu on the managers toolbar icon.
 */

// CHANGELOG - The most important updates/versions:
let changelog = [
    {version: '2020.05.30.0', description: 'Adding partial support for open.spotify.com. On album-pages (regular albums, not playlists) it can typically replace 232X232 with 640x640pixels cover art. Thanks to kopytko95 for tip making this possible.'},
    {version: '2020.04.25.0', description: 'iTunes / Apple Music fix for updated site.'},
    {version: '2019.11.03.0', description: 'Last.FM fix. Mouseover and right-click should work again now.'},
    {version: '2019.10.26.0', description: 'Last.FM partial fix. Now again able to find fullsize images. But mouseover with dimensions might not show and sometimes image is "protected" behind a layer.'},
    {version: '2018.02.10.0', description: 'Adding support for Deezer, Qobuz and Trackitdown (All tested on public pages only). Big thanks to Anton Fedorov for tips making this possible.'},
    {version: '2017.06.26.1', description: 'Currently grabbing covers directly from the iTunes website doesn\'t work when using Stig\'s Art Grabr as a *bookmarklet*. It does however still works with script installed and used as a *userscript*. Also grabbing iTunes covers indirectly via musicdiner.com, fnd.io and labs.stephenou.com/itunes should work both ways.'},
    {version: '2016.06.20.0', description: '1st official release version.'},
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
        [/cdbaby\./, /cdbaby\.name\/.*_small\.[jpgn]{3}/i, /_small\./gi, "."],
        [/cdbaby\./, /cdbaby\.name\/.*\.jpg/i, /\.jpg/gi, "_large.jpg"],
        [/cdbaby\./, /cdbaby\.name\/.*\.png/i, /\.png/gi, "_large.png"],
        [/deezer\./, /images\/\w{5,9}\/.*\.[jpng]{3}/i, /\/\d{2,3}x\d{2,3}-0{6}-\d{1,2}-0-0\.[jpng]{3}/gi, "/1400x1400-000000-0-0-0.png"],
        [/fnd\.io/, /\/\d{2,}x\d{2,}bb/i, /\/\d{2,}x\d{2,}bb/gi, "/999999x999999bb-100"],
        //[/itunes\.apple\./, /1\d0x1\d0\./i, /^(.*\/\/)\w+(\d+.mzstatic.com)\/\w+\/\w+\/(\w+\/\w+\/\w+\/\w+\/\w+\/[\w-]+)\/cover\d+x\d+.jpeg$/i, "$1is$2/image/thumb/$3/source/999999x999999bb-100.jpg"], // replace regexp from jesus2099
        //[/itunes\.apple\./, /1\d0x1\d0bb\.jpg/i, /\/source\/\d+x\d+bb\.jpg/i, "/source/999999x999999bb-100.jpg"], // fix 2016-11-21
        //[/itunes\.apple\./, /\d{2,}x\d+\w+\.jpe?g/i, /\/source\/\d+x\d+\w+\.jpe?g/i, "/source/999999x999999bb-100.jpg"], // fix 2017-06-23
        //[/(music|itunes)\.apple\./, /\/\d+x\d+w?\.jpe?g$/i, /\/\d+x\d+w?\.jpe?g$/i, "/999999x999999bb-100.jpg"], // fix 2017-10-14 + 2019-06-02
        [/(music|itunes)\.apple\./, /\/\d+x\d+bb\.jpe?g$/i, /\/\d+x\d+bb\.jpe?g$/i, "/999999x999999bb-100.jpg"], // fix 2020-04-25
        [/jamendo\./, /1\.\d00\.jpg/i, /1\.\d00\.jpg/gi, "1.0.jpg"],
        [/jamendo\./, /1\.\d00\.png/i, /1\.\d00\.png/gi, "1.0.png"],
        [/labs\.stephenou\.com/, /\/\d{2,3}x\d{2,3}bb/i, /\/\d{2,3}x\d{2,3}bb/gi, "/999999x999999bb-100"],
        // [/last(fm)?\.[a-z]{2,3}/, /\.lst\.fm\/i\/u\/[a-zA-Z]*\d{2,}\w*\//i, /\.lst\.fm\/i\/u\/[a-z]*\d{2,}\w*\//gi, ".lst.fm/i/u/"],
        // [/last(fm)?\.[a-z]{2,3}/, /\.akamaized\.net\/i\/u\/[a-zA-Z]*\d{2,}\w*\//i, /\.akamaized\.net\/i\/u\/[a-z]*\d{2,}\w*\//gi, ".akamaized.net/i/u/"],
        [/last(fm)?\.[a-z]{2,3}/, /\.net\/i\/u\/[a-zA-Z]*\d{2,}\w*\//i, /\.net\/i\/u\/[a-z]*\d{2,}\w*\//gi, ".net/i/u/"], // fix 2019-10-26
        [/magnatune\./, /cover_\d{2,3}\./i, /cover_\d{2,3}\./gi, "cover."],
        [/musicbrainz\.org/, /_thumb\d{3}\./i, /_thumb\d{3}\./gi, "."],
        [/musicbrainz\.org/, /-\d{3}\.jpg/i, /-\d{3}\.jpg/gi, ".jpg"],
        [/musicbrainz\.org/, /-\d{3}\.png/i, /-\d{3}\.png/gi, ".png"],
        [/musicdiner\./, /\/\d{2,3}x\d{2,3}bb/i, /\/\d{2,3}x\d{2,3}bb/gi, "/999999x999999bb-100"],
        [/play\.google\.com/, /googleusercontent\.com.*\=w\d{3}/i, /\=w\d{3}$/gi, "=w1200"],
        [/qobuz\.com/, /static\.qobuz\.com\/images\/covers\//i, /_\d{2,3}\.jpg/gi, "_max.jpg"],
        [/trackitdown\.net/, /\.cloudfront.net\/graphics\//i, /__\w+\.png/gi, "_original.jpg"],
        [/soundcloud\./, /t\d\d0x\d\d0\./i, /t\d\d0x\d\d0\./gi, "original."],
        [/open\.spotify\.com/, /i\.scdn\.co\/image\/ab67616d0000/i, /ab67616d00001e02/gi, "ab67616d0000b273"]];
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
        let spans = document.querySelectorAll("span[style*=background-image]");
        for (i = 0; i < spans.length; i++) {
            if (spans[i].style.backgroundImage) {
                let imgsrc = spans[i].style.backgroundImage.match(/url[\(\"\u0027]+([^\"\u0027\)]*)[\)\"\u0027]+/)[1];
                if ((spans[i].getElementsByTagName("img").length === 0) && (imgsrc.match(/t[\d]{3}x[\d]{3}\./) !== null)) {
                    spans[i].innerHTML = "<img src=\u0027" + imgsrc + "\u0027 alt=\u0027\u0027 style=\u0027width:200px;height:200px;border:none\u0027 />";
                }
            }
        }
    }
    // itunes/apple music pre-burner
    if (d.location.hostname.search(/\.apple\./) > -1) {
        let overlays = document.querySelectorAll(".artwork-overlay, .lockup__controls, .lockup__contextual-menu-trigger");
        for (i = 0; i < overlays.length; i++) {
            overlays[i].parentNode.removeChild(overlays[i]);
        }
    }
    // deezer pre-burner
    if (d.location.hostname.search(/deezer\.com/) > -1) {
        let pics = document.querySelectorAll("figure.thumbnail>div.picture");
        for (i = 0; i < pics.length; i++) {
            pics[i].classList.remove('picture');
        }
    }
    // last.fm pre-burner
    if (d.location.hostname.search(/last(fm)?\.[a-z]{2,3}/) > -1) {
        let elms = document.querySelectorAll(('.album-overview-cover-art-actions'));
        for (i=0; i < elms.length; i++) {
            elms[i].parentNode.removeChild(elms[i]);
        }
        let imgs = document.querySelectorAll(('a.cover-art img, a.image-list-item img'));
        for (i=0; i < imgs.length; i++) {
            imgs[i].style.maxWidth="370px";
            imgs[i].style.maxHeight="370px";
            imgs[i].parentNode.parentNode.replaceChild(imgs[i], imgs[i].parentNode); // (newchild, oldchild)
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
                        // log(' - ' + l[i].currentSrc + ' . Includes ' + w[1] + '?: ' + ((l[i].currentSrc).search(w[1]) > -1) );
                        if ((l[i].currentSrc).search(w[1]) > -1) {
                            l[i].style.border = "1px #FB0 solid";
                            if (l[i].naturalWidth) {
                                // l[i].title = "just testing"; // adding dimemsions later on onload image?
                                // l[i].parentNode.title = "just testing parent"; // adding dimemsions later on onload image?
                                l[i].onmouseover = function () { // onmouseover via w3 metode. Eller på niveauet over og tage dimension på første img child???
                                    this.setAttribute("title", String(this.naturalWidth) + "x" + this.naturalHeight);
                                    this.setAttribute("data-title", String(this.naturalWidth) + "x" + this.naturalHeight);
                                    this.setAttribute("data-tooltip", String(this.naturalWidth) + "x" + this.naturalHeight);
                                };
                            }
                            aEv(l[i], "load", function () {
                                if (this.style) {
                                    this.style.borderColor = "#F00";
                                    if (this.naturalWidth && this.naturalWidth > 999) {
                                        this.style.borderWidth = "2px";
                                    }
                                }
                                // Sæt titles HER istedet !!!
                                // this.title = "Done loading: " + String(this.naturalWidth) + "x" + this.naturalHeight;
                                // this.parentNode.title = "Done loading: " + String(this.naturalWidth) + "x" + this.naturalHeight;
                            });
                            aEv(l[i], "click", function () {
                                if (this.currentSrc) {
                                    window.location = this.currentSrc;
                                }
                            });
                            l[i].src = l[i].currentSrc.replace(w[2], w[3]);
                            if (l[i].srcset) {
                                l[i].removeAttribute('srcset')
                            }
                            n++;
                            if (n === m) {
                                if (confirm(String(n) + " images requested. Continue?")) {
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
        for (let i=0; i<Math.min(8,changelog.length); i++) {
            lcontent += '<li><i>'+changelog[i].version+'</i> - '+changelog[i].description+'</li>';
        }
        list.insertAdjacentHTML('beforeend', lcontent);
    }
    GMC.registerMenuCommand("Search big size cover art", runGrabr, "a");
    GMC.registerMenuCommand("Changelog", showGrabrLog, "l");
} else {
    // Started from bookmarklet!
    runGrabr();
}
