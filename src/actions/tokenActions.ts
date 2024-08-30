"use server"
import {Connection, PublicKey} from "@solana/web3.js";
import { TOKEN_PROGRAM_ID} from "@solana/spl-token";

export async function getUserTokens(publicKey: string) {
    const connection = new Connection('https://api.devnet.solana.com');
    const userPublicKey = new PublicKey(publicKey);

    // Fetch token accounts
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(userPublicKey, {
        programId: TOKEN_PROGRAM_ID,
    });



    console.log("tokenAccounts",tokenAccounts);

    const tokens = tokenAccounts.value.map((account) => {
        const info = account.account.data.parsed.info;
        // console.log("info", account.account.);
        return {
            mint: info.mint,
            amount: info.tokenAmount.amount,
            decimals: info.tokenAmount.decimals,
        };
    });
    console.log("tokens", tokens);
    return tokens;
}