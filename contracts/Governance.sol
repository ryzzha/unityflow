// // SPDX-License-Identifier: MIT
// pragma solidity ^0.8.0;

// import "./IProposals.sol";
// import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// contract Governance {
//     IProposals public proposalsContract;
//     IProposals public timelockContract;
//     IERC20 public token;
//     address public admin;

//     event ProposalRejected(bytes32 indexed proposalId);
//     event ProposalApproved(bytes32 indexed proposalId);

//     modifier onlyAdmin() {
//         require(msg.sender == admin, "Not authorized");
//         _;
//     }

//     modifier enougthTokens() {
//         require(token.balanceOf(msg.sender) > 0, "not enough tokens");
//         _;
//     }

//     constructor(address _proposalsContract, address _timelockContract, IERC20 _token) {
//         proposalsContract = IProposals(_proposalsContract);
//         timelockContract = IProposals(_timelockContract);
//         token = _token;
//         admin = msg.sender;
//     }

//     function propose(
//         address _to,
//         uint _value,
//         string calldata _func,
//         bytes calldata _data,
//         string calldata _description,
//         uint delay
//     ) external enougthTokens returns (bytes32) {
//         bytes32 proposalId = generateProposalId(_to, _value, _func,_data,_description);
//         proposalsContract.createProposal(proposalId, _description, _value);
//         bytes memory data;
//         if (bytes(_func).length > 0) {
//             data = abi.encodePacked(
//                 bytes4(keccak256(bytes(_func))), _data
//             );
//         } else {
//             data = _data;
//         }
//         timelockContract.queueProposal(proposalId, _to, _value, data, delay);
//         return proposalId;
//     }

//     function vote(bytes32 proposalId, uint8 voteType) external enougthTokens {
//         require(timelockContract.isVotingOpen(proposalId), "votting is closed");
//         require(voteType == 1 || voteType == 2 || voteType == 3, "Invalid vote type");
//         uint votingPower = token.balanceOf(msg.sender);
//         proposalsContract.vote(proposalId, voteType, msg.sender, votingPower);
//     }

//     function rejectProposal(bytes32 proposalId) external onlyAdmin {
//         proposalsContract.markAsRejected(proposalId);
//         emit ProposalRejected(proposalId);
//     }

//     function isProposalApproved(bytes32 proposalId) external view returns (bool) {
//         return proposalsContract.isProposalApproved(proposalId);
//     }

//     function executeProposal(bytes32 proposalId) external onlyAdmin {
//         require(proposalsContract.isProposalApproved(proposalId), "Proposal not approved");
//         timelockContract.executeProposal(proposalId);
//     }

//     function hasChanceToPass(bytes32 proposalId) external returns(bool) {
//         bool chance = proposalsContract.hasChanceToPass(proposalId);
//         return chance;
//     }

//     function generateProposalId(
//         address _to,
//         uint _value,
//         string calldata _func,
//         bytes calldata _data,
//         string calldata _description
//     ) internal pure returns(bytes32) {
//         return keccak256(abi.encode(
//             _to, _value, _func, _data, _description
//         ));
//     }
// }
