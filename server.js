const express = require('express');
const app = express();


//Firebase database connectivity and settings
const admin = require("firebase-admin");
const credentials = require("./dating-app-46a4d-firebase-adminsdk-6jf2m-b9cda1c876.json")
admin.initializeApp({
    credential: admin.credential.cert(credentials),
    databaseURL: 'https://dating-app-46a4d-default-rtdb.firebaseio.com',
});


// They serve to parse incoming request bodies so that your application can easily handle data submitted by users, particularly in the context of HTTP POST requests.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



//Function to format phone numbers
function formatPhoneNumber(phoneNumber) {

    const phoneNumberUtil = require('libphonenumber-js');
    const parsedPhoneNumber = phoneNumberUtil.parse(phoneNumber, 'IN'); 
    return phoneNumberUtil.format(parsedPhoneNumber, 'E.164');
}

//Signup api
app.post('/signup', async (req, res) => {

    try {
        const { email, password, firstName, lastName, gender, phoneNumber } = req.body;

        // Format the phone number to E.164 standard
        const formattedPhoneNumber = formatPhoneNumber(phoneNumber); // You need to implement the `formatPhoneNumber` function

        // Create user in Firebase Authentication
        const userRecord = await admin.auth().createUser({
            email,
            password,
            firstName,
            lastName,
            gender,
            phoneNumber: formattedPhoneNumber,
        });
        res.status(201).json({ message: 'User created successfully', userRecord });
    }
    catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
})


// Login api
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Authenticate user
        const userRecord = await admin.auth().getUserByEmail(email);

        const uid = userRecord.uid;

        // Fetch additional user data from Firebase Realtime Database
        const snapshot = await admin.database().ref(`/users/${uid}`).once('value');
        const userData = snapshot.val();

        res.json({ message: 'Login successful', userRecord });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(401).json({ error: 'Invalid credentials' });
    }
});


// set port
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is litening to port ${PORT}`);
});
