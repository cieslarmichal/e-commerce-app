import { IsString } from 'class-validator';

export class DeleteProductParamDto {
  @IsString()
  public readonly id: string;
}
