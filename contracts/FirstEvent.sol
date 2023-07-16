// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

interface IIERC721 {
    function ownerOf(uint256 tokenId) external view returns (address);
    function safeTransferFrom(address from, address to, uint256 tokenId) external ;

}

interface IIERC20 {
    function allowance(address owner, address spender) external view returns (uint256) ;
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

contract FirstEvent is IERC721Receiver{

    // Equals to `bytes4(keccak256("onERC721Received(address,address,uint256,bytes)"))`
    // which can be also obtained as `IERC721Receiver(0).onERC721Received.selector`
    bytes4 public constant _ERC721_RECEIVED = 0x150b7a02;

    address private _owner;
    address public nftAddress;
    address public recipient;
    address public priceToken;
    uint256 public priceAmount;
    uint256 public startTime;
    bool internal _lock;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event ChangedAddress(address _nftAddress, address _recipient);
    event ChangedPrice(address token, uint256 amount) ;
    event ChangedStartTime(uint256 _startTime);
    event GiveFree(uint256 tokenId, address to) ;
    event MultiGiveFree(uint256[] tokenIds, address to) ;
    event Purchased(address buyer, uint256 tokenId, address token, uint256 amount, address receipt) ;
    event MultiPurchased(address buyer, uint256[] tokenIds, address token, uint256 amount, address receipt) ;
    event Registerd(address operator, address from, uint256 tokenId, bytes data) ;

    modifier onlyOwner() {
        _checkOwner();
        _;
    }

    modifier ifFree {
        require(_lock != true, "in use");
        _lock = true;
        _;
        _lock = false;
    }

    modifier nonZeroAddress(address addr) {
        require(addr != address(0), "zero address");
        _;
    }

    modifier nonZero(uint256 value) {
        require(value != 0, "zero value");
        _;
    }

    modifier onSalePeriod() {
        require(startTime != 0 && startTime < block.timestamp, "not sale period");
        _;
    }

    constructor (address ownerAddress) {
        _owner = ownerAddress;
        emit OwnershipTransferred(address(0), ownerAddress);
    }

    /**** only Owner ****/

    // function renounceOwnership() public virtual onlyOwner {
    //     _transferOwnership(address(0));
    // }

    function transferOwnership(address newOwner) public virtual onlyOwner {
        require(newOwner != address(0), "Ownable: new owner is the zero address");
        _transferOwnership(newOwner);
    }

    function setAddress(address _nftAddress, address _recipient)
        external onlyOwner ifFree
    {
        require(nftAddress != _nftAddress || recipient != _recipient, "same address");
        nftAddress = _nftAddress;
        recipient = _recipient;

        emit ChangedAddress(_nftAddress, _recipient);
    }

    function setPrice(address _token, uint256 _amount)
        external onlyOwner ifFree
    {
        require(priceToken != _token || priceAmount != _amount, "same address");
        priceToken = _token;
        priceAmount = _amount;

        emit ChangedPrice(_token, _amount);
    }

    function setStartTime(uint256 _startTime)
        external onlyOwner ifFree
    {
        require(startTime != _startTime, "same startTime");
        startTime = _startTime;

        emit ChangedStartTime(_startTime);
    }

    function giveFree(uint256 tokenId, address to)
        external onlyOwner ifFree nonZeroAddress(to) nonZeroAddress(nftAddress)
    {
        require(IIERC721(nftAddress).ownerOf(tokenId) == address(this), "it' not mine");
        require(to != address(this), "it' me");
        IIERC721(nftAddress).safeTransferFrom(address(this), to, tokenId);
        emit GiveFree(tokenId, to) ;
    }

    function multiGiveFree(uint256[] memory tokenIds, address to)
        external onlyOwner ifFree nonZeroAddress(to) nonZeroAddress(nftAddress)
    {
        require(tokenIds.length != 0, "nothing");
        require(to != address(this), "it' me");
        for(uint256 i=0; i< tokenIds.length; i++){
            require(IIERC721(nftAddress).ownerOf(tokenIds[i]) == address(this), "it' not mine");
            IIERC721(nftAddress).safeTransferFrom(address(this), to, tokenIds[i]);
        }
        emit MultiGiveFree(tokenIds, to) ;
    }

    /**** external ****/

    function purchase(uint256 tokenId)
        external ifFree onSalePeriod nonZeroAddress(priceToken) nonZeroAddress(recipient) nonZero(priceAmount) onSalePeriod()
    {
        require(IIERC721(nftAddress).ownerOf(tokenId) == address(this), "it' not mine");
        require(IIERC20(priceToken).allowance(msg.sender, address(this)) >= priceAmount,
            "token approval amount is insufficient");
        require(IIERC20(priceToken).transferFrom(msg.sender, recipient, priceAmount), "payment failure");

        IIERC721(nftAddress).safeTransferFrom(address(this), msg.sender, tokenId);
        emit Purchased(msg.sender, tokenId, priceToken, priceAmount, recipient) ;
    }


    function multiPurchase(uint256[] memory tokenIds)
        external ifFree onSalePeriod nonZeroAddress(priceToken) nonZeroAddress(recipient) nonZero(priceAmount)
    {
        require(tokenIds.length != 0, "nothing");
        uint256 len = tokenIds.length;
        uint256 amount = priceAmount * len;
        require(IIERC20(priceToken).allowance(msg.sender, address(this)) >= amount,
            "token approval amount is insufficient");

        for (uint256 i = 0; i < len; i++) {
            require(IIERC721(nftAddress).ownerOf(tokenIds[i]) == address(this), "it' not mine");
        }

        require(IIERC20(priceToken).transferFrom(msg.sender, recipient, amount), "payment failure");

        for (uint256 j = 0; j < len; j++) {
            IIERC721(nftAddress).safeTransferFrom(address(this), msg.sender, tokenIds[j]);
        }

        emit MultiPurchased(msg.sender, tokenIds, priceToken, priceAmount, recipient) ;
    }

    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes calldata data
    ) external override returns (bytes4) {

        emit Registerd(operator, from, tokenId, data);

        return _ERC721_RECEIVED;
    }

    /**** public ****/

    /**** view ****/
    function owner() public view virtual returns (address) {
        return _owner;
    }

    /**** internal ****/
    function _checkOwner() internal view virtual {
        require(owner() == msg.sender, "Ownable: caller is not the owner");
    }

    function _transferOwnership(address newOwner) internal virtual {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}