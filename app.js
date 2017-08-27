var express=require('express');
var app=express();
var request=require('request');
var path = require('path');
var Handlebars = require('express3-handlebars');
var schedule=require('node-schedule');
var foodClient=require('./routes/food');
var textClient=require('./routes/text');

const resizeImg = require('resize-img');
var fs = require('fs');
var handlebars=Handlebars.create({
	layoutsDir: path.join(__dirname, "views"),
    
    helpers: {
        section: function(name, options){
            if(!this._sections) this._sections = {};
            this._sections[name] = options.fn(this);
            return null;
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
					textClient.setTextJob(doc);
					mongoose.connection.close();
					
			});
	});
}

/*fs.readdir('newpics',function(err,files){
	files.forEach(function(file,index){
		resizeImg(fs.readFileSync('newpics/'+file), {width: 128, height: 128}).then(buf => {
   		 fs.writeFileSync('public/img/foods/'+file, buf);
   		 
		});
		

	})
})*/


 




app.get('/',function(req,res){
	res.render('index');
});

app.post('/process',function(req,res){
	console.log(req.body);
	var newUser= {
		first_name:req.body.first_name,
		last_name:req.body.last_name,
		phone_number:req.body.phone_number,
		lunch_time:req.body.lunch_time
	};
	var opts={upsert:true};
	mongoose.connect("mongodb://anyone:anyone@ds143588.mlab.com:43588/takeout",
		opts,
		function(err){
			var userType;
			if(err) return console.error(err);
			User.findOne({phone_number:req.body.phone_number}
				,{$set:newUser}
				,opts
				,function(err,doc){
					if(err)console.error(err);
					mongoose.connection.close();
					res.render('foods',
					{name:req.body.first_name,
						foods:foodClient.getFoodsIDs(),
						phone_number:req.body.phone_number,
					});
			});
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

var port=process.env.PORT||3000;
app.listen(port, function(){
  console.log( 'Express started on http://localhost:' 
  	+ port
  	+ ' press Ctrl-C to terminate.' );
});