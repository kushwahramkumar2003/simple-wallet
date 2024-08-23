"use client"
import { Card, CardContent } from "@/components/ui/card";
import { useWallet } from "@/context/WalletContext";
import { AnimatePresence, motion } from "framer-motion";
import { cardsArr } from "@/components/Cards";

export default function Home() {
    const { currCard,currentCard } = useWallet();

    return (
        <div className="bg-gray-600 flex justify-center items-center h-screen ">
            <Card className="bg-gray-900 border-0 w-full max-w-md p-1 bg-gradient-to-br   from-gray-800 via-gray-900 to-black shadow-lg">
                <CardContent className="flex flex-col gap-6">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currCard}
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            transition={{ duration: 0.3 }}
                        >
                            {/*{cardsArr[currCard].element}*/}
                            {currentCard}
                        </motion.div>
                    </AnimatePresence>
                </CardContent>
            </Card>
        </div>
    );
}
