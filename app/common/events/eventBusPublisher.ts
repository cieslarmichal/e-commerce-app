import { EventBridgeClient, PutEventsCommand } from '@aws-sdk/client-eventbridge';
import { Event } from './event';

export abstract class EventBusPublisher<T extends Event> {
  abstract readonly source: T['source'];
  abstract readonly detailType: T['detailType'];
  abstract readonly eventBusName: T['eventBusName'];

  constructor(private readonly eventBridgeClient: EventBridgeClient) {}

  public async publish(data: T['detail']): Promise<void> {
    await this.eventBridgeClient.send(
      new PutEventsCommand({
        Entries: [
          {
            Source: this.source,
            Detail: data,
            DetailType: this.detailType,
            Resources: [],
            EventBusName: this.eventBusName,
          },
        ],
      }),
    );
  }
}
