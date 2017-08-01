// ==UserScript==
// @name        Stig's Art Grabr
// @namespace   dk.rockland.userscript.misc.artgrab
// @description Grabbing big high resolution album cover-art from various sites
// @version     2017.08.01.1
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
// @author      Stig Nygaard, http://www.rockland.dk
// @homepageURL http://www.rockland.dk/userscript/misc/artgrab/
// @supportURL  http://www.rockland.dk/userscript/misc/artgrab/
// @grant       GM_registerMenuCommand
// @noframes
// ==/UserScript==

// Partly based on tips at http://wiki.musicbrainz.org/User:Nikki/CAA and on itunes tip from
// MusicBrainz/GitHub/GreasyFork user jesus2099 who has made a lot of userscripts (especially
// for MusicBrainz users): https://greasyfork.org/users/2206-jesus2099

// To run this script as a bookmarklet (running latest GreasyFork hosted version), use:
// javascript:(function(){document.body.appendChild(document.createElement("script")).src="https://greasyfork.org/scripts/20771-stig-s-art-grabr/code/Stig's%20Art%20Grabr.user.js?t="+(new Date()).getTime();}())

// CHANGELOG - The most important updates/versions:
var changelog = [
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
    var DEBUG = false;
    var log = function(s) {
        if (DEBUG && window.console) {
            window.console.log(s);
        }
    };
    // [ page pattern, search for img patterns, replace this, with this ]
    var a = [[/45cat\./, /-s\.jpg/i, /-s\.jpg/gi, ".jpg"],
        [/45cat\./, /-s\.png/i, /-s\.png/gi, ".png"],
        [/allmusic\./, /\/JPG_\d{3}\//i, /\/JPG_\d{3}\//gi, "/JPG_1080/"],
        [/amazon\./, /\._[A-Z]{2}\d{3}_[\w_,-]*\.jpg/i, /\._[A-Z]{2}\d{3}_[\w_,-]*\.jpg/gi, ".jpg"],
        [/amazon\./, /\._[A-Z]{2}\d{3}_[\w_,-]*\.png/i, /\._[A-Z]{2}\d{3}_[\w_,-]*\.png/gi, ".png"],
        [/bandcamp\./, /_\d{1,2}\.jpg/i, /_\d{1,2}\.jpg/gi, "_0.jpg"],
        [/bandcamp\./, /_\d{1,2}\.png/i, /_\d{1,2}\.png/gi, "_0.png"],
        [/cdbaby\./, /images\..*_small\.[jpgn]{3}/i, /_small\./gi, "."],
        [/cdbaby\./, /images\..*\.jpg/i, /\.jpg/gi, "_large.jpg"],
        [/cdbaby\./, /images\..*\.png/i, /\.png/gi, "_large.png"],
        [/fnd\.io/, /\/\d{2,}x\d{2,}bb/i, /\/\d{2,}x\d{2,}bb/gi, "/99999999x99999999bb-100"],
        [/itunes\.apple\./, /1\d0x1\d0\./i, /^(.*\/\/)\w+(\d+.mzstatic.com)\/\w+\/\w+\/(\w+\/\w+\/\w+\/\w+\/\w+\/[\w-]+)\/cover\d+x\d+.jpeg$/i, "$1is$2/image/thumb/$3/source/99999999x99999999bb-100.jpg"], // replace regexp from jesus2099
        [/itunes\.apple\./, /1\d0x1\d0bb\.jpg/i, /\/source\/\d+x\d+bb\.jpg/i, "/source/99999999x99999999bb-100.jpg"], // fix 2016-11-21
        [/itunes\.apple\./, /\d{2,}x\d+\w+\.jpe?g/i, /\/source\/\d+x\d+\w+\.jpe?g/i, "/source/99999999x99999999bb-100.jpg"], // fix 2017-06-23
        [/jamendo\./, /1\.\d00\.jpg/i, /1\.\d00\.jpg/gi, "1.0.jpg"],
        [/jamendo\./, /1\.\d00\.png/i, /1\.\d00\.png/gi, "1.0.png"],
        [/labs\.stephenou\.com/, /\/\d{2,3}x\d{2,3}bb/i, /\/\d{2,3}x\d{2,3}bb/gi, "/99999999x99999999bb-100"],
        [/last(fm)?\.[a-z]{2,3}/, /\.lst\.fm\/i\/u\/[a-zA-Z]*\d{2,}\w*\//i, /\.lst\.fm\/i\/u\/[a-z]*\d{2,}\w*\//gi, ".lst.fm/i/u/"],
        [/last(fm)?\.[a-z]{2,3}/, /\.akamaized\.net\/i\/u\/[a-zA-Z]*\d{2,}\w*\//i, /\.akamaized\.net\/i\/u\/[a-z]*\d{2,}\w*\//gi, ".akamaized.net/i/u/"],
        [/magnatune\./, /cover_\d{2,3}\./i, /cover_\d{2,3}\./gi, "cover."],
        [/musicbrainz\.org/, /_thumb\d{3}\./i, /_thumb\d{3}\./gi, "."],
        [/musicbrainz\.org/, /-\d{3}\.jpg/i, /-\d{3}\.jpg/gi, ".jpg"],
        [/musicbrainz\.org/, /-\d{3}\.png/i, /-\d{3}\.png/gi, ".png"],
        [/musicdiner\./, /\/\d{2,3}x\d{2,3}bb/i, /\/\d{2,3}x\d{2,3}bb/gi, "/99999999x99999999bb-100"],
        [/soundcloud\./, /t\d\d0x\d\d0\./i, /t\d\d0x\d\d0\./gi, "original."],
        [/play\.google\.com/, /googleusercontent\.com.*\=w\d{3}/, /\=w\d{3}$/, "=w1200"]];
        /* https://affiliate.itunes.apple.com/resources/documentation/itunes-store-web-service-search-api/ */
    var aEv = function (e,ev,f,c) {
        c=(c)?c:false;
        if(e.addEventListener) {
            e.addEventListener(ev,f,c);
        } else if(e.attachEvent) {
            e.attachEvent("on"+ev,f);
        } else {
            e["on"+ev]=f;
        }
    };
    var w = null, n = 0, m = 20, d = document, i=0;
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
            imgs[i].style.maxWidth="200px";
            imgs[i].style.maxHeight="200px";
            imgs[i].parentNode.parentNode.replaceChild(imgs[i], imgs[i].parentNode);
        }
    }
    log('Activated while on ' + d.location.hostname);
    o:
    for (var v = 0; v < a.length; v++) {
        if (d.location.hostname.search(a[v][0]) > -1) {
            log('Running on ' + d.location.hostname);
            w = a[v];
            var l = d.getElementsByTagName("img");
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

if (typeof GM_registerMenuCommand === 'function') {
    // running as userscript - setting up menu item
    GM_registerMenuCommand("Search big size cover art", runGrabr, "a");
} else {
    // started from bookmarklet
    runGrabr();
}
