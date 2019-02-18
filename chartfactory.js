var ChartFactory = new function(){

	var TM_ZOOM_SCROLL = 0;
	var TM_CROSSHAIR = 1;
	var DEFAULT_ZOOM_MIN = 6;
	var DEFAULT_ZOOM_MAX = 40;
	
	function Touch(scrollfn, zoomfn, crossfn, distfn, chartobj){
		this.dragging = 0;
		this.startf = 0;
		this.scrollAction = scrollfn;
		this.zoomAction = zoomfn;
		this.crossAction = crossfn;
		this.distAction = distfn;
		this.chartobj = chartobj;
		this.actionStart = true;
		this.touchmode = TM_ZOOM_SCROLL;
		this.prolongScroll = false;
		this._touchstart;
		this._touchmove;
		this._touchend;
		
	}
	
	Touch.prototype.setTouchMode = function(touchmode){
		this.touchmode = touchmode;
	}
	
	
	
	Touch.prototype.touchstart = function(evt){
		evt.preventDefault();
		var target = evt.target;
		this.prolongScroll = false;
		if (evt.targetTouches.length == 1) {
			this.dragging = evt.touches[0].pageX;
			this.startf = 0;
			this.actionStart = true;
			
			if (this.touchmode == TM_CROSSHAIR) {
				var touchy = evt.touches[0].pageY;
				this.crossAction(target, this.dragging, touchy, this.actionStart, this.chartobj);
			}
		}
		else 
			if (evt.targetTouches.length == 2) {
				this.dragging = 0;
				var dist1x = evt.touches[0].pageX;
				var dist2x = evt.touches[1].pageX;
				var dist1y = evt.touches[0].pageY;
				var dist2y = evt.touches[1].pageY;
				var k1 = dist1x - dist2x;
				var k2 = dist1y - dist2y;
				this.startf = Math.sqrt(k1 * k1 + k2 * k2);
				this.actionStart = true;
				
				if (this.touchmode == TM_CROSSHAIR) {
					this.distAction(target, dist1x, dist2x, this.actionStart, this.chartobj);
				}
			}
			
			
		
	}
	
	Touch.prototype.touchend = function(evt){
		if (this.touchmode == TM_ZOOM_SCROLL && !this.actionStart && this.prolongScroll) {
		
		}
	}
	
	Touch.prototype.clearEvents = function(id){
		var tchart = document.getElementById(id);
		tchart.removeEventListener('touchstart', this._touchstart, false);
		tchart.removeEventListener('touchmove', this._touchmove, false);
		tchart.removeEventListener('touchend', this._touchend, false);
	}
	
	Touch.prototype.touchmove = function(evt){
		
		evt.preventDefault();
		var target = evt.target;
		var isstart = this.actionStart;
		this.actionStart = false;
		this.prolongScroll = false;
		if (this.touchmode == TM_ZOOM_SCROLL) {
		
			if (evt.targetTouches.length == 1) {
				var touchx = evt.touches[0].pageX;
				var move = this.dragging - touchx;
				this.scrollAction(target, move, isstart, this.chartobj);
				this.dragging = touchx;
				this.prolongScroll = true;
			}
			else 
				if (evt.targetTouches.length == 2) {
					this.dragging = 0;
					var dist1x = evt.touches[0].pageX;
					var dist2x = evt.touches[1].pageX;
					var dist1y = evt.touches[0].pageY;
					var dist2y = evt.touches[1].pageY;
					//alert(dist1x);
					var k1 = dist1x - dist2x;
					var k2 = dist1y - dist2y;
					var movef = Math.sqrt(k1 * k1 + k2 * k2);
					this.zoomAction(target, this.startf - movef, isstart, this.chartobj);
					this.startf = movef;
				}
			
		}
		else 
			if (this.touchmode == TM_CROSSHAIR) {
			
				if (evt.targetTouches.length == 1) {
					var touchx = evt.touches[0].pageX;
					var touchy = evt.touches[0].pageY;
					this.crossAction(target, touchx, touchy, isstart, this.chartobj);
					
				}
				else 
					if (evt.targetTouches.length == 2) {
					
						var dist1 = evt.touches[0].pageX;
						var dist2 = evt.touches[1].pageX;
						this.distAction(target, dist1, dist2, isstart, this.chartobj);
					}
				
			}
			
		
	}
	
	function attachTouch(id, scrollfn, zoomfn, crossfn, distfn, chartobj){
		var touch = new Touch(scrollfn, zoomfn, crossfn, distfn, chartobj);
		var tchart = document.getElementById(id);
		tchart.addEventListener('touchstart', touch._touchstart = function(e){
			touch.touchstart(e);
		}, false);
		tchart.addEventListener('touchmove', touch._touchmove = function(e){
			touch.touchmove(e);
		}, false);
		tchart.addEventListener('touchend', touch._touchend = function(e){
			touch.touchend(e);
		}, false);
		return touch;
	}
	
	//var changeCounter = 0;
	
	function Chart(divid, chartid, datafn, conf, maincanvas, context1) {
	        //if(document.getElementById('dconsole'))
		//    document.getElementById('dconsole').innerHTML = 'changeChart:'+(changeCounter++);
		this.context1 = context1;
		this.datafn = datafn;
		this.touchobj;
		this.offset;
		this.bias = 0;
		this.zoom = DEFAULT_ZOOM_MIN;
		this.prevzoom = DEFAULT_ZOOM_MIN;
		this.area;
		this.conf = conf;
		this.keepright;
		this.pt;
		this.divid = divid;
		this.chartid = chartid;
		this.maincanvas = maincanvas;
		this.isonbound = this.conf.holdright;
		this.isfirsttimebound = this.conf.holdright;
		this.mainctx = this.maincanvas.getContext('2d');
		

	}
	
	Chart.prototype.mydist = function(target, x1, x2, isstart, chartobj) {
	
	}


	Chart.prototype.mycross = function(target, x, y, isstart, chartobj) {
		if(chartobj.conf && chartobj.mainctx) {
			chartobj.mainctx.clearRect(0,0,chartobj.conf.spacewidth, chartobj.conf.spaceheight);
			chartobj.mainctx.drawImage(chartobj.context1.axiscanvas, 0, 0);
		
			IVOCHART.drawCrosshair(x - chartobj.offset.left, y - chartobj.offset.top, chartobj.conf, '#606060', chartobj.mainctx);
			chartobj.pt = Math.floor(IVOCHART.getBackPoint(chartobj.bias + (x - chartobj.prevzoom/2.- chartobj.offset.left), chartobj.prevzoom, chartobj.area.minx, chartobj.area.pointstepx) - 1 ) ;
			//var console = document.getElementById("console");
			//var data = chartobj.datafn();
			//console.innerHTML = "  "+x+"  o:"+(data.points[chartobj.pt]?data.points[chartobj.pt].o:0) + " h:"+(data.points[chartobj.pt]?data.points[chartobj.pt].h:0)+" l:"+(data.points[chartobj.pt]?data.points[chartobj.pt].l:0)+" c:"+(data.points[chartobj.pt]?data.points[chartobj.pt].c:0);
		}
	}

	Chart.prototype.myscroll = function(target, move, isstart, chartobj) {
		
		var oldbias = chartobj.bias; 
		chartobj.bias+=move;
		var data = chartobj.datafn();
		
		
		if(chartobj.area && 
		chartobj.bias+chartobj.conf.width>=chartobj.keepright + chartobj.area.cellx/2.+ chartobj.area.cellx)
		 {
			
			chartobj.keepright = chartobj.conf.cellx*data.points.length*chartobj.conf.xreduce[chartobj.conf.xreduce.length-1];
			if(move>0) {
				chartobj.bias = Math.max(oldbias , chartobj.keepright - chartobj.conf.width + chartobj.area.cellx/2.+ chartobj.area.cellx);
				chartobj.isonbound = chartobj.conf.holdright;
			}
			//alert('Here');
		} else {
			chartobj.keepright = chartobj.conf.cellx*data.points.length*chartobj.conf.xreduce[chartobj.conf.xreduce.length-1];
			//if(chartobj.area) chartobj.keepright = chartobj.area.width;
			chartobj.isonbound = false;
		}
		if(chartobj.touchobj && chartobj.touchobj.touchmode == TM_CROSSHAIR) {
			chartobj.isonbound = false;
		}
		
		if(chartobj.isfirsttimebound || chartobj.isonbound) {
			
			//if(document.getElementById('dconsole'))
		        //document.getElementById('dconsole').innerHTML = 'changeChart:'+(changeCounter++);
			
			var rightbound = (chartobj.keepright=chartobj.conf.cellx*data.points.length*chartobj.conf.xreduce[chartobj.conf.xreduce.length-1]) - chartobj.conf.width + chartobj.conf.cellx/2.+ chartobj.conf.cellx;
			chartobj.bias = rightbound;
			chartobj.isonbound = chartobj.conf.holdright;
			chartobj.isfirsttimebound = false;
			
		}
		
				
		
		chartobj.bias = chartobj.bias<0?0:chartobj.bias;
		
		chartobj.conf.cellx = chartobj.prevzoom;
		chartobj.conf.viewx = chartobj.bias;
		
		var result = IVOCHART.paintChart(chartobj.maincanvas, chartobj.mainctx, data, chartobj.conf, chartobj.context1);

		chartobj.area = result.area;
		chartobj.conf = result.conf;
		chartobj.pt = IVOCHART.getBackPoint( chartobj.bias + chartobj.conf.width/2., chartobj.area.cellx, chartobj.area.minx, chartobj.area.pointstepx);

	
	}
	

	Chart.prototype.myzoom = function(target, move, isstart, chartobj) {
		//alert("zoom"+move);
		if(Math.abs(move)<2) return;
		var data = chartobj.datafn();
		chartobj.isonbound = false;
		
		if(chartobj.area) {
			chartobj.bias = IVOCHART.getPoint( chartobj.pt, chartobj.zoom, chartobj.area.minx, chartobj.area.pointstepx) - chartobj.conf.width /2.;
		}
		chartobj.bias = chartobj.bias<0?0:chartobj.bias;	
		chartobj.prevzoom = chartobj.zoom;
		//alert("here2:"+chartobj.datafn().points+chartobj.conf);

		chartobj.conf.cellx = chartobj.zoom;
		chartobj.conf.viewx = chartobj.bias;
		chartobj.keepright = chartobj.conf.cellx*data.points.length*chartobj.conf.xreduce[chartobj.conf.xreduce.length-1];
		
		var result = IVOCHART.paintChart(chartobj.maincanvas, chartobj.mainctx, data, chartobj.conf, chartobj.context1);

		//alert(result.conf.width);
		if(move!=0)
			chartobj.zoom+=Math.max(Math.round(chartobj.zoom*2*(-move/result.conf.width)), move>0?-2:2);
		chartobj.zoom = chartobj.zoom>DEFAULT_ZOOM_MAX?DEFAULT_ZOOM_MAX:chartobj.zoom;
		chartobj.zoom = chartobj.zoom<DEFAULT_ZOOM_MIN?DEFAULT_ZOOM_MIN:chartobj.zoom;
		
	}
	
	

	Chart.prototype.paint = function() {
		
		this.myscroll(null, 1, true, this);
	}
	
	Chart.prototype.update = function(nums) {
		
		this.paint();
	}
	
	Chart.prototype.invalidate = function() {
        var chartdiv = document.getElementById(this.divid);
        var newwidth = chartdiv.offsetWidth;
        var newheight = chartdiv.offsetHeight
		
        if(newwidth==this.conf.spacewidth || newheight==this.conf.spaceheight)
            return;
        
		this.maincanvas.setAttribute('width', this.conf.spacewidth = newwidth);
		this.maincanvas.setAttribute('height', this.conf.spaceheight = newheight);
        
        this.conf.width = this.conf.spacewidth - 40;
		this.conf.height = this.conf.spaceheight - (this.conf.fontsize + this.conf.xtextbias); 

        this.paint();
    }
	
	Chart.prototype.handleTouches = function(touchdivid) {
	    //this.bias = 0;
	    
		this.offset = getOffset(touchdivid);
		if(this.touchobj) this.touchobj.clearEvents(this.divid);
    	this.touchobj = attachTouch(touchdivid, this.myscroll, this.myzoom, this.mycross, this.mydist, this);
	}
	
	Chart.prototype.setTouchMode = function(mode){
		if(this.touchobj) this.touchobj.setTouchMode(mode);
	}
	
	Chart.prototype.destroy = function(){
		if(this.touchobj) this.touchobj.clearEvents(this.divid);
	
	}
	
	function configure(conf, width, height) {
		if(!conf) conf = {};
		if(!conf.spacewidth) conf.spacewidth = width;
		if(!conf.spaceheight) conf.spaceheight = height;
		if(!conf.xperiod) conf.xperiod = '1m';
		if(!conf.xtextbias) conf.xtextbias = 4;
		if(!conf.xlbloffset) conf.xlbloffset = 3;
		if(!conf.fontsize) conf.fontsize = 8.1;
		if(!conf.holdright) conf.holdright = true;
		if(!conf.font) conf.font = 'Arial';
		if(!conf.width) conf.width = conf.spacewidth - 40;
		if(!conf.height) conf.height = conf.spaceheight - (conf.fontsize + conf.xtextbias); 
		if(!conf.xticks) conf.xticks = 5;
		if(!conf.yticks) conf.yticks = 5;
		if(!conf.viewx) conf.viewx = 0;
		if(!conf.viewy) conf.viewy = 0;
		if(!conf.cellx) conf.cellx = DEFAULT_ZOOM_MIN;
        if(!conf.celly) conf.celly = 1;
	    if(!conf.celloffset) conf.celloffset = 2;
        if(!conf.ticklength) conf.ticklength = 3;
		if(!conf.bordercolor) conf.bordercolor = 'rgb(0,0,0)';
        if(!conf.gridcolor) conf.gridcolor = 'rgb(220,220,220)';
		//if(!conf.xreduce) conf.xreduce = [1, 1];
		//if(!conf.yreduce) conf.yreduce = [0.3, 1];
		if(!conf.xreduce) conf.xreduce = [1, 1];
		if(!conf.yreduce) conf.yreduce = [1, 1];
		if(!conf.minmax) conf.minmax = IVOCHART.ohlcMinMax;
		if(!conf.charttype) conf.charttype = IVOCHART.drawCandle;
		//if(!conf.minmax) conf.minmax = IVOCHART.ohlcMinMax;
		//conf.minmax = [IVOCHART.volumeMinMax, IVOCHART.ohlcMinMax]; 
		//conf.charttype = [IVOCHART.drawVolume, IVOCHART.drawCandle];
		//if(!conf.charttype) conf.charttype = IVOCHART.drawCandle;
		return conf;

	}
	
	Chart.prototype.recreate = function(datafn, conf){
		this.destroy();
		var chartdiv = document.getElementById(this.divid);
		
		this.maincanvas.setAttribute('width', conf.spacewidth = chartdiv.offsetWidth);
		this.maincanvas.setAttribute('height', conf.spaceheight = chartdiv.offsetHeight);

		var chart = new Chart(this.divid, this.chartid, datafn, configure(conf, conf.spacewidth, conf.spaceheight), this.maincanvas, this.context1);
		if(this.touchobj) {
			chart.handleTouches(this.divid);
		}
		return chart;
	}
	
	
	function newInstance(divid, chartid, datafn, newconf) {
		var chartdiv = document.getElementById(divid);
		
		var basecanvas = document.getElementById(chartid);
		var conf = configure(newconf, chartdiv.offsetWidth, chartdiv.offsetHeight);
		
		if (!basecanvas) {
			basecanvas = document.createElement('canvas');
			basecanvas.id = chartid;
			basecanvas.setAttribute('width', conf.spacewidth);
			basecanvas.setAttribute('height', conf.spaceheight);
			chartdiv.appendChild(basecanvas);
		} else {
			basecanvas.setAttribute('width', conf.spacewidth);
			basecanvas.setAttribute('height', conf.spaceheight);
		}
		var context1 = {
			axiscanvas: document.createElement('canvas'),
			datacanvas: document.createElement('canvas')
		}
		var chart = new Chart(divid, chartid, datafn, conf, basecanvas, context1);
		return chart;
	}
	

	
	this.newInstance = newInstance;
	
}

