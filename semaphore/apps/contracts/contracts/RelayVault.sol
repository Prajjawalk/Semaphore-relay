//SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/ownership/Ownable.sol";

contract RelayVault is Ownable {

    uint256 public wIRONSupply;
    address public wIron;
    uint256 public ironPrice;
    uint8 public ironPriceDecimals;
    uint8 public ironDecimals; // Needs to be same as native asset decimals

    // whitelisted assets supported by the vault
    struct Asset {
        address priceFeed;
        uint8 assetDecimals;
        uint8 priceFeedDecimals;
        uint256 supply;
        bool allowed;
    }


    mapping(address => Asset) public assetAddressMap;

    uint256 public nativeETHSupply;

    constructor(address _wIron) {
        wIron = _wIron;
    }

    // Depositors deposit assets to get wIRON
    function deposit(address token, uint256 _amount) public payable {
        assert(assetAddressMap[token].allowed == true);

        // Transfer token from user to vault
        IERC20(token).transferFrom(msg.sender, address(this), _amount);
        Asset storage asset = assetAddressMap[token];
        asset.supply += _amount;

        uint256 wIronAmount = _convertPrice(token, wIron, _amount);
        IERC20(wIron).transfer(msg.sender, wIronAmount);

        nativeETHSupply += msg.value;
        IERC20(wIron).transfer(msg.sender, msg.value * 1400); // Eth to IRON ratio hardcoded for now, will update later
    }

    // Relay function to relay transactions given proofs of spending limit as input
    function relay() external onlyOwner {

    }

    function addSupportedAsset external onlyOwner (
        address priceFeed,
        uint8 assetDecimals,
        uint8 priceFeedDecimals,
        address tokenAddress) external payable {

            require(priceFeed != address(0), "!INVALID FEED");

            Asset storage asset = assetAddressMap[tokenAddress];
            asset.allowed = true;
            asset.priceFeed = priceFeed;
            asset.assetDecimals = assetDecimals;
            asset.supply = 0;
    }

    receive() external payable {
        // This function is executed when a contract receives plain Ether (without data)
        nativeETHSupply += msg.value;
        IERC20(wIron).transfer(msg.sender, msg.value * 1400); // TODO: update based on price feed
    }

    function _convertPrice(
        address _fromAsset,
        uint256 _fromAmount
    ) internal view returns(uint256) {
        require(_fromAsset != _toAsset, "!SAME_ASSET");
        require(assets[_fromAsset].priceFeed != address(0), "!INVALID(fromAsset)");

        if (_fromAmount == 0) {
            return 0;
        }

        int256 oraclePrice;
        uint256 updatedAt;

        ( , oraclePrice, , updatedAt, ) = AggregatorV3Interface(assets[_fromAsset].priceFeed).latestRoundData();
        uint256 fromOraclePrice = uint256(oraclePrice);
        require(maxPriceFeedAge == 0 || block.timestamp - updatedAt <= maxPriceFeedAge, "!PRICE_OUTDATED");
        // ( , oraclePrice, , updatedAt, ) = AggregatorV3Interface(assets[_toAsset].priceFeed).latestRoundData();
        uint256 toOraclePrice = uint256(ironPrice);
        // require(maxPriceFeedAge == 0 || block.timestamp - updatedAt <= maxPriceFeedAge, "!PRICE_OUTDATED");

        if (assets[_fromAsset].priceFeedDecimals != ironPriceDecimals) {
            // since oracle precision is different, scale everything
            // to _toAsset precision and do conversion
            return _scalePrice(_fromAmount, assets[_fromAsset].assetDecimals, ironDecimals) *
                    _scalePrice(fromOraclePrice, assets[_fromAsset].priceFeedDecimals, ironDecimals) /
                    _scalePrice(toOraclePrice, ironPriceDecimals, ironDecimals);
        } else {
            // oracles are already in same precision, so just scale _amount to asset precision,
            // and multiply by the price feed ratio
            return _scalePrice(_fromAmount, assets[_fromAsset].assetDecimals, ironDecimals) *
                fromOraclePrice / toOraclePrice;
        }
    }

    function _scalePrice(
        uint256 _price,
        uint8 _priceDecimals,
        uint8 _decimals
    ) internal pure returns (uint256){
        if (_priceDecimals < _decimals) {
            return _price * uint256(10 ** uint256(_decimals - _priceDecimals));
        } else if (_priceDecimals > _decimals) {
            return _price / uint256(10 ** uint256(_priceDecimals - _decimals));
        }
        return _price;
    }
}
