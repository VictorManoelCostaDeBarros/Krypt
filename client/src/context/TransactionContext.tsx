import { ChangeEvent, createContext, useEffect, useState } from "react";
import { createPublicClient, createWalletClient, custom, formatEther, http, parseEther } from "viem"

import { contractABI, contractAddress } from "../utils/constants";
import { sepolia } from "viem/chains";

export type Transaction = {
  addressTo: string,
  addressFrom: string,
  keyword: string,
  message: string,
  timestamp: string,
  amount: string
}

export const TransactionContext = createContext<{
  currentAccount: string,
  formData: {
    addressTo: string,
    amount: string,
    keyword: string,
    message: string
  },  
  transactions: Array<Transaction>,
  isLoading: boolean,
  transactionCount: number,
  connectWallet: () => Promise<void>,
  handleChange: (e: ChangeEvent<HTMLInputElement>, name: string) => void,
  sendTransaction: () => Promise<void>,
}>({
  currentAccount: "",
  formData: {
    addressTo: "",
    amount: "",
    keyword: "",
    message: ""
  },
  transactions: [],
  isLoading: false,
  transactionCount: 0,
  connectWallet: async () => {},
  handleChange: () => {},
  sendTransaction: async () => {} 
})

const { ethereum } = window as unknown as { ethereum?: any };

export const TransactionProvider = ({ children }: { children: React.ReactNode }) => {
  const [walletClient, setWalletClient] = useState<ReturnType<typeof createWalletClient> | null>(null);
  const [isLoading, setIsLoading] = useState(false)
  const [transactionCount, setTransactionCount] = useState(Number(localStorage.getItem("transactionCount") || "0"))
  const [transactions, setTransactions] = useState<Array<Transaction>>([])
  const [currentAccount, setCurrentAccount] = useState("")

  const [formData, setFormData] = useState({
    addressTo: "",
    amount: "",
    keyword: "",
    message: ""
  })

  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(),
  });


  const handleChange = (e: ChangeEvent<HTMLInputElement>, name: string) => {
    setFormData((prev) => ({ ...prev, [name]: e.target.value }))
  }

  const getAllTransactions = async () => {
    try {
      if (!ethereum) return alert("Please install MetaMask!")
      
      const availableTransactions = await publicClient.readContract({
        address: contractAddress,
        abi: contractABI,
        functionName: "getAllTransactions"
      }) as unknown as {
        amount: bigint,
        keyword: string,
        message: string,
        receiver: string,
        sender: string,
        timestamp: bigint
      }[]
      
      const structuredTransactions = availableTransactions.map<Transaction>((transaction: any) => ({
        addressTo: transaction.receiver,
        addressFrom: transaction.sender,
        keyword: transaction.keyword,
        message: transaction.message,
        timestamp: new Date(Number(transaction.timestamp) * 1000).toLocaleString(),
        amount: formatEther(transaction.amount)
      }))
      
      setTransactions(structuredTransactions)
    } catch (error) {
      console.error(error)
      throw new Error("No ethereum object")
    }
  }

  const checkIfWalletIsConnected = async () => {
    try {
      if (!ethereum) return alert("Please install MetaMask!")

      const accounts = await ethereum.request({ method: "eth_accounts" })

      const walletClientInstance = createWalletClient({
        chain: sepolia,
        transport: custom(ethereum),
      });

      setWalletClient(walletClientInstance);

      if (accounts.length) {
        setCurrentAccount(accounts[0])
        getAllTransactions()
      } else {
        console.log("No account found")
      }
    } catch (error) {
      console.error(error)
      throw new Error("No ethereum object")
    }
  }

  const checkIfTransactionsExist = async () => {
    try {
      const transactionCount = await publicClient.readContract({
        address: contractAddress,
        abi: contractABI, 
        functionName: "getTransactionCount"
      }) as unknown as bigint
      
      window.localStorage.setItem("transactionCount", transactionCount.toString())
    } catch (error) {
      console.error(error)
      throw new Error("No ethereum object")
    }
  }

  const connectWallet = async () => {
    try {
      if (!ethereum) return alert("Please install MetaMask!")
      if (!walletClient) return alert("Please connect your wallet first!")
      
      const accounts = await walletClient.requestAddresses();
      setCurrentAccount(accounts[0])
    } catch (error) {
      console.error(error)
      throw new Error("No ethereum object")
    }
  }

  const sendTransaction = async () => {
    try {
      if (!ethereum) {
        alert("Please install MetaMask!");
        return;
      }

      if (!walletClient) {
        alert("Please connect your wallet first!");
        return;
      }

      if (!currentAccount) {
        alert("Please connect your wallet first!");
        return;
      }

      const { addressTo, amount, keyword, message } = formData;

      if (!addressTo || !amount || !keyword || !message) {
        alert("Please fill in all fields");
        return;
      }

      setIsLoading(true);

      const parsedAmount = parseEther(amount);

      // First send the ETH transaction
      const ethTransaction = await ethereum.request({
        method: "eth_sendTransaction",
        params: [{
          from: currentAccount,
          to: addressTo,
          gas: "0x5208", // 21000 GWEI  
          value: parsedAmount.toString(16) // Convert to hex
        }]  
      });

      // Wait for the ETH transaction to be mined
      await publicClient.waitForTransactionReceipt({ hash: ethTransaction });

      // Then add to blockchain
      const transactionHash = await walletClient.writeContract({
        address: contractAddress,
        abi: contractABI,
        functionName: "addToBlockchain",
        args: [addressTo, parsedAmount, message, keyword],
        chain: sepolia,
        account: currentAccount as `0x${string}`
      });

      console.log(`Loading: ${transactionHash}`);
      await publicClient.waitForTransactionReceipt({ hash: transactionHash });
      setIsLoading(false);
      console.log(`Success: ${transactionHash}`);

      const transactionCount = await publicClient.readContract({
        address: contractAddress,
        abi: contractABI, 
        functionName: "getTransactionCount"
      });
      
      setTransactionCount(Number(transactionCount));
      
      window.location.reload();
      await getAllTransactions();
    } catch (error) {
      console.error("Transaction error:", error);
      setIsLoading(false);
      if (error instanceof Error) {
        alert(`Transaction failed: ${error.message}`);
      } else {
        alert("Transaction failed. Please try again.");
      }
      throw new Error("No ethereum object")
    }
  }

  useEffect(() => {
    checkIfWalletIsConnected()
    checkIfTransactionsExist()
  }, [])

  return (
    <TransactionContext.Provider value={{ 
      currentAccount, 
      connectWallet, 
      formData, 
      handleChange, 
      sendTransaction,
      transactions,
      isLoading,
      transactionCount
      }}> 
        {children}
    </TransactionContext.Provider>
  )
} 
