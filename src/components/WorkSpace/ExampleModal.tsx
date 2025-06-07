"use client";

import { motion } from "framer-motion";
import { CodeSquareIcon } from "lucide-react";
import { useRouter } from "@bprogress/next/app";

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
  executionType: "rpc" | "indexed";
}

interface ExamplesModalProps {
  isOpen: boolean;
  onClose: () => void;
  createTab: (
    title: string,
    id?: string,
    type?: string,
    query?: string,
    executionMethod?: "rpc" | "indexed"
  ) => void;
}

const exampleQueries: ExampleQuery[] = [
  {
    title: "Account Data on Sui Mainnet",
    description: "Fetch all details from specific accounts on Sui mainnet",
    query: `SELECT * FROM account 0xac5bceec1b789ff840d7d4e6ce4ce61c90d190a7f8c4f4ddf0bff6ee2413c33c, test.sui ON sui_mainnet`,
    executionType: "rpc",
  },
  {
    title: "User Balance & Transactions on Sui",
    description:
      "Get user’s balance and recent transactions on the Sui network.",
    query: `SELECT sui_balance FROM account 0xac5bceec1b789ff840d7d4e6ce4ce61c90d190a7f8c4f4ddf0bff6ee2413c33c ON sui_mainnet`,
    executionType: "rpc",
  },
  {
    title: "Vitalik.eth Balance Across EVM Chains",
    description:
      "Fetch balance for vitalik.eth across Ethereum Mainnet and Base",
    query: `SELECT  balance, chain FROM account vitalik.eth ON eth, base
`,
    executionType: "rpc",
  },

  {
    title: "Get Logs on EVM Chains",
    description:
      "Fetch balance for vitalik.eth across Ethereum Mainnet and Base",
    query: `SELECT * FROM log WHERE block 4638657:4638758, address 0xdAC17F958D2ee523a2206206994597C13D831ec7, topic0 0xcb8241adb0c3fdb35b70c24ce35c5eb0c17af7431c99f827d44a445ca624176a ON eth
SELECT * FROM log WHERE event_signature Confirmation(address,uint256), block 4638757 ON eth
`,
    executionType: "rpc",
  },
  {
    title: "Select block on Base",
    description:
      "View transaction details like sender, receiver, value, gas price, and status for specific tx hashes on the Base network.",
    query: `SELECT * FROM block 1000 ON base`,
    executionType: "rpc",
  },

  {
    title: "Inspect transactions on Base",
    description:
      "View detailed info for specific transactions on the Base network, including sender, receiver, value transferred, gas price, and status. Perfect for tracing on-chain activity by hash.",
    query: `SELECT 
    from, 
    to,
    value,
    gas_price,
    status 
  FROM tx 
    0x2d6a35b0e3d8f7f14656a3d24eacbd41f1c36f7fa19a7c6f100fb631d366555f,
   0x545ad99309713630154e5709db39e2e62753d6c5d34a293486895f49413e525b
  ON base`,
    executionType: "rpc",
  },
];

export const ExamplesModal: React.FC<ExamplesModalProps> = ({
  createTab,
  isOpen,
  onClose,
}) => {
  const router = useRouter();

  const handleSelect = (
    query: string,
    title: string,
    executionMethod: "rpc" | "indexed"
  ) => {
    const tabId = createTab(title, undefined, "sql", query, executionMethod);
    router.push(`/workspace/${tabId}`, { showProgress: true });

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl dark overflow-y-auto max-h-[40rem]">
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
                onClick={() =>
                  handleSelect(item.query, item.title, item.executionType)
                }
                className="cursor-pointer hover:bg-accent transition-all rounded-none h-full flex flex-col justify-between"
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
                <CardFooter className="text-xs text-muted-foreground flex justify-between">
                  <span>Click to use</span>
                  <span className="bg-[#1a1a1a] border border-[#333] px-2 py-0.5 rounded-full">
                    {item.executionType === "rpc"
                      ? "live rpc"
                      : item.executionType}
                  </span>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
