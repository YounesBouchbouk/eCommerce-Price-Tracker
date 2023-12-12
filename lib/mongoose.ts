import mongoose from "mongoose"

let isConnected = false //track connection status


export   const ConnectToDB= async() => {

    mongoose.set('strictQuery' , true)

    if(!process.env.MONGODB_URI) return console.log("MONGO_URI not set")


    if(isConnected) return console.log('==> already using database');


    console.log(process.env.MONGODB_URI);
    
    try {
        await mongoose.connect(process.env.MONGODB_URI)

        isConnected = true

        console.log("we have connected to db");
        
    } catch (error) {
        console.log(error);
    
    }
    
}