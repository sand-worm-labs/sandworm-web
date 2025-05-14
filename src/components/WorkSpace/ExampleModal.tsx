"use client";

import { motion } from "framer-motion";
import { CodeSquareIcon } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
    title: "SUI Account Balance",
    description: "Get balance of an account on SUI",
    query: `GET balance FROM account cx.eth ON sui`,
  },
  {
    title: "Recent Transactions",
    description: "Fetch recent transactions for a wallet",
    query: `GET transactions FROM wallet 0xabc123 ON eth LIMIT 10`,
  },
  {
    title: "NFT Ownership",
    description: "Show NFTs owned by an address",
    query: `GET nfts FROM owner 0xabc123 ON polygon`,
  },
];

export const ExamplesModal: React.FC<ExamplesModalProps> = ({
  createTab,
  isOpen,
  onClose,
}) => {
  const handleSelect = (query: string) => {
    createTab("Example Query", undefined, "sql", query);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogTrigger asChild>
        <Button variant="outline">Browse Examples</Button>
      </DialogTrigger>
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
                onClick={() => handleSelect(item.query)}
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
