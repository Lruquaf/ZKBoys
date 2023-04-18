// SPDX-License-Identifier: MIT

/**
 * @title An NFT Minting Contract Named zkBoys on zkSync Era Mainnet
 * @author Lruquaf ---> github.com/Lruquaf
 */

pragma solidity 0.8.8;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

error WLSaleNotStarted();
error WLSaleHasEnded();
error PublicSaleNotStarted();

error WLAmountLimitExceeded();
error PublicAmountLimitExceeded();

error SupplyLimitForWLExceeded();
error SupplyLimitExceeded();

error NotEligibleAddressForWL();

error NotEnoughETH();

error WithdrawFailed();

contract ZKBoys is ERC721, Ownable {
    using Strings for uint256;

    // maximum token supply ---> test: 10, real: 1000
    uint256 public constant MAX_SUPPLY = 10;
    // maximum token supply for whitelist ---> test: 4, real: 400
    uint256 public constant MAX_SUPPLY_FOR_WL = 4;

    // maximum mint amount per whitelisted address ---> test: 2, real: 5
    uint256 public constant MAX_AMOUNT_PER_WL = 2;
    // maximum mint amount per address in public sale ---> test: 3, real: 20
    uint256 public constant MAX_AMOUNT_PER_PUBLIC = 3;

    // public sale price per token
    uint256 public constant PUBLIC_PRICE = 0.0015 ether;

    // current token supply
    uint256 public tokenSupply = 0;
    // counter for tokens (token ids: 1-1000)
    uint256 public idCounter = 1;

    // test times: 1681635600, 1681722000, 1681981200, 1682067600
    // Pazartesi, 3 Nisan 2023 14:00:00 GMT+03:00, Monday, 3 April 2023 11:00:00
    // real time: 1680519600
    uint256 public wlMintDate;
    // Pazartesi, 3 Nisan 2023 20:00:00 GMT+03:00, Monday, 3 April 2023 17:00:00
    // real time: 1680541200
    uint256 public publicMintDate;

    // base URI of tokens
    string public baseURI = "";

    // mapping of whitelisted addresses
    mapping(address => bool) public isWhitelisted;
    // mapping of wl addresses and amount of their owned tokens
    mapping(address => uint256) public wlAddressToTokenAmounts;
    // mapping of addresses and amount of their owned tokens
    mapping(address => uint256) public addressToTokenAmounts;

    event TokenMinted(address to, uint256 amount);
    event Whitelisted(address whitelisted);
    event BatchWhitelisted(address[] whitelisteds);
    event Withdrew(uint256 amount);

    /**
     * @param _baseURI is base URI of NFT collection on IPFS
     */
    constructor(string memory _baseURI) ERC721("zkBoys", "ZKB") {
        baseURI = _baseURI;
    }

    /**
     * @notice this function exists to test minting dates
     * @param _wlMintDate is wlMintDate
     * @param _publicMintDate is publicMintDate
     */

    function setMintTime(
        uint256 _wlMintDate,
        uint256 _publicMintDate
    ) public onlyOwner {
        wlMintDate = _wlMintDate;
        publicMintDate = _publicMintDate;
    }

    /**
     * @notice the sale has two phase, whitelist sale and public sale.
     * Public sale starts after wl sale. When wl sale starts, only wl
     * addresses can mint just 5 tokens per address.
     * @dev owned tokens amount of an address should not exceed max
     * minted amount per wl address.
     * @param _amount is amount of tokens that want to mint.
     */
    function mintForWhitelist(uint256 _amount) external {
        if (block.timestamp < wlMintDate) {
            revert WLSaleNotStarted();
        } else if (block.timestamp >= publicMintDate) {
            revert WLSaleHasEnded();
        }
        if (!isWhitelisted[msg.sender]) {
            revert NotEligibleAddressForWL();
        }
        if (wlAddressToTokenAmounts[msg.sender] + _amount > MAX_AMOUNT_PER_WL) {
            revert WLAmountLimitExceeded();
        }
        if (_amount + tokenSupply > MAX_SUPPLY_FOR_WL) {
            revert SupplyLimitForWLExceeded();
        }
        for (uint i = 0; i < _amount; ++i) {
            _mint(msg.sender, idCounter);
            unchecked {
                tokenSupply++;
                idCounter++;
            }
        }
        wlAddressToTokenAmounts[msg.sender] += _amount;
        emit TokenMinted(msg.sender, _amount);
    }

    /**
     * @notice the sale has two phase, whitelist sale and public sale.
     * Public sale starts after wl sale. When public sale starts, any
     * address can mint just 20 tokens per address.
     * @dev owned tokens amount of an address should not exceed max
     * minted amount per address.
     * @param _amount is amount of tokens that want to mint.
     */
    function mintForPublic(uint256 _amount) external payable {
        if (block.timestamp < publicMintDate) {
            revert PublicSaleNotStarted();
        }
        if (
            addressToTokenAmounts[msg.sender] + _amount > MAX_AMOUNT_PER_PUBLIC
        ) {
            revert PublicAmountLimitExceeded();
        }
        if (_amount + tokenSupply > MAX_SUPPLY) {
            revert SupplyLimitExceeded();
        }
        if (msg.value != PUBLIC_PRICE * _amount) {
            revert NotEnoughETH();
        }
        for (uint i = 0; i < _amount; ++i) {
            _mint(msg.sender, idCounter);
            unchecked {
                tokenSupply++;
                idCounter++;
            }
        }
        addressToTokenAmounts[msg.sender] += _amount;
        emit TokenMinted(msg.sender, _amount);
    }

    /**
     * @notice owner adds a wl address.
     * @param _whitelisted is a wl address.
     */
    function addToWhitelist(address _whitelisted) external onlyOwner {
        isWhitelisted[_whitelisted] = true;
        emit Whitelisted(_whitelisted);
    }

    /**
     * @notice owner adds an array of wl addresses.
     * @param _whitelisteds is a wl address array.
     */
    function addToWhitelistBatch(
        address[] calldata _whitelisteds
    ) external onlyOwner {
        for (uint i = 0; i < _whitelisteds.length; ++i) {
            isWhitelisted[_whitelisteds[i]] = true;
        }
        emit BatchWhitelisted(_whitelisteds);
    }

    /**
     * @notice returns token URI of a spesific token.
     * @inheritdoc ERC721
     * @dev returns in format "ipfs://{CID}/{_tokenId}.json"
     * @param _tokenId is token id of querying token URI
     * @return if baseURI exists, returns token URI.
     * Otherwise returns empty string.
     */
    function tokenURI(
        uint256 _tokenId
    ) public view override returns (string memory) {
        _requireMinted(_tokenId);

        string memory _baseURI = _baseURI();
        return
            bytes(_baseURI).length > 0
                ? string(
                    abi.encodePacked(_baseURI, _tokenId.toString(), ".json")
                )
                : "";
    }

    /**
     * @notice returns base URI of NFT collection on IPFS.
     * @return baseURI
     */

    function _baseURI() internal view override returns (string memory) {
        return baseURI;
    }

    /**
     * @notice owner can withdraw balance of the contract at any time.
     */
    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        (bool success, ) = payable(msg.sender).call{value: balance}("");
        if (!success) {
            revert WithdrawFailed();
        }
        emit Withdrew(balance);
    }
}
