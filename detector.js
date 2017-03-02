var fs = require('fs');
var ip2country = require('ip2country');

var countryList = ['IN'];

var attackDetector = {
  isHeaderAttack: function(req) {
  	return req[tokenMap.ORIGIN_HEADER] == '"MATLAB R2013a"';
  },
  isIPAttack : function(req) {
    return countryList.indexOf(req[tokenMap['CLIENT_IP:port']].split(':')[0]) !== -1;
  }    
}


function _split(str, separator, ignoreChar) {

	var temp = '';
	var isIgnoreCharEncountered = false;

	var result = [];
	for (var i = 0; i < str.length; i++) {
		if (str[i] == separator && !isIgnoreCharEncountered) {
			result.push(temp);
			temp = '';
		} else {
			if (str[i] == ignoreChar) {
				isIgnoreCharEncountered = !isIgnoreCharEncountered;
			}
			temp += str[i];
		}
	}

	result.push(temp);
	return result;
}

function detectAttack(request){
	var attacked = 'No';
	var attackList = Object.keys(attackDetector);
	var requestSplitted = [];
	requestSplitted = _split(request, ' ', '"');

	for (var i in attackList) {
		if (attackDetector[attackList[i]](requestSplitted)) {
			attacked = 'Yes';
			break;
		}
	}

	return attacked;
}

function analyze(input) {
	input = input.split('\n');
	var output =[];

	input.forEach(function(request) {
		var attacked = detectAttack(request);
		console.log(attacked, request);
		output.push(attacked + ', ' + request);
	});
	return output;
}
 
function createTokenMap(logSignature) {
	var tokens = logSignature.split(' ');
	var map = {};
	tokens.forEach(function(t, i) {
		map[t] = i;
	})
	return map;
}

var logSignature = 'HTTP_METHOD URL HTTP_VERSION ORIGIN_HEADER SSL_CIPHER SSL_PROTOCOL LB_NAME TIMESTAMP CLIENT_IP:port BACKEND_IP:port request_processing_time backend_processing_time response_processing_time elb_status_code backend_status_code received_bytes sent_bytes';
var tokenMap;

module.exports = function(req, res, next){

	logSignature = req.body.logSignature;// || logSignature;
	tokenMap = createTokenMap(logSignature);

	var fsReadStream = fs.createReadStream(req.files.logFile.path);
	var file_input = "";
	 
	fsReadStream.on("data", function (input) {
	  file_input += input;
	})
	.on("end", function () {
	  req.output = analyze(file_input);
	  return next();
	});
}

