'use strict'

var validator = require('validator');
var fs = require('fs');
var path = require('path');
const article = require('../models/article');
var Article = require('../models/article');
const { exists } = require('../models/article');

var controller = {
    datosCurso: (req,res) => {
        var hola = req.body.hola; //para probar el postman, no vale para nada
        
        return res.status(200).send({
            curso: 'Master en Frameworks JS',
            autor: 'Lucía Arena',
            url: 'www.google.es',
            hola
        });
    },

    test: (req, res) => {
        return res.status(200).send({
            message: 'Soy la acción test de mi controlador de articulos'
        });
    },
    save: (req, res) => {
            //recoger parametros por post
            var params = req.body; 

            //validar datos
            try{
                var validate_title = !validator.isEmpty(params.title);
                var validate_content = !validator.isEmpty(params.content);


            }catch(err){
                return res.status(200).send({
                    status:'error',
                    message:"Faltan datos por enviar"
                 });
            }

            if(validate_title && validate_content){
                //Crear el objeto a guardar
                var article = new Article();

                //asignar valores
                article.title = params.title;
                article.content = params.content;
                article.image = null;

                //guardar el articulo
                article.save((err,articleStored)=>{

                    if(err||!articleStored){
                        return res.status(404).send({
                            status:'success',
                            message:"El artículo no se ha guardado"
                         });
                    }
                    
                    //Devolver respuesta
                    return res.status(200).send({
                        status: 'success',
                        article: articleStored
                    });
                });


            }else{
                return res.status(200).send({
                    status:'error',
                    message:"Los datos no son válidos"
                 });
            }       
    },

    getArticles: (req,res)=>{
        var query = Article.find({});

        var last = req.params.last;
        if(last||last!=undefined){
            query.limit(5);
        }
        //hacer un find para sacar los datos de la bd, el find lo dejo vacio para que me devuelva todo
        //el menos delante es para que ordene de manera descendente por el id
        query.sort('-id').exec((err,articles)=>{
            
            if(err){
                return res.status(500).send({
                    status:'error',
                    message:"Error al devolver los artículos"
                 });
            }

            if(!articles){
                return res.status(404).send({
                    status:'error',
                    message:"No hay artículos para mostrar"
                 });
            }
            
            return res.status(200).send({
                status:'access',
                articles
             });
        })
    },
    getArticle:(req,res)=>{

        //Recoger el ID de la url
        var articleId = req.params.id;

        //Comprobar que es diferente a null

        if(!article||articleId==null){
            return res.status(404).send({
                status:'error',
                message:"El artículo no existe"
             });
        }

        //Buscar el artículo 
        Article.findById(articleId,(err,article)=>{

            if(err||!article){
                return res.status(404).send({
                    status:'error',
                    message:"No existe el artículo"
                 });
            }

        //Devolver el artículo/JSON
        return res.status(200).send({
            status:'success',
            article
            });
        
        });

    },
    update:(req,res)=>{
        //Recoger el id del artículo por la url
        var articleId = req.params.id;

        //Recoger los datos que llegan por put
        var params = req.body;

        //Validar datos
        try{
            var validate_title = !validator.isEmpty(params.title);
            var validate_content = !validator.isEmpty(params.content);
        }catch(err){
            return res.status(200).send({
                status:'error',
                message:"Faltan datos por enviar"
             });
        }
        if(validate_title&&validate_content){
            //Hacer un find and update
            Article.findOneAndUpdate({_id: articleId}, params, {new:true}, (err,articleUpdated)=>{
                if(err){
                    return res.status(500).send({
                        status:'error',
                        message:"Error al actualizar"
                     });
                }
                if(!articleUpdated){
                    return res.status(404).send({
                        status:'error',
                        message:"No exite el artículo"
                     });
                }

                return res.status(200).send({
                    status:'success',
                    article:articleUpdated
                 });
            });
        }else{
            return res.status(200).send({
                status:'error',
                message:"La validación no es correcta"
             });
        }
        

        //DEvolver respuesta
        return res.status(200).send({
            status:'success',
            article
            });
    },
    
    delete: (req, res) => {
        // Recoger el id de la url
        var articleId = req.params.id;

        // Find and delete
        Article.findOneAndDelete({_id: articleId}, (err, articleRemoved) => {
            if(err){
                return res.status(500).send({
                    status: 'error',
                    message: 'Error al borrar !!!'
                });
            }

            if(!articleRemoved){
                return res.status(404).send({
                    status: 'error',
                    message: 'No se ha borrado el articulo'
                });
            }

            return res.status(200).send({
                status: 'success',
                article: articleRemoved
            });

        }); 
    },

    upload:(req,res)=>{
        //Configurar el módulo del connect multiparty en el router/article.js


        //Recoger el fichero de la petición
        var file_name = 'La imagen no se ha subido';
        if(!req.files){    
            return res.status(404).send({
                status: 'error',
                message: file_name
            });
        }
        //Conseguir nombre y extensión del archivo
        var file_path = req.files.file0.path;
        var file_split = file_path.split('\\');

        //*ADVERTENCIA: EN LINUX O MAC O PARA SUBIR AL SERVIDOR
        // var file_split = file_path.split('/');

        //Nombre del archivo
        var file_name = file_split[2];
        
        //Extensión del fichero
        var extension_split = file_name.split('\.');
        var file_ext = extension_split[1];

        //Comprobar la extensión, que solo puedan ser imágenes, si no es válida borraar el fichero
        if(file_ext != 'png' && file_ext != 'jpg' && file_ext != 'jpeg' && file_ext != 'gif' &&file_ext != 'PNG' && file_ext != 'JPG' && file_ext != 'JPEG' && file_ext != 'GIF'){
            //borrar archivo subido
            fs.unlink(file_path, (err) => {
                return res.status(200).send({
                    status:'error',
                    message:'La extension de la imagen no es válida'
                 });
            });

        }else{
            //buscar y subir el artículo
            //saco el id de la url
            var articleId = req.params.id;
            Article.findByIdAndUpdate({_id:articleId},{image: file_name}, {new:true}, (err,articleUpdated)=>{
                
                if(err || !articleUpdated){
                    return res.status(404).send({
                        status:'error',
                        message:'Error al guardar la imagen'
                    });
                }

                return res.status(200).send({
                    tatus:'success',
                    article:articleUpdated
                });
            });
            //Si todo es válido buscar el artículo asignarle el nombre de la imagen y actualizarlo
            return res.status(404).send({
                fichero: req.files,
                split: file_split,
                file_ext
            });
        }
    }, //end upload file
    getImage: (req,res) => {
        var file = req.params.image;
        var path_file ='./upload/articles/'+file;

        fs.exists(path_file,(exists) => {
            if(exists){
                return res.sendFile(path.resolve(path_file));
            }else{
                return res.status(404).send({
                    status:'error',
                    message:'La imagen no existe'
                });
            }
        });
    },

    search: (req,res) => {
        //Sacar el string a buscar
        var searchString = req.params.search;
        //Find or 
        Article.find({"$or":[
            {"title":{"$regex":searchString,"$options":"i"}},
            {"content":{"$regex":searchString,"$options":"i"}}
        ]})
        .sort([['date','descending']])
        .exec((err, articles) => {
            if(err){
                return res.status(500).send({
                    status:'error',
                    message:'Error en la petición',
                });
            }
            if(!articles || articles.length<=0){
                return res.status(404).send({
                    status:'error',
                    message:'No se ha encontrado ningún artículo que coincida con tu búsqueda',
                });
            }
            return res.status(200).send({
                status:'success',
                articles
            });
        });

    }

};//final del controller

//hay que hacer un module export para poder usar el objeto controller fuera de este archivo, y poder usar estos métodos en el archivo de rutas

module.exports = controller; 