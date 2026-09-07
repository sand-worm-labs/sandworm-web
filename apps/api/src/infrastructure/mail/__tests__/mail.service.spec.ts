import { I18nContext } from 'nestjs-i18n';
import { MailService } from '../mail.service';

const APP_VALUES: Record<string, unknown> = {
  'app.frontendDomain': 'https://app.example.com',
  'app.workingDirectory': '/srv/app',
  'app.name': 'Sandworm',
};

function makeService() {
  const mailerService = {
    sendMail: jest.fn(),
  } as any;

  const configService = {
    getOrThrow: jest.fn((key: string) => APP_VALUES[key]),
    get: jest.fn((key: string) => APP_VALUES[key]),
  } as any;

  const service = new MailService(mailerService, configService);
  return { service, mailerService, configService };
}

function makeI18n(translations: Record<string, string> = {}) {
  return {
    t: jest.fn(async (key: string, opts?: any) => translations[key] ?? key),
  } as any;
}

describe('MailService', () => {
  let currentSpy: jest.SpyInstance;

  afterEach(() => {
    currentSpy?.mockRestore();
  });

  describe('userSignUp', () => {
    it('sends the activation template with the translated context when i18n is present', async () => {
      const { service, mailerService } = makeService();
      currentSpy = jest.spyOn(I18nContext, 'current').mockReturnValue(makeI18n({ 'app.common.confirm_email': 'Confirm your email' }));

      await service.userSignUp({ to: 'a@b.com', data: { hash: 'h1' } });

      expect(mailerService.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'a@b.com',
          subject: 'Confirm your email',
          templatePath: expect.stringContaining('activation.hbs'),
          context: expect.objectContaining({
            title: 'Confirm your email',
            url: expect.stringContaining('/confirm-email?hash=h1'),
            app_name: 'Sandworm',
          }),
        }),
      );
    });

    it('falls back to an empty app context when there is no active i18n context', async () => {
      const { service, mailerService } = makeService();
      currentSpy = jest.spyOn(I18nContext, 'current').mockReturnValue(undefined as any);

      await service.userSignUp({ to: 'a@b.com', data: { hash: 'h1' } });

      expect(mailerService.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'a@b.com',
          subject: undefined,
          context: expect.objectContaining({ greeting: undefined, intro: undefined }),
        }),
      );
    });
  });

  describe('forgotPassword', () => {
    it('sends the reset-password template with the hash and expiry in the url', async () => {
      const { service, mailerService } = makeService();
      currentSpy = jest.spyOn(I18nContext, 'current').mockReturnValue(makeI18n());

      await service.forgotPassword({ to: 'a@b.com', data: { hash: 'h1', tokenExpires: 12345 } });

      expect(mailerService.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'a@b.com',
          templatePath: expect.stringContaining('reset-password.hbs'),
          context: expect.objectContaining({
            url: expect.stringContaining('/password-change?hash=h1&expires=12345'),
          }),
        }),
      );
    });
  });

  describe('confirmNewEmail', () => {
    it('sends the confirm-new-email template', async () => {
      const { service, mailerService } = makeService();
      currentSpy = jest.spyOn(I18nContext, 'current').mockReturnValue(makeI18n());

      await service.confirmNewEmail({ to: 'a@b.com', data: { hash: 'h1' } });

      expect(mailerService.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'a@b.com',
          templatePath: expect.stringContaining('confirm-new-email.hbs'),
          context: expect.objectContaining({ url: expect.stringContaining('/confirm-new-email?hash=h1') }),
        }),
      );
    });
  });

  describe('workspaceInvitation', () => {
    it('sends the workspace-invitation template with a default subject when untranslated', async () => {
      const { service, mailerService } = makeService();
      currentSpy = jest.spyOn(I18nContext, 'current').mockReturnValue(undefined as any);

      await service.workspaceInvitation({
        to: 'a@b.com',
        data: { hash: 'h1', workspaceName: 'Acme', inviterName: 'Jane' },
      });

      expect(mailerService.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'a@b.com',
          subject: 'Invitation to join Acme',
          templatePath: expect.stringContaining('workspace-invitation.hbs'),
          context: expect.objectContaining({
            actionTitle: 'Accept Invitation',
            workspaceName: 'Acme',
            inviterName: 'Jane',
          }),
        }),
      );
    });

    it('uses the translated title and action when i18n is present', async () => {
      const { service, mailerService } = makeService();
      currentSpy = jest.spyOn(I18nContext, 'current').mockReturnValue(
        makeI18n({
          'app.email.workspace_invitation.title': 'You are invited',
          'app.email.workspace_invitation.action_title': 'Join now',
        }),
      );

      await service.workspaceInvitation({
        to: 'a@b.com',
        data: { hash: 'h1', workspaceName: 'Acme', inviterName: 'Jane' },
      });

      expect(mailerService.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: 'You are invited',
          context: expect.objectContaining({ actionTitle: 'Join now' }),
        }),
      );
    });
  });

  describe('workspaceJoinRequest', () => {
    it('sends the workspace-join-request template with a default subject when untranslated', async () => {
      const { service, mailerService } = makeService();
      currentSpy = jest.spyOn(I18nContext, 'current').mockReturnValue(undefined as any);

      await service.workspaceJoinRequest({
        to: 'a@b.com',
        data: {
          userName: 'Jane',
          userEmail: 'jane@b.com',
          workspaceName: 'Acme',
          workspaceId: 'ws-1',
          role: 'member',
        },
      });

      expect(mailerService.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'a@b.com',
          subject: 'Join request for Acme',
          text: 'Jane wants to join Acme',
          templatePath: expect.stringContaining('workspace-join-request.hbs'),
          context: expect.objectContaining({ role: 'member', workspaceName: 'Acme' }),
        }),
      );
    });
  });
});