var testdata = { id: 0 };
var testchart;
var index;
var currdate = new Date();
function mydata() {
	return testdata;
}

function testAppend() {
	currdate = new Date(currdate.getTime() + 60*1000);
	testdata.points[testdata.points.length] = {n:index+1, o:4+index%5, c:5+index%6, l:3-index%3, h:12+index%4, v:500*index%10, t:currdate.getTime()};
	index++;
	testchart.paint();
	setTimeout(testAppend,300);
}

function runTest(iscross) {

testchart = ChartFactory.newInstance("touchchart", "chart", function(){
	return mydata();
}, 
{ 
minmax: [IVOCHART.volumeMinMax, IVOCHART.ohlcMinMax], charttype: [IVOCHART.drawVolume, IVOCHART.drawCandle]
//minmax: IVOCHART.closeMinMax, charttype: IVOCHART.drawCurve
, yreduce:[1, 1], xperiod: '1m' });

testdata.points = [
             {n:1, o:3, c:3, l:1.8, h:4, v:20000, t:1298977740000},
             {n:2, o:2.7, c:3.8, l:2, h:5, v:25000, t:1298977680000},
             {n:3, o:3.8, c:2.4, l:1.6, h:4.2, v:20000, t:1298977740000},
             {n:4, o:2, c:3, l:1.8, h:4, v:25000, t:1298977680000},
             {n:5, o:2.7, c:3.8, l:2, h:5, v:20000, t:1298977740000},
             {n:6, o:3.8, c:2.4, l:1.6, h:4.2, v:25000, t:1298977680000},
             {n:7, o:2, c:3, l:1.8, h:4, v:20000, t:1298977740000},
             {n:8, o:2.7, c:3.8, l:2, h:5, v:25000, t:1298977680000},
             {n:9, o:3.8, c:2.4, l:1.6, h:4.2, v:20000, t:1298977740000},
             {n:10, o:10, c:13, l:1.8, h:19, v:25000, t:1298977680000},
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
           ];

index = 48;
//testchart.paint(testdata);
testchart.paint();
testchart.handleTouches("touchchart");

if (iscross) {
	
	//testchart.myzoom(null, -200, false, testchart);
	//testchart.myzoom(null, -200, false, testchart);
	testchart.setTouchMode(1);
}
currdate = new Date(testdata.points[47].t);

setTimeout(testAppend,200);

//testchart.myzoom(null, -100, false, testchart);
	
}
