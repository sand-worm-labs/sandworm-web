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

  private async getAppContext(i18n: I18nContext) {
    const [
      logo_url,
      banner_url,
      twitter_url,
      telegram_url,
      twitter_icon_url,
      linkedin_url,
      linkedin_icon_url,
      support_email,
      help_center_url,
      unsubscribe_url,
    ] = await Promise.all([
      i18n.t('app.app.logo_url'),
      i18n.t('app.app.banner_url'),
      i18n.t('app.app.twitter_url'),
      i18n.t('app.app.telegram_url'),
      i18n.t('app.app.twitter_icon_url'),
      i18n.t('app.app.linkedin_url'),
      i18n.t('app.app.linkedin_icon_url'),
      i18n.t('app.app.support_email'),
      i18n.t('app.app.help_center_url'),
      i18n.t('app.app.unsubscribe_url'),
    ]);

    return {
      logo_url,
      banner_url,
      twitter_url,
      telegram_url,
      twitter_icon_url,
      linkedin_url,
      linkedin_icon_url,
      support_email,
      help_center_url,
      unsubscribe_url,
      year: new Date().getFullYear(),
    };
  }

  async userSignUp(mailData: MailData<{ hash: string }>): Promise<void> {
    const i18n = I18nContext.current();
    let emailConfirmTitle: MaybeType<string>;
    let greeting: MaybeType<string>;
    let intro: MaybeType<string>;
    let instruction: MaybeType<string>;
    let appContext = {};

    if (i18n) {
      [emailConfirmTitle, greeting, intro, instruction] = await Promise.all([
        i18n.t('app.common.confirm_email'),
        i18n.t('app.email.confirm_email.greeting'),
        i18n.t('app.email.confirm_email.intro'),
        i18n.t('app.email.confirm_email.instruction'),
      ]);
      appContext = await this.getAppContext(i18n);
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
        'infrastructure',
        'mail',
        'mail-templates',
        'activation.hbs',
      ),
      context: {
        ...appContext,
        title: emailConfirmTitle,
        url: url.toString(),
        actionTitle: emailConfirmTitle,
        app_name: this.configService.get('app.name', { infer: true }),
        greeting,
        intro,
        instruction,
        features: [
          'AI-powered queries that produce human readable outputs for Onchain information, while still having SQL editable data',
          'Multiple visualization style to showcase data to the world.',
          'Remix and share community notebooks',
          'Collaborate with others on the same file.',
        ],
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
    let appContext = {};

    if (i18n) {
      [resetPasswordTitle, subject, intro, instruction, disclaimer] = await Promise.all([
        i18n.t('app.common.reset_password'),
        i18n.t('app.email.reset_password.subject'),
        i18n.t('app.email.reset_password.intro'),
        i18n.t('app.email.reset_password.instruction'),
        i18n.t('app.email.reset_password.disclaimer'),
      ]);
      appContext = await this.getAppContext(i18n);
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
        'infrastructure',
        'mail',
        'mail-templates',
          'reset-password.hbs',
      ),
      context: {
        ...appContext,
        title: resetPasswordTitle,
        url: url.toString(),
        actionTitle: resetPasswordTitle,
        app_name: this.configService.get('app.name', { infer: true }),
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
    let appContext = {};

    if (i18n) {
      [emailConfirmTitle, greeting, message, instruction] = await Promise.all([
        i18n.t('app.common.confirm_email'),
        i18n.t('app.email.confirm_new_email.greeting'),
        i18n.t('app.email.confirm_new_email.message'),
        i18n.t('app.email.confirm_new_email.instruction'),
      ]);
      appContext = await this.getAppContext(i18n);
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
        'infrastructure',
        'mail',
        'mail-templates',
        'confirm-new-email.hbs',
      ),
      context: {
        ...appContext,
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
    let appContext = {};

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
      appContext = await this.getAppContext(i18n);
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
        'infrastructure',
        'mail',
        'mail-templates',
        'workspace-invitation.hbs',
      ),
      context: {
        ...appContext,
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

  async workspaceJoinRequest(
    mailData: MailData<{
      userName: string;
      userEmail: string;
      workspaceName: string;
      workspaceId: string;
      role: string;
    }>,
  ): Promise<void> {
    const i18n = I18nContext.current();
    let joinRequestTitle: MaybeType<string>;
    let actionTitle: MaybeType<string>;
    let appContext = {};

    if (i18n) {
      [joinRequestTitle, actionTitle] = await Promise.all([
        i18n.t('app.email.workspace_join_request.title'),
        i18n.t('app.email.workspace_join_request.action_title'),
      ]);
      appContext = await this.getAppContext(i18n);
    }

    const url = new URL(
      this.configService.getOrThrow('app.frontendDomain', {
        infer: true,
      }) + `/workspace/${mailData.data.workspaceId}/account`,
    );

    await this.mailerService.sendMail({
      to: mailData.to,
      subject: joinRequestTitle || `Join request for ${mailData.data.workspaceName}`,
      text: `${mailData.data.userName || mailData.data.userEmail} wants to join ${mailData.data.workspaceName}`,
      templatePath: path.join(
        this.configService.getOrThrow('app.workingDirectory', {
          infer: true,
        }),
        'src',
        'infrastructure',
        'mail',
        'mail-templates',
        'workspace-join-request.hbs',
      ),
      context: {
        ...appContext,
        title: joinRequestTitle || 'Workspace Join Request',
        url: url.toString(),
        actionTitle: actionTitle || 'Review Request',
        app_name: this.configService.get('app.name', { infer: true }),
        userName: mailData.data.userName,
        userEmail: mailData.data.userEmail,
        workspaceName: mailData.data.workspaceName,
        role: mailData.data.role,
      },
    });
  }
}