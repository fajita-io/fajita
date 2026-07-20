"use client";

import { useMemo, useState } from "react";

import {
  CHECK_INTERVAL_OPTIONS,
  estimateMonthlyChecks,
  formatChecksCompact,
  intervalOptionLabel,
  recommendPlanForChecks,
  type VolumeTier,
} from "@/lib/billing/check-volume";
import { publicPlans, VOLUME_TIERS } from "@/lib/site/pricing";

export function PricingVolumeSection() {
  const [tierIndex, setTierIndex] = useState(0);
  const [monitors, setMonitors] = useState(8);
  const [intervalSeconds, setIntervalSeconds] = useState(300);

  const tier: VolumeTier = VOLUME_TIERS[tierIndex] ?? VOLUME_TIERS[0];
  const estimatedChecks = useMemo(
    () => estimateMonthlyChecks(monitors, intervalSeconds),
    [monitors, intervalSeconds],
  );
  const recommendedPlan = recommendPlanForChecks(estimatedChecks);

  return (
    <div className="fj-pricing-volume">
      <div className="fj-pricing-volume__controls">
        <div>
          <label className="fj-label" htmlFor="volume-tier">
            Monthly check volume
          </label>
          <input
            id="volume-tier"
            type="range"
            min={0}
            max={VOLUME_TIERS.length - 1}
            step={1}
            value={tierIndex}
            onChange={(e) => setTierIndex(Number(e.target.value))}
            className="fj-pricing-volume__range"
          />
          <p className="fj-body-sm" style={{ marginTop: "var(--space-2)" }}>
            Up to{" "}
            <strong>{tier.label}</strong> checks per month
            {tier.contactSales ? " (contact us above this tier)" : null}
          </p>
        </div>

        <div className="fj-pricing-volume__calc">
          <p className="fj-eyebrow">Estimate your usage</p>
          <div className="fj-pricing-volume__calc-row">
            <label className="fj-body-sm" htmlFor="calc-monitors">
              Monitors
            </label>
            <input
              id="calc-monitors"
              type="number"
              min={1}
              max={200}
              value={monitors}
              onChange={(e) =>
                setMonitors(Math.max(1, Number(e.target.value) || 1))
              }
              className="fj-pricing-volume__input"
            />
          </div>
          <div className="fj-pricing-volume__calc-row">
            <label className="fj-body-sm" htmlFor="calc-interval">
              Check interval
            </label>
            <select
              id="calc-interval"
              value={intervalSeconds}
              onChange={(e) => setIntervalSeconds(Number(e.target.value))}
              className="fj-pricing-volume__input"
            >
              {CHECK_INTERVAL_OPTIONS.map((seconds) => (
                <option key={seconds} value={seconds}>
                  {intervalOptionLabel(seconds)}
                </option>
              ))}
            </select>
          </div>
          <p className="fj-body-sm" style={{ marginTop: "var(--space-3)" }}>
            Estimated{" "}
            <strong>{formatChecksCompact(estimatedChecks)}</strong> checks/month.
            {" "}
            {estimatedChecks > tier.checksIncluded ? (
              <>That exceeds this volume step. Choose a higher tier or plan.</>
            ) : (
              <>
                Fits{" "}
                <strong>
                  {publicPlans.find((p) => p.id === recommendedPlan)?.name}
                </strong>
                .
              </>
            )}
          </p>
        </div>
      </div>

      <ul className="fj-pricing-volume__plans" aria-label="Plans for selected volume">
        {publicPlans.map((plan) => {
          const fitsVolume = plan.checksIncluded >= tier.checksIncluded;
          const isRecommended =
            plan.id === tier.recommendedPlan ||
            plan.id === recommendedPlan;
          return (
            <li
              key={plan.id}
              className={`fj-pricing-volume__plan${
                isRecommended ? " fj-pricing-volume__plan--recommended" : ""
              }${!fitsVolume ? " fj-pricing-volume__plan--dim" : ""}`}
            >
              <p className="fj-eyebrow">{plan.name}</p>
              <p className="fj-heading-3" style={{ margin: 0 }}>
                {plan.checksLabel}
                <span className="fj-body-sm"> checks/mo</span>
              </p>
              {plan.monthlyUsd != null ? (
                <p className="fj-body-sm" style={{ marginTop: "var(--space-2)" }}>
                  From ${plan.monthlyUsd}/mo
                </p>
              ) : null}
              {isRecommended ? (
                <p className="fj-caption" style={{ marginTop: "var(--space-2)" }}>
                  Recommended for this volume
                </p>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
