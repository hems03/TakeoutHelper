var express=require('express');
var request=require('request');
var app=express();
var path = require('path');
var Bing = require('node-bing-api')({ accKey: "20aacff8d7144aa1b2e0befe613b89a7" });
var handlebars = require('express3-handlebars').create({
	layoutsDir: path.join(__dirname, "views"),
    
    helpers: {
        section: function(name, options){
            if(!this._sections) this._sections = {};
            this._sections[name] = options.fn(this);
            return null;
        }
    }
});

request('https://rumobile.rutgers.edu/1/rutgers-dining.txt', function (error, response, body) {
  if (!error && response.statusCode == 200) {
    var menuObj=JSON.parse(body);
    menuObj.forEach(function(hallObj){
    	console.log(hallObj.meals[hallObj.meals.length-2]);
    });
    

  }
});



var foods=["tacos","burritos","chicken_nuggets"];
var foodObjs=[];

function getFoodImages(ruFoodIndex, ruFoods){
	if(ruFoodIndex>=ruFoods.length){
		return;
	}
	Bing.images(ruFoods[ruFoodIndex],function(error, res, body){
    	foodObjs.push({food:ruFoods[ruFoodIndex],image:body.value[0].contentUrl});
    	console.log(body.value[0].contentUrl);
    	getFoodImages(++ruFoodIndex,ruFoods);

  	})
}
getFoodImages(0,foods);

var User=require('./models/user.js');
var mongoose=require('mongoose');
var opts={
	server:{
		socketOptions:{
			keepAlive:30000,
			 socketTimeoutMS: 30000,
      		connectionTimeoutMS: 30000
		}
	}
};


var Materialize = require('node-materialize');
app.use(express.static(__dirname + "/public"));
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.use(require('body-parser').urlencoded({extended:true}));
app.set('port',3000);



app.get('/takeout',function(req,res){
	res.render('index');
})

app.post('/process',function(req,res){
	console.log(req.body);
	var newUser= new User({
		first_name:req.body.first_name,
		last_name:req.body.last_name,
		phone_number:req.body.phone_number
	})
	mongoose.connect("mongodb://hems03:bobby007@ds143588.mlab.com:43588/takeout",
		opts,
		function(err){
			if(err) return console.error(err);
			newUser.save(function(err,res){
				if(err)return console.error(err);
				console.log("User Saved");
			});
			res.render('foods',{name:req.body.first_name,foods:foodObjs});
	/*
	})*/
	
	});
});

app.listen(app.get('port'), function(){
  console.log( 'Express started on http://localhost:' + 
    app.get('port') + '; press Ctrl-C to terminate.' );
});