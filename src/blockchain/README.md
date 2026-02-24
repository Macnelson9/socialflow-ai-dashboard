# Soroban Contract Bridge - Event Parsing & Templates

## Overview

This implementation provides comprehensive contract event parsing and pre-built contract templates for the SocialFlow Stellar/Soroban integration.

## Features Implemented

### ✅ 201.5 Contract Event Parsing

- **Parse execution events from transaction meta**: Extract events from Stellar transaction XDR
- **Extract event data and topics**: Parse SCVal data structures to native JavaScript types
- **Map events to typed structures**: Type-safe event interfaces with TypeScript
- **Add event filtering by type**: Filter by predefined event types (rewards, milestones, referrals, etc.)
- **Store events in local database**: IndexedDB storage with indexed queries

### ✅ 201.6 Contract Templates

- **Pre-built contract templates**: 3 production-ready templates
- **Engagement Rewards Template**: Reward users for likes, comments, shares
- **Referral Program Template**: Incentivize user referrals
- **Milestone Bonus Template**: Reward follower/engagement milestones
- **WASM hash storage**: Each template includes deployment hash
- **Configurable parameters**: Type-safe parameter definitions with defaults

## Architecture

```
src/blockchain/
├── types/
│   └── contract.ts              # TypeScript interfaces for events and templates
├── config/
│   └── contractTemplates.ts     # Pre-built contract template definitions
├── utils/
│   └── eventParser.ts           # Event parsing logic from transaction meta
├── services/
│   ├── EventStorageService.ts   # IndexedDB storage for events
│   └── SmartContractService.ts  # High-level contract interaction API
└── index.ts                     # Public exports
```

## Usage

### 1. Contract Templates

```typescript
import { CONTRACT_TEMPLATES, getTemplateById, getTemplatesByType } from './blockchain';

// Get all templates
console.log(CONTRACT_TEMPLATES);

// Get specific template
const template = getTemplateById('engagement-rewards-v1');

// Get templates by type
const referralTemplates = getTemplatesByType('referral_program');
```

### 2. Process Transaction Events

```typescript
import { smartContractService } from './blockchain';

// Process a transaction and extract events
const events = await smartContractService.processTransaction(
  transactionHash,
  transactionMeta,  // Base64 XDR from Stellar
  contractId,
  ledgerNumber
);

console.log(`Extracted ${events.length} events`);
```

### 3. Query Events

```typescript
// Get events for specific contract
const contractEvents = await smartContractService.getContractEvents(contractId);

// Get events by type
const rewardEvents = await smartContractService.getEventsByType(
  ContractEventType.REWARD_DISTRIBUTED
);

// Get recent events
const recent = await smartContractService.getRecentEvents(50);
```

### 4. Parse Specific Event Types

```typescript
// Parse reward distribution events
const rewards = smartContractService.parseRewardEvents(events);
rewards.forEach(reward => {
  console.log(`${reward.recipient} received ${reward.amount} ${reward.token}`);
});

// Parse milestone events
const milestones = smartContractService.parseMilestoneEvents(events);

// Parse referral events
const referrals = smartContractService.parseReferralEvents(events);
```

### 5. Event Statistics

```typescript
const stats = await smartContractService.getEventStats(contractId);
console.log(`Total events: ${stats.total}`);
console.log('By type:', stats.byType);
```

## Event Types

```typescript
enum ContractEventType {
  REWARD_DISTRIBUTED = 'reward_distributed',
  CAMPAIGN_CREATED = 'campaign_created',
  CAMPAIGN_COMPLETED = 'campaign_completed',
  MILESTONE_REACHED = 'milestone_reached',
  REFERRAL_REGISTERED = 'referral_registered',
  ENGAGEMENT_RECORDED = 'engagement_recorded',
}
```

## Contract Templates

### 1. Engagement Rewards
- **Purpose**: Automatically reward users for social engagement
- **Parameters**: 
  - `reward_token`: Token address for rewards
  - `like_reward`: Amount per like (default: 10)
  - `comment_reward`: Amount per comment (default: 25)
  - `share_reward`: Amount per share (default: 50)
  - `max_rewards_per_user`: Maximum per user (default: 1000)

### 2. Referral Program
- **Purpose**: Reward users for referring new followers
- **Parameters**:
  - `reward_token`: Token address
  - `referrer_reward`: Reward for referrer (default: 100)
  - `referee_reward`: Reward for new user (default: 50)
  - `min_engagement_threshold`: Minimum engagement (default: 5)
  - `max_referrals_per_user`: Maximum referrals (default: 50)

### 3. Milestone Bonus
- **Purpose**: Reward follower/engagement milestones
- **Parameters**:
  - `reward_token`: Token address
  - `milestone_1k`: Reward for 1K followers (default: 1000)
  - `milestone_10k`: Reward for 10K followers (default: 10000)
  - `milestone_100k`: Reward for 100K followers (default: 100000)
  - `milestone_1m`: Reward for 1M followers (default: 1000000)
  - `auto_distribute`: Auto-distribute on milestone (default: true)

## Storage

Events are stored in IndexedDB with the following indexes:
- `contractId`: Query events by contract
- `type`: Query events by type
- `timestamp`: Query events chronologically
- `transactionHash`: Query events by transaction

## Dependencies

- `@stellar/stellar-sdk`: Stellar SDK for XDR parsing and SCVal conversion
- IndexedDB: Browser-native storage (no external dependencies)

## Testing

See `examples/contractEventsExample.ts` for comprehensive usage examples.

## Requirements Satisfied

- ✅ **5.3**: Pre-built contract templates with WASM hashes
- ✅ **5.4**: Contract event parsing from transaction meta
- ✅ **5.5**: Event filtering, mapping, and storage

## Next Steps

1. Integrate with actual Stellar Horizon/Soroban RPC endpoints
2. Add real-time event monitoring via WebSocket
3. Implement contract deployment from templates
4. Add event notification system
5. Create UI components for event visualization
