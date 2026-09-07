// Stub nodemailer's transport so tests never touch real SMTP, and stub
// fs/promises so template reads never touch real disk.
jest.mock('nodemailer', () => {
  const sendMail = jest.fn();
  const createTransport = jest.fn(() => ({ sendMail }));
  return { __esModule: true, default: { createTransport }, createTransport };
});

jest.mock('node:fs/promises', () => {
  const readFile = jest.fn();
  return { __esModule: true, default: { readFile }, readFile };
});

import { MailerService } from '../mailer.service';
import nodemailer from 'nodemailer';
import fs from 'node:fs/promises';

const mockCreateTransport = nodemailer.createTransport as jest.Mock;
const mockSendMail = mockCreateTransport().sendMail as jest.Mock;
const mockReadFile = fs.readFile as jest.Mock;

const MAIL_VALUES: Record<string, unknown> = {
  'mail.host': 'smtp.example.com',
  'mail.port': 587,
  'mail.ignoreTLS': false,
  'mail.secure': true,
  'mail.requireTLS': true,
  'mail.user': 'user',
  'mail.password': 'pass',
  'mail.defaultName': 'Sandworm',
  'mail.defaultEmail': 'noreply@example.com',
};

function makeService() {
  const configService = {
    get: jest.fn((key: string) => MAIL_VALUES[key]),
  } as any;

  return new MailerService(configService);
}

describe('MailerService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates the nodemailer transport from config on construction', () => {
    makeService();

    expect(mockCreateTransport).toHaveBeenCalledWith({
      host: 'smtp.example.com',
      port: 587,
      ignoreTLS: false,
      secure: true,
      requireTLS: true,
      auth: { user: 'user', pass: 'pass' },
    });
  });

  describe('sendMail', () => {
    it('compiles the handlebars template with context and sends the resulting html', async () => {
      const service = makeService();
      mockReadFile.mockResolvedValue('<p>Hello {{name}}</p>');
      mockSendMail.mockResolvedValue(undefined);

      await service.sendMail({
        to: 'a@b.com',
        subject: 'Hi',
        templatePath: '/templates/hello.hbs',
        context: { name: 'Jane' },
      });

      expect(mockReadFile).toHaveBeenCalledWith('/templates/hello.hbs', 'utf-8');
      expect(mockSendMail).toHaveBeenCalledWith({
        to: 'a@b.com',
        subject: 'Hi',
        from: '"Sandworm" <noreply@example.com>',
        html: '<p>Hello Jane</p>',
      });
    });

    it('uses the given from address instead of the default when provided', async () => {
      const service = makeService();
      mockReadFile.mockResolvedValue('<p>Hi</p>');

      await service.sendMail({
        to: 'a@b.com',
        from: '"Custom" <custom@example.com>',
        templatePath: '/templates/hello.hbs',
        context: {},
      });

      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({ from: '"Custom" <custom@example.com>' }),
      );
    });

    it('uses the given html directly and skips template compilation when provided', async () => {
      const service = makeService();

      await service.sendMail({
        to: 'a@b.com',
        html: '<p>Raw html</p>',
        templatePath: '',
        context: {},
      });

      expect(mockReadFile).not.toHaveBeenCalled();
      expect(mockSendMail).toHaveBeenCalledWith(expect.objectContaining({ html: '<p>Raw html</p>' }));
    });

    it('propagates an error when the transport fails to send', async () => {
      const service = makeService();
      mockReadFile.mockResolvedValue('<p>Hi</p>');
      mockSendMail.mockRejectedValue(new Error('smtp connection refused'));

      await expect(
        service.sendMail({ to: 'a@b.com', templatePath: '/templates/hello.hbs', context: {} }),
      ).rejects.toThrow('smtp connection refused');
    });

    it('propagates an error when the template file cannot be read', async () => {
      const service = makeService();
      mockReadFile.mockRejectedValue(new Error('ENOENT: no such file'));

      await expect(
        service.sendMail({ to: 'a@b.com', templatePath: '/templates/missing.hbs', context: {} }),
      ).rejects.toThrow('ENOENT');
      expect(mockSendMail).not.toHaveBeenCalled();
    });
  });
});
