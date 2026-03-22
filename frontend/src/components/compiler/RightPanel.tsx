import { useState } from "react";
import OutputTabs from "./OutputTabs";

type TabId = "lexer" | "parser" | "semantic" | "symbol" | "errors";

type RightPanelProps = {
  defaultTab?: TabId;
};

const RightPanel = ({ defaultTab = "lexer" }: RightPanelProps) => {
  const [activeTab, setActiveTab] = useState<TabId>(defaultTab);

  return <OutputTabs activeTab={activeTab} onTabChange={setActiveTab} />;
};

export default RightPanel;
