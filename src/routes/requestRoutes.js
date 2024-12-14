const express = require('express');
const authenticate = require('../middlewares/authenticate');
const ConnectionRequest = require("../models/connectionRequest");
const User = require('../models/User');

const router = express.Router();

router.post('/request/send/:status/:toUserId', authenticate, async(req,res) => {
    try {
        const fromUserId = req.user._id;
        const toUserId = req.params.toUserId;
        const status = req.params.status;
        console.log(fromUserId,toUserId);
        if(toUserId === fromUserId){
            return res.status(400).json({message: "Can not send connection request to yourself"});
        }

        const allowedstatus = ["ignored", "interested"];
        if(!allowedstatus.includes(status)){
            return res.status(400).json({message: "Invalid status type: " + status})
        }
        const toUser = await User.findById(toUserId);
        if(!toUser){
            return res.status(404).json({message: "User not found!"})
        }

        const existingConnectionRequest = await ConnectionRequest.findOne({
            $or: [
                {fromUserId, toUserId},
                {fromUserId: toUserId, toUserId: fromUserId}
            ]
        });

        console.log("abc", existingConnectionRequest);

        if(existingConnectionRequest){
            return res.status(400).send({message: "Connection Request Already Exists!!"})
        }

        const connectionRequest = new ConnectionRequest({
            fromUserId,
            toUserId,
            status
        });

        const data = await connectionRequest.save();

        res.json({
            message: req.user.firstName + " is " + status + " in " + toUser.firstName,
            data,
        })
    } 
    catch (error) {
        res.status(400).send("Error: "+ error.message)
    }
});

router.post('/request/review/:status/:requestId', authenticate,async(req,res) =>{
    try {    
        const loggedInUser = req.user;
        const{status, requestId} = req.params;
    
        const validStatus = ["accepted","rejected"];
    
        if(!validStatus.includes(status)){
            return res.status(404).json({message: "Status not allowed!!"});
        };
        const connectionRequest = await ConnectionRequest.findOne({
            _id: requestId,
            toUserId: loggedInUser._id,
            status: "interested"
        });
    
        if(!connectionRequest){
            return res.status(404).json({message: "Connection request not found"});
        }
    
        connectionRequest.status = status;
    
        const data = await connectionRequest.save();
        res.json({message: "Connection request " + status, data});
    } 
    catch (error) {
        res.status(400).send("ERROR: " + error.message);
    }

})

module.exports = router;