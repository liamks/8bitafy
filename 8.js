document.canvas_width = 800;
document.canvas_height = 600;


/** PROGRESS BAR **/
/*
PROGRESS BAR DOESN'T update, until very end (e.g. its useless)
var ProgressBar = function(){
	this.MAX_WIDTH = 200;
	this.INCREMENT = 2;
	this.pb = document.getElementById("progress_bar");
	this.progress_div = document.getElementById("progress");
	this.progress = 0;
	this.progress_div.style.width = 0
}

ProgressBar.prototype.updateWidth = function(){

	this.progress_div.style.width = String(this.INCREMENT * this.progress) + "px";
}

ProgressBar.prototype.init = function(start_value){
	this.progress = start_value || this.progress;
	this.updateWidth();
	this.pb.style.display = "block"
}

ProgressBar.prototype.updateProgress = function(inc){
	this.progress = inc;
	this.updateWidth();
}

ProgressBar.prototype.updateByOnePercent = function(){
	this.progress += 1;
	this.updateWidth();
}

ProgressBar.prototype.updateByNPercent = function(current, total){

	var p = Math.floor((current / total) * 100);
	this.progress = p;
	this.updateWidth();
}

ProgressBar.prototype.done = function(){
	this.pb.style.display = "none";
	this.progress = 0;
		
}
*/
/*******************/


EightBitafy = {
	instructions : undefined,
	'img': undefined,
	'progressBar':undefined
}


function ImageWrapper(){
	this.img_el = document.getElementById("full_image");
	this.canvas = document.getElementById("view_it");
	this.instructions = document.getElementById("instructions");
	this.img_output = document.getElementById("img_output");


	
};

ImageWrapper.prototype.clear = function(){
	img_wrapper.canvas.getContext("2d")
		.clearRect(0,0,document.canvas_width, document.canvas_height);
	EightBitafy.instructions.style.display = "";
	EightBitafy.img.style.display = "none";
	
}

ImageWrapper.prototype.imageOnLoad = function(){
	//scope is img
	img_wrapper.width = this.width;
	img_wrapper.height = this.height;
	
	img_wrapper.drawImage();


}

ImageWrapper.prototype.addHandler = function(){
	this.img_el.addEventListener("load",this.imageOnLoad, false)
}

ImageWrapper.prototype.to_8bit = function(){
	var ctx = this.canvas.getContext("2d");
	var height = this.canvas.adj_height;
	var width = this.canvas.adj_width;
	var square,avg_rgb, best_match;
	
	//var current = 0;
	var total = height * width;

	for (var h = 0; h < height; h = h + 2) {
		for (var w = 0; w < width; w = w + 2){
			square = ctx.getImageData(w,h,2,2);
			avg_rgb = color_palette.get_average_rgb(square.data)
			best_match = color_palette.match_rgb(avg_rgb);
			ctx.fillStyle = "rgb(" +best_match.red + "," + best_match.green+ ","+ best_match.blue+")";
			ctx.fillRect(w,h,2,2);
			// current += 4;
			// EightBitafy.progressBar.updateByNPercent(current,total);

		}
	}
	//red, green, blue, alpha
}

ImageWrapper.prototype.drawImage = function(){
	

	var ctx = this.canvas.getContext("2d");
	this.canvas.style.opacity = 1;
	ctx.clearRect(0,0,document.canvas_width, document.canvas_height);

	var shrink_ratio = 1;

	if(this.width > this.height){
		if(this.width > document.canvas_width){
			shrink_ratio = document.canvas_width/this.width;
		}

	}else{
		if(this.height > document.canvas_height){
			shrink_ratio = document.canvas_height/this.height;
		}
	}

	this.canvas.adj_width = Math.floor(this.width * shrink_ratio);
	this.canvas.adj_height = Math.floor(this.height * shrink_ratio);
	this.canvas.width = this.canvas.adj_width;
	this.canvas.height = this.canvas.adj_height;


	ctx.drawImage(this.img,0,0,this.canvas.adj_width, this.canvas.adj_height);
	this.to_8bit();

	var src = this.canvas.toDataURL("image/png");
	EightBitafy.img.setAttribute("src",src);
	EightBitafy.img.style.display = "block";
	EightBitafy.instructions.style.display = "none";

	document.getElementById("generating_wrapper").style.display = "none";
	img_wrapper.img.src = "";

}

