var express=require('express');
var app=express();
var request=require('request');
var path = require('path');
var Handlebars = require('express3-handlebars');
var schedule=require('node-schedule');
var foodClient=require('./routes/food');
var textClient=require('./routes/text');
var handlebars=Handlebars.create({
	layoutsDir: path.join(__dirname, "views"),
    
    helpers: {
        section: function(name, options){
            if(!this._sections) this._sections = {};
            this._sections[name] = options.fn(this);
            return null;
        },
        arrayify:function(stuff){
        	var arr=[];
        	var i=0;
        	stuff=JSON.stringify(stuff);
        	while(stuff.indexOf(",")!=-1){
        		
        		arr.push(stuff.substr(0,stuff.indexOf(",")));
        		i=stuff.indexOf(",");
        		stuff=stuff.substr(i+1,stuff.length-1);
        	}
        	return(arr);
        },
        json:function(stuff){
        	return(JSON.stringify(stuff));
        }
    }
});
var User=require('./models/user.js');
var mongoose=require('mongoose');
var opts={
	server:{
		socketOptions:{
			keepAlive:1,
			connectTimeoutMS:30000
		}
	}
};
app.use(express.static(__dirname + "/public"));
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.use(require('body-parser').urlencoded({extended:true}));

function saveUserFoods(phoneNumber,foods){
	
	console.log(phoneNumber);
	User.findOne({phone_number:phoneNumber},function(err,doc){
				if(err)return console.error(err);
				doc.foods=foods;
				doc.save(function(err,mongoRes){
					if(err) return console.error(err);
					console.log('User Foods Updated');
					var rule=new schedule.RecurrenceRule();
					rule.dayOfWeek=[0,schedule.Range(0,5)];
					var time=doc.lunch_time.split(':');
					rule.hour=22//parseInt(time[0]);
					rule.minute=3//parseInt(time[1]);
					var j=schedule.scheduleJob(rule,function(){
						var matchedFoods=foodClient.getMatchingFoods(mongoRes.foods);
						console.log("Matched Foods:"+matchedFoods);
						textClient.sendLunchFoods(matchedFoods,mongoRes.phone_number);
					})
					mongoose.connection.close();
					
			});
	});
}



app.get('/',function(req,res){
	res.render('index');
})

app.post('/process',function(req,res){
	console.log(req.body);
	var newUser= new User({
		first_name:req.body.first_name,
		last_name:req.body.last_name,
		phone_number:req.body.phone_number,
		lunch_time:req.body.lunch_time
	});
	mongoose.connect("mongodb://anyone:anyone@ds143588.mlab.com:43588/takeout",
		opts,
		function(err){
			var userType;
			if(err) return console.error(err);
			User.findOne({phone_number:req.body.phone_number},function(err,doc){
				if(err)console.error(err);
				if(doc==null){
					userType='newUser';
					newUser.save(function(err,res){
							if(err)return console.error(err);
							console.log("User Saved");
				
					});
				}else{

					userType='currentUser';
					console.log('User Being Updated');
				}
				mongoose.connection.close();

				res.render('foods',
				{name:req.body.first_name,
					foods:foodClient.getFoodsIDs(),
					phone_number:req.body.phone_number,
					userType:userType
				});
			})
			
			
	/*
	})*/
	
	});
});

app.post("/picked_foods",function(req,res){
	console.log(req.body);
	if(mongoose.connection.readyState==0){
		mongoose.connect("mongodb://anyone:anyone@ds143588.mlab.com:43588/takeout",
		opts,
		function(err){
			if (err) return console.error(err);
			saveUserFoods(req.body.phone,req.body.foods);
		});
	}else{
		saveUserFoods(req.body.phone,req.body.foods);
	}
	
	

});

app.get('/thanks',function(req,res){
	res.render('thanks');
})

app.listen(process.env.PORT||3000, function(){
  console.log( 'Express started on http://localhost:' + 
    app.get('port') + '; press Ctrl-C to terminate.' );
});