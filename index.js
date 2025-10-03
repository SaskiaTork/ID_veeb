const express = require("express");
const fs = require("fs");
const bodyparser = require("body-parser");
const dateEt = require("./src/dateTimeET");
// loome objeksti mis ongi express.js programm ja edasi kasutamegi seda
const app = express();
//määrame renderdajaks ejs
app.set("view engine", "ejs");
//määrame kasutamiseks avaliku kataloogi
app.use(express.static("public"));
//päringu url-i parsimine, eraldame post osa. false, ki ainult ükstekst, true. kui muud infot ka
app.use(bodyparser.urlencoded({extended: false}));

app.get("/", (req,res)=>{
	//res.send("Express.js läks edukalt käima!");
	res.render("index");
});

app.get("/timenow", (req,res)=>{
	res.render("timenow", {nowDate: dateET.longDate(), nowWd: dateET.weekDay()});
});

app.get("/vanasonad", (req,res)=>{

	fs.readFile("public/vanasonad.txt", "utf8", (err, data)=>{
		if(err){
			res.render("genericlist", {heading: "Valik Eesti tuntut vanasõnasid", listData: ["Kahjuks vanasõnasid ei leidnud!"]});
		} else {
			let folkWisdom = data.split (";");
			res.render("genericlist", {heading: "Valik Eesti tuntut vanasõnasid", listData: folkWisdom});
		}
	});
	
});

app.get("/regvisit", (req,res)=>{
	res.render("index");
});

app.post("/regvisit", (req, res)=>{
	console.log(req.body);
	//avan tekstifaili kirjutamiseks sellisel moel, et kui teda pole, luuakse (parameeter "a")
	fs.open("public/txt/visitlog.txt", "a", (err, file)=>{
		if(err){
			throw(err);
		}
		else {
			//faili senisele sisule lisamine
			fs.appendFile("public/txt/visitlog.txt", req.body.nameInput + "; ", (err)=>{
				if(err){
					throw(err);
				}
				else {
					console.log("Salvestatud!");
					res.render("regvisit");
				}
			});
		}
	});
});

app.listen(5213);