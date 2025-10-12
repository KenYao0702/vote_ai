import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import { google } from 'googleapis';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { ethers } from 'ethers';
import { GoogleGenerativeAI } from "@google/generative-ai";

// --- Basic Setup ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();
const port = process.env.PORT || 3000;
app.use(cors({ origin: 'http://localhost:8080' }));
app.use(express.json());

// --- Constants ---
const ADMIN_EMAILS = ['yayaken0702@gmail.com'];
const OWNER_PRIVATE_KEY = process.env.GANACHE_FUNDER_PRIVATE_KEY || "0xe9dbd00767eef0e147dce36d0c2ffffffb8ecba9edeaad63f5ce7aa738c2c3a6";

// --- Database Setup (Simplified) ---
// This now serves as the primary source for candidate details.
const file = join(__dirname, 'db.json');
const adapter = new JSONFile(file);
const db = new Low(adapter, { users: {}, candidates: [] }); // Add candidates default

async function initializeDb() {
  await db.read();
  db.data = db.data || {};
  // We keep user wallets in memory, cleared on restart for dev purposes.
  db.data.users = {}; 
  // We DO NOT clear candidates, as db.json is the source of truth for them.
  await db.write();
  console.log('Database initialized and user wallets cleared.');
}
initializeDb();

// --- Blockchain Setup ---
// Dynamically read contract address from deployment info
let contractAddress;
try {
  const deploymentInfoPath = join(__dirname, '../blockchain/deployment-info.json');
  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentInfoPath, 'utf8'));
  contractAddress = deploymentInfo.contractAddress;
  console.log(`Successfully loaded contract address from deployment-info.json: ${contractAddress}`);
} catch (error) {
  console.error("Could not read deployment-info.json. Using a default or placeholder address.");
  contractAddress = "0x0000000000000000000000000000000000000000"; // Placeholder to avoid crash
}

// ABI now reflects the refactored contract
const contractABI = [
  "event Voted(uint256 indexed candidateId, address indexed voter)",
  "event VotingStarted(uint256 startTime, uint256 endTime)",
  "event VotingEnded(uint256 endTime)",
  "function owner() view returns (address)",
  "function votingStartTime() view returns (uint256)",
  "function votingEndTime() view returns (uint256)",
  "function startVoting(uint256 _durationInMinutes)",
  "function endVoting()",
  "function vote(uint256 _candidateId)",
  // IMPORTANT: The return tuple for getAllCandidates has been simplified
  "function getAllCandidates() view returns (tuple(uint256 voteCount)[] memory)",
  "function getVotingStatus() view returns (uint8)"
];
const provider = new ethers.JsonRpcProvider(process.env.BLOCKCHAIN_RPC_URL || "http://localhost:8545");
const ownerSigner = new ethers.Wallet(OWNER_PRIVATE_KEY, provider);
const votingContractAsOwner = new ethers.Contract(contractAddress, contractABI, ownerSigner);

// --- Google OAuth Setup ---
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.REDIRECT_URI
);

// --- API Routes ---

// == Public Routes ==
// This endpoint is now refactored to be the single source of truth for candidate info.
app.get('/api/candidates', async (req, res) => {
  try {
    // 1. Read candidate details from the local db.json file.
    await db.read();
    const offChainCandidates = db.data.candidates;

    // 2. Fetch the latest vote counts from the blockchain.
    const contract = new ethers.Contract(contractAddress, contractABI, provider);
    const onChainVoteCounts = await contract.getAllCandidates();

    // 3. Merge the off-chain details with the on-chain vote counts.
    const formattedCandidates = offChainCandidates.map((candidate, index) => {
      // Ensure we don't go out of bounds
      const voteCount = index < onChainVoteCounts.length ? Number(onChainVoteCounts[index].voteCount) : 0;
      return {
        id: index, // The ID is now the index in the array
        name: candidate.name,
        platform: candidate.platform,
        // You can add more fields here like image URLs, which are read from db.json
        imageUrl: candidate.imageUrl, 
        votes: voteCount
      };
    });

    res.json(formattedCandidates);
  } catch (error) {
    console.error('Failed to fetch and merge candidate data:', error);
    // Return the local candidate data as a fallback if the contract is not available?
    // For now, we send an error.
    res.status(500).json({ message: 'Failed to fetch candidate data' });
  }
});

app.get('/api/election/status', async (req, res) => {
    try {
        const contract = new ethers.Contract(contractAddress, contractABI, provider);
        const status = await contract.getVotingStatus();
        res.json({ status: Number(status) });
    } catch (error) {
        console.error('Failed to fetch election status:', error);
        res.status(500).json({ message: 'Failed to fetch election status' });
    }
});

app.get('/api/election/details', async (req, res) => {
    try {
        const contract = new ethers.Contract(contractAddress, contractABI, provider);
        const startTime = await contract.votingStartTime();
        const endTime = await contract.votingEndTime();
        res.json({
            startTime: Number(startTime), 
            endTime: Number(endTime) 
        });
    } catch (error) {
        console.error('Failed to fetch election details:', error);
        res.status(500).json({ message: 'Failed to fetch election details' });
    }
});

