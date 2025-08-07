import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { google } from 'googleapis';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { ethers } from 'ethers'; // 導入 ethers

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({ origin: 'http://localhost:8080' }));
app.use(express.json());

// LowDB setup
const file = join(__dirname, 'db.json');
const adapter = new JSONFile(file);
const db = new Low(adapter, { candidates: [] });

// Initialize database
async function initializeDb() {
  console.log('Attempting to initialize DB at:', file);
  await db.read();
  console.log('db.data after read:', db.data);
  if (db.data.candidates.length === 0) {
    db.data.candidates.push(
      { id: 'candidate1', name: '候選人 A', votes: 0 },
      { id: 'candidate2', name: '候選人 B', votes: 0 },
      { id: 'candidate3', name: '候選人 C', votes: 0 }
    );
    await db.write();
    console.log('Database initialized with default candidates.');
  } else {
    console.log('Database already exists and contains data.');
  }
}

// Run database initialization
initializeDb();

// Make db accessible to routes
app.locals.db = db;

// --- Blockchain Integration ---
const contractAddress = "0x2B2f78c5BF6D9C12Ee1225D5F374aa91204580c3"; // 替換為你部署的合約地址
const contractABI = [
  // 這裡只包含我們需要用到的 ABI，例如 vote 函數
  "function vote(uint256 _candidateId) public",
  "function getAllCandidates() public view returns (tuple(string name, uint256 voteCount)[] memory)"
];

// 設定 ethers provider (連接到 Ganache)
const provider = new ethers.JsonRpcProvider("http://host.docker.internal:8545");

// 設定 signer (用於發送交易，需要私鑰)
// 警告：在生產環境中切勿硬編碼私鑰！
const privateKey = "0xe9dbd00767eef0e147dce36d0c2ffffffb8ecba9edeaad63f5ce7aa738c2c3a6"; // 替換為你的 Ganache 帳戶私鑰
const signer = new ethers.Wallet(privateKey, provider);

// 建立合約實例
const votingContract = new ethers.Contract(contractAddress, contractABI, signer);

// 測試區塊鏈連線
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

// API to get all candidates
app.get('/api/candidates', async (req, res) => {
  await db.read();
  res.json(db.data.candidates);
});

// API to vote for a candidate
app.post('/api/vote/:candidateId', async (req, res) => {
  const { candidateId } = req.params;

  try {
    // 區塊鏈投票
    // 注意：這裡的 candidateId 需要與智能合約中的索引匹配
    // 我們的智能合約中，候選人 ID 是從 0 開始的索引
    // 如果前端傳來的是 'candidate1', 'candidate2' 這樣的字串 ID，需要轉換
    const contractCandidateId = parseInt(candidateId.replace('candidate', '')) - 1; // 假設前端 ID 是 'candidate1' -> 0

    const tx = await votingContract.vote(contractCandidateId);
    await tx.wait(); // 等待交易被打包
    console.log(`Vote transaction sent: ${tx.hash}`);

    // 更新 LowDB
    await db.read();
    const candidate = db.data.candidates.find(c => c.id === candidateId);

    if (candidate) {
      candidate.votes++;
      await db.write();
      res.json({ message: 'Vote recorded on blockchain and LowDB', candidate });
    } else {
      res.status(404).json({ message: 'Candidate not found in LowDB' });
    }
  } catch (error) {
    console.error('Error during vote transaction or LowDB update:', error);
    res.status(500).json({ message: 'Voting failed', error: error.message });
  }
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