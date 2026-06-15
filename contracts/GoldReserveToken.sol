// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title GoldReserveToken
/// @notice Teaching PoC for a permissioned gold-backed RWA token.
/// @dev This draft is intentionally compact for classroom reading. Production
///      versions should use OpenZeppelin ERC20, AccessControl, Pausable,
///      multisig administration, complete tests, and a security review.
contract GoldReserveToken {
    string public constant name = "Gold Gram Token";
    string public constant symbol = "GGT";
    uint8 public constant decimals = 0;

    address public owner;
    address public issuer;
    address public auditor;
    address public custodian;

    uint256 public reserveGrams;
    uint256 public totalSupply;
    uint256 public proofVersion;
    bytes32 public latestProofHash;
    bool public paused;

    mapping(address => uint256) public balanceOf;
    mapping(address => bool) public whitelist;
    mapping(address => bool) public frozen;

    event RoleUpdated(bytes32 indexed role, address indexed account);
    event ReserveProofUpdated(uint256 indexed version, uint256 reserveGrams, bytes32 proofHash);
    event WhitelistUpdated(address indexed account, bool allowed);
    event FrozenUpdated(address indexed account, bool frozen);
    event PausedUpdated(bool paused);
    event Transfer(address indexed from, address indexed to, uint256 amount);
    event RedemptionRequested(address indexed investor, uint256 amount, bytes32 redemptionHash);

    modifier onlyOwner() {
        require(msg.sender == owner, "not owner");
        _;
    }

    modifier onlyIssuer() {
        require(msg.sender == issuer || msg.sender == owner, "not issuer");
        _;
    }

    modifier onlyAuditor() {
        require(msg.sender == auditor || msg.sender == owner, "not auditor");
        _;
    }

    modifier whenActive() {
        require(!paused, "paused");
        _;
    }

    constructor(address initialIssuer, address initialAuditor, address initialCustodian) {
        owner = msg.sender;
        issuer = initialIssuer;
        auditor = initialAuditor;
        custodian = initialCustodian;
        whitelist[msg.sender] = true;
    }

    function setRole(bytes32 role, address account) external onlyOwner {
        require(account != address(0), "zero address");
        if (role == keccak256("ISSUER")) {
            issuer = account;
        } else if (role == keccak256("AUDITOR")) {
            auditor = account;
        } else if (role == keccak256("CUSTODIAN")) {
            custodian = account;
        } else {
            revert("unknown role");
        }
        emit RoleUpdated(role, account);
    }

    function updateReserveProof(uint256 newReserveGrams, bytes32 proofHash) external onlyAuditor {
        reserveGrams = newReserveGrams;
        latestProofHash = proofHash;
        proofVersion += 1;
        emit ReserveProofUpdated(proofVersion, newReserveGrams, proofHash);
    }

    function setWhitelist(address account, bool allowed) external onlyOwner {
        whitelist[account] = allowed;
        emit WhitelistUpdated(account, allowed);
    }

    function setFrozen(address account, bool isFrozen) external onlyOwner {
        frozen[account] = isFrozen;
        emit FrozenUpdated(account, isFrozen);
    }

    function setPaused(bool isPaused) external onlyOwner {
        paused = isPaused;
        emit PausedUpdated(isPaused);
    }

    function mintByReserve(address to, uint256 amount) external onlyIssuer whenActive {
        require(whitelist[to], "not whitelisted");
        require(!frozen[to], "frozen");
        require(totalSupply + amount <= reserveGrams, "reserve exceeded");
        totalSupply += amount;
        balanceOf[to] += amount;
        emit Transfer(address(0), to, amount);
    }

    function transfer(address to, uint256 amount) external whenActive returns (bool) {
        require(whitelist[msg.sender] && whitelist[to], "whitelist required");
        require(!frozen[msg.sender] && !frozen[to], "frozen");
        require(balanceOf[msg.sender] >= amount, "insufficient balance");
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        emit Transfer(msg.sender, to, amount);
        return true;
    }

    function burnForRedemption(uint256 amount, bytes32 redemptionHash) external whenActive {
        require(whitelist[msg.sender], "not whitelisted");
        require(!frozen[msg.sender], "frozen");
        require(balanceOf[msg.sender] >= amount, "insufficient balance");
        balanceOf[msg.sender] -= amount;
        totalSupply -= amount;
        emit Transfer(msg.sender, address(0), amount);
        emit RedemptionRequested(msg.sender, amount, redemptionHash);
    }
}
