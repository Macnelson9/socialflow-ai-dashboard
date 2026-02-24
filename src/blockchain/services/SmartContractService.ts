import { ContractEvent, ContractEventType } from '../types/contract';
import { ContractEventParser } from '../utils/eventParser';
import { eventStorage } from './EventStorageService';

export class SmartContractService {
  /**
   * Process transaction and extract contract events
   */
  async processTransaction(
    transactionHash: string,
    transactionMeta: string,
    contractId: string,
    ledger: number
  ): Promise<ContractEvent[]> {
    try {
      const events = ContractEventParser.parseEventsFromMeta(transactionMeta, contractId);
      
      // Enrich events with transaction data
      const enrichedEvents = events.map(event => ({
        ...event,
        transactionHash,
        ledger,
      }));

      // Store events in local database
      await eventStorage.storeEvents(enrichedEvents);

      return enrichedEvents;
    } catch (error) {
      console.error('Error processing transaction:', error);
      throw error;
    }
  }

  /**
   * Get events for a specific contract
   */
  async getContractEvents(contractId: string): Promise<ContractEvent[]> {
    return eventStorage.getEventsByContract(contractId);
  }

  /**
   * Get events by type
   */
  async getEventsByType(eventType: ContractEventType): Promise<ContractEvent[]> {
    return eventStorage.getEventsByType(eventType);
  }

  /**
   * Get recent events across all contracts
   */
  async getRecentEvents(limit: number = 50): Promise<ContractEvent[]> {
    return eventStorage.getRecentEvents(limit);
  }

  /**
   * Filter events by type
   */
  filterEvents(events: ContractEvent[], eventType: ContractEventType): ContractEvent[] {
    return ContractEventParser.filterEventsByType(events, eventType);
  }

  /**
   * Parse reward distribution events
   */
  parseRewardEvents(events: ContractEvent[]): Array<{
    recipient: string;
    amount: number;
    token: string;
  }> {
    return events
      .map(event => ContractEventParser.parseRewardEvent(event))
      .filter((parsed): parsed is NonNullable<typeof parsed> => parsed !== null);
  }

  /**
   * Parse milestone events
   */
  parseMilestoneEvents(events: ContractEvent[]): Array<{
    user: string;
    milestone: number;
    reward: number;
  }> {
    return events
      .map(event => ContractEventParser.parseMilestoneEvent(event))
      .filter((parsed): parsed is NonNullable<typeof parsed> => parsed !== null);
  }

  /**
   * Parse referral events
   */
  parseReferralEvents(events: ContractEvent[]): Array<{
    referrer: string;
    referee: string;
    reward: number;
  }> {
    return events
      .map(event => ContractEventParser.parseReferralEvent(event))
      .filter((parsed): parsed is NonNullable<typeof parsed> => parsed !== null);
  }

  /**
   * Get event statistics
   */
  async getEventStats(contractId?: string): Promise<{
    total: number;
    byType: Record<string, number>;
  }> {
    const events = contractId 
      ? await this.getContractEvents(contractId)
      : await eventStorage.getRecentEvents(1000);

    const byType: Record<string, number> = {};
    
    events.forEach(event => {
      byType[event.type] = (byType[event.type] || 0) + 1;
    });

    return {
      total: events.length,
      byType,
    };
  }
}

export const smartContractService = new SmartContractService();
