import Tutor from "@/components/Tutor";
import { getAllScenarios } from "@/lib/scenarios";

export default function Home() {
  const scenarios = getAllScenarios();
  return <Tutor scenarios={scenarios} />;
}
