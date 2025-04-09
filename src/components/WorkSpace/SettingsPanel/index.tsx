import * as React from "react";
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
import { Button } from "@/components/ui/button";
import { Card, CardTitle, CardContent, CardHeader } from "@/components/ui/card";
import { Settings } from "lucide-react";

const chains = ["Sui", "Ethereum", "Polygon", "Arbitrum"];
const themes = ["Twilight", "VS Code", "Dracula", "Monokai", "Solarized Dark"];

export const SettingsPanel: React.FC = () => {
  const [selectedChain, setSelectedChain] = React.useState<string>("Sui");
  const [rpcUrl, setRpcUrl] = React.useState<string>("");
  const [editorTheme, setEditorTheme] = React.useState<string>("Twilight");
  const [shortcutsEnabled, setShortcutsEnabled] = React.useState<boolean>(true);
  const [betaFeatures, setBetaFeatures] = React.useState<boolean>(false);
  const [defaultChain, setDefaultChain] = React.useState<string>("Sui");

  const handleSave = () => {
    const settings = {
      selectedChain,
      rpcUrl,
      editorTheme,
      shortcutsEnabled,
      betaFeatures,
      defaultChain,
    };
    console.log("Saved settings:", settings);
  };

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

      <CardContent className=" p-0 h-[calc(100%-60px)] overflow-y-auto px-4 ">
        <p className="my-3 text-sm font-medium">Customise your setup</p>
        <div className="flex flex-col space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="chain">Chain</Label>
            <Select value={selectedChain} onValueChange={setSelectedChain}>
              <SelectTrigger id="chain">
                <SelectValue placeholder="Select chain" />
              </SelectTrigger>
              <SelectContent>
                {chains.map(chain => (
                  <SelectItem key={chain} value={chain}>
                    {chain}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* RPC Input */}
          <div className="grid gap-2">
            <Label htmlFor="rpc">RPC URL</Label>
            <Input
              id="rpc"
              placeholder="https://rpc.sui.io"
              value={rpcUrl}
              onChange={e => setRpcUrl(e.target.value)}
            />
          </div>

          {/* Editor Theme */}
          <div className="grid gap-2">
            <Label htmlFor="theme">Editor Theme</Label>
            <Select value={editorTheme} onValueChange={setEditorTheme}>
              <SelectTrigger id="theme">
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                {themes.map(theme => (
                  <SelectItem key={theme} value={theme}>
                    {theme}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Shortcuts Toggle */}
          <div className="flex items-center justify-between">
            <Label htmlFor="shortcuts">Shortcuts Panel</Label>
            <Switch
              id="shortcuts"
              checked={shortcutsEnabled}
              onCheckedChange={setShortcutsEnabled}
            />
          </div>

          {/* Default Chain */}
          <div className="grid gap-2">
            <Label htmlFor="default-chain">Default Chain (Explorer)</Label>
            <Select value={defaultChain} onValueChange={setDefaultChain}>
              <SelectTrigger id="default-chain">
                <SelectValue placeholder="Default Chain" />
              </SelectTrigger>
              <SelectContent>
                {chains.map(chain => (
                  <SelectItem key={chain} value={chain}>
                    {chain}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Beta Feature Toggle */}
          <div className="flex items-center justify-between">
            <Label htmlFor="beta">Enable Experimental Features</Label>
            <Switch
              id="beta"
              checked={betaFeatures}
              onCheckedChange={setBetaFeatures}
            />
          </div>

          <div className="pt-4 flex justify-end">
            <Button onClick={handleSave} variant="default">
              Save
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
