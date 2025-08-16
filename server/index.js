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

// --- Admin Emails ---
// In a real application, this should be stored in a database or a secure config file.
const ADMIN_EMAILS = ['yayaken0702@gmail.com']; // TODO: Add your admin email here


// LowDB setup
const file = join(__dirname, 'db.json');
const adapter = new JSONFile(file);
const db = new Low(adapter, { candidates: [] });

// Initialize database
async function initializeDb() {
  console.log('Attempting to initialize DB at:', file);
  await db.read();

  // 無論如何，都確保 data 是一個物件
  if (!db.data || typeof db.data !== 'object') {
    db.data = {};
  }

  let needsWrite = false;

  // 強制檢查 candidates 陣列
  if (!Array.isArray(db.data.candidates)) {
    db.data.candidates = [];
    needsWrite = true;
  }

  // 強制檢查 votedUsers 陣列
  if (!Array.isArray(db.data.votedUsers)) {
    db.data.votedUsers = [];
    needsWrite = true;
  }

  // 只有在 candidates 為空時，才加入預設資料
  if (db.data.candidates.length === 0) {
    db.data.candidates.push(
      { id: 'candidate1', name: '候選人 A', votes: 0 },
      { id: 'candidate2', name: '候選人 B', votes: 0 },
      { id: 'candidate3', name: '候選人 C', votes: 0 }
    );
    console.log('Default candidates added.');
    needsWrite = true;
  }

  // 如果有任何結構上的變更，或新增了預設資料，就執行寫入
  if (needsWrite) {
    console.log('Writing updates to db.json...');
    await db.write();
    console.log('db.json has been updated.');
  } else {
    console.log('db.json is already up to date.');
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
  const { userEmail } = req.body; // 從 request body 獲取 userEmail

  if (!userEmail) {
    return res.status(400).json({ message: 'User email is required to vote.' });
  }

  await db.read();

  // 確保 votedUsers 陣列存在
  if (!Array.isArray(db.data.votedUsers)) {
    db.data.votedUsers = [];
  }

  // 檢查使用者是否已經投過票
  if (db.data.votedUsers.includes(userEmail)) {
    return res.status(403).json({ message: 'You have already voted.' });
  }

  try {
    // 區塊鏈投票
    const contractCandidateId = parseInt(candidateId.replace('candidate', '')) - 1;

    const tx = await votingContract.vote(contractCandidateId);
    await tx.wait();
    console.log(`Vote transaction sent: ${tx.hash}`);

    // 更新 LowDB 中的票數
    const candidate = db.data.candidates.find(c => c.id === candidateId);
    if (candidate) {
      candidate.votes++;
      // 將使用者加入已投票列表
      db.data.votedUsers.push(userEmail);
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

// --- Auth APIs ---
app.get('/api/auth/check-admin', (req, res) => {
  const { email } = req.query;
  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  // --- DEBUGGING LOGS ---
  console.log(`[Admin Check] Received email to check: "${email}"`);
  console.log(`[Admin Check] Admin list:`, ADMIN_EMAILS);
  // --- END DEBUGGING ---

  const isAdmin = ADMIN_EMAILS.includes(email);
  
  // --- DEBUGGING LOGS ---
  console.log(`[Admin Check] Is user admin? ${isAdmin}`);
  // --- END DEBUGGING ---

  res.json({ isAdmin });
});


// --- Admin APIs ---

// POST /api/admin/candidates - Add a new candidate
app.post('/api/admin/candidates', async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ message: 'Candidate name is required' });
  }

  await db.read();
  const newCandidate = {
    // Create a simple unique ID
    id: `candidate${Date.now()}`,
    name: name,
    votes: 0
  };
  db.data.candidates.push(newCandidate);
  await db.write();

  res.status(201).json({ message: 'Candidate added successfully', candidate: newCandidate });
});

// PUT /api/admin/candidates/:id - Update a candidate's name and platform
app.put('/api/admin/candidates/:id', async (req, res) => {
  const { id } = req.params;
  const { name, platform } = req.body; // 接收 platform 欄位

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

// DELETE /api/admin/candidates/:id - Delete a candidate
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


// 1. Redirect to Google's consent screen
app.get('/auth/google', (req, res) => {
  const { state } = req.query; // Read the state from the query

  const scopes = [
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email',
  ];

  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    state: state || '/', // Pass the state to Google. Default to '/' if not provided.
  });

  res.redirect(url);
});

// 2. Handle the callback from Google
app.get('/auth/google/callback', async (req, res) => {
  const { code, state } = req.query; // Also get the state back

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const people = google.people({ version: 'v1', auth: oauth2Client });
    const { data } = await people.people.get({
      resourceName: 'people/me',
      personFields: 'names,emailAddresses,photos',
    });

    const redirectPath = state || '/';
    const frontendRedirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:8080'}/auth/callback?name=${encodeURIComponent(data.names[0].displayName)}&email=${encodeURIComponent(data.emailAddresses[0].value)}&photo=${encodeURIComponent(data.photos[0].url)}&redirect=${encodeURIComponent(redirectPath)}`;
    res.redirect(frontendRedirectUrl);

  } catch (error) {
    console.error('Error during authentication', error);
    res.status(500).send('Authentication failed');
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});