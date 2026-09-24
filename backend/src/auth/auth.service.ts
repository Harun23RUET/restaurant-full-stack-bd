import * as nodemailer from "nodemailer";
import { randomBytes, createHash } from "crypto";
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma.service.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(data: any) {
    const existing = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      throw new UnauthorizedException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    const user = await this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        passwordHash,
        status: 'ACTIVE',
      },
    });

    const customer = await this.prisma.customer.create({
      data: {
        userId: user.id,
        fullName: data.name,
        email: data.email,
        phone: data.phone,
      },
    });

    const access_token = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      access_token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        status: user.status,
      },
      customer,
    };
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { customer: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const valid = await bcrypt.compare(
      password,
      user.passwordHash,
    );

    if (!valid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const access_token = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      access_token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        status: user.status,
      },
      customer: user.customer,
    };
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        customer: {
          include: {
            addresses: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      status: user.status,
      role: user.role,
      customer: user.customer,
    };
  }

  async forgotPassword(email: string) {
    const normalizedEmail = String(email || "").trim().toLowerCase();

    if (!normalizedEmail) {
      throw new Error("Email is required.");
    }

    const user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return {
        success: true,
        message: "If an account exists for this email, a reset link has been sent.",
      };
    }

    const rawToken = randomBytes(32).toString("hex");
    const tokenHash = createHash("sha256")
      .update(rawToken)
      .digest("hex");

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await this.prisma.passwordResetToken.deleteMany({
      where: {
        userId: user.id,
        usedAt: null,
      },
    });

    await this.prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    const frontendUrl =
      process.env.FRONTEND_URL || "http://localhost:3000";

    const resetUrl =
      `${frontendUrl}/reset-password?token=${rawToken}`;

    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = Number(process.env.SMTP_PORT || 587);
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpFrom =
      process.env.SMTP_FROM || smtpUser;

    if (!smtpHost || !smtpUser || !smtpPass || !smtpFrom) {
      throw new Error(
        "Password reset email service is not configured."
      );
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    await transporter.sendMail({
      from: smtpFrom,
      to: normalizedEmail,
      subject: "MARHABA - Password Reset",
      text:
        `Reset your MARHABA password using this link:\n\n${resetUrl}\n\n` +
        `This link will expire in 15 minutes.`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto">
          <h2 style="color:#f97316">MARHABA</h2>
          <h3>Password Reset</h3>
          <p>Click the button below to reset your password.</p>
          <p>
            <a
              href="${resetUrl}"
              style="
                display:inline-block;
                background:#f97316;
                color:white;
                padding:12px 20px;
                border-radius:8px;
                text-decoration:none;
                font-weight:bold
              "
            >
              Reset Password
            </a>
          </p>
          <p>This link will expire in 15 minutes.</p>
        </div>
      `,
    });

    return {
      success: true,
      message: "If an account exists for this email, a reset link has been sent.",
    };
  }

  async resetPassword(token: string, password: string) {
    if (!token) {
      throw new Error("Reset token is required.");
    }

    if (!password || password.length < 8) {
      throw new Error("Password must be at least 8 characters.");
    }

    const tokenHash = createHash("sha256")
      .update(token)
      .digest("hex");

    const resetToken =
      await this.prisma.passwordResetToken.findUnique({
        where: { tokenHash },
      });

    if (
      !resetToken ||
      resetToken.usedAt ||
      resetToken.expiresAt.getTime() < Date.now()
    ) {
      throw new Error("Invalid or expired reset token.");
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: resetToken.userId },
        data: { passwordHash },
      }),
      this.prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() },
      }),
      this.prisma.passwordResetToken.deleteMany({
        where: {
          userId: resetToken.userId,
          id: { not: resetToken.id },
        },
      }),
    ]);

    return {
      success: true,
      message: "Password reset successful.",
    };
  }
}


