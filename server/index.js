import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { google } from 'googleapis';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { ethers } from 'ethers';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({ origin: 'http://localhost:8080' }));
app.use(express.json());

const ADMIN_EMAILS = ['yayaken0702@gmail.com'];

// This is the private key for the first default Ganache account, used to fund new user wallets
const GANACHE_FUNDER_PRIVATE_KEY = "0xe9dbd00767eef0e147dce36d0c2ffffffb8ecba9edeaad63f5ce7aa738c2c3a6";

const file = join(__dirname, 'db.json');
const adapter = new JSONFile(file);
const db = new Low(adapter, { candidates: [], users: {}, votedUsers: [] });

async function initializeDb() {
  console.log('Attempting to initialize DB at:', file);
  await db.read();

  if (!db.data || typeof db.data !== 'object') {
    db.data = {};
  }

  let needsWrite = false;

  if (!Array.isArray(db.data.candidates)) {
    db.data.candidates = [];
    needsWrite = true;
  }

  if (!Array.isArray(db.data.votedUsers)) {
    db.data.votedUsers = [];
    needsWrite = true;
  }
  
  if (!db.data.users) {
    db.data.users = {};
    needsWrite = true;
  }

  if (db.data.candidates.length === 0) {
    db.data.candidates.push(
      { id: 'candidate1', name: '候選人 A', votes: 0 },
      { id: 'candidate2', name: '候選人 B', votes: 0 },
      { id: 'candidate3', name: '候選人 C', votes: 0 }
    );
    console.log('Default candidates added.');
    needsWrite = true;
  }

  if (needsWrite) {
    console.log('Writing updates to db.json...');
    await db.write();
    console.log('db.json has been updated.');
  } else {
    console.log('db.json is already up to date.');
  }
}

initializeDb();

app.locals.db = db;

const contractAddress = "0xa2F6E6029638cCb484A2ccb6414499aD3e825CaC";
const contractABI = [
  "function vote(uint256 _candidateId) public",
  "function getAllCandidates() public view returns (tuple(string name, uint256 voteCount)[] memory)"
];

const provider = new ethers.JsonRpcProvider("http://host.docker.internal:8545");

async function testBlockchainConnection() {
  try {
    const network = await provider.getNetwork();
    console.log('Successfully connected to blockchain network:', network.name, network.chainId);
  } catch (error) {
    console.error('Failed to connect to blockchain:', error.message);
  }
}
testBlockchainConnection();

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.REDIRECT_URI
);

app.get('/', (req, res) => {
  res.send('Hello from the Vote AI server!');
});

app.get('/api/candidates', async (req, res) => {
  await db.read();
  res.json(db.data.candidates);
});

app.post('/api/vote/:candidateId', async (req, res) => {
  const { candidateId } = req.params;
  const { userEmail } = req.body;

  if (!userEmail) {
    return res.status(400).json({ message: 'User email is required to vote.' });
  }

  await db.read();

  if (db.data.votedUsers.includes(userEmail)) {
    return res.status(403).json({ message: '您已經投過票，請勿重複投票，謝謝。' });
  }

  const user = db.data.users[userEmail];
  if (!user || !user.privateKey) {
    return res.status(404).json({ message: 'User blockchain wallet not found. Please log in again.' });
  }

  try {
    const userSigner = new ethers.Wallet(user.privateKey, provider);
    const userVotingContract = new ethers.Contract(contractAddress, contractABI, userSigner);

    const contractCandidateId = parseInt(candidateId.replace('candidate', '')) - 1;

    console.log(`User ${userEmail} (address: ${user.address}) is attempting to vote for candidate ${contractCandidateId}`);

    const tx = await userVotingContract.vote(contractCandidateId);
    await tx.wait();
    console.log(`Vote from ${user.address} successfully mined. Tx hash: ${tx.hash}`);

    const candidate = db.data.candidates.find(c => c.id === candidateId);
    if (candidate) {
      candidate.votes++;
      db.data.votedUsers.push(userEmail);
      await db.write();
      res.json({ message: 'Vote recorded on blockchain and LowDB', candidate });
    } else {
      res.status(404).json({ message: 'Candidate not found in LowDB' });
    }
  } catch (error) {
    console.error('Error during vote transaction or LowDB update:', error);
    if (error.message.includes("You have already voted.")) {
        return res.status(403).json({ message: '您已經投過票，請勿重複投票，謝謝。' });
    }
    res.status(500).json({ message: 'Voting failed', error: error.message });
  }
});

