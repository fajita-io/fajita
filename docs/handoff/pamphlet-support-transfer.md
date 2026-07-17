# Pamphlet support transfer checklist

For a future buyer of Fajita.

1. Take control of the Pamphlet workspace (when provisioned)
2. Rotate `PAMPHLET_API_KEY` and `PAMPHLET_WEBHOOK_SECRET`
3. Update chatbot ids and allowed origins
4. Confirm `capabilities.ts` matches the live contract
5. Rebuild knowledge index (local registry + future Pamphlet sync)
6. Review `/internal/support` queues
7. Export/delete support metadata per privacy policy
8. Verify Powered by Pamphlet still links to `https://pamphlet.io` with no tracking params
9. Confirm fallback `/contact?topic=support` remains usable if Pamphlet is down
10. Ensure no dependency on unrelated Accomplish personal accounts

Do not include secret values in transfer documents.
