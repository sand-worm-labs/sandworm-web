import type { BriefingFeed } from "@/features/briefing/types";

import { briefingItem } from "./builders";

// Sourced from the team's Paycrest notebooks; see _mockdata/overview/paycrest.ts.
export const paycrestBriefing: BriefingFeed = {
  subtitle: "Since your last visit, Tue 3 Nov",
  upToDate: {
    subtitle: "Since your last visit, Wed 4 Nov",
    message:
      "Nothing new since your last visit. New research, new signals and big moves in your numbers show up here.",
    archivedCount: 6,
  },
  items: [
    briefingItem({
      group: "Today",
      kind: "Signal",
      title: "Lemon Cash pays out about $16M a week in stablecoins",
      summary:
        "Paycrest has no peso corridor yet. Lemon already holds the pesos.",
      entity: "Argentina",
      time: "06:02",
      when: "Today at 06:02",
      isUnread: true,
      detail: {
        headline: {
          value: "$16M",
          label: "of USDC and USDT paid out each week",
          delta: { text: "$144M in 2 months", tone: "neutral" },
        },
        what: "Lemon Cash paid out $144M of USDC and USDT in two months, about $16M a week to some 9,400 receiving wallets. 83% of it was USDT. Paycrest does not support Argentine pesos today, and none of Lemon's labelled wallets has sent an order to a Paycrest gateway in 180 days.",
        why: "Lemon holds the pesos and the dollars, so it is the natural first liquidity provider for a peso corridor. That corridor has to take USDT on BNB Chain and Tron: USDC on Base reaches about 0.5% of Lemon's payouts. These totals include sweeps between Lemon's own wallets, so read them as an upper bound.",
      },
      action: { label: "Open signal", route: "signal" },
    }),
    briefingItem({
      group: "Today",
      kind: "Metric",
      title: "P2P.me pays naira sellers 2.4% more than Paycrest's quote",
      summary: "Since 17 Sep, and from one merchant. It can close quickly.",
      entity: "Nigeria",
      time: "06:00",
      when: "Today at 06:00",
      isUnread: true,
      detail: {
        headline: {
          value: "+2.4%",
          label: "more naira per USDC than Paycrest's live quote",
          delta: { text: "+3.4% on 30-day medians", tone: "neutral" },
        },
        what: "Since 17 September, a Nigerian selling USDC on P2P.me gets about 2.4% more naira than Paycrest's live quote. In August P2P.me paid about 1% less. Both run a buy-versus-sell gap of about 1.1%, so P2P.me's edge is the level of its price, not a tighter spread.",
        why: "The price comes from essentially one merchant, at about 7 priced orders a day, so the gap can close as fast as it opened. Paycrest's providers can quote closer to the street rate on the sell side. If they don't, P2P.me's naira growth is a pricing story, not only a distribution story.",
      },
      action: { label: "Read the analysis", route: "report" },
    }),
    briefingItem({
      group: "Today",
      kind: "Metric",
      title: "P2P.me's naira business rests on one merchant",
      summary:
        "About three-quarters of its naira orders, on a balanced book every day.",
      entity: "Nigeria",
      time: "05:40",
      when: "Today at 05:40",
      isUnread: true,
      detail: {
        headline: {
          value: "~75%",
          label: "of P2P.me's naira volume is filled by one merchant",
          delta: { text: "wallet 0x54e4…6624", tone: "neutral" },
        },
        what: "One merchant fills about three-quarters of the naira orders on P2P.me. In the last 90 days it was active on 76 days and filled 400 orders worth $131.8K, split almost evenly between buying USDC ($65.5K) and cashing out ($66.3K). Its quote is the price P2P.me shows Nigerians, which is why P2P.me pays sellers more than Paycrest's quote.",
        why: "P2P.me's Nigerian corridor depends on one counterparty, and Paycrest has the same shape: three related providers fill 60% of its settled volume. This merchant already holds USDC and naira, so it is the most useful liquidity conversation you could have in Nigeria. The address is a public wallet with no name attached. In Argentina P2P.me is less exposed: its two largest merchants did $111K and $106K in 90 days.",
      },
      action: { label: "Read the analysis", route: "report" },
    }),
    briefingItem({
      group: "Today",
      kind: "Signal",
      title: "Most of P2P.me's naira cash-outs come from one platform's users",
      summary:
        "Wallets funded by one contract made 82% of them. It has no name.",
      entity: "Nigeria",
      time: "05:35",
      when: "Today at 05:35",
      isUnread: true,
      detail: {
        headline: {
          value: "82%",
          label:
            "of P2P.me's naira cash-outs come from wallets one contract funds",
          delta: {
            text: "$254M paid to 13,780 wallets since 7 Sep",
            tone: "neutral",
          },
        },
        what: "The contract 0x6fa5…5a1d has paid out $254M in USDC to 13,780 wallets since 7 September. Seventeen of those wallets are P2P.me naira users, and they made 82% of its naira cash-outs. They also buy USDC (46% of their volume), so they look like traders or agents, not one person. Dune holds no public name for the contract.",
        why: "If Paycrest can name the platform and offer it a built-in naira cash-out, that flow comes to you instead of P2P.me. Start with Arkham's entity lookup. A contract paying thousands of wallets usually matches a known exchange or wallet. The link shows a relationship, not ownership.",
      },
      action: { label: "Open signal", route: "signal" },
    }),
    briefingItem({
      group: "Yesterday",
      kind: "Analysis",
      title: "Paycrest: the onchain inside story",
      summary: "New report. 59.8k orders on 8 chains, $10.2M in volume.",
      entity: "Paycrest",
      time: "Mon 14:10",
      when: "Mon at 14:10",
      isUnread: true,
      detail: {
        headline: {
          value: "$10.2M",
          label: "lifetime volume across 59.8k orders",
          delta: { text: "a minimum", tone: "neutral" },
        },
        what: "We decoded every order on Paycrest's eight EVM gateways. 64% of volume is cNGN, a naira stablecoin. The median USDC or USDT order is $9 and the median cNGN order is $350. Base and BNB Chain carry 95% of volume, and the median order settles in 0.7 minutes. 177 integrators have sent orders; the five largest account for 92% of volume.",
        why: "Fee income follows dollar-stablecoin volume more than cNGN, so it will grow mainly with the dollar corridors. The totals are a minimum: the Tron, Lisk, Asset Chain and Starknet gateways are not included.",
      },
      action: { label: "Read report", route: "report" },
    }),
    briefingItem({
      group: "Yesterday",
      kind: "Signal",
      title: "Nexo bought Buenbit and opened a Latin American hub",
      summary: "About $1.3bn of USDC and USDT moved through Nexo in 2 months.",
      entity: "Nexo",
      time: "Mon 11:32",
      when: "Mon at 11:32",
      isUnread: false,
      detail: {
        headline: {
          value: "$1.3bn",
          label: "of USDC and USDT through Nexo wallets in 2 months",
          delta: { text: "$1.8bn in all", tone: "neutral" },
        },
        what: "Nexo agreed to buy Buenbit on 11 December 2025, moved its accounts over on 1 April, and opened a Latin American hub in Buenos Aires on 5 March covering Argentina, Peru and Mexico. About $1.8bn moved through its labelled wallets in two months, 81% of it stablecoins. Dune labels no Buenbit wallet, so Buenbit's Argentine flow cannot be separated.",
        why: "Nexo is strong on yield and credit, not payouts, so Paycrest can pitch itself as its fiat payout layer. It barely uses Base, so lead with Ethereum, BNB Chain, Polygon and Arbitrum. Buenbit's licensed peso desk is a candidate liquidity provider.",
      },
      action: { label: "Open signal", route: "signal" },
    }),
    briefingItem({
      group: "Yesterday",
      kind: "Metric",
      title: "Three more naira off-ramps are growing next to Paycrest",
      summary: "P2P.me, Resolva and PAJ Cash each move $80K to $330K a month.",
      entity: "Nigeria",
      time: "Mon 09:20",
      when: "Mon at 09:20",
      isUnread: false,
      detail: {
        headline: {
          value: "7×",
          label: "P2P.me's naira growth, July to October",
          delta: { text: "$15K to $111K a month", tone: "neutral" },
        },
        what: "P2P.me's naira volume grew about 7× in three months, from $15K in July to $111K in October, and its naira cash-outs are about 5% of Paycrest's naira payouts. Resolva moved $1.26M in nine months and peaked at $333K in August before falling to $145K in September. PAJ Cash, a Solana to naira off-ramp, held between $68K and $85K a month from June to September.",
        why: "None of the three is near Paycrest's naira volume yet, but they are not measured alike: P2P.me counts buys and cash-outs, PAJ Cash counts deposits of SOL, tokens and stablecoins, and Resolva counts sweeps of five coins including Bitcoin. Read the bars as scale, not a ranking. PAJ Cash reaches Solana users, and the Paycrest notebooks read only EVM gateways.",
      },
      action: { label: "Read the analysis", route: "report" },
    }),
    briefingItem({
      group: "Yesterday",
      kind: "Signal",
      title: "Brazil and Mexico are where Latin America's stablecoins move",
      summary:
        "$1.2B of real stablecoins and $1.09B of Bitso payouts in 90 days.",
      entity: "Latin America",
      time: "Mon 08:45",
      when: "Mon at 08:45",
      isUnread: false,
      detail: {
        headline: {
          value: "$1.2B",
          label: "of Brazilian real stablecoins moved in 90 days",
          delta: { text: "92% of regional flow on Polygon", tone: "neutral" },
        },
        what: "Real-denominated stablecoins (BRZ, BRLA, BRL1) moved about $1.2B, around 400× P2P.me's whole Brazil book of $3.1M. Bitso paid out $1.09B in USDC and USDT to about 9,700 wallets, 94% of it on Polygon, and the peso stablecoin MXNB moved $132M. Colombia's COPM moved $51M. P2P.me barely serves Mexico.",
        why: "Paycrest already runs on Polygon, where almost all of this moves. BRLA Digital, Transfero and Bitso need bank off-ramps, which is what a Paycrest corridor is. P2P.me's Brazilian users also cash out about $500K a month, so retail demand is there too. Token volume includes DEX and bot hops, so it overstates real payments.",
      },
      action: { label: "Open signal", route: "signal" },
    }),
    briefingItem({
      group: "Last week",
      kind: "Analysis",
      title: "Argentina: who should integrate Paycrest",
      summary: "29 companies scored. Belo is the safest first audit.",
      entity: "Argentina",
      time: "Thu",
      when: "Thursday",
      isUnread: false,
      detail: {
        headline: {
          value: "29",
          label: "Argentine wallets, ramps and payment companies scored",
        },
        what: "From 100 Argentine crypto projects, 29 wallets, ramps and payment companies were scored for fit on five criteria. Belo, Wallbit and Takenos score highest. Belo is the safest first audit because seven sources name it; Wallbit and Takenos each rest on one source.",
        why: "To open Argentina, Paycrest needs senders for USDC and USDT payouts, and peso liquidity so orders don't refund. Ripio is the strongest candidate for liquidity. This is desk research only: the scores are hypotheses to test onchain, not findings.",
      },
      action: { label: "Read report", route: "report" },
    }),
    briefingItem({
      group: "Last week",
      kind: "Metric",
      title: "Kenya volume grew about 90× in six months",
      summary: "One payout account drives most of it.",
      entity: "Kenya",
      time: "Wed",
      when: "Wednesday",
      isUnread: false,
      detail: {
        headline: {
          value: "~90×",
          label: "Kenya corridor growth in six months",
          delta: { text: "$4.6K to $410K a quarter", tone: "positive" },
        },
        what: "Kenyan-shilling volume went from $4.6K in the first quarter of 2026 to $410K in the third, mostly from one East Africa payout account that started in late March and has been active every month since.",
        why: "A business sending regular payouts for seven months is a real sign of fit for payouts. The Nigeria corridor, by comparison, has been steady at $250K to $500K a quarter.",
      },
      action: { label: "Read report", route: "report" },
    }),
    briefingItem({
      group: "Last week",
      kind: "Signal",
      title: "P2P.me's 13 integrator apps complete only 1 in 3 orders",
      summary: "They already want an embedded ramp. Reliability is the pitch.",
      entity: "P2P.me",
      time: "Tue",
      when: "Tuesday",
      isUnread: false,
      detail: {
        headline: {
          value: "~1 in 3",
          label: "of integrator orders on P2P.me complete",
          delta: { text: "13 apps, under 1% of its volume", tone: "neutral" },
        },
        what: "Since May 2026, 13 apps have sent orders to P2P.me through its business gateway. About one in three completes, and apps carry under 1% of P2P.me's volume. The largest, 0xa012…20a5, is Argentine and completed $40K since September. It may be Luca Money, which one known transaction would confirm. Five of the apps share one deployer, so one team built them.",
        why: "These apps have already decided they want an embedded ramp, so they are warm leads for Paycrest's sender API. Lead with reliability: Paycrest's median order settles in 0.7 minutes, and most corridors refund about 5%.",
      },
      action: { label: "Open signal", route: "signal" },
    }),
    briefingItem({
      group: "Last week",
      kind: "Metric",
      title: "Resolva moved $1.26M in nine months, 43% from one account",
      summary: "Its volume fell 56% in September, almost all from the top 20.",
      entity: "Resolva",
      time: "Mon",
      when: "Monday",
      isUnread: false,
      detail: {
        headline: {
          value: "$1.26M",
          label: "of crypto-to-naira from 6,398 payments since 19 Jan",
          delta: { text: "September down 56% on August", tone: "negative" },
        },
        what: "543 accounts have paid Resolva. The largest brought 43% of volume and the top 20 brought 83%. Monthly volume rose from $27K in January to $333K in August, then fell to $145K in September, almost entirely because top accounts slowed. Nine of the top 20 have been quiet for over 30 days, together $282K. The median deposit is $30. Outside the top 20, volume kept growing.",
        why: "Resolva has the same concentration problem as Paycrest, and the same attacker: its master wallets carry about 5,000 fake look-alike entries, as Paycrest's providers do. No funds were lost. Totals are a minimum, since only volume reaching its five master wallets is counted.",
      },
      action: { label: "Read the analysis", route: "report" },
    }),
  ],
};