app.get('/api/auth/check-admin', (req, res) => {
  const { email } = req.query;
  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }
  const isAdmin = ADMIN_EMAILS.includes(email);
  res.json({ isAdmin });
});

app.post('/api/admin/candidates', async (req, res) => {
  const { name, platform } = req.body; // Also get platform
  if (!name) {
    return res.status(400).json({ message: 'Candidate name is required' });
  }

  await db.read();
  const newCandidate = {
    // Create a simple unique ID
    id: `candidate${Date.now()}`,
    name: name,
    platform: platform || '', // Add platform to the new object
    votes: 0
  };
  db.data.candidates.push(newCandidate);
  await db.write();

  res.status(201).json({ message: 'Candidate added successfully', candidate: newCandidate });
});

app.put('/api/admin/candidates/:id', async (req, res) => {
  const { id } = req.params;
  const { name, platform } = req.body;
  if (!name && !platform) {
    return res.status(400).json({ message: 'Name or platform is required for update' });
  }
  await db.read();
  const candidate = db.data.candidates.find(c => c.id === id);
  if (candidate) {
    if (name) candidate.name = name;
    if (platform) candidate.platform = platform;
    await db.write();
    res.json({ message: 'Candidate updated successfully', candidate });
  } else {
    res.status(404).json({ message: 'Candidate not found' });
  }
});

app.delete('/api/admin/candidates/:id', async (req, res) => {
  const { id } = req.params;
  await db.read();
  const initialLength = db.data.candidates.length;
  db.data.candidates = db.data.candidates.filter(c => c.id !== id);
  if (db.data.candidates.length < initialLength) {
    await db.write();
    res.json({ message: 'Candidate deleted successfully' });
  } else {
    res.status(404).json({ message: 'Candidate not found' });
  }
});

app.get('/auth/google', (req, res) => {
  const { state } = req.query;
  const scopes = [
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email',
  ];
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    state: state || '/',
  });
  res.redirect(url);
});

app.get('/auth/google/callback', async (req, res) => {
  const { code, state } = req.query;
  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const people = google.people({ version: 'v1', auth: oauth2Client });
    const { data } = await people.people.get({
      resourceName: 'people/me',
      personFields: 'names,emailAddresses,photos',
    });

    const userEmail = data.emailAddresses[0].value;

    await db.read();
    if (!db.data.users[userEmail]) {
      const wallet = ethers.Wallet.createRandom();
      console.log(`New wallet created for user ${userEmail}: ${wallet.address}`);

      // Fund the new wallet with some test ETH
      try {
        const funderWallet = new ethers.Wallet(GANACHE_FUNDER_PRIVATE_KEY, provider);
        const tx = await funderWallet.sendTransaction({
          to: wallet.address,
          value: ethers.parseEther("0.1")
        });
        await tx.wait();
        console.log(`Funded ${wallet.address} with 0.1 ETH. Tx hash: ${tx.hash}`);
      } catch (fundError) {
        console.error(`Failed to fund new wallet for ${userEmail}:`, fundError);
      }

      db.data.users[userEmail] = {
        address: wallet.address,
        privateKey: wallet.privateKey,
      };
      await db.write();
      
    } else {
      console.log(`User ${userEmail} already has a wallet.`);
    }

    const redirectPath = state || '/';
    const frontendRedirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:8080'}/auth/callback?name=${encodeURIComponent(data.names[0].displayName)}&email=${encodeURIComponent(userEmail)}&photo=${encodeURIComponent(data.photos[0].url)}&redirect=${encodeURIComponent(redirectPath)}`;
    res.redirect(frontendRedirectUrl);

  } catch (error) {
    console.error('Error during authentication', error);
    res.status(500).send('Authentication failed');
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});