pragma solidity ^0.4.16;

contract Lottery {
    address public manager;
    address[] public players;
    
    function Lottery() public {
        manager = msg.sender;
    }
    
    function enter() public payable {
        require(msg.value >= 0.01 ether);
        players.push(msg.sender);
    }
    
    function random() public view returns (uint){
        return uint(keccak256(block.difficulty, now, players));
    }
    
    function pickWinner() public restricted {
        // require(msg.sender == manager);
        
        uint index      = random() % players.length;
        address myAddress = this;
        players[index].transfer(myAddress.balance);
        players         = new address[](0);
    }
    
    modifier restricted(){
        require(msg.sender == manager);
        _;
    }
    
    function getPlayers() public view returns(address[]) {
        return players;
    }
}