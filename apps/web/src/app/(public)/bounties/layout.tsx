import type { ChildrenProps } from "@/types";
import { Web3Provider } from "@/web3/Web3Provider";

export default function PublicBountiesLayout({ children }: ChildrenProps) {
  return <Web3Provider>{children}</Web3Provider>;
}
