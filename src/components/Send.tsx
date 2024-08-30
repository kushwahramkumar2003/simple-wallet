import React, { useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Copy } from "lucide-react";
import { FaArrowUp } from "react-icons/fa";
import { useWallet } from "@/context/WalletContext";
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import bs58 from "bs58";
import {useToast} from "@/components/ui/use-toast";

const Send: React.FC = () => {
  const {toast} = useToast();
  const { accounts, walletType, currentAccount } = useWallet();
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [isOpen, setOpen] = React.useState(false);

  const handleSend = async () => {
    if (!recipient || !amount || parseFloat(amount) <= 0) {
      setError("Please enter a valid recipient address and amount.");
      return;
    }

    if (!currentAccount) {
      setError("No account selected.");
      return;
    }

    // console.log("send current account --> ", currentAccount);

    try {
      setSending(true);
      setError("");

      const connection = new Connection(
        "https://api.devnet.solana.com",
        "confirmed"
      );

      const from = Keypair.fromSecretKey(
        bs58.decode(currentAccount.privateKey)
      );
      const toPubkey = new PublicKey(recipient);
      const lamports = parseFloat(amount) * LAMPORTS_PER_SOL;

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: from.publicKey,
          toPubkey,
          lamports,
        })
      );

      const signature = await sendAndConfirmTransaction(
        connection,
        transaction,
        [from]
      );

      // console.log("Transaction Signature:", signature);

      // alert("Transaction successful!");
      toast({
        description:"Transaction successful!",
        duration:2000
      })
      setOpen(false)
    } catch (err) {
      console.error("Transaction failed:", err);
      setError("Transaction failed. Please check the console for details.");
    } finally {
      setSending(false);
    }
  };

  const handleMaxAmount = async () => {
    try {
      setSending(true);
      const connection = new Connection(
        "https://api.devnet.solana.com",
        "confirmed"
      );

      if (!currentAccount) {
        setError("No account selected.");
        return;
      }
      // console.log("send current account --> ", currentAccount);

      const from = Keypair.fromSecretKey(bs58.decode(currentAccount.privateKey));
      const balance = await connection.getBalance(from.publicKey);

      setAmount((balance / LAMPORTS_PER_SOL).toString());
    } catch (err) {
      console.error("Failed to fetch balance:", err);
      setError("Failed to fetch balance.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <Dialog open={isOpen} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-400 hover:to-teal-400 text-white flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg">
            <FaArrowUp className="text-xl" />
            Send
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md bg-gray-800 p-6 rounded-lg shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-white">
              Send SOL
            </DialogTitle>
            <DialogDescription className="text-gray-300 mt-2">
              Enter the recipient&apos;s public key and the amount of SOL you want to
              send.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 mt-4">
            {error && <p className="text-red-500">{error}</p>}
            <div className="grid gap-2">
              <Label htmlFor="recipient" className="text-gray-300">
                Recipient Public Key
              </Label>
              <Input
                id="recipient"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="Enter recipient's public key"
                className="bg-gray-700 text-white px-4 py-2 rounded-md"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="amount" className="text-gray-300">
                Amount (SOL)
              </Label>
              <Input
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount in SOL"
                className="bg-gray-700 text-white px-4 py-2 rounded-md"
              />
              <Button
                type="button"
                variant="secondary"
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 mt-2 rounded-md"
                onClick={handleMaxAmount}
                disabled={sending}
              >
                Send Max Amount
              </Button>
            </div>
          </div>
          <DialogFooter className="sm:justify-start mt-6">
            <Button
              onClick={handleSend}
              disabled={sending}
              className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white px-4 py-2 rounded-lg"
            >
              {sending ? "Sending..." : "Send SOL"}
            </Button>
            <DialogClose asChild>
              <Button
                type="button"
                variant="secondary"
                className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-md ml-2"
              >
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Send;
