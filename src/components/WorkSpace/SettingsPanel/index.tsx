import * as React from "react";
import { Settings } from "lucide-react";
import { toast } from "sonner";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardTitle, CardContent, CardHeader } from "@/components/ui/card";
import { useSandwormStore } from "@/store";

const chains = ["Sui", "Ethereum", "Polygon", "Arbitrum"];
const themes = ["sandworm", "vs-dark", "vs-light", "monokai"];

export const SettingsPanel: React.FC = () => {
  const {
    settings: {
      selectedChain,
      rpcUrl,
      editorTheme,
      shortcutsEnabled,
      betaFeatures,
      defaultChain,
    },
    setSelectedChain,
    setRpcUrl,
    setEditorTheme,
    setShortcutsEnabled,
    setBetaFeatures,
    setDefaultChain,
  } = useSandwormStore();

  return (
    <Card className="h-full overflow-hidden border-none dark">
      <CardHeader className="p-4 border-b ">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 py-2">
            <Settings className="h-5 w-5" />
            <CardTitle className=" font-medium">Settings </CardTitle>
          </div>
        </div>
      </CardHeader>

      <CardContent className=" py-4 h-[calc(100%-60px)] overflow-y-auto px-4 ">
        <div className="flex flex-col space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="chain" className="text-sm text-gray-500">
              Chain
            </Label>
            <Select
              value={selectedChain}
              onValueChange={value => {
                setSelectedChain(value);
                toast.success(`Chain set to ${value}`);
              }}
            >
              <SelectTrigger id="chain">
                <SelectValue placeholder="Select chain" />
              </SelectTrigger>
              <SelectContent className="dark">
                {chains.map(chain => (
                  <SelectItem key={chain} value={chain}>
                    {chain}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="rpc" className="text-sm text-gray-500">
              RPC URL
            </Label>
            <Input
              id="rpc"
              placeholder="https://rpc.sui.io"
              value={rpcUrl}
              onChange={e => setRpcUrl(e.target.value)}
              onBlur={() => {
                if (rpcUrl.trim()) {
                  toast.success("Updated RPC URL");
                }
              }}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="theme" className="text-sm text-gray-500">
              Editor Theme
            </Label>
            <Select
              value={editorTheme}
              onValueChange={value => {
                setEditorTheme(value);
                toast.success(`Theme changed to ${value}`);
              }}
            >
              <SelectTrigger id="theme">
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent className="dark">
                {themes.map(theme => (
                  <SelectItem key={theme} value={theme}>
                    {theme}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="default-chain" className="text-sm text-gray-500">
              Default Chain (Explorer)
            </Label>
            <Select
              value={defaultChain}
              onValueChange={value => {
                setDefaultChain(value);
                toast.success(`${value} is now your default chain`);
              }}
            >
              <SelectTrigger id="default-chain">
                <SelectValue placeholder="Default Chain" />
              </SelectTrigger>
              <SelectContent className="dark">
                {chains.map(chain => (
                  <SelectItem key={chain} value={chain}>
                    {chain}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between pt-3">
            <Label htmlFor="shortcuts" className="text-sm text-gray-500">
              Shortcuts Panel
            </Label>
            <Switch
              id="shortcuts"
              checked={shortcutsEnabled}
              onCheckedChange={checked => {
                setShortcutsEnabled(checked);
                toast.success(
                  checked
                    ? "Shortcuts panel enabled"
                    : "Shortcuts panel disabled"
                );
              }}
            />
          </div>

          {/* Beta Feature Toggle */}
          <div className="flex items-center justify-between py-3">
            <Label htmlFor="beta" className="text-sm text-gray-500">
              Enable Experimental Features
            </Label>
            <Switch
              id="beta"
              checked={betaFeatures}
              onCheckedChange={checked => {
                setBetaFeatures(checked);
                toast.success(
                  checked
                    ? "Experimental features enabled. You now have access to upcoming tools still under development."
                    : "Beta features disabled"
                );
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