function ColorPalette(){
	var color_step = 42;
	this.palette = [];
	var temp;
	for(var red = 0; red < 256; red = red + color_step){
		for(var green = 0; green < 256; green = green + color_step){
			for(var blue = 0; blue < 256; blue = blue + color_step){
				this.palette.push({"red":red,"green":green,"blue":blue});
			}
		}
	}
}

ColorPalette.prototype.rgb_diff = function(rgb1,rgb2){
	return Math.abs(rgb1.red - rgb2.red) +
		   Math.abs(rgb1.green - rgb2.green) +
		   Math.abs(rgb1.blue - rgb2.blue);
}

ColorPalette.prototype.match_rgb = function(rgb){
	var best_match = this.palette[0]
	var diff = this.rgb_diff(best_match,rgb);
	var new_diff;

	for(var i = 1; i < this.palette.length; i++){
		new_diff = this.rgb_diff(this.palette[i],rgb);
		if(new_diff < diff){
			diff = new_diff;
			best_match = this.palette[i];
		}
	}
	return best_match;
}

ColorPalette.prototype.get_average_rgb = function(cpa){
	//cpa = canvas_pixel_array
	//red, green, blue, alpha
	var red_avg = (cpa[0] + cpa[4] + cpa[8] + cpa[12])/4
	var green_avg = (cpa[1] + cpa[5] + cpa[9] + cpa[13])/4
	var blue_avg = (cpa[2] + cpa[6] + cpa[10] + cpa[14])/4
	return {"red": Math.floor(red_avg),
			"green": Math.floor(green_avg),
			"blue": Math.floor(blue_avg)}
}




function handleReader(aImg){
	return function(e) {
		aImg.src= e.target.result; 
	};
}


function handleImage(image){
	if(!image.type.match(/image.*/)){
		return;
	}
	var img = document.getElementById("full_image");
	img.file = image;

	var body = document.getElementsByTagName("body")[0]
	body.appendChild(img);

	var reader = new FileReader();
	reader.onloadend = handleReader(img);
	reader.readAsDataURL(image);
	img_wrapper.img = img;



}

function dragenter(e){
	EightBitafy.instructions.style.borderColor = "red";

	e.stopPropagation();
	e.preventDefault();
}

function dragover(e){
	EightBitafy.instructions.style.borderColor = "red";

	e.stopPropagation();
	e.preventDefault();
}

function drop(e){
	EightBitafy.instructions.style.borderColor = "#fff";
	document.getElementById("generating_wrapper").style.display = "block";

	e.stopPropagation();
	e.preventDefault();

	var dt = e.dataTransfer;
	var image = dt.files[0];

	//EightBitafy.progressBar.init();

	handleImage(image);
}

function dragleave(e){
	EightBitafy.instructions.style.borderColor = "#fff";

	e.stopPropagation();
	e.preventDefault();
}


function load(){
	EightBitafy.instructions = document.getElementById("instructions");
	EightBitafy.img = document.getElementById("img_output");
	//EightBitafy.progressBar = new ProgressBar();

	var dropbox, clear;
	dropbox = document.getElementById("instructions");
	clear = document.getElementById("clear")
	dropbox.addEventListener("dragenter", dragenter, false);
	dropbox.addEventListener("dragover", dragover, false);
	dropbox.addEventListener("drop",drop, false);
	dropbox.addEventListener("dragleave",dragleave, false);
	
	
	img_wrapper = new ImageWrapper()
	img_wrapper.addHandler();

	color_palette = new ColorPalette();

	clear.addEventListener("click",img_wrapper.clear,false);


}

window.onload = load;