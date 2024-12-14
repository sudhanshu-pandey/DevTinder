const express = require('express');
const User = require('../models/User');
const authenticate = require('../middlewares/authenticate'); // Import authenticate middleware
const dotenv = require('dotenv');
const ConnectionRequest = require('../models/connectionRequest');
dotenv.config();

const router = express.Router();

// Get User Info Route (Protected)
router.get('/userinfo', authenticate, async (req, res) => {
    try {
      // Use the userId that was set by the authenticate middleware
      const userId = req.user._id;   
      // Find the user by userId
      const user = await User.findById(userId).select('-password'); // Exclude password from response   
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      } 
      // Return user info (excluding password)
      res.status(200).json(user);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server Error' });
    }
});

router.patch('/updateProfile', authenticate, async (req, res) => {
  try {
    const userId = req.user.id; // Get the user's ID from the authenticated request
    const allowedUpdates = ['email', 'password','about','skills','photoURL']; // Specify fields that can be updated
    const updates = Object.keys(req.body); // Extract keys from req.body

    // Validate update fields
    const isValidOperation = updates.every((key) => allowedUpdates.includes(key));
    if (!isValidOperation) {
      return res.status(400).send({ error: 'Invalid updates!' });
    }

    // Find and update the user
    const updatedUser = await User.findByIdAndUpdate(userId, req.body, {
      new: true, // Return the updated document
      runValidators: true, // Ensure validation rules are applied
    });

    if (!updatedUser) {
      return res.status(404).send({ error: 'User not found!' });
    }

    res.status(200).send(updatedUser); // Send the updated user data
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});


// Get all users except the authenticated user
router.get('/feed', authenticate, async (req, res) => {
    try {
      const userId = req.user._id; // Get the authenticated user's ID

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      limit = limit > 50 ? 50 : limit;

      const skip = (page - 1)* limit;

      const connection = await ConnectionRequest.find({
        $or: [{ fromUserId: userId}, {toUserId: userId}]
      }).select("fromUserId toUserId")

      const HideUser = new Set();
      connection.forEach(user => {
        HideUser.add(user.fromUserId.toString());
        HideUser.add(user.toUserId.toString());
      });

      const users = await User.find({ $and: [{_id: {$nin: Array.from(HideUser)}}, { _id: {$ne: userId}}]}).select('-password').skip(skip).limit(limit); // Exclude password field from results

      res.send(users); // Send the list of users (excluding the authenticated one)
    } 
    catch (error) {
      res.status(500).json({ message: error.message });
    }
});

router.get('/pendingRequests', authenticate, async(req, res) => {
  try {
    const userId = req.user._id;
    const Requests = await ConnectionRequest.find({
      toUserId: userId,
      status:"interested"
    }).populate("fromUserId", ["firstName","lastName"]);

    res.json({message:"All interested Requests are: ", Requests});
  } 
  catch (error) {
    res.status(400).send("EROOR: " + error.message)
  }
});

router.get('/connection', authenticate, async(req, res) => {
  try {
    const userId = req.user._id;
    const Connections = await ConnectionRequest.find({
      $or: [
        {fromUserId: userId, status:"accepted"},
        {toUserId: userId, status:"accepted"}
      ],
    }).populate("fromUserId", ["firstName","lastName"]).populate("toUserId", ["firstName","lastName"]);

    res.json({message:"All Connections are: ", Connections});
  } 
  catch (error) {
    res.status(400).send("EROOR: " + error.message)
  }
});

module.exports = router;
