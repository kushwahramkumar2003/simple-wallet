"use client"
import { CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWallet } from "@/context/WalletContext";
import { useState } from "react";
import {Dialog, DialogContent, DialogTitle, DialogTrigger} from "@/components/ui/dialog";

export const FirstCard = () => {
    const { nextCard, createWallet } = useWallet();

    const handleCreateWallet = () => {
        createWallet();
        nextCard();
    };

    return (
        <>
            <CardHeader>
                <CardTitle className="text-white text-2xl">Create Wallet</CardTitle>
                <CardDescription className="text-gray-400 mt-2">
                    To get started, create a new wallet or import an existing one.
                </CardDescription>
            </CardHeader>
            <CardFooter className="mt-14 flex flex-col gap-4">
                <Button
                    className="bg-gray-700 text-white w-full font-semibold hover:bg-gray-600"
                    onClick={handleCreateWallet}
                >
                    Create New Wallet
                </Button>
                {/*<Button*/}
                {/*    className="bg-gray-600 text-white w-full font-semibold hover:bg-gray-500"*/}
                {/*    onClick={nextCard}*/}
                {/*>*/}
                {/*    Restore Wallet*/}
                {/*</Button>*/}
            </CardFooter>
        </>
    );
};

export const DisplayRecoveryPhraseCard = () => {
    const { nextCard, recoveryPhrase } = useWallet();

    return (
        <>
            <CardHeader>
                <CardTitle className="text-white text-2xl">Recovery Phrase</CardTitle>
                <CardDescription className="text-gray-400 mt-2">
                    Please save your recovery phrase in a safe place. You will need it to restore your wallet if you lose access.
                </CardDescription>
            </CardHeader>
            <CardFooter className="mt-14 flex flex-col gap-4">
                <div className="bg-black p-4 rounded-md text-center">
                    <p className="text-white text-lg">{recoveryPhrase.join(" ")}</p>
                </div>
                <Button
                    className="bg-gray-700 text-white w-full font-semibold hover:bg-gray-600 mt-4"
                    onClick={nextCard}
                >
                    I&apos;ve Saved It
                </Button>
            </CardFooter>
        </>
    );
};

export const ConfirmRecoveryPhraseCard = () => {
    const { nextCard, prevCard, recoveryPhrase } = useWallet();
    const [enteredPhrase, setEnteredPhrase] = useState("");

    const handleConfirm = () => {
        if (enteredPhrase.split(" ").join(" ") === recoveryPhrase.join(" ")) {
            nextCard();
        } else {
            alert("The recovery phrase you entered does not match. Please try again.");
        }
    };

    return (
        <>
            <CardHeader>
                <CardTitle className="text-white text-2xl">Confirm Recovery Phrase</CardTitle>
                <CardDescription className="text-gray-400 mt-2">
                    Please re-enter your recovery phrase to confirm that you have saved it correctly.
                </CardDescription>
            </CardHeader>
            <CardFooter className="mt-14 flex flex-col gap-4">
                <Input
                    type="text"
                    placeholder="Enter your recovery phrase"
                    value={enteredPhrase}
                    onChange={(e) => setEnteredPhrase(e.target.value)}
                    className="w-full bg-black border-0 text-white"
                />
                <Button
                    className="bg-gray-600 text-white w-full font-semibold hover:bg-gray-400"
                    onClick={handleConfirm}
                >
                    Confirm
                </Button>
                <Button
                    className="bg-gray-700 text-white w-full font-semibold hover:bg-gray-600 mt-2"
                    onClick={prevCard}
                >
                    Back
                </Button>
            </CardFooter>
        </>
    );
};

export const WalletDetailsCard = () => {
    const { accounts, addAccount, nextCard } = useWallet();

    return (
        <>
            <CardHeader>
                <CardTitle className="text-white text-2xl">Wallet Details</CardTitle>
                <CardDescription className="text-gray-400 mt-2">
                    Here are your wallet details. You can add more accounts if needed.
                </CardDescription>
            </CardHeader>
            <CardFooter className="flex flex-col gap-4 w-full justify-start items-start text-center mt-8">
                {accounts.map((account, index) => (
                    <div key={index} className="w-full flex flex-row justify-between items-center">
                        <h3 className="text-white text-xl">Account {index + 1}</h3>
                        <Dialog>

                            <DialogTrigger asChild>
                                <Button variant="outline">Show keys</Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px] flex flex-wrap text-black overflow-auto">
                                <DialogTitle>
                                    Public and Private key
                                </DialogTitle>
                                <p className="break-words w-full mb-2">Public Key: <span
                                    className="text-ellipsis overflow-hidden">{account.publicKey}</span></p>
                                <p className="break-words w-full">Private Key: <span
                                    className="text-ellipsis overflow-hidden">{account.privateKey}</span></p>
                            </DialogContent>
                        </Dialog>
                    </div>

                ))}
                <Button
                    className="bg-gray-600 hover:bg-gray-500 w-full mt-4"
                    onClick={addAccount}
                >
                    Add New Account
                </Button>
                {/*<Button*/}
                {/*    className="bg-purple-500 text-white w-full font-semibold hover:bg-purple-400 mt-4"*/}
                {/*    onClick={nextCard}*/}
                {/*>*/}
                {/*    Continue*/}
                {/*</Button>*/}
            </CardFooter>
        </>
    );
};

export const RestoreWalletCard = () => {
    const {nextCard, restoreWallet} = useWallet();
    const [mnemonic, setMnemonic] = useState("");

    const handleRestoreWallet = () => {
        restoreWallet(mnemonic);
        nextCard();
    };

    return (
        <>
            <CardHeader>
                <CardTitle className="text-white text-2xl">Restore Wallet</CardTitle>
                <CardDescription className="text-gray-400 mt-2">
                    Enter your secret recovery phrase to restore your wallet.
                </CardDescription>
            </CardHeader>
            <CardFooter className="mt-14 flex flex-col gap-4">
                <Input
                    type="text"
                    placeholder="Enter your recovery phrase"
                    value={mnemonic}
                    onChange={(e) => setMnemonic(e.target.value)}
                    className="w-full bg-black border-0 text-white"
                />
                <Button
                    className="bg-gray-600 hover:bg-gray-500 w-full"
                    onClick={handleRestoreWallet}
                >
                    Restore Wallet
                </Button>
            </CardFooter>
        </>
    );
};

export const cardsArr = [
    { element: <FirstCard /> },
    { element: <DisplayRecoveryPhraseCard /> },
    { element: <ConfirmRecoveryPhraseCard /> },
    { element: <WalletDetailsCard /> },
    { element: <RestoreWalletCard /> },
];
