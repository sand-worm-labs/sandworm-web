import { useState, useEffect } from "react";
import {
  Github,
  Terminal,
  BookOpen,
  Database,
  ExternalLink,
  TestTubeDiagonal,
} from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useSandwormStore } from "@/store";

const quickStartActions = [
  {
    title: "WQL Query",
    icon: <Terminal className="w-5 h-5" />,
    description: "Write and execute queries to get onchain data on Sandworm",
    action: "sql",
  },
  {
    title: "Start with a Template",
    icon: <TestTubeDiagonal className="w-5 h-5" />,
    description: "Use a pre-built query template to get started quickly",
    action: "examples",
  },
];

const resourceCards = [
  {
    title: "Star us on GitHub!",
    description: "Support our project by starring it on GitHub.",
    link: "https://github.com/sand-worm-sql",
    Icon: Github,
    action: "Star on GitHub",
  },
  {
    title: "Sandworm Docs",
    description: "Explore Sandworm documentation and learn more.",
    Icon: BookOpen,
    link: "#",
    action: "Read Docs",
  },
  {
    title: "CLI Documentation",
    Icon: ExternalLink,
    description: "Learn how to make the most of Sandworm CLI.",
    link: "#",
    action: "Learn More",
  },
];

const HomeTab = () => {
  const { createTab, queryHistory, error } = useSandwormStore();
  const [recentItems, setRecentItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const getUsersRecentItems = async () => {
    setLoading(true);
    try {
      const recentQueries = await Promise.resolve(
        queryHistory.slice(0, 6).map(h => ({
          cleaned_query: h.query,
          latest_event_time: h.timestamp,
          query_kind: "query",
        }))
      );
      setRecentItems(recentQueries);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getUsersRecentItems();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const handleNewAction = (type: string, query?: string) => {
    if (type === "sql") {
      createTab("New Query", "sql", query);
    }
    if (type === "examples") {
      createTab(
        "Sandworm Explore",
        "sql",
        `
-- Welcome to Sandworm Explore 🦆
-- You can run the following queries to get a grasp of it.
-- Fetch balance of an account on SUI
-- replace the value of the account
GET balance FROM account cx.eth  ON eth
`
      );
    }
  };

  const truncateQuery = (query: string, length: number = 50) => {
    return query.length > length ? `${query.slice(0, length)}...` : query;
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="space-y-2">
              <CardHeader>
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </CardHeader>
              <CardFooter>
                <Skeleton className="h-4 w-[150px]" />
              </CardFooter>
            </Card>
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <Card className="p-4 text-center text-muted-foreground">{error}</Card>
      );
    }

    if (recentItems.length === 0) {
      return (
        <Card className="p-4 text-center text-muted-foreground rounded-none min-h-32 flex items-center justify-center flex-col bg-transparent border-borderLight">
          No recent queries found
        </Card>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ">
        {recentItems.map((item, index) => (
          <motion.div
            key={`${item.id}-${Math.random()}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card
              className="hover:bg-accent/50 cursor-pointer transition-colors rounded-none"
              onClick={() => handleNewAction("sql", item.cleaned_query)}
            >
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center space-x-2">
                  <Database className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {item.query_kind || "Query"}
                  </span>
                </CardTitle>
                <CardDescription className="text-xs font-mono text-muted-foreground truncate">
                  {truncateQuery(item.cleaned_query)}
                </CardDescription>
              </CardHeader>
              <CardFooter className="text-xs text-muted-foreground">
                {formatDate(item.latest_event_time)}
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>
    );
  };

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto ">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <h1 className="text-3xl font-medium  tracking-tight">SANDW0RM.</h1>
        <p className="text-muted-foreground text-sm">
          The Easiest Way to Explore & Analyse Blockchain Data
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {quickStartActions.map((action, index) => (
          <motion.div
            key={action.title}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <button
              type="button"
              className="h-auto p-4 flex flex-col items-start space-y-2 hover:bg-accent hover:text-accent-foreground group w-full overflow-hidden border-borderLight border "
              onClick={() => handleNewAction(action.action)}
            >
              <div className="flex items-center space-x-2 text-white break-words">
                <div className="p-2 rounded-full bg-primary/10 group-hover:bg-primary/20 ">
                  {action.icon}
                </div>
                <p className="font-semibold text-base">{action.title}</p>
              </div>
              <p className="text-sm text-muted-foreground text-left ">
                {action.description}
              </p>
            </button>
          </motion.div>
        ))}
      </motion.div>

      <Tabs defaultValue="recent" className=" pt-3">
        <TabsList className="w-full justify-start px-0 pb-8">
          <TabsTrigger
            value="recent"
            className="flex items-start gap-2 data-[state=active]:border-primary data-[state=active]:border-b"
          >
            Recent Queries
          </TabsTrigger>
          <TabsTrigger
            value="resources"
            className="data-[state=active]:border-primary data-[state=active]:border-b"
          >
            Resources
          </TabsTrigger>
        </TabsList>

        <TabsContent value="recent" className="space-y-4">
          {renderContent()}
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {resourceCards.map((card, index) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="hover:bg-accent/50 transition-colors">
                  <CardHeader>
                    <CardTitle className="text-sm font-medium flex items-center space-x-2">
                      <div className="p-2 rounded-full bg-primary/10">
                        <card.Icon className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-muted-foreground">
                        {card.title}
                      </span>
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">
                      {card.description}
                    </CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <a
                      href={card.link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="ghost" className="w-full justify-start">
                        {card.action}
                      </Button>
                    </a>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HomeTab;
