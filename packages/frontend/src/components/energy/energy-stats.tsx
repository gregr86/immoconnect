import { Sun, Gauge, Zap } from "lucide-react";
import type { EnergyStats as EnergyStatsType } from "@/types";

interface EnergyStatsProps {
  stats: EnergyStatsType;
}

export function EnergyStats({ stats }: EnergyStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Biens eligibles */}
      <div className="bg-secondary rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center">
            <Sun className="h-5 w-5 text-amber-600" />
          </div>
          <p className="text-sm font-body text-muted-foreground">
            Biens eligibles
          </p>
        </div>
        <p className="text-2xl font-heading font-bold text-foreground">
          {stats.totalEligible}
        </p>
      </div>

      {/* Score moyen */}
      <div className="bg-secondary rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Gauge className="h-5 w-5 text-primary" />
          </div>
          <p className="text-sm font-body text-muted-foreground">Score moyen</p>
        </div>
        <p className="text-2xl font-heading font-bold text-foreground">
          {stats.avgScore}%
        </p>
      </div>

      {/* Potentiel Excellent */}
      <div className="bg-secondary rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-10 w-10 rounded-xl bg-success/10 flex items-center justify-center">
            <Zap className="h-5 w-5 text-success" />
          </div>
          <p className="text-sm font-body text-muted-foreground">
            Potentiel Excellent
          </p>
        </div>
        <p className="text-2xl font-heading font-bold text-foreground">
          {stats.excellentCount}
        </p>
      </div>
    </div>
  );
}
