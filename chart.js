const IVOCHART = new function(){

var LINE_BIAS = 0.5;
var TEXT_BIAS = 0.0;
var DEVICE_RATIO = window.devicePixelRatio || 1;
var sizes__ = {};

function getPointStep(min, max, cellsize, areasize) {
if((max - min)==0.) {
	max = max+1.;
	min = max-1.;
}
return (max - min) / (areasize / cellsize);
}

function getPoint(point, cellsize, min, step) {
return cellsize * (point - min) / step + cellsize/2.;
}

function getBackPoint(point, cellsize, min, step) {
    var rev = min + ((point - cellsize/2.) / cellsize) * step;
	return rev;
}

function pointIterator(min, max, step, fn) {
	var args = [];
	args[0] = 0;
	for(var arg = 0; arg<arguments.callee.caller.arguments.length; arg++) {
		args[arg+1] = arguments.callee.caller.arguments[arg];
	}
	for (var k = min; k <= max; k++) {
		var i = Math.floor(k);
		args[0] = i;
		
		if (fn instanceof Array) {
			
			for (var i = 0; i < fn.length; i++) {
				args[2] = arguments.callee.caller.arguments[1][i];
				fn[i].apply(this, args);
			}
		}
		else {
			args[2] = arguments.callee.caller.arguments[1][0];
			fn.apply(this, args);
		}
	}
}


function ohlcMinMax(i,data, area, fn) {
	
	if (data.points[i]) {
		area.vminy = data.points[i].l < area.vminy || !area.vminy ? data.points[i].l : area.vminy;
		area.vmaxy = data.points[i].h > area.vmaxy || !area.vmaxy ? data.points[i].h : area.vmaxy;
		
	}
}

function closeMinMax(i,data, area, fn) {
	
	if (data.points[i]) {
		area.vminy = data.points[i].c < area.vminy || !area.vminy ? data.points[i].c : area.vminy;
		area.vmaxy = data.points[i].c > area.vmaxy || !area.vmaxy ? data.points[i].c : area.vmaxy;
	}
}

function volumeMinMax(i,data, area, fn) {
	
	if (data.points[i]) {
		area.vminy = 0;//data.points[i].v < area.vminy || !area.vminy ? data.points[i].v : area.vminy;
		area.vmaxy = data.points[i].v > area.vmaxy || !area.vmaxy ? data.points[i].v : area.vmaxy;
		
	}
	
}

function findMinMax(data, area, fn) {
	pointIterator(area[0].vminx - area[0].pointstepx, area[0].vmaxx, area[0].pointstepx, fn);
}

function niceNumber(x, roundit) {
    var exp = Math.floor(Math.log(x) / Math.LN10);
    var f = x/Math.pow(10., exp);
    var nf;
    if(roundit) {
        if(f < 1.5) nf = 1.;
        else if (f < 3.) nf = 2.;
		else if (f < 4.) nf = 3.;
		else if (f < 5.) nf = 4.;
        else if (f < 7.) nf = 5.;
        else nf = 10;
    } else {
        if(f <= 1.) nf = 1.;
        else if (f <= 2.) nf = 2.;
		else if (f <= 4.) nf = 3.;
		else if (f <= 5.) nf = 4.;
        else if (f <= 7.) nf = 5.;
        else nf = 10.;
    }
    return nf*Math.pow(10, exp);
}

function getNiceTicks(min, max, ntick) {
    var range = niceNumber(max - min, false);
    var d = niceNumber(range/(ntick-1), true);
    var graphmin = Math.floor(min/d)*d;
    var graphmax = Math.ceil(max/d)*d;
    var nfrac = Math.max(-Math.floor(Math.log(d) / Math.LN10), 0.);
    return {
        minimum: graphmin,
        maximum: graphmax + 0.5 * d,
        gridstep: d,
        nfrac: nfrac
    };
    
}

function getNiceTicksTimeSeries(min, max, ntick) {
	var gap = Math.ceil(max - min);
	var d = Math.round(gap/ntick);
	//alert(max+","+min);
	return {
        minimum: Math.floor(min),
        maximum: Math.ceil(max),
        gridstep: d,
        nfrac: 0
    }; 
}


function getPowerOf10(value) {
    return (value>=100000. || value<=-100000)?Math.floor(Math.log(value) / Math.LN10):0;
}

function getVisibleArea(x, y, width, height, area, data) {
    
    area.vminx = getBackPoint(x, area.cellx, area.minx, area.pointstepx);
    area.vmaxx = getBackPoint(x + width, area.cellx, area.minx, area.pointstepx);
    area.vminy = getBackPoint(y, area.celly, area.miny, area.pointstepy),
    area.vmaxy = getBackPoint(y + height, area.celly, area.miny, area.pointstepy)
	
}


function getSteps(data, conf, area, xreduce, yreduce) {
    area.pointstepx = getPointStep(area.minx = data.minx, area.maxx = data.maxx, area.cellx = conf.cellx, area.width = conf.cellx*data.count*xreduce/*Math.max(conf.width, conf.cellx*data.count)*/);
    area.pointstepy = getPointStep(area.miny = data.miny, area.maxy = data.maxy, area.celly = conf.celly, area.height = conf.height * yreduce);
	
}

function configureArea(area, conf, xreduce, yreduce) {
	
	var vminmax = area.vmaxy - area.vminy; 
	if(vminmax==0.) {
		area.vminy -= 1;
		area.vmaxy +=1.;
		if(area.vminy<0) area.vminy=0;
		if(area.vmaxy<0) area.vmaxy=Math.max(area.vminy+1, 1);
		
	}
	//alert(area.vminy);
	area.nicex = getNiceTicks(area.vminx, area.vmaxx, conf.xticks);
    area.nicey = getNiceTicks(area.vminy, area.vmaxy, conf.yticks);

	area.vminy-=vminmax/15.;
	area.vmaxy+=vminmax/15.;
	
	
	area.pointstepx = getPointStep(area.vminx, area.vmaxx , area.cellx , conf.width * xreduce);
	area.pointstepy = getPointStep(area.vminy, area.vmaxy , area.celly , conf.height * yreduce);

}


function measureArea(data, conf) {
	var area = new Array();
	var lenarr = 1;

	if(!data.minx) data.minx = 1;
	if(!data.count) if(data.points) data.count = data.points.length;
	if(!data.maxx) data.maxx = data.count + 1; 

	if(conf.minmax instanceof Array) {
		lenarr = conf.minmax.length;
	}
    
	for (var i = 0; i < lenarr; i++) {
		area[i] = {};
		getSteps(data, conf, area[i], conf.xreduce[i], conf.yreduce[i]);
		getVisibleArea(conf.viewx, conf.viewy, conf.width*conf.xreduce[i], conf.height*conf.yreduce[i], area[i], data);
	}
	
	    
	findMinMax(data, area, conf.minmax);
	
    for (var i = 0; i < lenarr; i++) {
		
		configureArea(area[i], conf, conf.xreduce[i], conf.yreduce[i]);
	}
	
    return area;		
}

function getMinMaxByType(type) {
	var minmax;
	type = (type) ? parseInt(type) : type;
	switch(type) {
		case 1 : {
			minmax = closeMinMax;
			break;
		}
		case 2 : 
		case 3 : {
			minmax = ohlcMinMax;
			break;
		}
		case 4 : {
			minmax = volumeMinMax;
			break;
		}
		default : minmax = volumeMinMax;
	}
	return minmax;
}

function getChartType(type) {
	var chartType;
	type = (type) ? parseInt(type) : type;
	switch(type) {
		case 1 : {
			chartType = drawCurve;
			break;
		}
		case 2 : {
			chartType = drawCandle;
			break;
		}
		case 3 : {
			chartType = drawBar;
			break;
		}
		case 4 : {
			chartType = drawVolume;
			break;
		}
		default : chartType = drawVolume;
	}
	return chartType;
}


function drawCrosshair(x, y, conf, color, ctx) {
	if(x<0) x=0;
	if(x>conf.width) x=conf.width;
	if(y<0) y=0;
	if(y>conf.height) y=conf.height;
	
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(x+LINE_BIAS,LINE_BIAS);
	ctx.lineTo(x+LINE_BIAS,conf.height+LINE_BIAS);
    ctx.moveTo(LINE_BIAS, y + LINE_BIAS);
	ctx.lineTo(conf.width + LINE_BIAS, y + LINE_BIAS);
    ctx.stroke();
	
}

function drawLine(x1,y1,x2,y2, color, ctx) {
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(x1,y1);
    ctx.lineTo(x2,y2);
    ctx.stroke();
}


function drawCurve(i, data, area, conf, ctx, canvas, fn){
	var point1 = data.points[i-1];
	var point2 = data.points[i];
	if(!point1 || !point2) return;
	var x1x = Math.round(getPoint(point1.n, area.cellx, area.vminx, area.pointstepx)) - 1;
	var x2x = Math.round(getPoint(point2.n, area.cellx, area.vminx, area.pointstepx)) - 1;
	var y1x = Math.round(conf.height - getPoint(point1.c, area.celly, area.vminy, area.pointstepy)) - 1;
	var y2x = Math.round(conf.height - getPoint(point2.c, area.celly, area.vminy, area.pointstepy)) - 1;
	
	var color = y1x<y2x?'#a00000':'#104010';
	ctx.lineWidth = 1.5;
	drawLine(x1x, y1x, x2x, y2x, color, ctx);
	ctx.lineWidth = 1;
}

function drawBar(i, data, area, conf, ctx, canvas, fn){
    var point = data.points[i];
	if(!point) return;        
    var x = Math.round(getPoint(point.n, area.cellx, area.vminx, area.pointstepx)) - 1;
    var high = Math.round(conf.height - getPoint(point.h, area.celly, area.vminy, area.pointstepy)) - 1;
    var low = Math.round(conf.height - getPoint(point.l, area.celly, area.vminy, area.pointstepy)) - 1;
    var open = Math.round(conf.height - getPoint(point.o, area.celly, area.vminy, area.pointstepy)) - 1;
    var close = Math.round(conf.height - getPoint(point.c, area.celly, area.vminy, area.pointstepy)) - 1;
	
    var lev = point.o > point.c;
	var color = lev?'#a00000':'#104010';
	
	
	
	drawLine(x + LINE_BIAS, high, x + LINE_BIAS, low, color, ctx);
	drawLine(Math.round(x - area.cellx/2.) + LINE_BIAS - 1 + conf.celloffset, open + LINE_BIAS, x + LINE_BIAS, open + LINE_BIAS, color, ctx);
	drawLine(x + LINE_BIAS, close + LINE_BIAS, Math.round(x + area.cellx/2.) + 1 + LINE_BIAS - conf.celloffset, close + LINE_BIAS, color, ctx);
	
}

function drawVolume(i, data, area, conf, ctx, canvas, fn) {
	var point = data.points[i];
	if(!point) return; 
	//if(point.v<=0.) return;
	var x = Math.round(getPoint(point.n, area.cellx, area.vminx, area.pointstepx)) - 1;
    var lev = Math.round(conf.height-1 - getPoint(point.v, area.celly, area.vminy, area.pointstepy)) - 1;
	
	/*
	var console = document.getElementById("console");
	var fconsole = console.innerHTML;
	fconsole+=" "+lev; 
	console.innerHTML = fconsole;*/
	
	ctx.strokeStyle = "#708090";
	//var console = document.getElementById("console");
	//console.innerHTML = point.n+","+area.vmaxy+","+lev;
	ctx.strokeRect(Math.round(x - area.cellx/2.) - 1 + LINE_BIAS + conf.celloffset, lev + LINE_BIAS, area.cellx - conf.celloffset, conf.height - lev); 

	ctx.fillStyle = "rgba(128, 144, 160, 0.6)";
	ctx.fillRect(Math.round(x - area.cellx/2.) - 1  + LINE_BIAS + conf.celloffset, lev + LINE_BIAS, area.cellx - conf.celloffset, conf.height - lev); 
}

function drawCandle(i, data, area, conf, ctx, canvas, fn){
    var point = data.points[i];
	if(!point) return;        
    var x = Math.round(getPoint(point.n, area.cellx, area.vminx, area.pointstepx)) - 1;
    var high = Math.round(conf.height - getPoint(point.h, area.celly, area.vminy, area.pointstepy)) - 1;
    var low = Math.round(conf.height - getPoint(point.l, area.celly, area.vminy, area.pointstepy)) - 1;
    var open = Math.round(conf.height - getPoint(point.o, area.celly, area.vminy, area.pointstepy)) - 1;
    var close = Math.round(conf.height - getPoint(point.c, area.celly, area.vminy, area.pointstepy)) - 1;
	
    var lev = point.o > point.c;
    var lev1 = lev ? open : close;
    var lev2 = !lev ? open : close;
	
	ctx.strokeStyle = lev?'#800000':'#407040';
	ctx.fillStyle = lev?'rgba(214, 0, 0, 0.7)':'rgba(50,150,50, 0.7)';
	
    ctx.beginPath();
    ctx.moveTo(x + LINE_BIAS, high);
    ctx.lineTo(x + LINE_BIAS , lev1);
    ctx.stroke();
    //if (lev) {
	ctx.strokeRect(Math.round(x - area.cellx/2. + conf.celloffset) - 1 + LINE_BIAS, lev1 + LINE_BIAS, area.cellx - conf.celloffset , lev2 - lev1);
    ctx.fillRect(Math.round(x - area.cellx/2. + conf.celloffset) - 1 + LINE_BIAS, lev1 + LINE_BIAS, area.cellx - conf.celloffset, lev2 - lev1);
    //} else {
    //   ctx.strokeRect(x - area.cellx/2. + LINE_BIAS + conf.celloffset, lev1 + LINE_BIAS, area.cellx - conf.celloffset, lev2 - lev1);
    //}
    ctx.beginPath();
    ctx.moveTo(x + LINE_BIAS, lev2);
    ctx.lineTo(x + LINE_BIAS, low);
    ctx.stroke();
}


function drawData(data, area, conf, ctx, canvas, fn) {
	pointIterator(area[0].vminx - area[0].pointstepx, area[0].vmaxx, area[0].pointstepx, fn);
}

function translatePeriod(xperiod) {
	if(xperiod=='1m') return { quant: 'day', millis: 60*1000, formatl: 'HH:mm', formatb: 'dd.MM.yy'};
	else if(xperiod=='5m') return { quant: 'day', millis: 5*60*1000, formatl: 'HH:mm', formatb: 'dd.MM.yy'};
	else if(xperiod=='15m') return { quant: 'day', millis: 15*60*1000, formatl: 'HH:mm', formatb: 'dd.MM.yy'};
	else if(xperiod=='1h') return { quant: 'day', millis: 60*60*1000, formatl: 'HH', formatb: 'dd.MM.yy'};
	else if(xperiod=='2h') return { quant: 'day', millis: 2*60*60*1000, formatl: 'HH dd.MM', formatb: 'dd.MM.yy'};
	else if(xperiod=='1d') return { quant: 'month', millis: 24*60*60*1000, formatl: 'dd.MM.yy'};
	else if(xperiod=='1w') return { quant: 'month', millis: 7*24*60*60*1000, formatl: 'dd.MM.yy'};
	else if(xperiod=='1mn') return { quant: 'year', millis: 30*24*60*60*1000, formatl: 'MM.yy'};
	else return { quant: 'day', millis: 60*1000, formatl: 'HH:mm', formatb: 'dd.MM.yy'};
}

function drawLabelY(coord, conf, x, y, ctx, canvas) {
	var power = getPowerOf10(coord);
	if(power>0) {
		coord = coord/Math.pow(10., power);
		var v1 = coord.toFixed(0);
		var v2 = coord.toFixed(2);
		coord = Math.abs(v1-v2)>0.00000001?v2:v1;
		
	}
    ctx.drawText(conf.font, conf.fontsize, Math.round(x) + conf.xlbloffset + TEXT_BIAS, Math.round(y + conf.fontsize/2.) + TEXT_BIAS, coord);
}

function drawLabelX(coord, conf, x, y, data, ctx, canvas) {
	var plen = data.points.length;
	var d;
	var period = translatePeriod(conf.xperiod);
	if(data.points[coord - 1]) {
		d = new Date(data.points[coord - 1].t);
	} else if(coord-1>=plen) {
		d = new Date(data.points[plen - 1].t + (coord - plen)*period.millis);
	} else if(coord-1<0) {
		d = new Date(data.points[0].t - Math.abs(coord)*period.millis);
	}
    
	ctx.drawTextCenter(conf.font, conf.fontsize, x + TEXT_BIAS, y + conf.fontsize + conf.xlbloffset + TEXT_BIAS, formatDate(d, period.formatl));
}

function drawChart(data, conf, ctx, canvas, dctx, dcanvas) {
	/*if(!data || !data.points || !data.points.length<1) {
		return null;
	}*/
    var _area = measureArea(data, conf);
	var area = _area[_area.length - 1];
	
	ctx.scale(DEVICE_RATIO, DEVICE_RATIO);
	ctx.strokeStyle = conf.bordercolor;
	ctx.strokeRect(LINE_BIAS, LINE_BIAS, conf.width, conf.height);
	//ctx.fillStyle = "#f0f0f0";
    //ctx.fillRect(LINE_BIAS, LINE_BIAS, conf.width, conf.height);
    
    for(var y = area.nicey.minimum; y<area.nicey.maximum; y+=area.nicey.gridstep) {
        var coord = y.toFixed(area.nicey.nfrac);
        var gridy = Math.round(conf.height - getPoint(y, area.celly, area.vminy, area.pointstepy)) + LINE_BIAS;
		
		if (gridy >= conf.ticklength && gridy <= conf.height - conf.ticklength) {
			drawLabelY(coord, conf, conf.width, gridy, ctx, canvas);
		}
		if (gridy > conf.ticklength && gridy < conf.height - conf.ticklength) {
			drawLine(0, gridy, conf.ticklength, gridy, conf.bordercolor, ctx);
			drawLine(conf.ticklength, gridy, conf.width - conf.ticklength, gridy, conf.gridcolor, ctx);
			drawLine(conf.width - conf.ticklength, gridy, conf.width, gridy, conf.bordercolor, ctx);
		}
    }
    
    for(var x = area.nicex.minimum; x<area.nicex.maximum; x+=area.nicex.gridstep) {
        var coord = x.toFixed(area.nicex.nfrac);
        var gridx = Math.round(getPoint(x, area.cellx, area.vminx, area.pointstepx)) + LINE_BIAS;
        
		if(gridx >= conf.ticklength && gridx<=conf.width - conf.ticklength) {
			drawLabelX(coord, conf, gridx, conf.height, data, ctx, canvas);
		}
        if (gridx > conf.ticklength && gridx<conf.width - conf.ticklength) {
            drawLine(gridx, 0, gridx, conf.ticklength, conf.bordercolor, ctx);
            drawLine(gridx, conf.ticklength, gridx, conf.height - conf.ticklength, conf.gridcolor, ctx);
            drawLine(gridx, conf.height - conf.ticklength,  gridx, conf.height, conf.bordercolor, ctx);
        }
    }

	ctx.scale(1/DEVICE_RATIO, 1/DEVICE_RATIO);
    drawData(data, _area, conf, dctx, dcanvas, conf.charttype);

	return area;

}

function changeChart(data, conf, ctx, canvas) {
	var area = measureArea(data, conf);
}

function createChart(data, conf, context) {
    
    context.axiscanvas.setAttribute('width', conf.spacewidth*DEVICE_RATIO);
    context.axiscanvas.setAttribute('height', conf.spaceheight*DEVICE_RATIO);

    context.datacanvas.setAttribute('width', conf.width*DEVICE_RATIO - 1);
    context.datacanvas.setAttribute('height', conf.height*DEVICE_RATIO - 1);
	
    var ctx = context.axiscanvas.getContext('2d');
	var dctx = context.datacanvas.getContext('2d');
	
	dctx.scale(DEVICE_RATIO, DEVICE_RATIO);
	
    ctx.clearRect(0,0,conf.spacewidth*DEVICE_RATIO, conf.spaceheight*DEVICE_RATIO);
	dctx.clearRect(0,0,conf.width*DEVICE_RATIO-1, conf.height*DEVICE_RATIO-1);
    CanvasTextFunctions.enable(ctx);
    var area = drawChart(data, conf, ctx, context.axiscanvas, dctx, context.datacanvas);
	ctx.drawImage(context.datacanvas, 1, 1);
    return { context: context, area: area, conf: conf};
}

function resetSizes(canvas) {
	
	sizes__[canvas.id] = false;
	
}

function paintChart(maincanvas, mainctx, data, conf, context1) {

		if(!data || !data.points) {
			
			return null;
		}

		var result = IVOCHART.createChart(data, conf, context1);
		
		if( !sizes__[maincanvas.id] && maincanvas.width  > 0 && maincanvas.height > 0 ) {

			sizes__[maincanvas.id] = { 'w':maincanvas.width , 'h':maincanvas.height  };

			maincanvas.style.width  = maincanvas.width  + 'px';
			maincanvas.style.height = maincanvas.height + 'px';

			maincanvas.setAttribute('width', sizes__[maincanvas.id].w * DEVICE_RATIO);
			maincanvas.setAttribute('height', sizes__[maincanvas.id].h * DEVICE_RATIO);

		}

		mainctx.clearRect(0,0,maincanvas.width,maincanvas.height);
    	mainctx.drawImage(context1.axiscanvas, 0, 0);

		return result;
}

function testCase(id, bias, zoom, context) {
    var basecanvas = document.getElementById(id);
    var result = createChart({
           miny: 1.5,
           maxy: 2.,
           minx: 1,
           maxx: 200,
           count: 200,
           points: [
             {n:1, o:3, c:3, l:1.8, h:4, v:20000, t:1298977740000},
             {n:2, o:2.7, c:3.8, l:2, h:5, v:25000, t:1298977680000},
             {n:3, o:3.8, c:2.4, l:1.6, h:4.2, v:20000, t:1298977740000},
             {n:4, o:2, c:3, l:1.8, h:4, v:25000, t:1298977680000},
             {n:5, o:2.7, c:3.8, l:2, h:5, v:20000, t:1298977740000},
             {n:6, o:3.8, c:2.4, l:1.6, h:4.2, v:25000, t:1298977680000},
             {n:7, o:2, c:3, l:1.8, h:4, v:20000, t:1298977740000},
             {n:8, o:2.7, c:3.8, l:2, h:5, v:25000, t:1298977680000},
             {n:9, o:3.8, c:2.4, l:1.6, h:4.2, v:20000, t:1298977740000},
             {n:10, o:2, c:3, l:1.8, h:4, v:25000, t:1298977680000},
             {n:11, o:3, c:3.8, l:2, h:5, v:20000, t:1298977740000},
             {n:12, o:3.8, c:2.4, l:1.6, h:4.2, v:25000, t:1298977680000},
             {n:13, o:2, c:3, l:1.8, h:4, v:20000, t:1298977740000},
             {n:14, o:2.7, c:3.8, l:2, h:5, v:25000, t:1298977680000},
             {n:15, o:3.8, c:2.4, l:1.6, h:4.2, v:20000, t:1298977740000},
             {n:16, o:2, c:3, l:1.8, h:4, v:25000, t:1298977680000},
             {n:17, o:2.7, c:3.8, l:2, h:5, v:20000, t:1298977740000},
             {n:18, o:3.8, c:2.4, l:1.6, h:4.2, v:25000, t:1298977680000},
             {n:19, o:2, c:3, l:1.8, h:4, v:20000, t:1298977740000},
             {n:20, o:2.7, c:3.8, l:2, h:5, v:25000, t:1298977680000},
             {n:21, o:3.8, c:6.4, l:1.6, h:7.2, v:20000, t:1298977740000},
             {n:22, o:2, c:3, l:1.8, h:4, v:20000, t:1298977740000},
             {n:23, o:2.7, c:3.8, l:2, h:5, v:25000, t:1298977680000},
             {n:24, o:3.8, c:2.4, l:1.6, h:4.2, v:20000, t:1298977740000},
             {n:25, o:2, c:3, l:1.8, h:4, v:25000, t:1298977680000},
             {n:26, o:2.7, c:3.8, l:2, h:5, v:20000, t:1298977740000},
             {n:27, o:3.8, c:2.4, l:1.6, h:4.2, v:25000, t:1298977680000},
             {n:28, o:2, c:3, l:1.8, h:4, v:200000, t:1298977740000},
             {n:29, o:2.7, c:3.3, l:2, h:5, v:250000, t:1298977680000},
             {n:30, o:3.8, c:2.0, l:1.6, h:4.2, v:20000, t:1298977740000},
             {n:31, o:2, c:3, l:1.8, h:4, v:25000, t:1298977680000},
             {n:32, o:2.7, c:3.8, l:2, h:5, v:20000, t:1298977740000},
             {n:33, o:3.8, c:2.4, l:1.6, h:4.2, v:25000, t:1298977680000},
             {n:34, o:2, c:3, l:1.8, h:4, v:20000, t:1298977740000},
             {n:35, o:2.7, c:3.8, l:2, h:5, v:25000, t:1298977680000},
             {n:36, o:3.8, c:2.4, l:1.6, h:4.2, v:20000, t:1298977740000},
             {n:37, o:2, c:3, l:1.8, h:4, v:25000, t:1298977680000},
             {n:38, o:2.7, c:3.8, l:2, h:5, v:20000, t:1298977740000},
             {n:39, o:3.8, c:2.4, l:1.6, h:4.2, v:25000, t:1298977680000},
             {n:40, o:2, c:3, l:1.8, h:4, v:20000, t:1298977740000},
             {n:41, o:2.7, c:3.8, l:2, h:5, v:25000, t:1298977680000},
             {n:42, o:3.8, c:2.4, l:1.6, h:4.2, v:20000, t:1298977740000},
             {n:43, o:2, c:3, l:1.8, h:4, v:25000, t:1298977680000},
             {n:44, o:2.7, c:3.8, l:2, h:5, v:20000, t:1298977740000},
             {n:45, o:3.8, c:2.4, l:1.6, h:4.2, v:25000, t:1298977680000},
             {n:46, o:2, c:3, l:1.8, h:4, v:20000, t:1298977740000},
             {n:47, o:2.7, c:3.8, l:2, h:5, v:25000, t:1298977680000},
             {n:48, o:3.8, c:2.4, l:1.6, h:4.2, v:30000, t:1298977740000}
           ]
       }, {
           spacewidth: basecanvas.width,
           spaceheight: basecanvas.height,
           height: 200,
           width: 400,
           xticks: 7,
           yticks: 7,
           viewx: bias,
           viewy: 0,
           cellx: zoom,
           celly: 1,
	       celloffset: 2,
           ticklength: 3,
           bordercolor:'rgb(0,0,0)',
           gridcolor:'rgb(220,220,220)',
		   minmax: volumeMinMax,
		   charttype: drawVolume
       }, context);
    var basectx = basecanvas.getContext('2d'); 
    basectx.clearRect(0,0,basecanvas.width,basecanvas.height);
    basectx.drawImage(context.axiscanvas, 0, 0); 
	return result;  
}


this.runTest = testCase;
this.getBackPoint = getBackPoint;
this.getPoint = getPoint;
this.drawCrosshair = drawCrosshair;
this.createChart = createChart;
this.paintChart = paintChart;
this.drawCandle = drawCandle;
this.drawVolume = drawVolume;
this.drawBar = drawBar;
this.drawCurve = drawCurve;
this.ohlcMinMax = ohlcMinMax;
this.closeMinMax = closeMinMax;
this.volumeMinMax = volumeMinMax;
this.getMinMaxByType = getMinMaxByType;
this.getChartType = getChartType;
this.translatePeriod = translatePeriod;
this.resetSizes = resetSizes;

}









