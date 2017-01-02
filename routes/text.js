var fs=require('fs');
var accountSid = fs.readFileSync('routes/api_keys','utf8');
var authToken = 'e521606e176f354a1543e63638bebc07';

var client = require('twilio')(accountSid, authToken); 

var exports=module.exports;

exports.sendLunchFoods=function(lunchFoods,phoneNumber){
	var message="Food Favorites Being Served Today: "+JSON.stringify(lunchFoods);
	client.messages.create({ 
    	to: phoneNumber, 
    	from: " +18482307126", 
    	body: message, 
	}, function(err, message) { 
		if(err)console.error(err);
    	console.log("Message Successfully Sent To: "+phoneNumber);
	});
};