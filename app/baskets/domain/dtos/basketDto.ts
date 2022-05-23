import { IsUUID, IsArray, IsString } from 'class-validator';
import { RecordToInstanceTransformer } from '../../../common';

export class BasketDto {
  @IsUUID('4')
  public readonly id: string;

  @IsString()
  public readonly email: string;

  @IsArray()
  public readonly products: string[];

  public static readonly create = RecordToInstanceTransformer.transformFactory(BasketDto);
}
