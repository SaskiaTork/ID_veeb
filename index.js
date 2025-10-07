const express = require("express");
const fs = require("fs");
const bodyparser = require("body-parser");
//lisan andmebaasiga suhtlemiseks mooduli
const mysql = require ("mysql2")
//lisan andmebaasi juurdepääsuinfot
const dbInfo = require("../../vp2025config.js");
const dateEt = require("./src/dateTimeET");
// loome objeksti mis ongi express.js programm ja edasi kasutamegi seda
const app = express();
//määrame renderdajaks ejs
app.set("view engine", "ejs");
//määrame kasutamiseks avaliku kataloogi
app.use(express.static("public"));
//päringu url-i parsimine, eraldame post osa. false, ki ainult ükstekst, true. kui muud infot ka
app.use(bodyparser.urlencoded({extended: false}));

// loon andmebaasiühenduse
const conn = mysql.createConnection({
	host: dbInfo.configData.host,
	user: dbInfo.configData.user,
	password: dbInfo.configData.passWord,
	database: dbInfo.configData.dataBase
});

app.get("/", (req,res)=>{
	//res.send("Express.js läks edukalt käima!");
	res.render("index");
});

app.get("/timenow", (req,res)=>{
	res.render("timenow", {nowDate: dateEt.longDate(), nowWd: dateEt.weekDay()});
});

app.get("/vanasonad", (req,res)=>{
	fs.readFile("public/txt/vanasonad.txt", "utf8", (err, data)=>{
		if(err){
			res.render("genericlist", {heading: "Valik Eesti tuntut vanasõnasid", listData: ["Kahjuks vanasõnasid ei leidnud!"]});
		} else {
			let folkWisdom = data.split (";");
			res.render("genericlist", {heading: "Valik Eesti tuntut vanasõnasid", listData: folkWisdom});
		}
	});
	
});

app.get("/regvisit", (req,res)=>{
	res.render("regvisit");
});

app.post("/regvisit", (req, res)=>{
  const firstName = req.body.firstNameInput.trim();
  const lastName = req.body.lastNameInput.trim();

  // kuupäev ja kellaaeg
  const dateStr = dateEt.longDate();       // nt "6. oktoober 2025"
  const timeStr = dateEt.time();           // nt "13:45:22"

  //logirida
  const visitLine = `${firstName} ${lastName}, ${dateStr} kell ${timeStr}\n`;

  // salvestame faili
  fs.appendFile("public/txt/visitlog.txt", visitLine, (err) => {
    if (err) {
      console.error("Salvestamisel tekkis viga:", err);
      res.render("regvisit");
    } else {
      console.log("Külastus salvestatud!");
      res.render("visitregistered", { firstName, lastName });
    }
  });
});

app.get("/visitlog", (req, res) => {
	let listData = [];
	fs.readFile("public/txt/visitlog.txt", "utf8", (err, data) => {
		if (err) {
			//kui tuleb viga, siis ikka väljastame veebilehe, liuhtsalt vanasõnu pole ühtegi
			res.render("genericlist", {heading: "Registreeritud külastused", listData: ["Ei leidnud ühtegi külastust!"]});
		}	
		else {
			let tempListData = data.split(";");
			for(let i = 0; i < listData.length - 1; i ++){
				ListData.push(listData[i]);
			}
			res.render("genericlist", { heading:"Regristreeritud külalised",listData:listData });
		}
  });
});

app.get("/eestifilm", (req,res)=>{
	res.render("eestifilm");
});

app.get("/eestifilm/filmiinimesed", (req,res)=>{
	const sqlReq = "SELECT * FROM person";
	conn.execute(sqlReq,(err, sqlRes)=>{
		if (err){
			console.log (err);
			res.render("filmiinimesed", {personList: []});
		}
		else{
			console.log(sqlRes);
			res.render("filmiinimesed", {personList: sqlRes});
			
		}
	});
	//res.render("eestifilm");
});

app.get("/eestifilm/filmiinimesed_add", (req,res)=>{
	res.render("filmiinimesed_add", {notice:"Ootan sisestust"});
});
app.get("/eestifilm/filmiinimesed_add", (req,res)=>{
	console.log(reg.body);
	//kas andmed on olemas kontrollin
	//|| -or &&- and
	if(!req.body.firstNameInput || !reg.body.lastNameInput || reg.body.bornInput || reg.body.bordInput > new Date ()){
		res.render("filmiinimesed_add", {notice: "Andmed on vigased! Vaata üle!"});
	}
	else {
		let deceasedDate = null;
		if(req.body.deceasedInput != ""){
			deceasedDate = req.body.deceasedInput;
		}
		let sqlReq = "INSERT INTO person (first_name, last_name, born, deceased) VALUES (?,?,?,?)";
		conn.execute(sqlReq, [req.body.firstNameInput, reg.body.lastNameInput, reg.body.bornInput, deceasedDate], (err, sqlRes)=>{
			if (err){
				res.render("filmiinimesed_add", {notice: "Tekkise tehniline viga:" + err});
				
			}
			else {
				res.render("filmiinimesed_add", {notice: "Andmed on salvestadut!:"});
			}	
		});
	}
	
	//res.render("filmiinimesed_add", {notice: "Andmed olemas!" + reg.body});
});
	
app.listen(5213);