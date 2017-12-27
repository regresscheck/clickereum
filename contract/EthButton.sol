pragma solidity ^0.4.18;

contract ButtonGame {
    uint256 winnerBlockDelta = 250;
    
    address _feeAddress;
    uint256 public prize;
    address lastAddress;
    uint256 lastBlockNumber;
    bool finished;
    bool started;
    
    function ButtonGame(address feeAddress) public {
        _feeAddress = feeAddress;
        prize = 0;
        finished = false;
        started = false;
    }
    
    function press() public payable {
        // prize should be increased at least by 2 percent
        require(msg.value * 50 >= prize);
        require(!started || lastBlockNumber + winnerBlockDelta <= block.number);

        prize += msg.value;
        lastAddress = msg.sender;
        lastBlockNumber = block.number;
        started = true;
    }
    
    function takePrize() public payable {
        require(block.number > lastBlockNumber + winnerBlockDelta);
        require(msg.sender == lastAddress);
        require(!finished);
        require(started);

        finished = true;
        uint256 totalPrize = prize * 98 / 100; // 2% is taken as a fee
        msg.sender.transfer(totalPrize);
        _feeAddress.transfer(prize - totalPrize);
    }
    
    function isFinished() public constant returns (bool) {
        return finished;
    }

    function getWinnerCandidate() public constant returns (address) {
        return lastAddress;
    }

    function getBlocksLeft() public constant returns (uint256) {
        return winnerBlockDelta + lastBlockNumber - block.number;
    }

}