var accountSid = 'AC0b1f09e79d2eb190440a1d2ef4b232cb'; 
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
}