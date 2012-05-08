var meme_image_list = $('#meme-images > li'),
	active_meme = meme_image_list.filter('.active')[0].children[0].getAttribute('data-img'),
	color1 = $('#color1'),
	color2 = $('#color2'),
	canvas = $('#cvs')[0],
	top_input = $('#text-top'),
	bottom_input = $('#text-bottom'),
	generate = $('#generate'),
	userlink = $('#img-link'),
	spinner = $('#spinner'),
	font_slider = $("#slider-font-size"),
	font_size = $("#font-size"),
	api_key_btn = $('#api-key'),
	api_key_input = $('#api-key-input'),
	nav_form = $('#nav-form'),
	ctx = canvas.getContext('2d'),
	PATH = 'images/';

function draw() {
	var img = $("<img />")[0];
	img.src = PATH + active_meme;
	img.onload = function(e) {
		var font_offset = font_size.val()*.95;
		canvas.height = img.height;
		canvas.width = img.width;
		ctx.save();
		ctx.font = "bold " + font_size.val() + "px Arial";
		ctx.textAlign = "center";
		ctx.fillStyle = color1.val();
		ctx.strokeStyle = color2.val();
		ctx.lineWidth = Math.floor(font_size.val()/20);
		ctx.clearRect(0, 0, img.height, img.width);
		ctx.drawImage(img, 0, 0, img.width, img.height);
		ctx.fillText(top_input.val(), img.width / 2, font_offset, img.width);
		ctx.strokeText(top_input.val(), img.width / 2, font_offset, img.width);
		ctx.fillText(bottom_input.val(), img.width / 2, img.height - font_offset/3, img.width);
		ctx.strokeText(bottom_input.val(), img.width / 2, img.height - font_offset/3, img.width);

		ctx.restore();
	};
}
// top line input
top_input.keyup(function(e) {
	draw();
});
// bottom line input
bottom_input.keyup(function(e) {
	draw();
});
// meme image dropdown
meme_image_list.click(function(e) {
	e.preventDefault();
	meme_image_list.each(function(i, el) {
		if (e.target.parentNode != el) {
			el.className = '';
		} else {
			el.className = 'active';
			active_meme = el.children[0].getAttribute('data-img');
		}
	});
	draw();
});

generate.click(function(e) {
	e.preventDefault();
	spinner.show();
	var dataURL = canvas.toDataURL("image/png").split(',')[1];
	$.ajax({
		url: 'http://api.imgur.com/2/upload.json',
		type: 'POST',
		data: {
			type: 'base64',
			key: $('#api-key-input').val(),
			image: dataURL
		},
		dataType: 'json'
	}).success(function(data) {
		top_input.val('');
		bottom_input.val('');
		Notifier.success('Your image has been uploaded successfully.', 'Complete!');
		spinner.hide();
		userlink.val(data['upload']['links']['original']);
		userlink[0].select();
		userlink[0].focus();
	}).error(function() {
		Notifier.error('Could not reach imgur service. Enter a new API Key or wait a few minutes and try again.', 'Error!');
		spinner.hide();
	});
});
nav_form.submit(function(e) {
	e.preventDefault();
});

function update_key(e) {
	if( $.cookie('lememe-api-key') != $(this).val() ) {
		$.cookie('lememe-api-key', $(this).val(), { expires: 7 });
		Notifier.info('Your API KEY will be rememberd in your browsers cookies for 7 days. If you would like to revert to the old key please clear your browsers cookies and refresh the page.', 'API KEY Saved!');
	}
	$(this).unbind('blur', update_key);
	api_key_btn.show();
	api_key_input.hide();
}
api_key_btn.click(function(e) {
	api_key_btn.hide();
	api_key_input.show();
	api_key_input.bind('blur', update_key);
	api_key_input[0].select();
	api_key_input[0].focus();
});

$('input.color-picker').miniColors({
	change: function(hex, rgb) {
		draw();
	}
});

font_slider.slider({
	range: "max",
	min: 16,
	max: 60,
	value: 20,
	slide: function(event, ui) {
		font_size.val(ui.value);
	},
	change: function(event, ui) {
		draw();
	}
});
font_size.val(font_slider.slider("value"));

if( $.cookie('lememe-api-key') ) {
	api_key_input.val($.cookie('lememe-api-key'));
}

var k_pattern = [38,38,40,40,37,39,37,39,66,65],
    k_hold = k_pattern.splice(0),
    k_reset;
$(window).on('keydown', function(e) {
	if( k_hold.shift() === e.which && k_hold.length === 0) {
		top_input.val(" Neva gonna give you up! ");
		bottom_input.val(" Neva gonna let you down! ");
		active_meme = "rickastley.jpg";
		color1.miniColors('value', "#fff");
		color2.miniColors('value', "#000");
		font_slider.slider('value' , 28);
		font_size.val(28);
		k_hold = k_pattern.splice(0);
	}
	clearTimeout(k_reset);
	k_reset = setTimeout(function() {
		k_hold = k_pattern.splice(0);
	}, 1000 * 10);
});

draw();
