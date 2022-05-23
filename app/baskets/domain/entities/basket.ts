import { IsOptional, IsString, IsUUID, IsArray } from 'class-validator';

export class Basket {
  @IsUUID('4')
  @IsOptional()
  public id?: string;

  @IsString()
  public email: string;

  @IsArray()
  public products: string[];
}
