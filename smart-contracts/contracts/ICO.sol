// SPDX-License-Identifier: MIT
pragma solidity 0.8.16;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract StknICO {
    //Administration Details
    address public owner;
    address payable public ICOWallet;

    //Token
    IERC20 public token;

    //ICO Details
    uint public tokenPrice = 0.0001 ether;
    uint public hardCap = 1 ether;
    uint public softCap = 0.1 ether;
    uint public minInvestment = 0.001 ether;
    uint public maxInvestment = 0.5 ether;
    uint public raisedAmount = 0 ether;
    uint public icoStartTime;
    uint public icoEndTime;

    //Investor
    mapping(address => uint256) public depositedAmountOf;

    //Events
    event Deposit(
        address indexed from,
        uint value
    );

    event Withdraw(address from, uint256 value);
    event Claim(address from, uint256 value);
    event OwnerWithdraw(uint256 amount);

    //Initialize Variables
    // constructor(address payable _icoWallet, address _token, uint256 _startTime, uint256 _endTime) {
    constructor(address _token, uint256 _startTime, uint256 _endTime) {
        owner = msg.sender;
        // ICOWallet = _icoWallet;

        icoStartTime = _startTime;
        icoEndTime = _endTime;

        token = IERC20(_token);
    }

    //Access Control
    modifier onlyOwner() {
        require(msg.sender == owner, "ONLY_OWNER");
        _;
    }

    //Receive Ether Directly
    receive() external payable {
        // deposit();
    }

    // //Change ICO Wallet
    // function changeICOWallet(address payable _newICOWallet) external onlyOwner {
    //     ICOWallet = _newICOWallet;
    // }

    //Change Owner
    function changeOwner(address _newOwner) external onlyOwner {
        owner = _newOwner;
    }

    /* User Function */
    
    //deposit
    function deposit() public payable {
        // require(ICOState == State.RUNNING, "ICO isn't running");
        require(block.timestamp >= icoStartTime && block.timestamp < icoEndTime, "ICO_NOT_IN_PROGRESS");
        require(
            msg.value >= minInvestment && depositedAmountOf[msg.sender] + msg.value <= maxInvestment,
            "Check Min and Max Investment"
        );

        raisedAmount = address(this).balance;

        require(
            raisedAmount + msg.value <= hardCap,
            "Send within hardcap range"
        );

        depositedAmountOf[msg.sender] += msg.value;

        emit Deposit(msg.sender, msg.value);
        // return true;
    }

    //Withdraw BNB
    function withdraw() external returns(bool){
        raisedAmount = address(this).balance;
        require(raisedAmount < softCap && block.timestamp > icoEndTime, "NOT_WITHDRAWABLE");

        uint256 depositAmt = depositedAmountOf[msg.sender];

        require(depositAmt > 0, "ZERO_DEPOSIT");
        require(depositAmt <= address(this).balance, "EXCEED_TOTAL_DEPOSIT");

        msg.sender.call{value: depositAmt}("");

        emit Withdraw(msg.sender, depositAmt);
        return true;
    }

    function claim() external {
        raisedAmount = address(this).balance;
        require(raisedAmount > softCap && block.timestamp > icoEndTime || raisedAmount > hardCap, "NOT_CLAIMABLE");

        uint256 tokenAmt = depositedAmountOf[msg.sender];
        // uint256 tokenAmt = depositedAmountOf[msg.sender] * tokenPrice;
        token.transfer(msg.sender, tokenAmt / tokenPrice);
         
        emit Claim(msg.sender, tokenAmt);
    }

    function ownerWithdraw() external onlyOwner {
        raisedAmount = address(this).balance;
        require(raisedAmount > softCap && block.timestamp > icoEndTime || raisedAmount > hardCap, "NOT_CLAIMABLE");
        owner.call{value: raisedAmount}("");
        // token.transfer(owner, ) 

        emit OwnerWithdraw(raisedAmount);
    }

    function getDepositedAmountOf(address addr) public view returns (uint) {
        return depositedAmountOf[addr];
    }
}
