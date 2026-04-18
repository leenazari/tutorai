
import Tutor from "@/components/Tutor";
import { getDefaultScenario } from "@/lib/scenarios";

export default function Home() {
  const scenario = getDefaultScenario();
  return <Tutor scenario={scenario} />;
}
