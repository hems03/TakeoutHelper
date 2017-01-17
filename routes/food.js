var fs=require('fs');
var request=require('request');
var CronJob=require('cron').CronJob;

var takeoutItems;
var exports = module.exports;

//Need to add more takeout items
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
                     "P B J",
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
var menu;
request('https://rumobile.rutgers.edu/1/rutgers-dining.txt',function(err,response,body){
			menu=JSON.parse(body);
			console.log(body);

		});
var getMenu=function(){
	var job=new CronJob('00 00 12 * * 1-5',function(){
		request('https://rumobile.rutgers.edu/1/rutgers-dining.txt',function(err,response,body){
			menu=body;

		});
	}
	,null,true,null);	
}
getMenu();


exports.getMatchingFoods=function(favorites){
	console.log(favorites);

	
	var result=[];
	menu.forEach(function(hallObj){
		var lunchObj=hallObj.meals[1].genres[hallObj.meals[1].genres.length-1];
		console.log(lunchObj);
		if(lunchObj.genre_name.valueOf()!='Lunch To Go'
			&&lunchObj.genre_name.valueOf()!='Knight Room'){
			return;
		}
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

exports.getFoodsIDs=function(){
	var foodIds=[];
	foods.forEach(function(food){
		foodIds.push(food.replace(new RegExp(" ","g"),"_"));
	})
	return(foodIds);
}

exports.getFoods=function(){
	return foods;
}