import { IsString } from 'class-validator';

export class RemoveProductParamDto {
  @IsString()
  public readonly id: string;
}

export class RemoveProductResponseDto {
  public constructor(public readonly statusCode: number) {}
}
