$(function(){function e(){var e="";return window.getSelection?e=window.getSelection().toString():document.selection&&document.selection.type!="Control"&&(e=document.selection.createRange().text),e}$("body").on("click",".ui-page-active .menu",function(){console.log("clickMenu"),$(".ui-page-active .menu-panel").panel("toggle")}),$("body").on("click",".ui-page-active .seting",function(){$(".ui-page-active .seting-panel").panel("toggle")}),$("body").on("swipeleft swiperight","[data-role='page']",function(t){e()||(t.type==="swipeleft"?$(".menu-panel").panel("close"):t.type==="swiperight"&&($(".menu-panel").panel("open"),$(".search").select()))}),window.require&&$("#seting").click(function(){return require("nw.gui").Window.get().showDevTools(),!1}),$(document).on("pagecontainerchange",function(){var e=$(".ui-page-active").jqmData("title");console.log("pagecontainerchange by "+e),$("[data-role='header'] h1").text("Anda-Stock"+(e=="Anda-Stock"?"":"#"+e)),$(".menu-panel [data-role='listview'] a.ui-btn-active").removeClass("ui-btn-active"),$(".menu-panel [data-role='listview'] a").each(function(){$(this).text()===e&&$(this).addClass("ui-btn-active")}),$(".ui-page-active").attr("inited")==undefined&&($(".ui-page-active").attr("inited",!0),e=="ชนิดสินค้า"?app.initProduct():e=="สินค้าเข้า"&&app.initImportProduct())}),$(document).on("pagecontainerchange","Report.html",function(){alert("Report.html")})})