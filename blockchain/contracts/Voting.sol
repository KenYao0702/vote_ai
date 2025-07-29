// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Voting {
    struct Candidate {
        string name;
        uint256 voteCount;
    }

    // 儲存所有候選人
    Candidate[] public candidates;

    // 映射，用於追蹤哪些地址已經投過票
    mapping(address => bool) public voters;

    // 事件，用於記錄投票行為
    event Voted(uint256 candidateId, address voter);

    constructor(string[] memory _candidateNames) {
        for (uint256 i = 0; i < _candidateNames.length; i++) {
            candidates.push(Candidate({
                name: _candidateNames[i],
                voteCount: 0
            }));
        }
    }

    // 投票函數
    function vote(uint256 _candidateId) public {
        // 檢查呼叫者是否已經投過票
        // require(!voters[msg.sender], "You have already voted.");

        // 檢查候選人 ID 是否有效
        require(_candidateId < candidates.length, "Invalid candidate ID.");

        // 增加候選人的票數
        candidates[_candidateId].voteCount++;

        // 標記呼叫者已經投過票
        voters[msg.sender] = true;

        // 發出投票事件
        emit Voted(_candidateId, msg.sender);
    }

    // 獲取所有候選人資訊
    function getAllCandidates() public view returns (Candidate[] memory) {
        return candidates;
    }
}
