"use client";

import { motion } from "framer-motion";
import { CodeSquareIcon } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ExampleQuery {
  title: string;
  description: string;
  query: string;
}

interface ExamplesModalProps {
  isOpen: boolean;
  onClose: () => void;
  createTab: (title: string, id?: string, type: string, query?: string) => void;
}

const exampleQueries: ExampleQuery[] = [
  {
    title: "Account Data on Sui Mainnet",
    description: "Fetch all details from specific accounts on Sui mainnet",
    query: `SELECT * FROM account 0xac5bceec1b789ff840d7d4e6ce4ce61c90d190a7f8c4f4ddf0bff6ee2413c33c, test.sui ON sui_mainnet`,
  },
  {
    title: "User Balance & Transactions on Sui",
    description:
      "Get user’s balance and recent transactions on the Sui network.",
    query: `SELECT sui_balance FROM account 0xac5bceec1b789ff840d7d4e6ce4ce61c90d190a7f8c4f4ddf0bff6ee2413c33c ON sui_mainnet`,
  },
  {
    title: "Vitalik.eth Balance Across EVM Chains",
    description:
      "Fetch balance for vitalik.eth across Ethereum Mainnet and Base",
    query: `SELECT  balance, chain FROM account vitalik.eth ON eth, base
`,
  },
  {
    title: "Get Logs on EVM Chains",
    description:
      "Fetch balance for vitalik.eth across Ethereum Mainnet and Base",
    query: `SELECT * FROM log WHERE block 4638657:4638758, address 0xdAC17F958D2ee523a2206206994597C13D831ec7, topic0 0xcb8241adb0c3fdb35b70c24ce35c5eb0c17af7431c99f827d44a445ca624176a ON eth
SELECT * FROM log WHERE event_signature Confirmation(address,uint256), block 4638757 ON eth
`,
  },
  {
    title: "Select block on Base",
    description:
      "View transaction details like sender, receiver, value, gas price, and status for specific tx hashes on the Base network.",
    query: `SELECT * FROM block 1000:1050 ON base`,
  },
  {
    title: "Track USDT Transfers on EVM",
    description:
      "Get log events for USDT on Ethereum Mainnet across specific blocks. Includes a `Confirmation(address,uint256)` event sample.",
    query: `SELECT * FROM log WHERE block 4638657:4638758, address 0xdAC17F958D2ee523a2206206994597C13D831ec7, topic0 0xcb8241adb0c3fdb35b70c24ce35c5eb0c17af7431c99f827d44a445ca624176a ON eth
  SELECT * FROM log WHERE event_signature Confirmation(address,uint256), block 4638757 ON eth`,
  },
];

export const ExamplesModal: React.FC<ExamplesModalProps> = ({
  createTab,
  isOpen,
  onClose,
}) => {
  const handleSelect = (query: string, title: string) => {
    createTab(title, undefined, "sql", query);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl dark">
        <DialogHeader>
          <DialogTitle>Explore Example Queries</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          {exampleQueries.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card
                onClick={() => handleSelect(item.query, item.title)}
                className="cursor-pointer hover:bg-accent transition-all rounded-none"
              >
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <CodeSquareIcon className="w-4 h-4 text-muted-foreground" />
                    {item.title}
                  </CardTitle>
                  <CardDescription className="text-xs font-mono text-muted-foreground truncate">
                    {item.description}
                  </CardDescription>
                </CardHeader>
                <CardFooter className="text-xs text-muted-foreground">
                  Click to use
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
