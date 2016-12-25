var mongoose=require('mongoose');
var userSchema=mongoose.Schema({
	first_name:String,
	last_name:String,
	phone_number:String,
	foods:[String]
});
userSchema.methods.getFoods=function(){
	return this.foods;
}
var User=mongoose.model('User', userSchema);
module.exports=User;