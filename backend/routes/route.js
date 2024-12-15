import express from 'express'
import UserPreference from '../models/model.js';
import Analytics from '../models/model2.js';
// import expressIp from 'express-ip';
// import useragent from 'express-useragent';
import { UAParser } from 'ua-parser-js';
import axios from 'axios'
import haversine from 'haversine-distance';
import { Parser } from 'json2csv';

const router = express.Router();

function calcTrust({ phone, name, email, distance }) {

    const phoneScore = phone ? 1 : 0;
    const emailScore = email ? 1 : 0;
    console.log(phone,email,name,distance);
    let distanceScore = 0;
    
    if (distance === null || distance === undefined) {
        distanceScore = 0; 
    } else if (distance < 50) {
        distanceScore = 1;
    } else if (distance < 100) {
        distanceScore = 0.75;
    } else if (distance < 200) {
        distanceScore = 0.5;
    } else if (distance < 250) {
        distanceScore = 0.25;
    } else {
        distanceScore = 0;
    }
    
    const nameScore = name ? 1 : 0;
    console.log(phoneScore,emailScore,distanceScore,nameScore)
    const trustIndex = (phoneScore * 40) + (emailScore * 20) + (distanceScore * 30 ) +(nameScore * 10);

    return trustIndex; 
}


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
        await Analytics.updateOne({ userSub }, { $set: { distance: null } });
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
    
    //for edit
    if (e_Permission && pref.e_Permission) {
        updatedData.email = email;
    }

    if (p_Permission && pref.p_Permission) {
        updatedData.phone = phone;
    }

    if (a_Permission && pref.a_Permission) {
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

//analytics

router.post('/log', async (req, res) => {
    console.log(" Hit");

    const { userSub } = req.body;
    const parser = new UAParser();
    const userAgent = req.headers['user-agent'];
    const userType = parser.setUA(userAgent).getResult();
    
    const deviceType = userType.device.type === 'mobile' ? 'mobile' :
                       userType.device.type === 'tablet' ? 'tablet' : 'web';

    let ipAddress;

    const response = await axios.get('https://api.ipify.org?format=json');
    ipAddress = response.data.ip; 

    const existingAnalytics = await Analytics.findOne({ userSub });

        if (existingAnalytics) {
            existingAnalytics.timestamp = Date.now(); 
            existingAnalytics.ipAddress = ipAddress; 
            existingAnalytics.deviceType = deviceType;

            await existingAnalytics.save();
            console.log('Updated existing analytics:', existingAnalytics);
            return res.status(200).json(existingAnalytics);
        } else {
            const newAnalytics = new Analytics({
                userSub,
                timestamp: Date.now(),
                ipAddress,
                deviceType,
            });

            await newAnalytics.save();
            console.log('Created new analytics:', newAnalytics);
            return res.status(201).json(newAnalytics);
        }
        
});


router.post('/calcDistance', async (req, res) => {

    const { userSub } = req.body;

    console.log("hit-calc")

    const userPref = await UserPreference.findOne({ userSub });
    const userAddress = userPref.address; 

    // const userAddress = "delhi india";
    if(userAddress === null){
        await Analytics.updateOne({ userSub }, { $set: { distance: null } });
        res.json({ message: 'Response sent' });
        return;
    }
    const analytics = await Analytics.findOne({ userSub });

    const ipAddress = analytics.ipAddress;

    const geoResponse = await axios.get(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(userAddress)}&format=json`);
    
    const userCoords = { lat: geoResponse.data[0].lat, lng: geoResponse.data[0].lon };

    const ipGeoResponse = await axios.get(`https://ipapi.co/${ipAddress}/json/`);

    const ipCoords = {
        lat: ipGeoResponse.data.latitude,
        lng: ipGeoResponse.data.longitude
    };

    const distance = haversine(userCoords, ipCoords);
    const distanceInKm = distance / 1000; 

    await Analytics.updateOne({ userSub }, { $set: { distance: distanceInKm } });

    const updatedAnalytics = await Analytics.findOne({ userSub });

    return res.status(200).json(updatedAnalytics);             

});


router.get('/download', async (req, res) => {

    const combinedData = await UserPreference.aggregate([
        {
            $lookup: {
                from: 'analytics', 
                localField: 'userSub', 
                foreignField: 'userSub', 
                as: 'analyticsData' 
            }
        },
        {
            $unwind: {
                path: '$analyticsData',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $project: {
                userSub: 1,
                name: 1,
                email: 1,
                phone: 1,
                timestamp: { $ifNull: ['$analyticsData.timestamp', null] },
                distance: { $ifNull: ['$analyticsData.distance', null] },
                trustIndex: {$ifNull: ['$analyticsData.trustIndex', 0]}
            }
        }
    ]);    

    const json2csvParser = new Parser();
    const csv = json2csvParser.parse(combinedData);

    res.header('Content-Type', 'text/csv');
    res.attachment('user_data.csv');
    res.send(csv);          
});

//line graph
router.get('/active-users', async (req, res) => {
    try {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 7); // Last 7 days

        const results = await Analytics.aggregate([
            {
                $match: {
                    timestamp: { $gte: startDate } // Filter last 7 days
                }
            },
            {
                $project: {
                    // Convert timestamp to IST
                    day: { 
                        $dateToString: { 
                            format: '%Y-%m-%d', 
                            date: { $add: ['$timestamp', 19800000] } // Add 5 hours 30 minutes in milliseconds
                        }
                    },
                    hour: { 
                        $hour: { 
                            $add: ['$timestamp', 19800000] // Add 5 hours 30 minutes in milliseconds
                        } 
                    }
                }
            },
            {
                $group: {
                    _id: {
                        day: '$day',
                        timeSlot: { 
                            $switch: {
                                branches: [
                                    { case: { $lte: ['$hour', 6] }, then: '0-6' },
                                    { case: { $and: [{ $gt: ['$hour', 6] }, { $lte: ['$hour', 12] }] }, then: '6-12' },
                                    { case: { $and: [{ $gt: ['$hour', 12] }, { $lte: ['$hour', 18] }] }, then: '12-18' }
                                ],
                                default: '18-24'
                            }
                        }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $group: {
                    _id: '$_id.day',
                    counts: {
                        $push: {
                            slot: '$_id.timeSlot',
                            count: '$count'
                        }
                    }
                }
            },
            {
                $project: {
                    day: '$_id',
                    _id: 0,
                    counts: {
                        // Initialize counts for all time slots
                        $arrayToObject: {
                            $map: {
                                input: [
                                    { slot: '0-6', count: 0 },
                                    { slot: '6-12', count: 0 },
                                    { slot: '12-18', count: 0 },
                                    { slot: '18-24', count: 0 }
                                ],
                                as: 'defaultSlot',
                                in:
                                  [
                                      '$$defaultSlot.slot',
                                      {
                                          // Find the count for this slot or default to 0
                                          $ifNull:[
                                              {
                                                  $arrayElemAt : [
                                                      {
                                                          $filter : {
                                                              input : '$counts',
                                                              as : 'count',
                                                              cond : { $eq : ['$$count.slot', '$$defaultSlot.slot'] }
                                                          }
                                                      }, 
                                                      0
                                                  ]
                                              },
                                              0 // Default to zero if not found
                                          ]
                                      }
                                  ]
                              }
                          }
                      }
                  }
              },
              {
                  // Replace undefined with zero counts
                  $project:{
                      day:'$day',
                      _id : 0,
                      counts:{
                          $map:{
                              input:{ 
                                  $objectToArray:'$counts'
                              },
                              as:'count',
                              in:{
                                  k:'$$count.k',
                                  v:{ 
                                      $ifNull:['$$count.v.count',0]
                                  }
                              }
                          }
                      }
                  }
              }
          ]);

        res.status(200).json(results);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/trust', async (req, res) => {

    const { userSub } = req.body;

    if (!userSub) {
        return res.status(400).json({ message: 'userSub is required' });
    }

    const userPreference = await UserPreference.findOne({ userSub });
    const userAnalytics = await Analytics.findOne({ userSub });

    if (!userPreference) {
        return res.status(404).json({ message: 'UserPreference not found for this userSub' });
    }

    if (!userAnalytics) {
        return res.status(404).json({ message: 'Analytics data not found for this userSub' });
    }

    const { phone, name, email } = userPreference;
    const { distance } = userAnalytics;


    const trustIndex = calcTrust({ phone, name, email, distance });

    userAnalytics.trustIndex = trustIndex;

    await userAnalytics.save();

    console.log('Updated Analytics with Trust Index:', userAnalytics);
    return res.status(200).json({message: 'Trust Index calculated and stored successfully' });       

});

router.get('/all_data', async(req, res) => {
    const data = await Analytics.find();
    res.status(200).json(data);
});

export default router;