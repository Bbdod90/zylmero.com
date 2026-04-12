import { DemoRoleProvider } from "@/components/landing/demo-role-context";
import { ZylmeroLanding } from "@/components/landing/zylmero-landing";

export function LandingPage() {
  return (
    <DemoRoleProvider>
      <ZylmeroLanding />
    </DemoRoleProvider>
  );
}
