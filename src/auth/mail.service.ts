import { Injectable } from '@nestjs/common';
import { Transporter } from 'nodemailer';

@Injectable()
export class MailService {
  private nodemailer = require('nodemailer');
  private transporter: Transporter;

  constructor() {
    this.transporter = this.nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  async sendActivationMail(to: string, link: string) {
    await this.transporter.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject: 'Account activation on ' + process.env.CLIENT_URL,
      text: '',
      html: `
        <div>
          <h1>Quiziverse</h1>
          <h2>Activation link</h2>
          <a href="${link}">${link}</a>
        </div>
      `,
    });
  }
}
