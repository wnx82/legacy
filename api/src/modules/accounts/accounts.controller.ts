import { Body, Controller, Delete } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { BadRequestException } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '@legacy/shared';

@ApiTags('accounts')
@ApiBearerAuth()
@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Delete('me')
  @ApiOperation({ summary: 'Supprime (anonymise) mon compte et efface mes données personnelles (RGPD)' })
  deleteMe(
    @Body() body: { confirm?: string },
    @CurrentUser() user: AuthenticatedUser,
  ) {
    // Confirmation explicite requise pour une action destructive et irréversible.
    if (body?.confirm !== 'SUPPRIMER') {
      throw new BadRequestException('Confirmation requise : envoyez { "confirm": "SUPPRIMER" }.');
    }
    return this.accountsService.deleteMyAccount(user.id);
  }
}
