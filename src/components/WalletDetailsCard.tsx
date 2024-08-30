import { useWallet } from "@/context/WalletContext";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useQRCode } from "next-qrcode";
import {
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";
import { cn } from "@/lib/utils";
import { Eye, EyeOff, Copy } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/use-toast";
import { Connection, PublicKey } from "@solana/web3.js";
import axios from "axios";
import constants from "@/lib/constaints";
import Send from "./Send";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import Tokens, {TokenProps} from "@/components/Tokens";
import {getUserTokens} from "@/actions/tokenActions";

export const WalletDetailsCard = () => {
  const { Canvas } = useQRCode();
  const { toast } = useToast();
  const { accounts, addAccount, setCurrentAccount, currentAccount } =
      useWallet();
  const [currAccount, setCurrAccount] = useState<string>(
      accounts[0]?.publicKey || ""
  );
  const [tokens,setTokens] = useState<TokenProps[]>([])
  const [showKeys, setShowKeys] = useState<boolean>(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [usdcAmount, setUsdcAmount] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [transactions, setTransactions] = useState<any[]>([]);

  //   const currentAccount = accounts.find(
  //     (account) => account.publicKey === currAccount
  //   );

  const handleCopy = (keyType: string) => {
    if (!currentAccount) {
      toast({
        title: `Error`,
        description: "Please first Create account",
        variant: "destructive",
        duration: 2000,
      });
      return;
    }
    const key =
      keyType === "public"
        ? currentAccount.publicKey
        : currentAccount.privateKey;
    navigator.clipboard.writeText(key);
    toast({
      title: `${keyType === "public" ? "Public" : "Private"} key copied!`,
      description: `${
        keyType === "public" ? "Public" : "Private"
      } key has been copied to your clipboard.`,
      variant: "default",
      duration: 2000,
    });
  };



  useEffect(() => {
    async function fetchBalanceAndTransactions() {
      if (!currAccount) return;

      setLoading(true);
      try {
        const connection = new Connection(constants.NEXT_ALCHEMY_URI || "");

        // Fetch balance
        const balanceLamports = await connection.getBalance(
          new PublicKey(currAccount)
        );
        setBalance(balanceLamports / 1e9);

        const { data } = await axios.get(
          "https://api.coingecko.com/api/v3/simple/price",
          {
            params: {
              ids: "solana",
              vs_currencies: "usd",
            },
          }
        );
        setUsdcAmount((balanceLamports / 1e9) * data.solana.usd);

        // Fetch recent transactions
        const signatures = await connection.getSignaturesForAddress(
          new PublicKey(currAccount),
          { limit: 4 }
        );
        const fetchedTransactions = await Promise.all(
          signatures.map(async (signatureInfo) => {
            const tx = await connection.getTransaction(
              signatureInfo.signature,
              { commitment: "confirmed" }
            );
            return tx;
          })
        );
        // console.log("fetchedTransactions", fetchedTransactions);
        setTransactions(fetchedTransactions);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({ description: "Failed to fetch data." });
      } finally {
        setLoading(false);
      }
    }

    fetchBalanceAndTransactions();
  }, [currAccount, toast]);

  useEffect(() => {
    // console.log("useEffect 1 called.")
    if (accounts.length ===1 ) {
      setCurrAccount(accounts[0].publicKey);
      setCurrentAccount(accounts[0]);
      // console.log("First account selected!!")
    }
  }, [accounts]);

  useEffect( () => {
    // console.log("useEffect 2 called.")

    async function fetch(){
      try {
        const res = await getUserTokens(currAccount);
        setTokens(res)
      }catch (err){
      console.log("Failed to fetch user data:", err);
      }
    }
    fetch();
    const selectedAccount = accounts.find(
        (account) => account.publicKey === currAccount
    );
    if (selectedAccount) {
      setCurrentAccount(selectedAccount);
    }
  }, [currAccount, accounts]);

  return (
    <TooltipProvider>
      <motion.div
        className="max-w-md mx-auto p-6 rounded-lg bg-gradient-to-br from-gray-800 via-gray-900 to-black"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <CardHeader>
          <CardTitle className="text-white text-2xl">Wallet Details</CardTitle>
          <CardDescription className="text-gray-400 mt-2 flex flex-row justify-between items-center text-center gap-4">
            {/* Wallet account selection */}
            <Select
                onValueChange={(value) => setCurrAccount(value)}
                value={currAccount}
            >
              <SelectTrigger className="w-[180px] bg-gray-800 text-white border border-gray-600 rounded-md shadow-md hover:bg-gray-700">
                <SelectValue placeholder="Select Account" />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 text-white border border-gray-600 rounded-md shadow-lg">
                {accounts.map((account, i) => (
                  <SelectItem
                    value={account.publicKey}
                    key={account.publicKey}
                    className="hover:bg-gray-600 active:bg-gray-500 transition-colors focus:bg-transparent focus:text-white hover:cursor-pointer"
                  >
                    Account {i + 1}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              className="bg-gray-700 hover:bg-gray-600 text-white"
              onClick={addAccount}
            >
              Add
            </Button>

             {currentAccount && (
            <Dialog>
              <DialogTrigger asChild>
                <Button className="border-gray-600 bg-gray-700 hover:bg-gray-600 text-white">
                  Keys
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] bg-gray-800 p-6 rounded-lg shadow-xl overflow-auto">
                <DialogTitle className="text-white">
                  Public and Private Key
                </DialogTitle>
                <div className="space-y-4 mt-4">
                  <div className="flex items-center gap-2 justify-between">
                    <p className="font-medium text-white ">Public Key:</p>
                    <div className="flex items-center gap-2 ">
                      <p
                        className="text-gray-400 break-words w-full cursor-pointer"
                        onClick={() => handleCopy("public")}
                      >
                        {"••••••••••••••••••••••••"}
                      </p>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="hover:bg-gray-600 hover:text-white"
                              onClick={() => handleCopy("public")}
                            >
                              <Copy className="text-gray-600 hover:text-white" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Copy</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 justify-between">
                    <p className="font-medium text-white">Private Key:</p>
                    <div className="flex items-center gap-2 ">
                      <p
                        className="text-gray-400 break-words w-full cursor-pointer"
                        onClick={() => handleCopy("private")}
                      >
                        {"••••••••••••••••••••••••"}
                      </p>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="hover:bg-gray-600 hover:text-white"
                              onClick={() => handleCopy("private")}
                            >
                              <Copy className="text-gray-600 hover:text-white" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Copy</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
              )}
          </CardDescription>
        </CardHeader>

        <CardFooter className="flex flex-col gap-4 w-full justify-start items-center text-center mt-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center space-y-4 w-full">
              <motion.div
                className="w-16 h-16 border-4 border-t-4 border-gray-500 border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1 }}
              />
              <p className="text-gray-400">Loading balance...</p>
            </div>
          ) : (
              <>
                <div className="w-full flex flex-col items-center bg-gray-800 p-4 rounded-lg shadow-lg">
                  <div className="text-center mb-4">
                    <h3 className="text-lg text-gray-300">Balance</h3>
                    <p className="text-3xl font-semibold text-white">
                      {balance?.toFixed(2) || "—"} SOL
                    </p>
                    <p className="text-md text-gray-400">
                      ≈ {usdcAmount?.toFixed(2) || "—"} USDC
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <Send/>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                            className="bg-blue-500 hover:bg-blue-400 text-white flex items-center gap-2 px-4 py-2 rounded-lg">
                          <FaArrowDown className="text-xl"/>
                          Receive
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md bg-gray-800 p-6 rounded-lg shadow-xl">
                        <DialogHeader>
                          <DialogTitle className="text-xl font-semibold text-white">
                            Receive SOL
                          </DialogTitle>
                          <DialogDescription className="text-gray-300 mt-2">
                            Share your public key below to receive payments or
                            transfers to your account.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="flex flex-col items-center space-y-4 mt-4">
                          <div className="flex flex-row items-center w-full">
                            <div className="flex-1">
                              <Label htmlFor="publicKey" className="sr-only">
                                Public Key
                              </Label>
                              <Input
                                  id="publicKey"
                                  value={currAccount}
                                  readOnly
                                  className="cursor-pointer bg-gray-700 text-white px-4 py-2 rounded-md w-full"
                                  onClick={() => handleCopy("public")}
                              />
                            </div>
                            <Button
                                type="button"
                                size="sm"
                                className="bg-blue-600 hover:bg-blue-500 text-white px-3 ml-2 rounded-md"
                                onClick={() => handleCopy("public")}
                            >
                              <Copy className="h-5 w-5"/>
                            </Button>
                          </div>

                          <Canvas
                              text={currAccount}
                              options={{
                                errorCorrectionLevel: "M",
                                margin: 3,
                                scale: 4,
                                width: 200,
                                color: {
                                  dark: "#000",
                                  light: "#FFF",
                                },
                              }}
                          />

                          <p className="text-gray-400 text-sm text-center mt-4">
                            Scan the QR code or copy the public key to share your
                            address.
                          </p>
                        </div>
                        <DialogFooter className="sm:justify-start mt-6">
                          <DialogClose asChild>
                            <Button
                                type="button"
                                variant="secondary"
                                className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-md"
                            >
                              Close
                            </Button>
                          </DialogClose>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>



                <div className="w-full">
                  <h4 className="text-lg text-gray-300 mb-3">Your Tokens</h4>
                  <div className="flex flex-col gap-4">
                    {tokens.map((token, index) => (
                        <Tokens
                            key={index}
                            mint={token.mint}
                            amount={token.amount}
                            decimals={token.decimals}
                        />
                    ))}
                  </div>
                </div>

                {/* Transactions */}
                <div className="w-full mt-6">
                  <h4 className="text-lg text-gray-300 mb-3">
                    Recent Transactions
                  </h4>
                  <div className="flex flex-col gap-2 overflow-y-scroll max-h-64 scrollbar-hide hide-scrollbar">
                    {transactions.length > 0 ? (
                        transactions.map((tx, index) => {
                          const {meta, transaction, blockTime} = tx || {};
                          if (!meta || !transaction || !blockTime) return null;

                          const isSent = meta.preBalances[1] > meta.postBalances[1];

                          const amount =
                              Math.abs(meta.postBalances[1] - meta.preBalances[1]) /
                              1e9;
                          const time = new Date(blockTime * 1000).toLocaleString();

                          return (
                              <div
                                  key={index}
                                  className="p-4 bg-gray-800 rounded-lg flex items-center justify-between text-white shadow-lg"
                              >
                                <div className="flex items-center gap-4">
                                  {isSent ? (
                                      <FaArrowUp className="text-red-500"/>
                                  ) : (
                                      <FaArrowDown className="text-green-500"/>
                                  )}
                                  <div>
                                    <p className="font-medium">
                                      {isSent ? "Sent" : "Received"}
                                    </p>
                                    <p className="text-sm text-gray-400">{time}</p>
                                  </div>
                                </div>
                                <p className="text-lg font-semibold">
                                  {amount.toFixed(4)} SOL
                                </p>
                              </div>
                          );
                        })
                    ) : (
                        <p className="text-gray-400">
                          No recent transactions found.
                        </p>
                    )}
                  </div>
                </div>
              </>
          )}
        </CardFooter>
      </motion.div>
    </TooltipProvider>
  );
};
