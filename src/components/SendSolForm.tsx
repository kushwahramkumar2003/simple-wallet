import { useWallet } from "@/context/WalletContext";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";
import constants from "@/lib/constaints";
import axios from "axios";

//@ts-ignore
const SendSolDialog = ({ open, onClose }) => {
    const { accounts } = useWallet();
    const { toast } = useToast();
    const [recipientAddress, setRecipientAddress] = useState("");
    const [amount, setAmount] = useState("");
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({ recipientAddress: "", amount: "" });

    const validateForm = () => {
        let isValid = true;
        const errors = { recipientAddress: "", amount: "" };

        // Validate recipient address
        try {
            const recipientPublicKey = new PublicKey(recipientAddress);
            if (!PublicKey.isOnCurve(recipientPublicKey.toBuffer())) {
                errors.recipientAddress = "Invalid Solana address.";
                isValid = false;
            }
        } catch (error) {
            errors.recipientAddress = "Invalid Solana address format.";
            isValid = false;
        }

        // Validate amount
        //@ts-ignore
        if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
            errors.amount = "Amount must be greater than 0.";
            isValid = false;
        } else if (parseFloat(amount) > 100) {
            errors.amount = "Amount is too large. Please send less than 100 SOL.";
            isValid = false;
        }

        setErrors(errors);
        return isValid;
    };

    const handleSendSol = async () => {
        if (!validateForm()) return;

        try {
            setLoading(true);
            const connection = new Connection(constants.NEXT_ALCHEMY_URI || "");

            const recipientPublicKey = new PublicKey(recipientAddress);

            // Construct the transaction
            const transaction = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey: new PublicKey(accounts[0].publicKey),
                    toPubkey: recipientPublicKey,
                    lamports: parseFloat(amount) * LAMPORTS_PER_SOL,
                })
            );

            // Send and confirm the transaction
            //@ts-ignore
            const { signature } = await window.solana.signAndSendTransaction({
                transaction,
                options: {
                    skipPreflight: false,
                    commitment: "confirmed",
                },
            });

            await connection.confirmTransaction({
                signature,
                blockhash: (await connection.getLatestBlockhash()).blockhash,
                lastValidBlockHeight: (await connection.getLatestBlockhash()).lastValidBlockHeight,
            });

            toast({ description: "Transaction successful!" });
            onClose();
        } catch (error) {
            console.error("Transaction failed:", error);
            //@ts-ignore
            toast({ description: `Error: ${error.message}` });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="bg-gray-800 text-white">
                <DialogHeader>
                    <DialogTitle>Send SOL</DialogTitle>
                    <DialogDescription>Enter recipient details and amount to send SOL.</DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-4 mt-4">
                    <Input
                        placeholder="Recipient Address"
                        value={recipientAddress}
                        onChange={(e) => setRecipientAddress(e.target.value)}
                        className="bg-gray-700 text-white"
                        //@ts-ignore
                        error={errors.recipientAddress}
                    />
                    {errors.recipientAddress && (
                        <p className="text-red-500 text-sm">{errors.recipientAddress}</p>
                    )}

                    <Input
                        placeholder="Amount (SOL)"
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="bg-gray-700 text-white"
                        //@ts-ignore
                        error={errors.amount}
                    />
                    {errors.amount && <p className="text-red-500 text-sm">{errors.amount}</p>}

                    <Button
                        onClick={handleSendSol}
                        disabled={loading}
                        className="bg-green-500 hover:bg-green-400 text-white mt-2"
                    >
                        {loading ? "Sending..." : "Send SOL"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default SendSolDialog;
