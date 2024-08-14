"use client"
import { createContext, useContext, useState, ReactNode } from "react";
import { generateMnemonic, mnemonicToSeedSync } from "bip39";
import { derivePath } from "ed25519-hd-key";
import {Keypair} from "@solana/web3.js";

interface Account {
    publicKey: string;
    privateKey: string;
}

interface WalletContextType {
    currCard: number;
    nextCard: () => void;
    prevCard: () => void;
    walletType: string;
    setWalletType: (type: string) => void;
    password: string;
    setPassword: (password: string) => void;
    confirmPassword: string;
    setConfirmPassword: (password: string) => void;
    recoveryPhrase: string[];
    accounts: Account[];
    addAccount: () => void;
    restoreWallet: (mnemonic: string) => void;
    createWallet: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
    const [currCard, setCurrCard] = useState(0);
    const [walletType, setWalletType] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [recoveryPhrase, setRecoveryPhrase] = useState<string[]>([]);
    const [accounts, setAccounts] = useState<Account[]>([]);

    const nextCard = () => setCurrCard((prev) => prev + 1);
    const prevCard = () => setCurrCard((prev) => prev - 1);


    const generateAccount = (mnemonic: string, index: number): Account => {
        const seed = mnemonicToSeedSync(mnemonic); // Generate seed from mnemonic
        const derivedSeed = derivePath(`m/44'/501'/${index}'/0'`, seed.toString("hex")).key;
        const keypair = Keypair.fromSeed(derivedSeed.slice(0, 32));

        const publicKey = keypair.publicKey.toBase58();
        const privateKey = Buffer.from(keypair.secretKey).toString("hex");

        return { publicKey, privateKey };
    };

    const createWallet = () => {
        const mnemonic = generateMnemonic();
        setRecoveryPhrase(mnemonic.split(" "));
        const newAccount = generateAccount(mnemonic, 0);
        setAccounts([newAccount]);
    };

    const restoreWallet = (mnemonic: string) => {
        setRecoveryPhrase(mnemonic.split(" "));
        const restoredAccount = generateAccount(mnemonic, 0);
        setAccounts([restoredAccount]);
    };

    const addAccount = () => {
        const newAccount = generateAccount(recoveryPhrase.join(" "), accounts.length);
        setAccounts([...accounts, newAccount]);
    };

    return (
        <WalletContext.Provider
            value={{
                currCard,
                nextCard,
                prevCard,
                walletType,
                setWalletType,
                password,
                setPassword,
                confirmPassword,
                setConfirmPassword,
                recoveryPhrase,
                accounts,
                addAccount,
                restoreWallet,
                createWallet,
            }}
        >
            {children}
        </WalletContext.Provider>
    );
};

export const useWallet = () => {
    const context = useContext(WalletContext);
    if (context === undefined) {
        throw new Error("useWallet must be used within a WalletProvider");
    }
    return context;
};
