import { IsString, IsOptional, MaxLength, MinLength, IsNotEmpty } from "class-validator";

export class CreateNoteDto {

    @IsString({ message:'El titulo debe ser un texto'})
    @IsNotEmpty({message:'El titulo es obligatorio'})
    @MinLength(2, { message: 'El titulo debe tener más de 2 caracteres'})
    @MaxLength(50, { message: 'El titulo debe tener menos de 20 caracteres'})
    title: string;

    @IsString({ message:'El contenido debe ser un texto'})
    @IsNotEmpty({message:'El contenido es obligatorio'})
    @MinLength(20, { message: 'El contenido debe tener más de 20 caracteres'})
    @MaxLength(1000, { message: 'El contenido debe tener menos de 400 caracteres'})
    content: string;

    @IsString({ message:'La categoria debe ser un texto'})
    @IsNotEmpty({message:'La categoria es obligatoria'})
    @MinLength(2, { message: 'La categoria debe tener más de 2 caracteres'})
    @MaxLength(20, { message: 'La categoria debe tener menos de 20 caracteres'})
    category: string;

    @IsString({ message:'La issue debe ser un texto'})
    @IsNotEmpty({message:'La issue es obligatoria'})
    @MinLength(2, { message: 'La issue debe tener más de 2 caracteres'})
    @MaxLength(30, { message: 'La issue debe tener menos de 20 caracteres'})
    issue: string;

    @IsOptional()
    status: string;
}