//SPDX-License-Identifier: Unlicense
pragma solidity ^0.6.0;

import "https://raw.githubusercontent.com/OpenZeppelin/openzeppelin-contracts-ethereum-package/master/contracts/token/ERC721/ERC721.sol";
import "https://raw.githubusercontent.com/OpenZeppelin/openzeppelin-contracts-ethereum-package/master/contracts/token/ERC20/ERC20.sol";
import "https://raw.githubusercontent.com/Uniswap/uniswap-v2-core/master/contracts/interfaces/IUniswapV2Factory.sol";

interface IFusefactory {
    event newNFTtoERC20Mint(address indexed fuserc20Contract, address indexed mintby);
    function createFuseERC20(string calldata  _name,string calldata _symbol, uint256 _supply, address _mintAt) external returns(address);

}
interface IUniswapV2Route2{

    function addLiquidity(
        address tokenA,
        address tokenB,
        uint amountADesired,
        uint amountBDesired,
        uint amountAMin,
        uint amountBMin,
        address to,
        uint deadline
    ) external returns (uint amountA, uint amountB, uint liquidity);
    
    function addLiquidityETH(
        address token,
        uint amountTokenDesired,
        uint amountTokenMin,
        uint amountETHMin,
        address to,
        uint deadline
    ) external payable returns (uint amountToken, uint amountETH, uint liquidity);
}

