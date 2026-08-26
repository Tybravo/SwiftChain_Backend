import { xdr, scValToNative } from '@stellar/stellar-sdk';
import { deliveryService } from '../services/delivery.service';
import logger from '../config/logger';

export class DeliveryHandlers {
  /**
   * Processes a delivery_created smart contract event XDR payload.
   * @param xdrPayload Base64 encoded XDR string representing the event value
   */
  public async processDeliveryCreatedEvent(xdrPayload: string): Promise<unknown> {
    try {
      // Decode the base64 XDR payload into an ScVal
      const scVal = xdr.ScVal.fromXDR(xdrPayload, 'base64');

      // Convert ScVal to a native JavaScript object
      const nativeData = scValToNative(scVal) as Record<string, unknown>;

      logger.info(`Decoded delivery_created event: ${JSON.stringify(nativeData)}`);

      // Extract required fields
      // Assuming the payload contains `delivery_id` and `contract_id` in a map/struct
      const deliveryId = nativeData?.delivery_id as string | undefined;
      const contractId = nativeData?.contract_id as string | undefined;

      if (!deliveryId || !contractId) {
        throw new Error('Missing delivery_id or contract_id in XDR payload');
      }

      // Update the delivery in the database
      const updatedDelivery = await deliveryService.updateDeliveryOnChainCreation(
        deliveryId,
        contractId,
      );

      logger.info(`Successfully processed delivery_created event for deliveryId: ${deliveryId}`);

      return updatedDelivery;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Error processing delivery_created event: ${errorMessage}`);
      throw error;
    }
  }
}

export const deliveryHandlers = new DeliveryHandlers();
