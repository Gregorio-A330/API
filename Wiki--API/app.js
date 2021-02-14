//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/wikiDB", { useNewUrlParser: true, useUnifiedTopology: true });

//ESQUEMA ou ESQUELETO do Objeto
const articleSchema = {
    title: String,
    content: String
}

//MODELO do esquema -- lembrando que o mongoose coloca depois em letra minuscula e no plural o ("Article") para jogar no banco
const Article = mongoose.model("Article", articleSchema)

///////////////////////////////////////REQUEST TARGETTING ALL ARTICLES///////////////////////////////////////////////
app.route("/articles")
///////////////////////////////////////Get Route all the articles////////////////////////////////////////////////////
    .get(function (req, res) {

        Article.find(function (err, foundArticles) {
            if (!err) {
                res.send(foundArticles)
            } else {
                res.send(err)
            }

        })
    })
///////////////////////////////////////Post Route to Create a new article//////////////////////////////////////////
    .post(function (req, res) {
        console.log(req.body.title);
        console.log(req.body.content);

        //criando um novo article com o que vamos receber do Postman
        const newArticle = new Article({
            title: req.body.title,
            content: req.body.content
        })
        // Salva o que veio do postman direto no banco, com a callback function informando se teve algum erro ou não
        //afim de informar ao postman e não deixar "esperando alguma resposta de confirmação"
        newArticle.save(function (err) {
            if (!err) {
                res.send("Successfully added a new article.")
            } else {
                res.send(err)
            }
        })
    })
///////////////////////////////////////Delete Route////////////////////////////////////////////////////////////////
    .delete(function (req, res) {
        Article.deleteMany(function (err) {
            if (!err) {
                res.send("successfully deleted all articles.")
            } else {
                res.send(err)
            }
        })

    });

///////////////////////////////////////REQUEST TARGETTING A SPECIFIC ARTICLE///////////////////////////////////////

app.route("/articles/:articleTitle")
///////////////////////////////////////Get Route by Title//////////////////////////////////////////////////////////
    .get(function (req, res) {

        Article.findOne({ title: req.params.articleTitle }, function (err, foundArticle) {
            if (foundArticle) {
                res.send(foundArticle)
            } else {
                res.send("No articles matching that title was found")
            }
        })
    })
    
/////////////////////////////////////////Update Route with overwrite by Title/////////////////////////////////////
    .put(function (req, res) {
        Article.update(
            { title: req.params.articleTitle },
            { title: req.body.title, content: req.body.content },
            { overwrite: true },
            function (err) {
                if (!err) {
                    res.send("successfully updated article.");
                }
            }
        );
    })
/////////////////////////////////////////Update Route With Single or More Keys/////////////////////////////////////
    .patch(function (req, res) {

        console.log(req.body) //esse vai ser o formato que voce vai enviar via PATCH podendo ter um ou mais retornos
        // e ao jogar no set ele vai montar conforme receber os dados

        Article.update(
            { title: req.params.articleTitle },
            { $set: req.body },
            function (err) {
                if (!err) {
                    res.send("successfully updated article");
                } else {
                    res.send(err);
                }
            }
        );
    })
/////////////////////////////////////////Delete Route by Title////////////////////////////////////////////////////
    .delete(function (req, res) {
        Article.deleteOne(
            { title: req.params.articleTitle },
            function (err) {
                if (!err) {
                    res.send("Successfully Deleted article")
                } else {
                    res.send(err);
                }
            }
        );
    });



/////////////////////// Configurações da porta e localhost /////////////////////////////////////////////////////

let port = process.env.PORT;
if (port == null || port == "") {
    port = 3000;
}

app.listen(port, function () {
    console.log("Server started sucessfully");
});
