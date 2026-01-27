// backend/services/emailService.js
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

class EmailService {
  constructor() {
    // Create transporter
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || "smtp.gmail.com",
      port: process.env.EMAIL_PORT || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  /**
   * Send tournament announcement email
   */
  async sendTournamentAnnouncement(userEmail, userName, tournamentData) {
    const { name, league, applicationStartDate, applicationEndDate, link } = tournamentData;

    const mailOptions = {
      from: `"ARENA Gaming" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: `🎮 New Tournament: ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">New Tournament Announced!</h2>
          
          <p>Hi ${userName},</p>
          
          <p>A new tournament has been announced that might interest you:</p>
          
          <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1F2937;">${name}</h3>
            <p><strong>League:</strong> ${league}</p>
            <p><strong>Applications Open:</strong> ${new Date(applicationStartDate).toLocaleDateString()}</p>
            <p><strong>Applications Close:</strong> ${new Date(applicationEndDate).toLocaleDateString()}</p>
          </div>
          
          <a href="${link}" style="display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
            View Tournament Details
          </a>
          
          <p style="color: #6B7280; font-size: 14px; margin-top: 30px;">
            You received this email because you're subscribed to updates for this league/game.
            <br>
            <a href="${process.env.CLIENT_URL}/unsubscribe" style="color: #4F46E5;">Unsubscribe</a>
          </p>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      return { success: true };
    } catch (error) {
      console.error("Email send error:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send match scheduled notification
   */
  async sendMatchScheduled(userEmail, userName, matchData) {
    const { tournament, opponent, scheduledTime, link } = matchData;

    const mailOptions = {
      from: `"ARENA Gaming" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: `⚔️ Match Scheduled: ${tournament}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">Your Match is Scheduled!</h2>
          
          <p>Hi ${userName},</p>
          
          <p>Your match has been scheduled:</p>
          
          <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Tournament:</strong> ${tournament}</p>
            <p><strong>Opponent:</strong> ${opponent}</p>
            <p><strong>Time:</strong> ${new Date(scheduledTime).toLocaleString()}</p>
          </div>
          
          <a href="${link}" style="display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
            View Match
          </a>
          
          <p style="color: #EF4444; font-weight: bold;">
            ⚠️ Remember to join on time or you'll forfeit the match!
          </p>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      return { success: true };
    } catch (error) {
      console.error("Email send error:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send application status notification
   */
  async sendApplicationStatus(userEmail, userName, applicationData) {
    const { type, name, status, link } = applicationData; // type: 'league' | 'tournament'

    const mailOptions = {
      from: `"ARENA Gaming" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: `${status === 'approved' ? '✅' : '❌'} Application ${status === 'approved' ? 'Approved' : 'Rejected'}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: ${status === 'approved' ? '#10B981' : '#EF4444'};">
            Application ${status === 'approved' ? 'Approved' : 'Rejected'}
          </h2>
          
          <p>Hi ${userName},</p>
          
          <p>Your application to <strong>${name}</strong> has been ${status}.</p>
          
          ${status === 'approved' ? `
            <a href="${link}" style="display: inline-block; background: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
              View ${type === 'league' ? 'League' : 'Tournament'}
            </a>
          ` : `
            <p style="color: #6B7280;">Better luck next time! Keep an eye out for more opportunities.</p>
          `}
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      return { success: true };
    } catch (error) {
      console.error("Email send error:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send tournament results
   */
  async sendTournamentResults(userEmail, userName, resultsData) {
    const { tournament, position, winner, stats, link } = resultsData;

    const mailOptions = {
      from: `"ARENA Gaming" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: `🏆 Tournament Results: ${tournament}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">Tournament Complete!</h2>
          
          <p>Hi ${userName},</p>
          
          <p>The <strong>${tournament}</strong> tournament has concluded!</p>
          
          <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            ${winner === 'Draw' 
              ? `<p><strong>Result:</strong> Draw (No Winner)</p>` 
              : `<p><strong>🏆 Winner:</strong> ${winner}</p>`}
            <p><strong>Your Position:</strong> ${position}</p>
            <p><strong>Your Stats:</strong> ${stats.wins}W - ${stats.losses}L - ${stats.draws}D</p>
            <p><strong>Points Earned:</strong> ${stats.points}</p>
          </div>
          
          <a href="${link}" style="display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
            View Full Results
          </a>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      return { success: true };
    } catch (error) {
      console.error("Email send error:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send sponsorship request to advertiser
   */
  async sendSponsorshipRequest(advertiserEmail, advertiserName, sponsorshipData) {
    const { tournament, league, flatFee, link } = sponsorshipData;

    const mailOptions = {
      from: `"ARENA Gaming" <${process.env.EMAIL_USER}>`,
      to: advertiserEmail,
      subject: `💼 Sponsorship Opportunity: ${tournament}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">Exclusive Sponsorship Opportunity</h2>
          
          <p>Hi ${advertiserName},</p>
          
          <p>A new tournament is seeking an exclusive sponsor!</p>
          
          <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Tournament:</strong> ${tournament}</p>
            <p><strong>League:</strong> ${league}</p>
            <p><strong>Exclusive Sponsorship Fee:</strong> $${flatFee}</p>
          </div>
          
          <p><strong>Benefits:</strong></p>
          <ul>
            <li>Your ads displayed exclusively during all matches</li>
            <li>Brand visibility to all tournament participants</li>
            <li>Logo placement on tournament page</li>
          </ul>
          
          <a href="${link}" style="display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
            View Details & Respond
          </a>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      return { success: true };
    } catch (error) {
      console.error("Email send error:", error);
      return { success: false, error: error.message };
    }
  }
}

export default new EmailService();