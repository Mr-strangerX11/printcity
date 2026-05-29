import { Controller, Post, Body, Get, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MailService } from '../mail/mail.service';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Health & Diagnostics')
@Controller('health')
export class HealthController {
  private readonly logger = new Logger(HealthController.name);

  constructor(private mailService: MailService) {}

  @Public()
  @Get('status')
  @ApiOperation({ summary: 'Get system health status' })
  @ApiResponse({ status: 200, description: 'System status' })
  getStatus() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      mail: this.mailService.getStatus(),
    };
  }

  @Public()
  @Post('mail/test')
  @ApiOperation({ summary: 'Test email sending (admin only - for diagnostics)' })
  @ApiResponse({ status: 200, description: 'Email test result' })
  async testEmail(@Body() body: { email?: string }) {
    const testEmail = body?.email || 'test@example.com';

    this.logger.log(`📧 Testing email send to: ${testEmail}`);

    try {
      // Use reflection to call the private send method for testing
      await (this.mailService as any).send(
        testEmail,
        '[TEST] PrintCity Email Test',
        `
          <html>
            <body style="font-family: Arial, sans-serif; padding: 20px;">
              <h2>✅ Email Test Successful!</h2>
              <p>This is a test email from PrintCity.</p>
              <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
              <p style="color: #666; font-size: 12px;">If you received this email, your SMTP configuration is working correctly.</p>
            </body>
          </html>
        `
      );

      return {
        success: true,
        message: `Test email sent to ${testEmail}`,
        timestamp: new Date().toISOString(),
        mailStatus: this.mailService.getStatus(),
      };
    } catch (error: any) {
      this.logger.error(`❌ Test email failed: ${error?.message}`);
      return {
        success: false,
        error: error?.message || 'Unknown error',
        message: 'Failed to send test email',
        timestamp: new Date().toISOString(),
        mailStatus: this.mailService.getStatus(),
        troubleshooting: {
          tip1: 'Check SMTP credentials in .env file',
          tip2: 'Verify SMTP_HOST and SMTP_PORT are correct',
          tip3: 'Ensure SMTP_USER and SMTP_PASS are set',
          tip4: 'Check firewall is not blocking SMTP port',
          tip5: 'If using Ethereal, check: https://ethereal.email/messages',
        },
      };
    }
  }

  @Public()
  @Get('mail/diagnostics')
  @ApiOperation({ summary: 'Get detailed mail service diagnostics' })
  @ApiResponse({ status: 200, description: 'Mail service diagnostics' })
  getMailDiagnostics() {
    const status = this.mailService.getStatus();

    return {
      timestamp: new Date().toISOString(),
      service: status,
      recommendations: this.getRecommendations(status),
      nextSteps: this.getNextSteps(status),
    };
  }

  private getRecommendations(status: any): Array<{ level: string; message: string; action: string }> {
    const recommendations: Array<{ level: string; message: string; action: string }> = [];

    if (status.mode === 'Ethereal (Test)') {
      recommendations.push({
        level: 'warning',
        message: 'Using Ethereal test account - emails will NOT be delivered to real inboxes',
        action: 'Configure real SMTP credentials in .env to enable production email',
      });
    }

    if (!status.configured) {
      recommendations.push({
        level: 'error',
        message: 'SMTP not configured properly',
        action: 'Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS in .env',
      });
    }

    if (status.lastError) {
      recommendations.push({
        level: 'error',
        message: `Last error: ${status.lastError}`,
        action: 'Check SMTP connection and credentials',
      });
    }

    if (status.smtpUser === '[NOT SET]') {
      recommendations.push({
        level: 'error',
        message: 'SMTP_USER is not set',
        action: 'Add SMTP_USER to .env file',
      });
    }

    return recommendations;
  }

  private getNextSteps(status: any): string[] {
    if (status.mode === 'Ethereal (Test)') {
      return [
        '1. Visit https://ethereal.email/ to sign up for free testing',
        '2. Create a test account',
        '3. Copy credentials to .env (SMTP_HOST, SMTP_USER, SMTP_PASS)',
        '4. Restart the backend',
        '5. Visit https://ethereal.email/messages to see test emails',
      ];
    }

    if (!status.configured) {
      return [
        '1. Choose an SMTP provider (Mailtrap, SendGrid, Gmail, etc.)',
        '2. Get your SMTP credentials from the provider',
        '3. Add to .env:',
        '   SMTP_HOST=your_smtp_host',
        '   SMTP_PORT=587 or 465',
        '   SMTP_USER=your_username',
        '   SMTP_PASS=your_password',
        '4. Restart backend',
        '5. Use /health/mail/test to verify',
      ];
    }

    return ['✅ Your email configuration looks good! Use /health/mail/test to send a test email.'];
  }
}
