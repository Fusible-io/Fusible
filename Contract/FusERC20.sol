pragma solidity ^0.6.0;

import "https://raw.githubusercontent.com/OpenZeppelin/openzeppelin-contracts/master/contracts/token/ERC20/ERC20.sol";
contract FUSERC20 is ERC20 {
    
    address private minter;
    address private owner;
      event MinterSet(address indexed oldMinter, address indexed newMinter);
    
    // modifier to check if caller is owner
    modifier isMinter(address _parent) {
        // If the first argument of 'require' evaluates to 'false', execution terminates and all
        // changes to the state and to Ether balances are reverted.
        // This used to consume all gas in old EVM versions, but not anymore.
        // It is often a good idea to use 'require' to check if functions are called correctly.
        // As a second argument, you can also provide an explanation about what went wrong.
        require(_parent == minter, "Caller is not Minter");
        _;
    }
    modifier isOwner(){
                require(msg.sender == owner, "Caller is not owner");
        _;
    }
    
    function setMinter(address newMinter) public isOwner {
        emit MinterSet(owner, newMinter);
        minter = newMinter;
    }
   // string public constant name;
	//string public constant symbol;
	//uint public constant decimals = 18;
        //update in next iteration
        //constructor(string _name, string _symbol,uint256 _supply) public {
        constructor() ERC20('Fusible.io','FUSE') public {
           // name= 'FUSE:NFT to ERC20';
            //symbol = 'FUV1-NRC20';
            owner = msg.sender;
           // _mint(msg.sender, _supply*(10**18));
            
        }
        
        function mintByContract(uint256 _amt) isMinter(msg.sender)  external returns(bool){
            _mint(msg.sender,_amt*(10**18));
            return true;
        }
}