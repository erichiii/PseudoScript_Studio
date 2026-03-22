import OutputTabs from "./OutputTabs";

type RightPanelProps = {
  output: string;
  isCompiling?: boolean;
  error?: string | null;
  success?: boolean | null;
};

const RightPanel = ({ output, isCompiling, error, success }: RightPanelProps) => (
  <OutputTabs output={output} isCompiling={isCompiling} error={error} success={success} />
);

export default RightPanel;
