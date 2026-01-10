import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { I18nContext } from 'nestjs-i18n';
import { MailData } from './interfaces/mail-data.interface';

import { AllConfigType } from '@/config/config.type';
import { MaybeType } from '@/common/types/maybe.type';
import path from 'path';
import { MailerService } from '../mailer/mailer.service';

@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService<AllConfigType>,
  ) { }

  async userSignUp(mailData: MailData<{ hash: string }>): Promise<void> {
    const i18n = I18nContext.current();
    let emailConfirmTitle: MaybeType<string>;
    let greeting: MaybeType<string>;
    let intro: MaybeType<string>;
    let instruction: MaybeType<string>;

    if (i18n) {
      [emailConfirmTitle, greeting, intro, instruction] = await Promise.all([
        i18n.t('app.common.confirm_email'),
        i18n.t('app.email.confirm_email.greeting'),
        i18n.t('app.email.confirm_email.intro'),
        i18n.t('app.email.confirm_email.instruction'),
      ]);
    }

    const url = new URL(
      this.configService.getOrThrow('app.frontendDomain', {
        infer: true,
      }) + '/confirm-email',
    );
    url.searchParams.set('hash', mailData.data.hash);

    await this.mailerService.sendMail({
      to: mailData.to,
      subject: emailConfirmTitle,
      text: `${url.toString()} ${emailConfirmTitle}`,
      templatePath: path.join(
        this.configService.getOrThrow('app.workingDirectory', {
          infer: true,
        }),
        'src',
        'modules',
        'mail',
        'mail-templates',
        'activation.hbs',
      ),
      context: {
        title: emailConfirmTitle,
        url: url.toString(),
        actionTitle: emailConfirmTitle,
        app_name: this.configService.get('app.name', { infer: true }),
        greeting,
        intro,
        instruction,
      },
    });
  }

  async forgotPassword(
    mailData: MailData<{ hash: string; tokenExpires: number }>,
  ): Promise<void> {
    const i18n = I18nContext.current();
    let resetPasswordTitle: MaybeType<string>;
    let subject: MaybeType<string>;
    let intro: MaybeType<string>;
    let instruction: MaybeType<string>;
    let disclaimer: MaybeType<string>;

    if (i18n) {
      [resetPasswordTitle, subject, intro, instruction, disclaimer] = await Promise.all([
        i18n.t('app.common.reset_password'),
        i18n.t('app.email.reset_password.subject'),
        i18n.t('app.email.reset_password.intro'),
        i18n.t('app.email.reset_password.instruction'),
        i18n.t('app.email.reset_password.disclaimer'),
      ]);
    }

    const url = new URL(
      this.configService.getOrThrow('app.frontendDomain', {
        infer: true,
      }) + '/password-change',
    );
    url.searchParams.set('hash', mailData.data.hash);
    url.searchParams.set('expires', mailData.data.tokenExpires.toString());

    await this.mailerService.sendMail({
      to: mailData.to,
      subject: resetPasswordTitle,
      text: `${url.toString()} ${resetPasswordTitle}`,
      templatePath: path.join(
        this.configService.getOrThrow('app.workingDirectory', {
          infer: true,
        }),
        'src',
        'modules',
        'mail',
        'mail-templates',
        'reset-password.hbs',
      ),
      context: {
        title: resetPasswordTitle,
        url: url.toString(),
        actionTitle: resetPasswordTitle,
        app_name: this.configService.get('app.name', {
          infer: true,
        }),
        subject,
        intro,
        instruction,
        disclaimer,
      },
    });
  }

  async confirmNewEmail(mailData: MailData<{ hash: string }>): Promise<void> {
    const i18n = I18nContext.current();
    let emailConfirmTitle: MaybeType<string>;
    let greeting: MaybeType<string>;
    let message: MaybeType<string>;
    let instruction: MaybeType<string>;

    if (i18n) {
      [emailConfirmTitle, greeting, message, instruction] = await Promise.all([
        i18n.t('app.common.confirm_email'),
        i18n.t('app.email.confirm_new_email.greeting'),
        i18n.t('app.email.confirm_new_email.message'),
        i18n.t('app.email.confirm_new_email.instruction'),
      ]);
    }

    const url = new URL(
      this.configService.getOrThrow('app.frontendDomain', {
        infer: true,
      }) + '/confirm-new-email',
    );
    url.searchParams.set('hash', mailData.data.hash);

    await this.mailerService.sendMail({
      to: mailData.to,
      subject: emailConfirmTitle,
      text: `${url.toString()} ${emailConfirmTitle}`,
      templatePath: path.join(
        this.configService.getOrThrow('app.workingDirectory', {
          infer: true,
        }),
        'src',
        'modules',
        'mail',
        'mail-templates',
        'confirm-new-email.hbs',
      ),
      context: {
        title: emailConfirmTitle,
        url: url.toString(),
        actionTitle: emailConfirmTitle,
        app_name: this.configService.get('app.name', { infer: true }),
        greeting,
        message,
        instruction,
      },
    });
  }

  async workspaceInvitation(
    mailData: MailData<{ hash: string; workspaceName: string; inviterName: string }>,
  ): Promise<void> {
    const i18n = I18nContext.current();
    let invitationTitle: MaybeType<string>;
    let greeting: MaybeType<string>;
    let intro: MaybeType<string>;
    let instruction: MaybeType<string>;
    let expiryNote: MaybeType<string>;
    let actionTitle: MaybeType<string>;

    if (i18n) {
      [invitationTitle, greeting, intro, instruction, expiryNote, actionTitle] = await Promise.all([
        i18n.t('app.email.workspace_invitation.title'),
        i18n.t('app.email.workspace_invitation.greeting'),
        i18n.t('app.email.workspace_invitation.intro', {
          args: { inviterName: mailData.data.inviterName, workspaceName: mailData.data.workspaceName },
        }),
        i18n.t('app.email.workspace_invitation.instruction'),
        i18n.t('app.email.workspace_invitation.expiry_note'),
        i18n.t('app.email.workspace_invitation.action_title'),
      ]);
    }

    const url = new URL(
      this.configService.getOrThrow('app.frontendDomain', {
        infer: true,
      }) + '/workspace/accept-invitation',
    );
    url.searchParams.set('hash', mailData.data.hash);

    await this.mailerService.sendMail({
      to: mailData.to,
      subject: invitationTitle || `Invitation to join ${mailData.data.workspaceName}`,
      text: `${url.toString()} - You've been invited to join ${mailData.data.workspaceName}`,
      templatePath: path.join(
        this.configService.getOrThrow('app.workingDirectory', {
          infer: true,
        }),
        'src',
        'modules',
        'mail',
        'mail-templates',
        'workspace-invitation.hbs',
      ),
      context: {
        title: invitationTitle || 'Workspace Invitation',
        url: url.toString(),
        actionTitle: actionTitle || 'Accept Invitation',
        app_name: this.configService.get('app.name', { infer: true }),
        workspaceName: mailData.data.workspaceName,
        inviterName: mailData.data.inviterName,
        greeting,
        intro,
        instruction,
        expiryNote,
      },
    });
  }

}