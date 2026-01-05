import { IsString, IsOptional, MaxLength, MinLength, IsNotEmpty } from "class-validator";

export class CreateNoteDto {

    @IsString({ message:'El titulo debe ser un texto'})
    @IsNotEmpty({message:'El titulo es obligatorio'})
    @MinLength(5, { message: 'El titulo debe tener más de 5 caracteres'})
    @MaxLength(60, { message: 'El titulo debe tener menos de 60 caracteres'})
    title: string;

    @IsString({ message:'El contenido debe ser un texto'})
    @IsNotEmpty({message:'El contenido es obligatorio'})
    @MinLength(20, { message: 'El contenido debe tener más de 20 caracteres'})
    @MaxLength(4000, { message: 'El contenido debe tener menos de 4000 caracteres'})
    content: string;

    @IsString({ message:'La categoria debe ser un texto'})
    @IsNotEmpty({message:'La categoria es obligatoria'})
    category: string;

    @IsString({ message:'El tema debe ser un texto'})
    @IsNotEmpty({message:'El tema es obligatorio'})
    @MinLength(1, { message: 'El tema es muy corto'})
    @MaxLength(30, { message: 'El tema debe tener menos de 20 caracteres'})
    issue: string;

    @IsOptional()
    status: string;
}