"use client";
import {
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWallet } from "@/context/WalletContext";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {WalletDetailsCard} from "@/components/WalletDetailsCard";

export const FirstCard = () => {
  const { nextCard, createWallet } = useWallet();

  const handleCreateWallet = () => {
    createWallet();
    nextCard(<DisplayRecoveryPhraseCard/>);
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
        <Button
            className="bg-gray-600 text-white w-full font-semibold hover:bg-gray-500"
            onClick={()=>{
              nextCard(<RestoreWalletCard/>)
            }}
        >
            Restore Wallet
        </Button>
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
          Please save your recovery phrase in a safe place. You will need it to
          restore your wallet if you lose access.
        </CardDescription>
      </CardHeader>
      <CardFooter className="mt-14 flex flex-col gap-4">
        <div className="bg-black p-4 rounded-md text-center">
          <p className="text-white text-lg">{recoveryPhrase.join(" ")}</p>
        </div>
        <Button
          className="bg-gray-700 text-white w-full font-semibold hover:bg-gray-600 mt-4"
          onClick={()=>{
            nextCard(<ConfirmRecoveryPhraseCard />)
          }}
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
      nextCard(<WalletDetailsCard />);
    } else {
      alert(
        "The recovery phrase you entered does not match. Please try again."
      );
    }
  };

  return (
    <>
      <CardHeader>
        <CardTitle className="text-white text-2xl">
          Confirm Recovery Phrase
        </CardTitle>
        <CardDescription className="text-gray-400 mt-2">
          Please re-enter your recovery phrase to confirm that you have saved it
          correctly.
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

export const RestoreWalletCard = () => {
  const { nextCard, restoreWallet } = useWallet();
  const [mnemonic, setMnemonic] = useState("");

  const handleRestoreWallet = () => {
    restoreWallet(mnemonic);
    nextCard(<WalletDetailsCard />);
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
