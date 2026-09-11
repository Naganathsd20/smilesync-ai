import ActivityOverview from "@/components/dashboard/ActivityOverview";
import MainActions from "@/components/dashboard/MainActions";
import WelcomeSection from "@/components/dashboard/WelcomeSection";
import SmartRemindersCard from "@/components/reminders/SmartRemindersCard";
import Navbar from "@/components/Navbar";

export const dynamic = "force-dynamic";

function DashboardPage() {
  return (
    <>
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-8 pt-24 space-y-8">
        <WelcomeSection />
        <MainActions />
        <SmartRemindersCard />
        <ActivityOverview />
      </div>
    </>
  );
}
export default DashboardPage;
