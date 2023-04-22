

//Contract based on [https://docs.openzeppelin.com/contracts/3.x/erc721](https://docs.openzeppelin.com/contracts/3.x/erc721)

pragma solidity ^0.8.17;

import "./TOW_ERC721.sol";
import "./Images.sol";

contract TOW3 is ERC721 {

  // Number of tokens minted
  // It will be used to calculate the current price
  // and also as token id of the next token
  uint256 private tokensMinted;

  // Different type of NFTs within our collection
  // type 0 is none, so we can detect unexistant tokens
  enum TokenType {
      NONE,
      TOW,
      HOST
  }

  // The Tree token metadata and id
  string private towMetadata;

  // How much to pay more on each buy
  uint256 public priceRaise;

  // At what transfer number when last withdrawal was made by a former host
  // Needed to calculated the amount to refund
  mapping(address => uint256) private lastWithdrawAt;

  // amount already withdrawn by addresses
  mapping(address => uint256) private alreadyWithdrawn;

  constructor(uint256 _priceRaise) ERC721("The Tree of Wealth", "TTOW") {
      priceRaise = _priceRaise;
      // First mint would be The Tree
      // And it's for the contract
      mint(address(this));
  }

  function mint(address _owner) private {
      uint256 newItemId = tokensMinted;

      // now mint
      _safeMint(_owner, newItemId);

      // Increase the token ids
      tokensMinted = tokensMinted + 1;
  }

  function getTokenType(uint256 tokenId) public view returns (TokenType) {
      if (tokenId == 0) return TokenType.TOW;
      if (tokenId >= tokensMinted) return TokenType.NONE;
      return TokenType.HOST;
  }

  function tokenURI(uint256 tokenId)
      public
      view
      override
      returns (string memory)
  {
    _requireMinted(tokenId);
      if (getTokenType(tokenId) == TokenType.TOW) {
          return Images.getToWMetadata();
      }

      return Images.getHostTokenMetadata(tokenId);
  }

  /**
    * @dev See {IERC721-transferFrom}.
    */
  function transferFrom( address from, address to, uint256 tokenId ) public onlyNotToW(tokenId) override {
    return super.transferFrom(from, to, tokenId);
  }

  /**
    * @dev See {IERC721-safeTransferFrom}.
    */
  function safeTransferFrom( address from, address to, uint256 tokenId, bytes memory _data ) public onlyNotToW(tokenId) override {
    return super.safeTransferFrom(from, to, tokenId, _data);
  }

  /**
    * Modifier to check that a token is not the ToW
    */
  modifier onlyNotToW(uint256 tokenId) {
    require(tokenId != 0,  "ToW: Can only transfer by using the host method");
    _;
  }

  /**
    * @dev See {IERC721-approve}.
    */
  function approve(address to, uint256 tokenId) public override {
    require(tokenId != 0, "ToW: Can't approve transactions for The Tree");
    super.approve(to, tokenId);
  }

  /**
    * Transfers the token to the caller, if it's sending the correct value
    */
  function host() public payable {
    address currentHost = ownerOf(0);

    // Always need to pay one ether more than the previous owner
    require(lastWithdrawAt[msg.sender] == 0, "ToW: You've already hosted The Tree" );

    // Always need to pay one ether more than the previous owner
    require(msg.value == currentPrice(), "ToW: The price is not right" );
    
    // Mint the token
    mint(msg.sender);

    // Set up the last withdraw for the sender to this token.
    lastWithdrawAt[msg.sender] = tokensMinted;

    // now transfer The Tree
    _transfer(currentHost, msg.sender, 0);
  }


  /**
    * Any holder might have some value hold in the contract
    * call withdraw to get that value
    */
  function withdraw() public {
    uint256 toWithdraw = availableToWithdraw();

    require( toWithdraw > 0, "ToW: No funds to withdraw");

    // Set the last withdraw to the current transfer
    lastWithdrawAt[msg.sender] = tokensMinted;

    // Update the value already withdrawn
    alreadyWithdrawn[msg.sender] += toWithdraw;

    // Transfer the funds
    payable(msg.sender).transfer(toWithdraw);

    // Emit event
    emit Withdraw(msg.sender, toWithdraw);
  }

  ////////////////////
  // Info methods
  ////////////////////
  function availableToWithdraw() public view returns(uint256) {
    uint256 lastWithdraw = lastWithdrawAt[msg.sender];

    require( lastWithdraw != 0,  "ToW: You've never been a host");
    

    return (tokensMinted - lastWithdraw) * priceRaise;
  }

  function currentPrice() public view returns(uint256) {
    if( tokensMinted == 1 ) return (priceRaise / 10);
    return (tokensMinted - 1) * priceRaise;
  }

  function hasBeenHost( address addr ) public view returns(bool) {
    return lastWithdrawAt[addr] > 0;
  }

  function getWithdrawnValue() public view returns(uint256) {
    return alreadyWithdrawn[msg.sender];
  }


  // Events
  event Withdraw(address owner, uint256 value);
}
