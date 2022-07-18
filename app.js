const express = require("express");
const bodyParser = require("body-parser");
const request=require("request");
const app = express();
const mongoose=require("mongoose");
const _=require("lodash");

app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));


mongoose.connect("mongodb://localhost:27017/toDoListDB");

const toDOSchema={
    task: String
};

const Task = mongoose.model("Task", toDOSchema);

const ListSchema={
    name: String,
    todos: [toDOSchema]
}
const List = mongoose.model("List", ListSchema);


const defaultItems=[];




app.get("/", function(req, res){

    var today=new Date();

    var options =
    {
        weekday: "long",
        day: "numeric",
        month: "long"
    };
    var day=today.toLocaleDateString("en-US",options);
    var liss=[];
    List.find({},function(err,foundLists){
        
        foundLists.forEach(function(ele){
            liss.push(ele.name);
        })
        
    })
    Task.find({}, function(err, foundTasks){
    
        res.render("list", {title: "Today", newItems:foundTasks, newLists: liss});
    });
    

});


app.post("/", function(req,res){

    const listName=req.body.button;
    if(req.body.newItem.length>0)
    {
        const todo=new Task({
            task: req.body.newItem
            
            });
        if(req.body.button === "Today")
        {
            
            todo.save();
            res.redirect("/");
        }
        else
        {
            List.findOne({name: listName}, function(err, foundList){
                foundList.todos.push(todo);
                foundList.save();
                res.redirect("/"+ listName);
            });
        }
    }
    
});

app.post("/delete" ,function(req,res){
    const toDoID=req.body.checkbox;
    const listName=req.body.listName;
    if(listName==="Today")
    {
        Task.findByIdAndRemove(req.body.checkbox, function(err){
            setTimeout(() => {
                
                if(!err)
                {
                    res.redirect("/");
                }
            }, 500);
        });
    }
    else
    {
        List.findOneAndUpdate({name : listName},{$pull:{todos:{_id:toDoID}}},function(err,foundList){
            setTimeout(() => {
                
                if(!err)
                {
                    res.redirect("/"+ listName);
                }
            }, 500);
            
        });
    }
    
})

app.get("/:custom", function(req,res){

    const customName=_.capitalize(req.params.custom);
    var liss=[];
    List.find({},function(err,foundLists){
        
        foundLists.forEach(function(ele){
            liss.push(ele.name);
        })
        
    })
    List.findOne({name: customName }, function(err, foundList){
        if(!err)
        {
            if(!foundList)
            {
            const list=new List({
                name: customName,
                todos: defaultItems
            });
            list.save();
            res.redirect("/"+customName);
            }
            else
            {
                res.render("list", {title: foundList.name, newItems:foundList.todos , newLists: liss});
            }
        }
        
        });

    
    
});

app.post("/liss",function(req,res){

    const listName=req.body.newList;
    res.redirect("/"+listName);
});

app.post("/deletel",function(req,res){
    const listName=req.body.del;
    List.deleteOne({name : listName},function(err){
        res.redirect("/");
    });
});
app.listen(3000, function(){
    console.log("Server started on port 3000.");
});