contract Fucore{
    
    constructor() public {}
    //WETH Rinkeby: 0xc778417e063141139fce010982780140aa0cd5ab
    //UniswapV2Factory Rinkeby : 0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f
    //UniswapV2Router2 Rinkeby : 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D
    //IFusefactory Rinkeby : 0x0792948747156DD2410B7BF81Ff352d84444995F
    event HTLCERC721New(
        bytes32 indexed contractId,
        address indexed sender,
        address indexed receiver,
        address tokenContract,
        uint256 tokenId
    );
    event HTLCERC721Withdraw(bytes32 indexed contractId);
    event HTLCERC721Refund(bytes32 indexed contractId);

    struct LockContract {
        address sender;
        address receiver;
        address tokenContract;
        uint256 tokenId;
        
        bool withdrawn;
        bool refunded;
    }
    /*
     struct LockContract {
        address sender;
        address receiver;
        address tokenContract;
        uint256 tokenId;
        bytes32 hashlock;
        // locked UNTIL this time. Unit depends on consensus algorithm.
        // PoA, PoA and IBFT all use seconds. But Quorum Raft uses nano-seconds
        uint256 timelock;
        bool withdrawn;
        bool refunded;
        bytes32 preimage;
    }*/
    modifier WETHTransferableAllowance(uint256 _wethSupply){
        //ensure this contract is approved allowance to transfer the WETH tokensTransferable
        // so that WETH could be deposited to create LP on uniswap
        require(
            IERC20(0xc778417E063141139Fce010982780140Aa0cD5Ab).allowance(msg.sender,address(this)) > _wethSupply,
            "The HTLC must min allowance of WETH to send to the contract"
            );
        _;
    }
    modifier tokensTransferable(address _token, uint256 _tokenId) {
        // ensure this contract is approved to transfer the designated token
        // so that it is able to honor the claim request later
        require(
            IERC721(_token).getApproved(_tokenId) == address(this),
            "The HTLC must have been designated an approved spender for the tokenId"
        );
        _;
    }
    
    modifier futureTimelock(uint256 _time) {
        // only requirement is the timelock time is after the last blocktime (now).
        // probably want something a bit further in the future then this.
        // but this is still a useful sanity check:
        require(_time > now, "timelock time must be in the future");
        _;
    }
    modifier contractExists(bytes32 _contractId) {
        require(haveContract(_contractId), "contractId does not exist");
        _;
    }
    /*
    modifier hashlockMatches(bytes32 _contractId, bytes32 _x) {
        require(
            contracts[_contractId].hashlock == sha256(abi.encodePacked(_x)),
            "hashlock hash does not match"
        );
        _;
    }*/
    modifier withdrawable(bytes32 _contractId) {
        require(contracts[_contractId].receiver == msg.sender, "withdrawable: not receiver");
        require(contracts[_contractId].withdrawn == false, "withdrawable: already withdrawn");
        // if we want to disallow claim to be made after the timeout, uncomment the following line
        // require(contracts[_contractId].timelock > now, "withdrawable: timelock time must be in the future");
        _;
    }
    modifier refundable(bytes32 _contractId) {
        require(contracts[_contractId].sender == msg.sender, "refundable: not sender");
        require(contracts[_contractId].refunded == false, "refundable: already refunded");
        require(contracts[_contractId].withdrawn == false, "refundable: already withdrawn");
     //   require(contracts[_contractId].timelock <= now, "refundable: timelock not yet passed");
        _;
    }

    mapping (bytes32 => LockContract) contracts;


    function newContract(
        address _receiver,
        address _tokenContract,
        uint256 _tokenId
    )
        external
        tokensTransferable(_tokenContract, _tokenId)
        
        returns (bytes32 contractId)
    {
        contractId = sha256(
            abi.encodePacked(
                msg.sender,
                _receiver,
                _tokenContract,
                _tokenId
            )
        );

        // Reject if a contract already exists with the same parameters. The
        // sender must change one of these parameters (ideally providing a
        // different _hashlock).
        if (haveContract(contractId))
            revert("Contract already exists");

        // This contract becomes the temporary owner of the token
        IERC721(_tokenContract).transferFrom(msg.sender, address(this), _tokenId);

        contracts[contractId] = LockContract(
            msg.sender,
            _receiver,
            _tokenContract,
            _tokenId,
            false,
            false
        );

        emit HTLCERC721New(
            contractId,
            msg.sender,
            _receiver,
            _tokenContract,
            _tokenId

        );
    }
    function createFUSERC20(uint256 _wethSupply)
    external WETHTransferableAllowance(_wethSupply)
    returns (bool)
    {
        //address FUSE = address(new ERC20(_supply));
        IERC20(0xc778417E063141139Fce010982780140Aa0cD5Ab).transferFrom(msg.sender, address(this),_wethSupply);
       // IUniswapV2Factory(0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f).createPair(FUSE, 0xc778417E063141139Fce010982780140Aa0cD5Ab);
        return true;
    }
    
    function createER20(string calldata  _name,string calldata _symbol, uint256 _supply) external returns(address){
        address con = address(this);
        return IFusefactory(0x5E675D8e529B16F6fe498624a4110eDadF24A5a7).createFuseERC20(_name,_symbol,_supply,con);
    }
    
    function createUNIPair(address _fuse,
        address tokenB
    ) external  returns (uint amountToken, uint amountETH, uint liquidity){
       
     //   return IUniswapV2Factory(0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f).createPair(_fuse, 0xc778417E063141139Fce010982780140Aa0cD5Ab);
    address con = address(this);
    //require(approveContractForFUSERCRoute(_fuse,0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D,amountTokenDesired*10**18),"");
    return    IUniswapV2Route2(0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D).addLiquidity(
   _fuse,tokenB,IERC20(_fuse).balanceOf(address(this)),IERC20(tokenB).balanceOf(address(this)),1,1,con,(now+30 minutes)
);
    }
    
    
        
    
    
    
    function approveContractForFUSERCRoute(address _fuse) public returns(bool) {
       return IERC20(_fuse).approve(0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D,  IERC20(_fuse).balanceOf(address(this)));
        
    }
    function withdraw(bytes32 _contractId)
        external
        contractExists(_contractId)
        withdrawable(_contractId)
        returns (bool)
    {
        LockContract storage c = contracts[_contractId];
        
        c.withdrawn = true;
        IERC721(c.tokenContract).transferFrom(address(this), c.receiver, c.tokenId);
        emit HTLCERC721Withdraw(_contractId);
        return true;
    }

    /**
     * @dev Called by the sender if there was no withdraw AND the time lock has
     * expired. This will restore ownership of the tokens to the sender.
     *
     * @param _contractId Id of HTLC to refund from.
     * @return bool true on success
     */
    function refund(bytes32 _contractId)
        external
        contractExists(_contractId)
        refundable(_contractId)
        returns (bool)
    {
        LockContract storage c = contracts[_contractId];
        c.refunded = true;
        IERC721(c.tokenContract).transferFrom(address(this), c.sender, c.tokenId);
        emit HTLCERC721Refund(_contractId);
        return true;
    }


    function getContract(bytes32 _contractId)
        public
        view
        returns (
            address sender,
            address receiver,
            address tokenContract,
            uint256 tokenId,

            bool withdrawn,
            bool refunded

        )
    {
        if (haveContract(_contractId) == false)
            return (address(0), address(0), address(0), 0, false, false);
        LockContract storage c = contracts[_contractId];
        return (
            c.sender,
            c.receiver,
            c.tokenContract,
            c.tokenId,
            c.withdrawn,
            c.refunded

        );
    }

    /**
     * @dev Is there a contract with id _contractId.
     * @param _contractId Id into contracts mapping.
     */
    function haveContract(bytes32 _contractId)
        internal
        view
        returns (bool exists)
    {
        exists = (contracts[_contractId].sender != address(0));
    }
}