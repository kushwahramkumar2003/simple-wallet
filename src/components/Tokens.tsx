import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

export interface TokenProps {
    mint: string;
    amount: number;
    decimals: number;
}

export default function  Tokens ({ mint, amount, decimals }: TokenProps) {
    const tokenName = "Sample Token"; // Replace with actual token name if available
    const tokenImage = "/path-to-your-sample-image.png"; // Replace with the actual image URL
    const formattedAmount = (amount / Math.pow(10, decimals)).toFixed(2);

    return (
        <TooltipProvider>
            <motion.div
                className="flex items-center bg-gray-800 p-4 rounded-lg shadow-lg gap-4 w-full"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <img
                    src={"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSg600Xa4ws6jp54kMDNGYF232lIhY51QJqEA&s"}
                    alt={tokenName}
                    className="w-12 h-12 rounded-full"
                />
                <div className="flex flex-col flex-1">
                    <span className="text-lg text-white font-semibold">{tokenName}</span>
                    <span className="text-sm text-gray-400">Mint: {mint.substring(0,6)+"..."}</span>
                </div>
                <Tooltip>
                    <TooltipTrigger>
            <span className="text-xl text-white font-semibold">
              {formattedAmount}
            </span>
                    </TooltipTrigger>
                    <TooltipContent>
                        <span>{formattedAmount} {tokenName}</span>
                    </TooltipContent>
                </Tooltip>
            </motion.div>
        </TooltipProvider>
    );
};
