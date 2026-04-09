import { IsEmail, IsString, IsOptional } from "class-validator";
import { Type } from "class-transformer";

export class UpdateUserDto {
    @IsEmail()
    @IsOptional()
    email: string;

    @IsString()
    @IsOptional()
    password: string;
}