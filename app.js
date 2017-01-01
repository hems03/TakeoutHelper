var express=require('express');
var request=require('request');
var fs=require('fs');
var easyimg=require('easyimage');
var app=express();
var path = require('path');
var Bing = require('node-bing-api')({ accKey: "58721dab6e1f43238bade8e6fd9ab8fa" });
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

	
	var result=[];
	menu.forEach(function(hallObj){
		var lunchObj=hallObj.meals[1].genres[hallObj.meals[1].genres.length-1];
		console.log("Lunch Takeout for "+hallObj.location_name+": "+lunchObj);
		var matchedLunchFoods=[];
		lunchObj.items.forEach(function(lunchFood){
			favorites.forEach(function(favFoodObj){
				var words=favFoodObj.food.split(' ');
				var match=true;
				words.every(function(word,index){
					if(lunchFood.includes(word)){
						return true;
					}
					match=false;
					return (match);
				});
				if(match){
					matchedLunchFoods.push(favFoodObj.food);
				};
			});
		});
		if(matchedLunchFoods.length!=0){
				result.push({
					hall:hallObj.location_name,
					matched_foods:matchedLunchFoods
				});
		}
    });
    return(result);
}



/*request('https://rumobile.rutgers.edu/1/rutgers-dining.txt', function (error, response, body) {
  if (!error && response.statusCode == 200) {
    var menuObj=JSON.parse(body);

    
    

  }
});*/


//Will add all foods come next semester
var foods=["Hoagie Roll",
                     "Cookie Assortment",
                     "Genoa Salami",
                     "Grilled Chicken Caesar Salad",
                     "Italian Meatballs",
                     "Roast Beef",
                     "Tuna Salad",
                     "Turkey Breast",
                     "Variety Wraps",
                     "Beef Meatball Sub Knight Room",
                     "Chicken Caesar Wrap",
                     "Double Turkey On A Croissant",
                     "Fresh Garden Salad",
                     "Grilled Buffalo Chicken Salad",
                     "P B and J",
                     "Round Cheese Pizza",
                     "Round Pepperoni Pizza",
                     "Teriyaki Sesame Tofu",
                     "Big Martys Hamburger Bun",
                     "Black Bean Corn Salad",
                     "Brew City Fry Potatoes",
                     "Chicken Patty Brower",
                     "Grilled Chicken Breast",
                     "Knight Room Vegetable Burger",
                     "Mozzarella Cheese Sticks"
                     ];
function getFoodIDs(foods){
	var foodIds=[];
	foods.forEach(function(food){
		foodIds.push(food.replace(new RegExp(" ","g"),"_"));
	})
	return(foodIds);
}

var User=require('./models/user.js');
var mongoose=require('mongoose');
var opts={
	server:{
		socketOptions:{
			keepAlive:30000
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
	var newUser= new User({
		first_name:req.body.first_name,
		last_name:req.body.last_name,
		phone_number:req.body.phone_number
	})
	mongoose.connect("mongodb://anyone:anyone@ds143588.mlab.com:43588/takeout",
		opts,
		function(err){
			if(err) return console.error(err);
			User.findOne({phone_number:req.body.phone_number},function(err,doc){
				if(doc!=null){
					newUser.save(function(err,res){
							if(err)return console.error(err);
							console.log("User Saved");
				
					});
				}else{
					console.log('User Being Updated');
				}
			})
			
			mongoose.connection.close();
			res.render('foods',{name:req.body.first_name,foods:getFoodIDs(foods),phone_number:req.body.phone_number});
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
					rule.dayOfWeek=[0,schedule.Range(0,6)];
					rule.hour=11;
					rule.minute=28;
					var j=schedule.scheduleJob(rule,function(){
						var matchedFoods=getMatchingFoods(mongoRes.foods,menu);
						console.log("Matched Foods:"+matchedFoods);
					})
					mongoose.connection.close();
					
			});
	});
}

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





app.listen(app.get('port'), function(){
  console.log( 'Express started on http://localhost:' + 
    app.get('port') + '; press Ctrl-C to terminate.' );
});