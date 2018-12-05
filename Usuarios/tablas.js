var conn = new Mongo();
var db = conn.getDB("users-service-db");
db.users.drop();
db.counters.drop();

db.users.insertOne({_id: 1, names:"Max", family_name:"Bombin", rut:"18.297.512-5", email:"max@gmail.com", 
password:"$2a$10$OXIxBEC8wfQ/dspUT3yDDOM.GDOBWK3j.2oX2L8xZQXY1ZyGMH9Ru", rol:"admin", profile_name: "max.g.c"});

db.counters.insertOne({_id: "usersid", sequence_value: 1});


