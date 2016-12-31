var express=require('express');
var request=require('request');
var fs=require('fs');
var app=express();
var path = require('path');
var Bing = require('node-bing-api')({ accKey: "20aacff8d7144aa1b2e0befe613b89a7" });
var helpers = require('handlebars-helpers');
var array = helpers.array();
var Handlebars = require('express3-handlebars');
var schedule=require('node-schedule');
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



//Dummy Menu 
var menu=JSON.parse(fs.readFileSync('menu','utf8'));

function getMatchingFoods(favorites,menu){
	console.log(favorites);
	var matchedLunchFoods=[];
	

	menu.forEach(function(hallObj){
		var lunchObj=hallObj.meals[1].genres[hallObj.meals[1].genres.length-1];
		console.log("Lunch Takeout for "+hallObj.location_name+": "+lunchObj);
		
		lunchObj.items.forEach(function(lunchFood){
			favorites.forEach(function(favFood){
				if(lunchFood.valueOf()==favFood.valueOf()){
					matchedLunchFoods.push(favFood);
				}
			});
		});
    });
    return(matchedLunchFoods);
}



/*request('https://rumobile.rutgers.edu/1/rutgers-dining.txt', function (error, response, body) {
  if (!error && response.statusCode == 200) {
    var menuObj=JSON.parse(body);

    
    

  }
});*/



var foods=["12\" Hoagie Roll",
                     "Cheese Pizza",
                     "Chip Assortment T/O",
                     "Cookie Assortment T/O",
                     "Genoa Salami",
                     "Grilled Chicken Caesar Salad",
                     "Italian Meatballs .5 Oz",
                     "Multigrain Sub Roll",
                     "Ranch Dressing Ff",
                     "Roast Beef",
                     "Tuna Salad",
                     "Turkey Breast",
                     "Ultimo Pepperoni Pizza Takeout",
                     "Variety Wraps",
                     "Beef Meatball Sub Knight Room",
                     "Chicken Caesar Wrap",
                     "Chips Take Out",
                     "Double Turkey On A Croissant",
                     "Fresh Garden Salad",
                     "Grilled Buffalo Chicken Salad",
                     "Grilled Chicken Caesar Salad",
                     "Italian Dressing",
                     "Multigrain Sub Roll",
                     "P,B, & J",
                     "Round Cheese Pizza",
                     "Round Pepperoni Pizza",
                     "Teriyaki Sesame Tofu",
                     "Big Martys Hamburger Bun",
                     "Black Bean & Corn Salad K.R.",
                     "Brew City Fry Potatoes",
                     "Chicken Patty Brower Lto",
                     "Grilled Chicken Breast",
                     "Knight Room Caesar Salad Plain",
                     "Knight Room Vegetable Burger",
                     "Mozzarella Cheese Sticks"
                     ];
var foodObjs=[];
function getFoodImages(ruFoodIndex, ruFoods){
	if(ruFoodIndex>=ruFoods.length){
		return;
	}
	Bing.images(ruFoods[ruFoodIndex],function(error, res, body){
		if (error) return console.error(error);
    	foodObjs.push({food:ruFoods[ruFoodIndex].replace(new RegExp(" ","g"),"_"),image:body.value[0].contentUrl});
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
			mongoose.connection.close();
			res.render('foods',{name:req.body.first_name,foods:foodObjs,phone_number:req.body.phone_number});
	/*
	})*/
	
	});
});

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
					rule.hour=13;
					rule.minute=17;
					var j=schedule.scheduleJob(rule,function(){
						var mathedFoods=getMatchingFoods(mongoRes.foods,menu);
						console.log(mathedFoods);
					})
					mongoose.connection.close();
					
			});
	});
}

app.post("/picked_foods",function(req,res){
	console.log(req.body);
	if(mongoose.connection.readyState==0){
		mongoose.connect("mongodb://hems03:bobby007@ds143588.mlab.com:43588/takeout",
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





app.listen(app.get('port'), function(){
  console.log( 'Express started on http://localhost:' + 
    app.get('port') + '; press Ctrl-C to terminate.' );
});