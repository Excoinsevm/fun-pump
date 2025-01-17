// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.27;

import {Token} from "./Token.sol";

import "hardhat/console.sol";

interface IUniswapV2Router {
    function addLiquidityETH(
        address token,
        uint256 amountTokenDesired,
        uint256 amountTokenMin,
        uint256 amountETHMin,
        address to,
        uint256 deadline
    )
        external
        payable
        returns (
            uint256 amountToken,
            uint256 amountETH,
            uint256 liquidity
        );
}

contract Factory {
    uint256 public constant TARGET = 10_000 ether;
    uint256 public constant TOKEN_LIMIT = 800_000 ether;
    uint256 public immutable fee;
    address public owner;
    address public uniswapRouter;

    uint256 public totalTokens;
    address[] public tokens;
    mapping(address => TokenSale) public tokenToSale;

    struct TokenSale {
        address token;
        string name;
        address creator;
        uint256 sold;
        uint256 raised;
        bool isOpen;
    }

    event Created(address indexed token);
    event Buy(address indexed token, uint256 amount);

    constructor(uint256 _fee, address _uniswapRouter) {
        fee = _fee;
        owner = msg.sender;
        uniswapRouter = _uniswapRouter;
    }

    function getTokenSale(
        uint256 _index
    ) public view returns (TokenSale memory) {
        return tokenToSale[tokens[_index]];
    }

    function getCost(uint256 _sold) public pure returns (uint256) {
        uint256 floor = 0.0025 ether;
        uint256 step = 0.00001 ether;
        uint256 increment = 10000 ether;

        uint256 cost = (step * (_sold / increment)) + floor;
        return cost;
    }

    function create(
        string memory _name,
        string memory _symbol
    ) external payable {
        require(msg.value >= fee, "Factory: Creator fee not met");

        Token token = new Token(msg.sender, _name, _symbol, 1_000_000 ether);

        // Store token address
        tokens.push(address(token));

        // Increment total tokens
        totalTokens++;

        // Create the sale.
        TokenSale memory sale = TokenSale(
            address(token),
            _name,
            msg.sender,
            0,
            0,
            true
        );

        // Save the sale to mapping.
        tokenToSale[address(token)] = sale;

        emit Created(address(token));
    }

    function buy(address _token, uint256 _amount) external payable {
        TokenSale storage sale = tokenToSale[_token];

        require(sale.isOpen == true, "Factory: Buying closed");
        require(_amount >= 1 ether, "Factory: Amount too low");
        require(_amount <= 10000 ether, "Factory: Amount exceeded");

        // Calculate the price of 1 token based on the total bought.
        uint256 cost = getCost(sale.sold);

        // Determine the total price for X amount.
        uint256 price = cost * (_amount / 10 ** 18);

        // Check to ensure enough ETH is sent.
        require(msg.value >= price, "Factory: Insufficient ETH received");

        // Update contract states.
        sale.sold += _amount;
        sale.raised += price;

        // If we have reached our ETH goal OR buy limit, stop allowing buys.
        if (sale.sold >= TOKEN_LIMIT || sale.raised >= TARGET) {
            sale.isOpen = false;
        }

        // Transfer tokens to buyer.
        Token(_token).transfer(msg.sender, _amount);

        emit Buy(_token, _amount);
    }

    function deposit(address _token) external {
    // Fetch the token and its sale details
    Token token = Token(_token);
    TokenSale memory sale = tokenToSale[_token];

    require(sale.isOpen == false, "Factory: Target not reached");

    uint256 tokenBalance = token.balanceOf(address(this));
    uint256 ethBalance = sale.raised;

    require(tokenBalance > 0 && ethBalance > 0, "Factory: Nothing to deposit");

    // Approve the Uniswap Router to spend the tokens
    token.approve(uniswapRouter, tokenBalance);

    // Add liquidity to Uniswap and send LP tokens to the dead address
    IUniswapV2Router(uniswapRouter).addLiquidityETH{value: ethBalance}(
        _token,
        tokenBalance,
        0, // Min amount of tokens (slippage tolerance can be added)
        0, // Min amount of ETH (slippage tolerance can be added)
        0x000000000000000000000000000000000000dEaD, // Send LP tokens to dead address
        block.timestamp + 3600 // Deadline: 1 hour
    );
}


    function withdraw(uint256 _amount) external {
        require(msg.sender == owner, "Factory: Not owner");

        (bool success, ) = payable(owner).call{value: _amount}("");
        require(success, "Factory: ETH transfer failed");
    }
}
