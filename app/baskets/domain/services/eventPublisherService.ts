import { EventBridgeClient, PutEventsCommand } from '@aws-sdk/client-eventbridge';

export interface EventProperties {
  source: string;
  detail: string;
  detailType: string;
  eventBusName: string;
}

export class EventPublisherService {
  constructor(private readonly eventBridgeClient: EventBridgeClient) {}

  public async publishEvent(properties: EventProperties): Promise<void> {
    await this.eventBridgeClient.send(
      new PutEventsCommand({
        Entries: [
          {
            Source: properties.source,
            Detail: properties.detail,
            DetailType: properties.detailType,
            Resources: [],
            EventBusName: properties.eventBusName,
          },
        ],
      }),
    );
  }
}
