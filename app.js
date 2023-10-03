//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ =require("lodash");


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://venkatesh:Temp@db.c10ouyp.mongodb.net/TodolistDB");

const itemSchma = ({
  name:String
});

const Item = mongoose.model("Item",itemSchma);

const item1 = new Item({
  name:"welcome"
});
const item2 = new Item({
  name:"to"
});
const item3 = new Item({
  name:"my Todolist"
});

const defaultItem = [item1,item2,item3];

const listsSchema = ({
  name:String,
  items:[itemSchma]
});

const List = mongoose.model("list",listsSchema);


app.get("/", function(req, res) {
  Item.find({}).then((founditem)=>{
    if(founditem.length === 0){
      Item.insertMany(defaultItem);
      res.redirect("/")
    }else{
      res.render("list", {listTitle: "Today", newListItems: founditem});
    }
  });
});

app.get("/:customTitle", function(req,res){
  const customTitle = _.capitalize(req.params.customTitle);
  List.findOne({name: customTitle}).then((foundlist)=>{
    if(!foundlist){
      const list = new List({
        name:customTitle,
        items:defaultItem
      });
      list.save();
      res.redirect("/"+ customTitle);
    }else{
      res.render("list", {listTitle: foundlist.name, newListItems: foundlist.items})
    }
  })
})
 
app.post("/", function(req, res){
  const newitem = req.body.newItem;
  const listTitle = req.body.list;
  const item = new Item({
    name:newitem
  })
  if(listTitle === "Today"){
    item.save();
    res.redirect("/")
  }else{
    List.findOne({name: listTitle}).then((foundlist)=>{
      foundlist.items.push(item);
      foundlist.save();
      res.redirect("/"+ listTitle);
    });
  }
});

app.post("/delete",function(req, res){
  const removeItem = req.body.checkId;
  const deleteTitle = req.body.delete;
  if(deleteTitle==="Today"){
    Item.findOneAndRemove({_id:removeItem}).then(()=>{console.log("successfuly deleted");});
    res.redirect("/")
  }else{
    List.findOneAndUpdate({name:deleteTitle},{$pull: {items:{_id:removeItem}}}).then(()=>{console.log("deleted");});
    res.redirect("/"+deleteTitle);
  }
});
let port =process.env.PORT;
if(port == null || port == ""){
  port=3000;
}
app.listen(port, function() {
  console.log("Server started has started successfully");
});
