String.prototype.padL = function(n, pad)
{
	t = '';
	if(n>this.length){
		for(i=0;i < n-this.length;i++){
			t+=pad;
		}
	}
	return t+this;
}
String.prototype.padR = function(n, pad)
{
	t = this;
	if(n>this.length){
		for(i=0;i < n-this.length;i++){
			t+=pad;
		}
	}
	return t;
}

function formatDate(date, format){
	
	var monthesShort = {
		0: "Jan",
		1: "Feb",
		2: "Mar",
		3: "Apr",
		4: "May",
		5: "Jun",
		6: "Jul",
		7: "Aug",
		8: "Sep",
		9: "Oct",
		10: "Nov",
		11: "Dec"
	};

    
    if (!format) 
        format = "MM/dd/yyyy";
    
    var month = date.getMonth() + 1;
    var year = date.getFullYear();
    
    format = format.replace("MM", month.toString().padL(2, "0"));

    if (format.indexOf("3m") > -1) 
        format = format.replace("3m", monthesShort[month - 1]);
    
    if (format.indexOf("yyyy") > -1) 
        format = format.replace("yyyy", year.toString());
    else 
        if (format.indexOf("yy") > -1) 
            format = format.replace("yy", year.toString().substr(2, 2));
    
    format = format.replace("dd", date.getDate().toString().padL(2, "0"));
    
    var hours = date.getHours();
    
    if (format.indexOf("t") > -1) {
        if (hours > 11) 
            format = format.replace("t", "pm")
        else 
            format = format.replace("t", "am")
    }
    
    if (format.indexOf("HH") > -1) 
        format = format.replace("HH", hours.toString().padL(2, "0"));
    if (format.indexOf("hh") > -1) {
        if (hours > 12) 
            hours - 12;
        if (hours == 0) 
            hours = 12;
        format = format.replace("hh", hours.toString().padL(2, "0"));
    }
    
    if (format.indexOf("mm") > -1) 
        format = format.replace("mm", date.getMinutes().toString().padL(2, "0"));
    
    if (format.indexOf("ss") > -1) 
        format = format.replace("ss", date.getSeconds().toString().padL(2, "0"));
    
    return format;
}