// == User Routes ==
app.post('/api/vote/:candidateId', async (req, res) => {
  const { candidateId } = req.params;
  const { userEmail } = req.body;

  if (!userEmail) {
    return res.status(400).json({ message: 'User email is required.' });
  }
  await db.read();
  const user = db.data.users[userEmail];
  if (!user || !user.privateKey) {
    return res.status(404).json({ message: 'User wallet not found. Please log in again.' });
  }

  try {
    const userSigner = new ethers.Wallet(user.privateKey, provider);
    const userVotingContract = new ethers.Contract(contractAddress, contractABI, userSigner);
    const tx = await userVotingContract.vote(Number(candidateId));
    await tx.wait();
    res.json({ message: 'Vote successfully recorded on the blockchain.' });
  } catch (error) {
    console.error('Error during vote transaction:', error);
    let detailedMessage = 'An unknown error occurred during voting.';
    if (error.info && error.info.error && error.info.error.message) {
        detailedMessage = error.info.error.message;
    } else if (error.reason) {
        detailedMessage = error.reason;
    }
    if (detailedMessage.includes("You have already voted.")) {
        res.status(403).json({ message: "您已投過票，請勿重複投票，謝謝您" });
    } else {
        res.status(500).json({ message: detailedMessage });
    }
  }
});

// == Admin Routes ==
app.get('/api/auth/check-admin', (req, res) => {
  const { email } = req.query;
  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }
  const isAdmin = ADMIN_EMAILS.includes(email);
  res.json({ isAdmin });
});

const adminCheck = (req, res, next) => {
    const { email } = req.body;
    if (!email || !ADMIN_EMAILS.includes(email)) {
        return res.status(403).json({ message: 'Forbidden: Administrator access required.' });
    }
    next();
};

app.post('/api/admin/start-voting', adminCheck, async (req, res) => {
    const { duration } = req.body;
    if (!duration || typeof duration !== 'number' || duration <= 0) {
        return res.status(400).json({ message: 'A positive number for duration (in minutes) is required.' });
    }
    try {
        const tx = await votingContractAsOwner.startVoting(duration);
        await tx.wait();
        res.json({ message: `Voting started successfully for ${duration} minutes.` });
    } catch (error) {
        console.error('Error starting voting:', error);
        const reason = error.reason || 'Failed to start voting.';
        res.status(500).json({ message: reason });
    }
});

app.post('/api/admin/end-voting', adminCheck, async (req, res) => {
    try {
        const tx = await votingContractAsOwner.endVoting();
        await tx.wait();
        res.json({ message: 'Voting ended successfully.' });
    } catch (error) {
        console.error('Error ending voting:', error);
        const reason = error.reason || 'Failed to end voting.';
        res.status(500).json({ message: reason });
    }
});

// == AI Routes ==
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const aiModel = genAI.getGenerativeModel({ model: "gemini-pro-latest" });

app.post('/api/ai/chat', async (req, res) => {
  const { question } = req.body;//從前端接收使用者問題

  if (!question) {
    return res.status(400).json({ message: 'Question is required.' });
  }

  try {
    // 1. 從 db.json 讀取所有候選人資料，作為AI的「上下文」
    await db.read();
    const candidatesContext = db.data.candidates.map(c => `- ${c.name}: ${c.platform}`).join('\n');
    // 2. 組合最終的 Prompt
    const prompt = `你是一個投票議題的AI分析助理。請根據以下的候選人名單和他們的政見，回答使用者的問題。請保持中立、客觀，並以繁體中文回答。

候選人資料：
${candidatesContext}

---

使用者的問題是：「${question}」`;
// 3. 將組合好的 prompt 送給 Gemini API
    const result = await aiModel.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    res.json({ answer: text });
  } catch (error) {
    console.error('Error in AI chat endpoint:', error);
    res.status(500).json({ message: 'An error occurred while processing your question with the AI.' });
  }
});

// == Auth Routes ==
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
    prompt: 'select_account', // Force account selection every time
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
      try {
        const funderWallet = new ethers.Wallet(OWNER_PRIVATE_KEY, provider);
        const tx = await funderWallet.sendTransaction({
          to: wallet.address,
          value: ethers.parseEther("0.5")
        });
        await tx.wait();
        console.log(`Funded ${wallet.address} with 0.5 ETH. Tx hash: ${tx.hash}`);
      } catch (fundError) {
        console.error(`Failed to fund new wallet for ${userEmail}:`, fundError);
      }
      db.data.users[userEmail] = {
        address: wallet.address,
        privateKey: wallet.privateKey,
      };
      await db.write();
    }
    const redirectPath = state || '/';
    const frontendRedirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:8080'}/auth/callback?name=${encodeURIComponent(data.names[0].displayName)}&email=${encodeURIComponent(userEmail)}&photo=${encodeURIComponent(data.photos[0].url)}&redirect=${encodeURIComponent(redirectPath)}`;
    res.redirect(frontendRedirectUrl);
  } catch (error) {
    console.error('Error during authentication', error);
    res.status(500).send('Authentication failed');
  }
});

// --- Server Start ---
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});