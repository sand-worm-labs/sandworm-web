import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const chains = ["Sui", "Ethereum", "Polygon", "Arbitrum"];
const themes = ["Twilight", "VS Code", "Dracula", "Monokai", "Solarized Dark"];

export const SettingsTab: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
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
    onClose(); // optional: toast or persist to localStorage
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>⚙️ Sandworm Settings</DialogTitle>
          <DialogDescription>
            Customize your dev experience and vibe ✨
          </DialogDescription>
        </DialogHeader>

        {/* Chain Selector */}
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

        {/* Default Chain Preference */}
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

        {/* Footer */}
        <DialogFooter className="pt-4">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
