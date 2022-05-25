import { RecordToInstanceTransformer } from '../../../common';
import { OrderItemDto } from '../dtos';

export class OrderItemMapper {
  public mapEntityToDto(entityRecord: Record<any, any>): OrderItemDto {
    return RecordToInstanceTransformer.transform(entityRecord, OrderItemDto);
  }
}
