// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract Voting {
    // --- STATE VARIABLES ---

    address public owner;
    uint256 public votingStartTime;
    uint256 public votingEndTime;

    enum VotingStatus { NotStarted, Running, Ended }

    // Candidate struct now only holds the vote count. Details are off-chain.
    struct Candidate {
        uint256 voteCount;
    }

    Candidate[] public candidates;
    mapping(address => bool) public voters;

    // --- EVENTS ---

    event Voted(uint256 indexed candidateId, address indexed voter);
    event VotingStarted(uint256 startTime, uint256 endTime);
    event VotingEnded(uint256 endTime);

    // --- MODIFIERS ---

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function.");
        _;
    }

    // --- CONSTRUCTOR ---

    // Constructor now only takes the number of candidates to initialize vote counters.
    constructor(uint256 _candidatesCount) {
        owner = msg.sender;
        for (uint256 i = 0; i < _candidatesCount; i++) {
            candidates.push(Candidate({
                voteCount: 0
            }));
        }
    }

    // --- VOTING LOGIC ---

    function vote(uint256 _candidateId) public {
        require(getVotingStatus() == VotingStatus.Running, "Voting is not currently active.");
        require(!voters[msg.sender], "You have already voted.");
        require(_candidateId < candidates.length, "Invalid candidate ID.");

        candidates[_candidateId].voteCount++;
        voters[msg.sender] = true;

        emit Voted(_candidateId, msg.sender);
    }

    // --- ADMIN FUNCTIONS ---

    function startVoting(uint256 _durationInMinutes) public onlyOwner {
        require(votingStartTime == 0, "Voting has already been started.");
        votingStartTime = block.timestamp;
        votingEndTime = block.timestamp + (_durationInMinutes * 1 minutes);
        emit VotingStarted(votingStartTime, votingEndTime);
    }

    function endVoting() public onlyOwner {
        require(getVotingStatus() == VotingStatus.Running, "Voting is not running.");
        votingEndTime = block.timestamp;
        emit VotingEnded(block.timestamp);
    }

    // --- VIEW FUNCTIONS ---

    // This function now returns an array of vote counts.
    function getAllCandidates() public view returns (Candidate[] memory) {
        return candidates;
    }

    function getVotingStatus() public view returns (VotingStatus) {
        if (votingStartTime == 0) {
            return VotingStatus.NotStarted;
        } else if (block.timestamp < votingEndTime) {
            return VotingStatus.Running;
        } else {
            return VotingStatus.Ended;
        }
    }
}