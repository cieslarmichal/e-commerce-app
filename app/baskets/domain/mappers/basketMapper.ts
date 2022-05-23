import { RecordToInstanceTransformer } from '../../../common';
import { BasketDto } from '../dtos';

export class BasketMapper {
  public mapEntityToDto(entityRecord: Record<any, any>): BasketDto {
    return RecordToInstanceTransformer.transform(entityRecord, BasketDto);
  }
}
