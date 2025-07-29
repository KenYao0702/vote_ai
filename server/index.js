require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.REDIRECT_URI
);

app.get('/', (req, res) => {
  res.send('Hello from the Vote AI server!');
});

// 1. Redirect to Google's consent screen
app.get('/auth/google', (req, res) => {
  const scopes = [
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email',
  ];

  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
  });

  res.redirect(url);
});

// 2. Handle the callback from Google
app.get('/auth/google/callback', async (req, res) => {
  const { code } = req.query;

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const people = google.people({ version: 'v1', auth: oauth2Client });
    const { data } = await people.people.get({
      resourceName: 'people/me',
      personFields: 'names,emailAddresses,photos',
    });

    // Here, you would typically find or create a user in your database
    // and create a session or JWT for them.
    // For now, we'll just send back the user's profile.
    const frontendRedirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:8080'}/auth/callback?name=${encodeURIComponent(data.names[0].displayName)}&email=${encodeURIComponent(data.emailAddresses[0].value)}&photo=${encodeURIComponent(data.photos[0].url)}`;
    res.redirect(frontendRedirectUrl);

  } catch (error) {
    console.error('Error during authentication', error);
    res.status(500).send('Authentication failed');
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});