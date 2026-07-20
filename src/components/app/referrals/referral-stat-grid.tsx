export interface ReferralStat {
  label: string;
  value: string;
}

export function ReferralStatGrid({ stats }: { stats: ReferralStat[] }) {
  return (
    <div className="fj-referrals-stats">
      {stats.map((stat) => (
        <div key={stat.label} className="fj-referrals-stat">
          <span className="fj-referrals-stat__value">{stat.value}</span>
          <span className="fj-referrals-stat__label">{stat.label}</span>
        </div>
      ))}
    </div>
  );
}
