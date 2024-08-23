"use client";
import { createContext, useContext, useState, ReactNode } from "react";
import {generateMnemonic, mnemonicToSeed, mnemonicToSeedSync} from "bip39";
import bs58 from "bs58";
import { derivePath } from "ed25519-hd-key";
import { Keypair } from "@solana/web3.js";
import { FirstCard } from "@/components/Cards";
import nacl from "tweetnacl";
import {ethers} from "ethers";
import keyPair = nacl.signProps.keyPair;

interface Account {
    publicKey: string;
    privateKey: string;
    keyPair:keyPair
}

interface WalletContextType {
    currCard: number;
    nextCard: (card: JSX.Element) => void;
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
    currentCard: JSX.Element;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
    const [currCard, setCurrCard] = useState(0);
    const [walletType, setWalletType] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [recoveryPhrase, setRecoveryPhrase] = useState<string[]>([]);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [currentCard, setCurrentCard] = useState<JSX.Element>(<FirstCard />);

    const prevCard = () => {
        setCurrCard((prev) => prev - 1);
        // Additional logic to update `currentCard` based on `currCard` index if needed
    };
    //@ts-ignore
    const generateAccount = (mnemonic: string, index: number,pathType:string): Account|null => {

        try {
            const seedBuffer = mnemonicToSeedSync(mnemonic);
            // const path = `m/44'/${pathType}'/0'/${index}'`;
            const path = `m/44'/${pathType}'/${index}'/0'`;
            // m/44'/501'/${currentIndex}'/0'

            const { key: derivedSeed } = derivePath(path, seedBuffer.toString("hex"));

            let publicKeyEncoded: string;
            let privateKeyEncoded: string;
            let keypair = null;
            if (pathType === "501") {
                // Solana
                const { secretKey } = nacl.sign.keyPair.fromSeed(derivedSeed);
                keypair = Keypair.fromSecretKey(secretKey);

                privateKeyEncoded = bs58.encode(secretKey);
                publicKeyEncoded = keypair.publicKey.toBase58();
            } else if (pathType === "60") {
                // Ethereum
                const privateKey = Buffer.from(derivedSeed).toString("hex");
                privateKeyEncoded = privateKey;

                const wallet = new ethers.Wallet(privateKey);
                publicKeyEncoded = wallet.address;
            } else {
                return null;
            }
            if(keypair)
            return {
                publicKey: publicKeyEncoded,
                privateKey: privateKeyEncoded,
                //@ts-ignore
                keyPair:keypair
            };
        } catch (error) {

            return null;
        }





        // const seed = mnemonicToSeedSync(mnemonic);
        // const derivedSeed = derivePath(`m/44'/501'/${index}'/0'`, seed.toString("hex")).key;
        // const { secretKey } = nacl.sign.keyPair.fromSeed(derivedSeed);
        // const keypair = Keypair.fromSecretKey(secretKey);
        // let privateKeyEncoded = bs58.encode(secretKey);
        // let publicKeyEncoded = keypair.publicKey.toBase58();
        // return { publicKey:publicKeyEncoded, privateKey:privateKeyEncoded };

    };

    const createWallet = () => {
        const mnemonic = generateMnemonic();
        setRecoveryPhrase(mnemonic.split(" "));
        const newAccount = generateAccount(mnemonic, 0,"501");
        if(newAccount)
        setAccounts([newAccount]);
    };

    const restoreWallet = (mnemonic: string) => {
        setRecoveryPhrase(mnemonic.split(" "));
        const restoredAccount = generateAccount(mnemonic, 0,"501");
        if(restoredAccount)
        setAccounts([restoredAccount]);
    };

    const addAccount = () => {
        const newAccount = generateAccount(recoveryPhrase.join(" "), accounts.length,"501");
        if(newAccount)
        setAccounts([...accounts, newAccount]);
    };

    const nextCard = (card: JSX.Element) => {
        setCurrentCard(card);
        setCurrCard((prev) => prev + 1);
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
                currentCard,
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
