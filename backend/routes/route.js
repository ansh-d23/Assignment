import express from 'express'
import UserPreference from '../models/model.js';

const router = express.Router();

router.post('/preference', async (req, res) => {
    console.log("hit");
    const { userSub, e_Permission, p_Permission, a_Permission } = req.body;

    const pref = {
        userSub,
        e_Permission,
        p_Permission,
        a_Permission,
        firstTimeLogin: false
    };

    const newPref = new UserPreference(pref);
    await newPref.save();
    res.status(200).json(newPref);

});

router.put('/edit-preference', async (req, res) => {
    console.log("hit", req.body);
    const { userSub, e_Permission, p_Permission, a_Permission, email, phone, address } = req.body;

    const pref = await UserPreference.findOne({ userSub });

    const updatedData = { e_Permission, p_Permission, a_Permission };

    //yes to no
    if (!e_Permission && pref.e_Permission){
        updatedData.email = null;
    }

    if (!p_Permission && pref.p_Permission){
        updatedData.phone = null;
    }

    if (!a_Permission && pref.a_Permission){
        updatedData.address = null;  
    }

    //no to yes
    if (e_Permission && !pref.e_Permission) {
        updatedData.email = email;
    }

    if (p_Permission && !pref.p_Permission) {
        updatedData.phone = phone;
    }

    if (a_Permission && !pref.a_Permission) {
        updatedData.address = address;
    }

    const updatedPref = await UserPreference.findOneAndUpdate(
        { userSub },
        { $set: updatedData },
        { new: true }
    );

    res.status(200).json(updatedPref);
});


router.post('/submit', async (req, res) => {

    console.log(" hit", req.body); 
    const { userSub, name, email, phone, address } = req.body;

    let pref = await UserPreference.findOne({ userSub });

    const userData = {
        userSub,
        name: name,
        email: pref.e_Permission ? email : null,
        phone: pref.p_Permission ? phone : null,
        address: pref.a_Permission ? address : null,
    };    

    await UserPreference.updateOne({ userSub }, { $set: userData });
    res.status(200).json(userData);
    
});

//backendDashboard
router.get('/all_users', async (req, res) => {
    const users = await UserPreference.find();
    res.status(200).json(users);
});


router.get('/user-preference/:userSub', async (req, res) => {
    const Pref = await UserPreference.findOne({ userSub: req.params.userSub });
    res.status(200).json(Pref);
});

export default router;