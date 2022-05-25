import { RecordToInstanceTransformer } from '../../../common';
import { OrderDto } from '../dtos';
import { OrderItemMapper } from './orderItemMapper';

export class OrderMapper {
  public constructor(private readonly orderItemMapper: OrderItemMapper) {}

  public mapEntityToDto(entityRecord: Record<any, any>): OrderDto {
    const itemsDto = entityRecord['items'].map((orderItem: any) => this.orderItemMapper.mapEntityToDto(orderItem));

    entityRecord['items'] = itemsDto;

    return RecordToInstanceTransformer.transform(entityRecord, OrderDto);
  }
}
