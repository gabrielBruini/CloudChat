const express = require('express')
const app = express()
const http = require('http').createServer(app)
const io = require('socket.io')(http)
const flash = require('express-flash')
const session = require('express-session')
const {userJoin, userLeave, getAllusers} = require("./utils/users")

app.use(session({
    secret: 'keyboard cat',   
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000}

}))

app.use(flash())
app.set('view engine', 'ejs')
app.use(express.static("public"))
app.use(express.urlencoded({extended: true}))
app.use(express.json())




app.get('/', (req, res) => {
    var nameError = req.flash("nameError") 
    
    res.render('index', {nameError})
})

app.post("/chat", (req, res) => {
    const name = req.body.name
    var nameError;

    if(name == undefined || name == '' || name == ' '){
        nameError = 'O nome de usuário não pode ser vazio'
        req.flash('nameError', nameError)
        res.redirect("/")
        return
    }   

    res.render("chat", {name})   
    
})



io.on("connection", (socket) =>{   
    
    socket.on("join", (username) => {
        //adiciona o usuário conectado ao array
        const user = userJoin(socket.id, username)        


    //Boas vindas
    socket.emit("messagebot", "Bem-vindo ao chat")

    //Broadcast quando um usuário conectar
    socket.broadcast.emit("messagebot", `${user.username} Entrou no chat!`)
    
        //Envio de dados 
    io.emit("roomUsers", { users: getAllusers()})


    })

    //Mensagens do usuário
    socket.on("mensagemChat", data => {       
        io.emit('messageUser', data)
    })

    
    //Quando desconectar
    
    socket.on("disconnect", () => {
        //remove o usuário do array
      const user = userLeave(socket.id)      

      if(user) {
          //emite a mensagem de desconectado
          io.emit('messagebot', 'Usuário desconectado')

          //passa o novo array sem o usuário
          io.emit("roomUsers", {users: getAllusers()})
       
      }
    })
    
})

http.listen(3000, () => {
    console.log('APP Rodando')
})
