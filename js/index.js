$(function() {
	var canClick = true;
	//页面加载成功
	var imgDowns = false;
	var len = 0;
	var lens = 0;
	window.onload = function() {

		var img = $("body").find("img[loadsrc]"); //图片数组
		var length = img.length; //图片数量
		len += length;
		var downImgs = 0; //已下载数量
		var percent = 0; //百分比
		for(var i = 0; i < length; i++) {
			var imgs = new Image();
			var imgDiv = img.eq(i);
			var imgsrc = imgDiv.attr("loadsrc");
			imgs.src = imgsrc;
			if(imgs.complete) {
				imgDiv.attr("src", imgsrc).removeAttr("loadsrc"); //有缓存
				imgDown();
			} else {
				imgDiv.attr("src", imgsrc).load(function() {
					$(this).removeAttr("loadsrc"); //无缓存
					imgDown();
				})
			}
		}
		

		function imgDown() {
			downImgs++;
			lens++;
			downPercent();
			percent = parseInt(100 * downImgs / length);
			if(percent == 100) {
				$("#audio")[0].play();
				imgDowns = true;
				downOk();
			}
		}

		function downOk() {
			if(imgDowns) {
				$(".loading").hide();
				$(".page1").show();
			}
		}

		function downPercent() {
			$(".loading_tips span").html(parseInt(100 * downImgs / length) + "%");
			$(".loading_jindu").width(parseInt(220 * lens / len));
		}
	}
	$(".page1_words1").on("tap", function() {
		if(canClick) {
			canClick = false;
			var index = $(".page1_words1").index(this);
			$(".light").eq(index).show();
			$(".page1_words2").eq(index).show();
			var timer = setTimeout(function() {
				clearTimeout(timer);
				timer = null;
				$(".hidden").hide();
				$(".detail").eq(index).show();
			}, 1000);
		}
	});
	$(".page1_words2").on("tap", function() {
		if(canClick) {
			canClick = false;
			var index = $(".page1_words2").index(this);
			var timer = setTimeout(function() {
				clearTimeout(timer);
				timer = null;
				$(".hidden").hide();
				$(".detail").eq(index).show();
			}, 1000);
		}
	});
	$(".light").on("tap", function() {
		if(canClick) {
			canClick = false;
			var index = $(".light").index(this);
			var timer = setTimeout(function() {
				clearTimeout(timer);
				timer = null;
				$(".hidden").hide();
				$(".detail").eq(index).show();
			}, 1000);
		}

	});
	$(".dark").on("tap", function() {
		if(canClick) {
			canClick = false;
			var index = $(".dark").index(this);
			$(".light").eq(index).show();
			$(".page1_words2").eq(index).show();
			var timer = setTimeout(function() {
				clearTimeout(timer);
				timer = null;
				$(".hidden").hide();
				$(".detail").eq(index).show();
			}, 1000);
		}

	});
	$(".page1_button1").on("tap", function() {
		$(".hidden").hide();
		$(".page7").show();
	});
	$(".page1_button2").on("tap", function() {
		$(".hidden").hide();
		$(".page10").show();
	});
	$(".button").on("tap", function() {
		$(".hidden").hide();
		$(".page1").show();
		canClick = true;
	});
	$(".page7_button1").on("tap", function() {
		$(".hidden").hide();
		$(".page8").show();
	});
	$(".page7_button2").on("tap", function() {
		$(".hidden").hide();
		$(".page9").show();
	});
	$(".page8_button").on("tap", function() {
		$(".page8_videoBg").show();
		$(".page8_play").show();
		$("#video1").css({
			"width": "0px",
			"height": "0px"
		});
		$("#video1")[0].pause();
		$("#audio")[0].play();
		$(".music").css({
			"background-position": "11px -44px"
		});
	});
	$("video").on("ended",function(e){
		
		alert(888);
	});
	$(".page9_button").on("tap", function() {
		$(".page9_videoBg").show();
		$(".page9_play").show();
		$("#video2").css({
			"width": "0px",
			"height": "0px"
		});
		$("#video2")[0].pause();
		$("#audio")[0].play();
		$(".music").css({
			"background-position": "11px -44px"
		});
	});
	$(".page8_play").on("tap", function() {
		$(".page8_videoBg").hide();
		$(this).hide();
		$("#video1").css({
			"width": "480px",
			"height": "270px"
		});
		
		$("#video1")[0].play();
		/*$("#audio")[0].pause();
		isRotate=!isRotate;
		$(".music").css({
			"background-position": "11px 11px"
		});*/
	});
	$(".page9_play").on("tap", function() {
		$(".page9_videoBg").hide();
		$(this).hide();
		$("#video2").css({
			"width": "480px",
			"height": "270px"
		});
		$("#video2")[0].play();
		/*$("#audio")[0].pause();
		isRotate=!isRotate;
		$(".music").css({
			"background-position": "11px 11px"
		});*/

	});
	$("#video1")[0].addEventListener("play",function(){
		$("#audio")[0].pause();
		isRotate=false;
		$(".music").css({
			"background-position": "11px 11px"
		});
	},false);
	$("#video1")[0].addEventListener("pause",function(){
		$("#audio")[0].play();
		isRotate=true;
		$(".music").css({
				"background-position": "11px -44px"
		});
	},false);
	$("#video2")[0].addEventListener("play",function(){
		$("#audio")[0].pause();
		isRotate=false;
		$(".music").css({
			"background-position": "11px 11px"
		});
	},false);
	//页面音乐
	var isRotate = false;
	$("#audio")[0].addEventListener("canplay", function() {
		isRotate = true;
	});

	$(".music").on("tap", function(e) {
		e.stopPropagation();
		e.preventDefault();
		if (isRotate) {
			$(".music").css({
				"background-position": "11px 11px"
			});
			$("#audio")[0].pause();
			alert(666);
		} else {
			$(".music").css({
				"background-position": "11px -44px"
			});
			$("#audio")[0].play();
		}
		isRotate = !isRotate;
	});
});