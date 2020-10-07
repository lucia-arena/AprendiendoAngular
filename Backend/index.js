'use strict'
var mongoose = require('mongoose');
var app = require('./app');
var port = 3900; 

//No sé por qué pero parece importante
mongoose.Promise=global.Promise;
//Desactiva consas antiguas
mongoose.set('useFindAndModify', false);
mongoose.connect('mongodb://localhost:27017/api_rest_blog',{useNewUrlParser:true})
    .then(()=>{
        console.log("La conexion a la base de datos se ha realizado correctamente");

        //crear servidor y ponerme a escuchar peticiones http
        app.listen(port,()=>{
            console.log('Servidor corriendo en http://localhost:'+port);
        });
    });
