# Krypt - Blockchain Transaction Platform

Krypt is a modern web3 application that allows users to send and track blockchain transactions. Built with React, TypeScript, and Solidity, it provides a seamless interface for interacting with the Ethereum blockchain.

## Features

- 🔐 Connect your Ethereum wallet (MetaMask)
- 💸 Send transactions with custom messages
- 📊 View transaction history
- 🔍 Track transaction status
- 💻 Modern and responsive UI
- 🧪 Comprehensive smart contract testing

## Tech Stack

### Frontend
- React
- TypeScript
- TailwindCSS
- Viem (Ethereum interaction)
- Vite

### Smart Contract
- Solidity
- Foundry (Testing framework)
- Hardhat (Development environment)

## Prerequisites

- Node.js (v16 or higher)
- MetaMask browser extension
- Foundry (for smart contract development)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/krypt.git
cd krypt
```

2. Install frontend dependencies:
```bash
cd client
pnpm install
```

3. Install smart contract dependencies:
```bash
cd web3
forge install
```

## Development

### Frontend
```bash
cd client
pnpm dev
```

### Smart Contract
```bash
cd web3
# Run tests
forge test

# Deploy contract
forge script script/Transactions.s.sol
```

## Smart Contract

The smart contract (`Transactions.sol`) provides the following functionality:

- Record transactions with sender, receiver, amount, message, and timestamp
- Track transaction count
- Emit events for transaction tracking
- Balance validation before transaction

## Testing

The project includes comprehensive tests for the smart contract:

- Initial state verification
- Transaction creation and validation
- Multiple transaction handling
- Balance validation
- Event emission

Run tests with:
```bash
cd web3
forge test
```

## Project Structure

```
krypt/
├── client/                 # Frontend application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── context/      # React context providers
│   │   └── utils/        # Utility functions
│   └── public/           # Static assets
└── web3/                  # Smart contract
    ├── src/              # Solidity source files
    ├── test/             # Smart contract tests
    └── script/           # Deployment scripts
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [MetaMask](https://metamask.io/)
- [Viem](https://viem.sh/)
- [Foundry](https://book.getfoundry.sh/)
- [React](https://reactjs.org/)
- [TailwindCSS](https://tailwindcss.com/) 