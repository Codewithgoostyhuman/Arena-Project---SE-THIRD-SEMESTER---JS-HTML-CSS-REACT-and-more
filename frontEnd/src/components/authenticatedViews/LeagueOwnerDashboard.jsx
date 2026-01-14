import React from 'react';
import { Users,Trophy} from 'lucide-react';
import StatsCard from '../reuseableComponents/StatsCard';
export default function LeagueOwnerDashboard() {
    return (
        <>
            <StatsCard
                title="My Leagues"
                value="0"
                icon={<Users className="h-8 w-8 text-indigo-600" />}
            />
            <StatsCard
                title="Active Tournaments"
                value="0"
                icon={<Trophy className="h-8 w-8 text-purple-600" />}
            />
            <StatsCard
                title="Total Players"
                value="0"
                icon={<Users className="h-8 w-8 text-green-600" />}
            />
        </>
    );
}