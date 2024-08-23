import { useWallet } from "@/context/WalletContext";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";
import { cn } from "@/lib/utils";
import { Eye, EyeOff, Copy } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/use-toast";
import {Connection, PublicKey} from "@solana/web3.js";
import axios from "axios";
import constants from "@/lib/constaints";



export const WalletDetailsCard = () => {
    const { toast } = useToast();
    const { accounts, addAccount } = useWallet();
    const [currAccount, setCurrAccount] = useState<string>(accounts[0]?.publicKey || "");
    const [showKeys, setShowKeys] = useState<boolean>(false);
    const [balance, setBalance] = useState<number | null>(null);
    const [usdcAmount, setUsdcAmount] = useState<number | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const currentAccount = accounts.find((account) => account.publicKey === currAccount);

    const handleCopy = (key: string) => {
        navigator.clipboard.writeText(key);
        toast({ description: "Copied to clipboard!" });
    };

    useEffect(() => {
        async function fetchBalance() {
            if (!currAccount) return;

            setLoading(true);
            try {
                console.log("uri ",constants.NEXT_ALCHEMY_URI)
                const connection = new Connection(constants.NEXT_ALCHEMY_URI || "");
                const balanceLamports = await connection.getBalance(new PublicKey(currAccount));
                setBalance(balanceLamports / 1e9);


                const { data } = await axios.get("https://api.coingecko.com/api/v3/simple/price", {
                    params: {
                        ids: "solana",
                        vs_currencies: "usd"
                    }
                });
                setUsdcAmount(balanceLamports / 1e9 * data.solana.usd);

            } catch (error) {
                console.error("Error fetching balance:", error);
                toast({ description: "Failed to fetch balance." });
            } finally {
                setLoading(false);
            }
        }

        fetchBalance();
    }, [currAccount, toast]);

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
                        <Select onValueChange={(value) => setCurrAccount(value)} value={currAccount}>
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

                        <Button className="bg-gray-700 hover:bg-gray-600 text-white" onClick={addAccount}>
                            Add
                        </Button>

                        {currentAccount && (
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="outline" className={cn("border-gray-600 bg-gray-700 hover:bg-gray-600 text-white")}>
                                        Keys
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[425px] flex flex-wrap text-black overflow-auto">
                                    <DialogTitle>Public and Private Key</DialogTitle>
                                    <div className="space-y-4 mt-4">
                                        <div className="flex items-center gap-2">
                                            <p className="font-medium">Public Key:</p>
                                            <div className="flex items-center gap-2 w-full">
                                                <p className={cn("break-words w-full", showKeys ? "text-black" : "text-gray-400")}>
                                                    {showKeys ? currentAccount.publicKey : "••••••••••••••••••••••••••••••••"}
                                                </p>
                                                <Button variant="ghost" size="sm" onClick={() => setShowKeys(!showKeys)}>
                                                    {showKeys ? <EyeOff className="text-gray-600" /> : <Eye className="text-gray-600" />}
                                                </Button>
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger>
                                                            <Button variant="ghost" size="sm" onClick={() => handleCopy(currentAccount.publicKey)}>
                                                                <Copy className="text-gray-600" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>Copy</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <p className="font-medium">Private Key:</p>
                                            <div className="flex items-center gap-2 w-full">
                                                <p className={cn("break-words w-full", showKeys ? "text-black" : "text-gray-400")}>
                                                    {showKeys ? currentAccount.privateKey : "••••••••••••••••••••••••••••••••"}
                                                </p>
                                                <Button variant="ghost" size="sm" onClick={() => setShowKeys(!showKeys)}>
                                                    {showKeys ? <EyeOff className="text-gray-600" /> : <Eye className="text-gray-600" />}
                                                </Button>
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger>
                                                            <Button variant="ghost" size="sm" onClick={() => handleCopy(currentAccount.privateKey)}>
                                                                <Copy className="text-gray-600" />
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
                                    <p className="text-3xl font-semibold text-white">{balance?.toFixed(2) || '—'} SOL</p>
                                    <p className="text-md text-gray-400">≈ {usdcAmount?.toFixed(2) || '—'} USDC</p>
                                </div>
                                <div className="flex gap-4">
                                    <Button
                                        className="bg-green-500 hover:bg-green-400 text-white flex items-center gap-2 px-4 py-2 rounded-lg">
                                        <FaArrowUp/>
                                        Send
                                    </Button>
                                    <Button
                                        className="bg-blue-500 hover:bg-blue-400 text-white flex items-center gap-2 px-4 py-2 rounded-lg">
                                        <FaArrowDown/>
                                        Receive
                                    </Button>
                                </div>
                            </div>
                            <div className="w-full bg-gray-700 p-4 rounded-lg shadow-lg mt-4">
                                <h3 className="text-white text-lg mb-2">Transaction History</h3>
                                <div className="text-gray-300 space-y-2">
                                    <div className="flex justify-between">
                                        <span>Received 1.2 SOL</span>
                                        <span className="text-green-400">+1.2 SOL</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Sent 0.8 SOL</span>
                                        <span className="text-red-400">-0.8 SOL</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Received 0.5 SOL</span>
                                        <span className="text-green-400">+0.5 SOL</span>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </CardFooter>
            </motion.div>
        </TooltipProvider>
    );
};
