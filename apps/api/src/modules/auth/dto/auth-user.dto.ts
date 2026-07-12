import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

// Безопасное представление пользователя для клиента — без пароля и служебных полей.
export class AuthUserDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  username: string;

  @ApiProperty({ enum: UserRole, enumName: 'UserRole' })
  role: UserRole;
}
