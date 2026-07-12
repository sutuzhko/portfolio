import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { UpdateProfileDto } from './update-profile.dto';

// Проверяем контракт «редактируем активную локаль»: в PATCH локализованного поля
// допустима только ru, только en или обе — валидация не требует парности.
describe('UpdateProfileDto — патч одной локали', () => {
  it('принимает локализованное поле только с en', async () => {
    const dto = plainToInstance(UpdateProfileDto, { roleTitle: { en: 'Full Stack Developer' } });
    expect(await validate(dto)).toHaveLength(0);
  });

  it('принимает локализованное поле только с ru', async () => {
    const dto = plainToInstance(UpdateProfileDto, { roleTitle: { ru: 'Фуллстек-разработчик' } });
    expect(await validate(dto)).toHaveLength(0);
  });

  it('принимает патч из единственного поля', async () => {
    const dto = plainToInstance(UpdateProfileDto, { bioMarkdown: { en: 'About me' } });
    expect(await validate(dto)).toHaveLength(0);
  });

  it('всё ещё отклоняет нестроковую локаль', async () => {
    const dto = plainToInstance(UpdateProfileDto, { roleTitle: { en: 123 } });
    expect((await validate(dto)).length).toBeGreaterThan(0);
  });
});
