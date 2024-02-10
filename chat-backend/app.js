import express from "express"
import dotenv from "dotenv"
import { Server } from "socket.io"
import mongoose from "mongoose"
import compression from "express-compression"
import cors from "cors"
import multer from "multer"
import fs from "node:fs"
import cron from "node-cron"

import { usersModel } from "./src/mongo/models/users.js"


cron.schedule('0 0 * * *', async () => {
    try {
        // Vaciar la colección de usuarios
        const result = await usersModel.deleteMany({});
        console.log(`Se eliminaron ${result.deletedCount} usuarios.`);

        const documents = fs.readdirSync("./uploads/documents")
        const media = fs.readdirSync("./uploads/media")
        const audio = fs.readdirSync("./uploads/audio");

        documents.forEach(doc=>{
            fs.unlinkSync(`./uploads/documents/${doc}`)
        })
        media.forEach(med=>{
            fs.unlinkSync(`./uploads/media/${med}`)
        })
        audio.forEach(aud=>{
            fs.unlinkSync(`./uploads/audio/${aud}`)
        })

    } catch (error) {
        console.error('Error al vaciar la base de datos:', error);
    }
});

dotenv.config()
const app = express()
const upload = multer({ dest: 'uploads/' })
const PORT = process.env.PORT || 3000

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(compression({
    brotli: { enabled: true, zlib: {} }
}))
app.use(cors({ origin: 'http://localhost:5173', credentials: true }))
app.use('/uploads', express.static('uploads'));

const server = app.listen(PORT, () => {
    console.log(`Server started on Port ${PORT}`)
})

server.on("error", (err) => {
    console.log(err)
})

app.post("/files", upload.single("document"), (req, res) => {
    saveFile(req.file)
    res.send({ status: "OK" })
})

function saveFile(file) {
    const newPath = `./uploads/documents/${file.originalname}`
    fs.renameSync(file.path, newPath)

}

app.post("/images-videos", upload.single("media"), (req, res) => {
    saveMedia(req.file)
    res.send({ status: "OK" })
})

function saveMedia(media) {
    const newPath = `./uploads/media/${media.originalname}`
    fs.renameSync(media.path, newPath)
}

app.post("/audio", upload.single("audio"), (req, res) => {
    saveAudio(req.file)
    res.send({ status: "OK" })
})

function saveAudio(audio) {
    const newPath = `./uploads/audio/${audio.originalname}`
    fs.renameSync(audio.path, newPath)
}

//Conect to mongo
mongoose.connect(process.env.MONGO_URL)

const users = []

const ioServer = new Server(server, {
    cors: {
        origin: 'http://localhost:5173',
        credentials: true,
    }
})
ioServer.on("connection", async (socket) => {
    console.log("New connection")
    socket.on("disconnect", () => {
        console.log("Client disconnected");
    })
    socket.on("new-user", (nameUser) => {
        users.push(nameUser);
        ioServer.emit("users", [...new Set(users)].length)
    })
    socket.emit("all-messages", await usersModel.find())
    socket.on("new-message", async (data) => {
        console.log(data)
        await usersModel.create(data)
        ioServer.emit("all-messages", await usersModel.find())
    })
})