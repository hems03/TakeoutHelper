var fs=require('fs');
var menu=JSON.parse(fs.readFileSync('menu','utf8'));
var exports = module.exports;

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

exports.getMatchingFoods=function(favorites){
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