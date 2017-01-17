var fs=require('fs');
var schedule=require('node-schedule');
var CronJob=require('cron').CronJob;
var foodClient=require('./food');
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


exports.setTextJob=function(doc){
	var time=doc.lunch_time.split(':');
	var hour=parseInt(time[0],10);
	var minute=parseInt(time[1],10);	
	var cronSchema='00 '+minute+' '+hour+' * * 1-5';
	console.log('cronSchema: '+cronSchema);
	var job=new CronJob(cronSchema,function(){
		var matchedFoods=foodClient.getMatchingFoods(doc.foods);
		console.log(matchedFoods);
		exports.sendLunchFoods(matchedFoods,doc.phone_number);
	}
	,null,true,null);		
	
}