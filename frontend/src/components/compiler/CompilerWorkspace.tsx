import LeftPanel from "./LeftPanel";
import RightPanel from "./RightPanel";

const CompilerWorkspace = () => (
  <div className="grid gap-8 lg:grid-cols-[420px,1fr]">
    <LeftPanel />
    <RightPanel />
  </div>
);

export default CompilerWorkspace;
