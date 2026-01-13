import StatsCard from "../reuseableComponents/StatsCard";
import { Gamepad2,Clock,Shield } from "lucide-react";
export default function OperatorDashboard() {
    return (
        <>
            <StatsCard
                title="Pending Users"
                value="0"
                icon={<Clock className="h-8 w-8 text-yellow-600" />}
            />
            <StatsCard
                title="Total Games"
                value="0"
                icon={<Gamepad2 className="h-8 w-8 text-blue-600" />}
            />
            <StatsCard
                title="Active Leagues"
                value="0"
                icon={<Shield className="h-8 w-8 text-indigo-600" />}
            />
        </>
    );
}