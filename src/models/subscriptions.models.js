import mongoose ,{Schema}from 'mongoose'

const subscriptionSchema = mongoose.Schema({
    //one who is subscribing
    subscriber :{
        type: Schema.Types.ObjectId,
        ref:"User"
    },
    channel:{
        type: Schema.Types.ObjectId,
        ref:'User'
    },




},{timestamps:true})

export const Subscriptions = mongoose.model('Subscriptions', subscriptionSchema)